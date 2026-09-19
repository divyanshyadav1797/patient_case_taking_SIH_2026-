const authService = require('../services/authService');
const otpService = require('../services/otpService');
const userRepository = require('../repositories/userRepository');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

class AuthController {
  /**
   * POST /api/v1/auth/login
   * Universal Login (Patient, Doctor, Hospital, Kiosk)
   * Returns JWT Access Token + Refresh Token + User
   */
  async login(req, res, next) {
    try {
      const result = await authService.login(req.authPayload);
      return successResponse(res, result, result.message, 200);
    } catch (err) {
      return errorResponse(res, err.message, 401);
    }
  }

  /**
   * POST /api/v1/auth/register
   * Universal Direct Registration
   * Returns JWT Access Token + Refresh Token + User
   */
  async register(req, res, next) {
    try {
      const result = await authService.register(req.validatedRegister);
      return successResponse(res, result, result.message, 201);
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   * Exchange valid Refresh Token for a fresh JWT Access Token
   */
  async refreshToken(req, res, next) {
    try {
      const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];
      if (!refreshToken) {
        return errorResponse(res, 'Refresh token is required in request body or X-Refresh-Token header', 400);
      }
      const result = await authService.refreshAccessToken(refreshToken);
      return successResponse(res, result, 'Access token refreshed successfully', 200);
    } catch (err) {
      return errorResponse(res, err.message, 401);
    }
  }

  /**
   * POST /api/v1/auth/verify-token (or GET /api/v1/auth/verify-token)
   * Inspect and verify JWT token status
   */
  async verifyToken(req, res, next) {
    try {
      const authHeader = req.headers['authorization'] || req.headers['Authorization'];
      const token = req.body.token || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);
      
      const status = authService.verifyTokenStatus(token);
      if (!status.valid) {
        return errorResponse(res, status.message, 401);
      }
      return successResponse(res, status, 'Token is valid and active', 200);
    } catch (err) {
      return errorResponse(res, err.message, 500);
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Session Termination & JWT Token Revocation
   */
  async logout(req, res, next) {
    try {
      const authHeader = req.headers['authorization'] || req.headers['Authorization'];
      const token = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.split(' ')[1] : null;
      const refreshToken = req.body?.refreshToken || null;

      const result = await authService.logout(token, refreshToken);
      return successResponse(res, null, result.message, 200);
    } catch (err) {
      return errorResponse(res, err.message, 500);
    }
  }

  /**
   * GET /api/v1/auth/me
   * Get Active Authenticated Profile
   */
  async getMe(req, res, next) {
    try {
      return successResponse(res, {
        user: req.user,
        jwtClaims: req.tokenPayload
      }, 'Profile retrieved successfully', 200);
    } catch (err) {
      return errorResponse(res, err.message, 500);
    }
  }

  /**
   * POST /api/v1/auth/register/request-otp
   * Request OTP for Aadhaar or Phone Registration
   */
  async requestOtp(req, res, next) {
    try {
      const result = await otpService.requestOtp(req.body);
      return successResponse(res, result, result.message, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  }

  /**
   * POST /api/v1/auth/register/verify-otp
   * Verify entered OTP
   */
  async verifyOtp(req, res, next) {
    try {
      const result = await otpService.verifyOtp(req.otpVerifyPayload);
      return successResponse(res, result, result.message, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  }

  /**
   * POST /api/v1/auth/register/complete
   * Complete Aadhaar OTP verified registration
   */
  async completeOtpRegistration(req, res, next) {
    try {
      const result = await authService.completeOtpRegistration(req.body);
      return successResponse(res, result, result.message, 201);
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  }

  /**
   * POST /api/v1/auth/password/change
   * Authenticated password change
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return errorResponse(res, 'Both currentPassword and newPassword are required', 400);
      }
      const userId = req.user._id || req.user.customId;
      const result = await authService.changePassword(userId, currentPassword, newPassword);
      return successResponse(res, null, result.message, 200);
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  }

  /**
   * GET /api/v1/auth/users
   * Demo & System inspection endpoint
   */
  async listUsers(req, res, next) {
    try {
      const users = await userRepository.listAllUsers();
      return successResponse(res, { count: users.length, users }, 'Users listed successfully', 200);
    } catch (err) {
      return errorResponse(res, err.message, 500);
    }
  }
}

module.exports = new AuthController();
