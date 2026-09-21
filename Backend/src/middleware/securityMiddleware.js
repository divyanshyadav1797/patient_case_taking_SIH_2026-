/**
 * Quantum Care Security Middleware Suite
 * Zero external dependencies: pure standard library & Express primitives
 * Implements: Rate Limiting, NoSQL Sanitization, XSS Tag Stripping, Security Headers
 */

// ── 1. In-Memory Sliding-Window Rate Limiter ──
function createRateLimiter({
  windowMs = 60 * 1000,
  max = 120,
  message = 'Too many requests, please slow down.'
} = {}) {
  const store = new Map(); // ip -> Array<timestamp>

  // Periodically clean stale records every 2 minutes
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of store.entries()) {
      const active = timestamps.filter(t => now - t < windowMs);
      if (active.length === 0) store.delete(ip);
      else store.set(ip, active);
    }
  }, 2 * 60 * 1000);
  if (cleanupTimer.unref) cleanupTimer.unref();

  return (req, res, next) => {
    // Determine client IP safely (respect proxy if configured)
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : null)
      || req.socket?.remoteAddress
      || '127.0.0.1';

    const now = Date.now();
    const windowStart = now - windowMs;

    let timestamps = store.get(ip) || [];
    timestamps = timestamps.filter(t => t > windowStart);

    if (timestamps.length >= max) {
      const retryAfter = Math.ceil((timestamps[0] + windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: Math.max(1, retryAfter)
      });
    }

    timestamps.push(now);
    store.set(ip, timestamps);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - timestamps.length));
    next();
  };
}

// ── 2. NoSQL Operator Injection Sanitizer ──
function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = sanitizeObject(obj[i]);
    }
    return obj;
  }
  for (const key of Object.keys(obj)) {
    // Strip keys starting with $ (MongoDB query operators) or containing . (dotted path manipulation)
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      sanitizeObject(obj[key]);
    }
  }
  return obj;
}

function noSqlSanitizer(req, res, next) {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
}

// ── 3. Basic XSS Input Content Sanitizer ──
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  // Remove dangerous HTML/script tags from user inputs while keeping clinical punctuation
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:[^\s"'>]+/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

function sanitizeContent(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'string') obj[i] = sanitizeString(obj[i]);
      else if (typeof obj[i] === 'object') sanitizeContent(obj[i]);
    }
    return obj;
  }
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === 'object') {
      sanitizeContent(obj[key]);
    }
  }
  return obj;
}

function xssSanitizer(req, res, next) {
  if (req.body) sanitizeContent(req.body);
  if (req.query) sanitizeContent(req.query);
  next();
}

// ── 4. Defense-in-Depth Security Headers ──
function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), payment=()');
  res.removeHeader('X-Powered-By');
  next();
}

module.exports = {
  createRateLimiter,
  apiLimiter: createRateLimiter({ windowMs: 60 * 1000, max: 150, message: 'Too many API requests, please wait a minute.' }),
  authLimiter: createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many authentication attempts. Please try again after 15 minutes.' }),
  noSqlSanitizer,
  xssSanitizer,
  securityHeaders
};
