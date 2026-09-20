require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getStatus } = require('./src/config/db');
const userRepository = require('./src/repositories/userRepository');
const clinicalRepository = require('./src/repositories/clinicalRepository');
const authRoutes = require('./src/routes/authRoutes');
const clinicalRoutes = require('./src/routes/clinicalRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const patientRoutes = require('./routes/patientRoutes');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

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
        completeOtp: 'POST /api/v1/auth/register/complete',
        logout: 'POST /api/v1/auth/logout',
        me: 'GET /api/v1/auth/me'
      }
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
  res.json({ status: 'ok', service: 'medikiosk-backend', db: getStatus() });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/v1', clinicalRoutes);
app.use('/api', clinicalRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/patients', patientRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found on Quantum Care Server`
  });
});

app.use(errorHandler);

async function startServer() {
  await connectDB();
  await userRepository.seedDefaultUsers();
  await clinicalRepository.seedDefaults();

  app.listen(PORT, () => {
    console.log(`Quantum Care Backend running on http://localhost:${PORT}`);
    console.log(`API Base: http://localhost:${PORT}/api/v1`);
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
