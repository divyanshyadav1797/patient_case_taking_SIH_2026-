const BlacklistedToken = require('../models/BlacklistedToken');

// Fast in-memory cache of blacklisted tokens: Map<token, expiresAtTimestamp>
const blacklistCache = new Map();

class TokenRepository {
  constructor() {
    // Attempt to hydrate blacklist cache from MongoDB once connected
    this.hydrateFromMongo().catch(err => {
      // Ignored during startup before connection
    });
  }

  /**
   * Load active unexpired blacklisted tokens from MongoDB
   */
  async hydrateFromMongo() {
    try {
      const now = new Date();
      const tokens = await BlacklistedToken.find({ expiresAt: { $gt: now } }).lean();
      tokens.forEach(item => {
        const expTime = new Date(item.expiresAt).getTime();
        blacklistCache.set(item.token, expTime);
      });
      if (tokens.length > 0) {
        console.log(`[TokenRepository] Loaded ${tokens.length} revoked tokens from MongoDB`);
      }
    } catch (e) {
      // Non-blocking if DB not ready yet
    }
  }

  /**
   * Blacklist a token upon logout or revocation in MongoDB
   * @param {string} token
   * @param {object} decoded - Decoded JWT payload with exp, sub, jti
   * @param {string} reason
   */
  async blacklistToken(token, decoded = {}, reason = 'logout') {
    if (!token) return;

    // Default to 7 days if exp is missing
    const expiresAt = decoded.exp 
      ? new Date(decoded.exp * 1000) 
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const record = {
      token,
      jti: decoded.jti || null,
      userId: decoded.id || decoded.sub || null,
      reason,
      expiresAt
    };

    // 1. Update in-memory cache
    blacklistCache.set(token, expiresAt.getTime());

    // 2. Persist directly in MongoDB
    try {
      await BlacklistedToken.create(record);
    } catch (e) {
      // Ignore duplicate key error if already blacklisted
    }
  }

  /**
   * Check if a token has been blacklisted / revoked
   * @param {string} token
   * @returns {boolean}
   */
  isBlacklisted(token) {
    if (!token) return false;
    const expTime = blacklistCache.get(token);
    if (!expTime) return false;

    // If expired, clean up from in-memory cache
    if (Date.now() > expTime) {
      blacklistCache.delete(token);
      return false;
    }
    return true;
  }
}

module.exports = new TokenRepository();
