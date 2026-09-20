const { verifyAccessToken } = require('../config/jwt');
const userRepository = require('../repositories/userRepository');
const tokenRepository = require('../repositories/tokenRepository');
const { errorResponse } = require('../utils/responseFormatter');

/**
 * JWT Authentication Middleware
 * Validates 'Authorization: Bearer <token>' header against signature, expiration, and token blacklist
 */
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authorization header missing or not Bearer token format', 401);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return errorResponse(res, 'Bearer token missing from authorization header', 401);
  }

  // 1. Check if token was revoked / blacklisted upon logout
  if (tokenRepository.isBlacklisted(token)) {
    return errorResponse(res, 'Authentication token has been revoked or logged out. Please sign in again.', 401);
  }

  // 2. Cryptographic signature and expiration check
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return errorResponse(res, 'Invalid, expired, or tampered JWT access token', 401);
  }

  try {
    const user = await userRepository.findById(decoded.sub || decoded.id);
    if (!user) {
      return errorResponse(res, 'User associated with this token no longer exists', 401);
    }

    if (user.status === 'SUSPENDED' || user.status === 'DISABLED') {
      return errorResponse(res, `Account is currently ${user.status.toLowerCase()}. Please contact support.`, 403);
    }

    // Attach user and decoded JWT claims to request
    req.user = user;
    req.token = token;
    req.tokenPayload = decoded;
    next();
  } catch (err) {
    return errorResponse(res, 'Server error during token verification', 500);
  }
}

module.exports = {
  authenticateToken
};
