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

// ── Strict & Configurable CORS Policy ──
const rawOrigins = process.env.CORS_ORIGIN || process.env.ALLOWED_ORIGINS || '';
const allowedOrigins = rawOrigins
  ? rawOrigins.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'];

const allowAllOrigins = allowedOrigins.includes('*') || rawOrigins === '*';

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser agents, wildcard origins, whitelisted origins, or development mode
    if (!origin || allowAllOrigins || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
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
app.use('/uploads', async (req, res, next) => {
  // Disallow any execution or script files in uploaded media
  const blockedExts = ['.exe', '.sh', '.bat', '.cmd', '.js', '.mjs', '.php', '.phtml', '.py', '.html', '.htm', '.svg'];
  const ext = path.extname(req.path).toLowerCase();
  if (blockedExts.includes(ext)) {
    return res.status(403).json({ success: false, message: 'Access to executable file types is prohibited.' });
  }

  // Cloud Ephemeral Storage Recovery: If file is missing from local disk (container restart), restore from MongoDB
  const localFilePath = path.join(uploadsPath, req.path.replace(/^\//, ''));
  if (!fs.existsSync(localFilePath)) {
    try {
      const MedicalRecord = require('./src/models/MedicalRecord');
      const filename = path.basename(req.path);
      const record = await MedicalRecord.findOne({
        $or: [
          { fileUrl: req.originalUrl },
          { fileUrl: `/uploads/${req.path.replace(/^\//, '')}` },
          { previewUrl: req.originalUrl },
          { file: filename }
        ]
      }).lean();

      if (record && record.imageData && record.imageData.startsWith('data:')) {
        const matches = record.imageData.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          const buffer = Buffer.from(matches[2], 'base64');
          const fileDir = path.dirname(localFilePath);
          if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir, { recursive: true });
          }
          fs.writeFileSync(localFilePath, buffer);
        }
      }
    } catch (e) {
      // Continue to next handler if DB unavailable
    }
  }

  next();
}, express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    if (filePath && filePath.toLowerCase().endsWith('.pdf')) {
      res.setHeader('Content-Security-Policy', "default-src 'self' blob:; object-src 'self' blob:; style-src 'unsafe-inline'");
    } else {
      res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'");
    }
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

app.get('/api', (req, res) => {
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

// ── Production Frontend SPA Serving ──
const candidateDistPaths = [
  path.resolve(__dirname, '../Frontend/dist'),
  path.resolve(__dirname, 'public'),
  path.resolve(__dirname, '../dist')
];

const resolvedFrontendDist = candidateDistPaths.find(
  (p) => fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))
);

if (process.env.SERVE_FRONTEND !== 'false' && resolvedFrontendDist) {
  console.log(`[Frontend] Serving production SPA from: ${resolvedFrontendDist}`);
  app.use(express.static(resolvedFrontendDist, {
    maxAge: '1d',
    index: 'index.html'
  }));

  // Non-API GET routes serve index.html for client-side routing (Express 5 compatible)
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads') && !req.path.startsWith('/health')) {
      return res.sendFile(path.join(resolvedFrontendDist, 'index.html'));
    }
    next();
  });
} else {
  // If not serving frontend, root returns API status
  app.get('/', (req, res) => {
    const dbStatus = getStatus();
    res.json({
      project: 'Quantum Care Backend API',
      version: '1.0.0',
      status: 'ONLINE',
      database: dbStatus
    });
  });
}

// ── Unmatched API Routes 404 Handler ──
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found on Quantum Care Server`
  });
});

app.use(errorHandler);

async function startServer() {
  try {
    await connectDB();
    if (process.env.SEED_DEMO_DATA === 'true') {
      await userRepository.seedDefaultUsers();
      await clinicalRepository.seedDefaults();
      console.log('[Seed] Default verification accounts seeded in MongoDB');
    } else {
      console.log('[Database] Clean database mode (set SEED_DEMO_DATA=true to seed demo accounts)');
    }
  } catch (err) {
    console.error('[Database] MongoDB connection warning:', err.message);
    console.warn('[Database] Server started in standby mode. Verify MONGODB_URI to enable database persistence.');
  }

  const server = app.listen(PORT, () => {
    console.log(`Quantum Care Backend running on http://localhost:${PORT}`);
    console.log(`API Base: http://localhost:${PORT}/api/v1`);
  });

  return server;
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught Exception:', err);
});

if (require.main === module) {
  startServer().catch((err) => {
    console.error('Fatal startup error:', err);
    process.exit(1);
  });
}

module.exports = { app, startServer };
