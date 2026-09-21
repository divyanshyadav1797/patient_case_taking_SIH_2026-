require('dotenv').config();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'quantum_care_super_secure_jwt_secret_key_sih_2026_prototype';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'quantum_care_refresh_jwt_secret_key_sih_2026_prototype';
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate standard access token
 * @param {object} user - User object or claims
 * @returns {string} Signed JWT Access Token
 */
function generateAccessToken(user) {
  const payload = {
    sub: user._id || user.id || user.customId,
    id: user._id || user.id || user.customId,
    customId: user.customId,
    role: user.role,
    name: user.name,
    email: user.email,
    tokenType: 'access',
    jti: crypto.randomUUID()
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

/**
 * Generate long-lived refresh token
 * @param {object} user - User object or claims
 * @returns {string} Signed JWT Refresh Token
 */
function generateRefreshToken(user) {
  const payload = {
    sub: user._id || user.id || user.customId,
    id: user._id || user.id || user.customId,
    customId: user.customId,
    role: user.role,
    tokenType: 'refresh',
    jti: crypto.randomUUID()
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

/**
 * Generate both Access Token and Refresh Token in one call
 * @param {object} user
 * @returns {{ accessToken: string, refreshToken: string, token: string, tokenType: string, expiresIn: string }}
 */
function generateTokenPair(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    accessToken,
    refreshToken,
    token: accessToken, // Alias for backward compatibility
    tokenType: 'Bearer',
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  };
}

/**
 * Verify and decode an Access Token
 * @param {string} token
 * @returns {object|null}
 */
function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.tokenType && decoded.tokenType !== 'access') {
      return null;
    }
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Verify and decode a Refresh Token
 * @param {string} token
 * @returns {object|null}
 */
function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    if (decoded.tokenType && decoded.tokenType !== 'refresh') {
      return null;
    }
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Decode token without verifying signature (useful for logging / token inspection)
 * @param {string} token
 * @returns {object|null}
 */
function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
}

module.exports = {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  // Shorthands
  generateToken: generateAccessToken,
  verifyToken: verifyAccessToken
};
