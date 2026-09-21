require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { connectDB, getStatus } = require('./src/config/db');
const userRepository = require('./src/repositories/userRepository');
const clinicalRepository = require('./src/repositories/clinicalRepository');
const authRoutes = require('./src/routes/authRoutes');
const clinicalRoutes = require('./src/routes/clinicalRoutes');
const { errorHandler } = require('./src/middleware/errorHandler');

const {
  securityHeaders,
  apiLimiter,
  noSqlSanitizer,
  xssSanitizer
} = require('./src/middleware/securityMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security Headers & Hardening ──
app.use(securityHeaders);

// ── Strict CORS Policy ──
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or non-browser agents, whitelisted origins, or development mode
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ── Sanitization Middleware ──
app.use(noSqlSanitizer);
app.use(xssSanitizer);

// ── Global API Rate Limiter ──
app.use('/api', apiLimiter);

// ── Secure Static Uploads Storage ──
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', (req, res, next) => {
  // Disallow any execution or script files in uploaded media
  const blockedExts = ['.exe', '.sh', '.bat', '.cmd', '.js', '.mjs', '.php', '.phtml', '.py', '.html', '.htm', '.svg'];
  const ext = path.extname(req.path).toLowerCase();
  if (blockedExts.includes(ext)) {
    return res.status(403).json({ success: false, message: 'Access to executable file types is prohibited.' });
  }
  next();
}, express.static(uploadsPath, {
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

if (process.env.DEBUG_HTTP === 'true') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

app.get('/', (req, res) => {
  const dbStatus = getStatus();
  res.json({
    project: 'Quantum Care Backend API',
    version: '1.0.0',
    status: 'ONLINE',
    database: dbStatus,
    endpoints: {
      auth: {
        login: 'POST /api/v1/auth/login',
        register: 'POST /api/v1/auth/register',
        requestOtp: 'POST /api/v1/auth/register/request-otp',
        verifyOtp: 'POST /api/v1/auth/register/verify-otp',
        logout: 'POST /api/v1/auth/logout',
        me: 'GET /api/v1/auth/me'
      },
      aiIntake: {
        start: 'POST /api/v1/ai/intake/start',
        answer: 'POST /api/v1/ai/intake/:sessionId/answer',
        session: 'GET /api/v1/ai/intake/:sessionId'
      },
      clinicalReports: {
        list: 'GET /api/v1/clinical-reports',
        detail: 'GET /api/v1/clinical-reports/:id',
        update: 'PATCH /api/v1/clinical-reports/:id'
      },
      patientHistory: 'GET /api/v1/patients/:patientId/history'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    db: getStatus()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'quantum-care-backend', db: getStatus() });
});

// Primary API Mounts
app.use('/api/v1/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/v1', clinicalRoutes);
app.use('/api', clinicalRoutes);

// Convenience direct routes
app.use('/api/doctors', (req, res, next) => {
  req.url = '/doctors' + req.url;
  clinicalRoutes(req, res, next);
});
app.use('/api/patients', (req, res, next) => {
  req.url = '/patients' + req.url;
  clinicalRoutes(req, res, next);
});
app.use('/api/hospitals', (req, res, next) => {
  req.url = '/hospital' + req.url;
  clinicalRoutes(req, res, next);
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found on Quantum Care Server`
  });
});

app.use(errorHandler);

async function startServer() {
  await connectDB();
  if (process.env.SEED_DEMO_DATA === 'true') {
    await userRepository.seedDefaultUsers();
    await clinicalRepository.seedDefaults();
    console.log('[Seed] Default verification accounts seeded in MongoDB');
  } else {
    console.log('[Database] Clean database mode (set SEED_DEMO_DATA=true to seed demo accounts)');
  }

  const server = app.listen(PORT, () => {
    console.log(`Quantum Care Backend running on http://localhost:${PORT}`);
    console.log(`API Base: http://localhost:${PORT}/api/v1`);
  });

  return server;
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error('Fatal startup error:', err);
    process.exit(1);
  });
}

module.exports = { app, startServer };
