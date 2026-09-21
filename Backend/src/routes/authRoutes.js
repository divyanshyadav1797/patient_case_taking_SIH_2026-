const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
  validateLogin,
  validateRegister,
  validateOtpRequest,
  validateOtpVerify
} = require('../middleware/validateMiddleware');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/securityMiddleware');

// ── Authentication Endpoints ──

// Universal Login -> Returns JWT Access + Refresh Token (Rate-limited)
router.post('/login', authLimiter, validateLogin, (req, res, next) => authController.login(req, res, next));
router.post('/signin', authLimiter, validateLogin, (req, res, next) => authController.login(req, res, next));

// Universal Direct Registration -> Returns JWT Access + Refresh Token (Rate-limited)
router.post('/register', authLimiter, validateRegister, (req, res, next) => authController.register(req, res, next));
router.post('/signup', authLimiter, validateRegister, (req, res, next) => authController.register(req, res, next));

// JWT Token Refresh -> Issues new JWT Access Token
router.post('/refresh', (req, res, next) => authController.refreshToken(req, res, next));
router.post('/token/refresh', (req, res, next) => authController.refreshToken(req, res, next));

// JWT Token Inspection & Verification
router.post('/verify-token', (req, res, next) => authController.verifyToken(req, res, next));
router.get('/verify-token', (req, res, next) => authController.verifyToken(req, res, next));

// Aadhaar / Mobile OTP Registration Workflow (TRD Section 10 & 11)
router.post('/register/fetch-aadhaar', authLimiter, (req, res, next) => authController.fetchAadhaar(req, res, next));
router.post('/register/request-otp', authLimiter, validateOtpRequest, (req, res, next) => authController.requestOtp(req, res, next));
router.post('/register/verify-otp', authLimiter, validateOtpVerify, (req, res, next) => authController.verifyOtp(req, res, next));
router.post('/register/complete', authLimiter, (req, res, next) => authController.completeOtpRegistration(req, res, next));

// Kiosk Patient Verification & Fast In-Kiosk Registration
router.post('/kiosk/patient-auth', authLimiter, (req, res, next) => authController.kioskPatientAuth(req, res, next));
router.post('/kiosk/fast-register', authLimiter, (req, res, next) => authController.kioskFastRegister(req, res, next));

// Session Termination -> Revokes and blacklists active JWT Token
router.post('/logout', (req, res, next) => authController.logout(req, res, next));

// Protected User Profile -> Requires active JWT Bearer Token
router.get('/me', authenticateToken, (req, res, next) => authController.getMe(req, res, next));

// Password Management -> Requires active JWT Bearer Token
router.post('/password/change', authenticateToken, (req, res, next) => authController.changePassword(req, res, next));

// Protected Admin Users Inspection -> Requires ADMIN role
router.get('/users', authenticateToken, requireRole('admin'), (req, res, next) => authController.listUsers(req, res, next));

module.exports = router;
