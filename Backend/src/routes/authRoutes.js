const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
  validateLogin,
  validateRegister,
  validateOtpRequest,
  validateOtpVerify
} = require('../middleware/validateMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');

// ── Authentication Endpoints ──

// Universal Login -> Returns JWT Access + Refresh Token
router.post('/login', validateLogin, (req, res, next) => authController.login(req, res, next));
router.post('/signin', validateLogin, (req, res, next) => authController.login(req, res, next));

// Universal Direct Registration -> Returns JWT Access + Refresh Token
router.post('/register', validateRegister, (req, res, next) => authController.register(req, res, next));
router.post('/signup', validateRegister, (req, res, next) => authController.register(req, res, next));

// JWT Token Refresh -> Issues new JWT Access Token
router.post('/refresh', (req, res, next) => authController.refreshToken(req, res, next));
router.post('/token/refresh', (req, res, next) => authController.refreshToken(req, res, next));

// JWT Token Inspection & Verification
router.post('/verify-token', (req, res, next) => authController.verifyToken(req, res, next));
router.get('/verify-token', (req, res, next) => authController.verifyToken(req, res, next));

// Aadhaar / Mobile OTP Registration Workflow (TRD Section 10 & 11)
router.post('/register/fetch-aadhaar', (req, res, next) => authController.fetchAadhaar(req, res, next));
router.post('/register/request-otp', validateOtpRequest, (req, res, next) => authController.requestOtp(req, res, next));
router.post('/register/verify-otp', validateOtpVerify, (req, res, next) => authController.verifyOtp(req, res, next));
router.post('/register/complete', (req, res, next) => authController.completeOtpRegistration(req, res, next));

// Session Termination -> Revokes and blacklists active JWT Token
router.post('/logout', (req, res, next) => authController.logout(req, res, next));

// Protected User Profile -> Requires active JWT Bearer Token
router.get('/me', authenticateToken, (req, res, next) => authController.getMe(req, res, next));

// Password Management -> Requires active JWT Bearer Token
router.post('/password/change', authenticateToken, (req, res, next) => authController.changePassword(req, res, next));

// Inspection & Demo Verification
router.get('/users', (req, res, next) => authController.listUsers(req, res, next));

module.exports = router;
