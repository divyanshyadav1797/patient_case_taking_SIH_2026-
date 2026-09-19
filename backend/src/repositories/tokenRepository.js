const fs = require('fs');
const path = require('path');
const dbConfig = require('../config/db');
const BlacklistedToken = require('../models/BlacklistedToken');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Fast in-memory cache of blacklisted tokens: Map<token, expiresAtTimestamp>
const blacklistCache = new Map();

function loadBlacklist() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (Array.isArray(data.blacklistedTokens)) {
        const now = Date.now();
        data.blacklistedTokens.forEach(item => {
          const expTime = new Date(item.expiresAt).getTime();
          if (expTime > now) {
            blacklistCache.set(item.token, expTime);
          }
        });
      }
    }
  } catch (err) {
    console.warn('[TokenRepository] Could not load blacklisted tokens from file:', err.message);
  }
}

loadBlacklist();

class TokenRepository {
  /**
   * Blacklist a token upon logout or revocation
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
      expiresAt: expiresAt.toISOString()
    };

    // 1. Update in-memory cache
    blacklistCache.set(token, expiresAt.getTime());

    // 2. Persist in MongoDB if connected
    if (dbConfig.isConnected) {
      try {
        await BlacklistedToken.create({
          token,
          jti: record.jti,
          userId: record.userId,
          reason,
          expiresAt
        });
      } catch (e) {
        // Token might already be in blacklist, ignore duplicate key error
      }
    }

    // 3. Persist in local JSON store
    try {
      if (fs.existsSync(DB_FILE)) {
        const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        if (!Array.isArray(data.blacklistedTokens)) {
          data.blacklistedTokens = [];
        }
        // Remove expired from array
        const now = Date.now();
        data.blacklistedTokens = data.blacklistedTokens.filter(
          item => new Date(item.expiresAt).getTime() > now
        );
        data.blacklistedTokens.push(record);
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (e) {
      console.warn('[TokenRepository] Failed to save blacklist to db.json:', e.message);
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

    // If expired, clean up and treat as not blacklisted (it will fail normal JWT exp check anyway)
    if (Date.now() > expTime) {
      blacklistCache.delete(token);
      return false;
    }
    return true;
  }
}

module.exports = new TokenRepository();
