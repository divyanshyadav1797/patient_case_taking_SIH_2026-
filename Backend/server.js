require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getStatus } = require('./src/config/db');
const userRepository = require('./src/repositories/userRepository');
const clinicalRepository = require('./src/repositories/clinicalRepository');
const authRoutes = require('./src/routes/authRoutes');
const clinicalRoutes = require('./src/routes/clinicalRoutes');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all frontends (Vite port 5173, HTML files, custom ports)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Root & Health status
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
        me: 'GET /api/v1/auth/me',
        changePassword: 'POST /api/v1/auth/password/change',
        listUsers: 'GET /api/v1/auth/users'
      }
    },
    demoCredentials: {
      patient: { identifier: 'rahul.sharma@example.com (or Aadhaar: 123456789012, or Phone: 9876543210)', password: 'patient123', pin: '1234' },
      doctor: { identifier: 'dr.sarah@medicare.org (or NMC: NMC-2018-99412)', password: 'doctor123' },
      hospital: { identifier: 'admin@smshospital.org (or Reg: RJ-MED-2014-991)', password: 'hospital123' },
      kiosk: { identifier: 'KIOSK-TER-04', pin: '1234' }
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

// Mount Authentication Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/auth', authRoutes); // Compatibility alias

// Mount Clinical Routes (Appointments, Doctors, Records, Prescriptions, Kiosk)
app.use('/api/v1', clinicalRoutes);
app.use('/api', clinicalRoutes); // Compatibility alias

// 404 handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found on Quantum Care Server`
  });
});

// Centralized error handler
app.use(errorHandler);

// Initialize DB and launch server
async function startServer() {
  await connectDB();
  await userRepository.seedDefaultUsers();
  await clinicalRepository.seedDefaults();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Quantum Care Backend Server Running on Port ${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api/v1`);
    console.log(`🔐 Auth Endpoints: http://localhost:${PORT}/api/v1/auth`);
    console.log(`📋 Health Check: http://localhost:${PORT}/health`);
    console.log(`=======================================================`);
  });
}

startServer().catch(err => {
  console.error('Fatal startup error:', err);
});
