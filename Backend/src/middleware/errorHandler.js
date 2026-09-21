const { errorResponse } = require('../utils/responseFormatter');

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'An internal error occurred';

  // Handle specific Mongoose/Database errors safely without leaking schema internals
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const fields = Object.keys(err.errors || {}).join(', ');
    message = `Validation failed for fields: ${fields || 'unknown'}`;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid identifier format for parameter: ${err.path || 'id'}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'A record with this identifier or unique value already exists.';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication failed: Invalid or expired token.';
  } else if (statusCode >= 500) {
    // Only log internally, don't expose system/DB internals in production
    console.error(`[Internal Error] ${req.method} ${req.originalUrl}:`, err.message);
    if (process.env.NODE_ENV === 'production') {
      message = 'An unexpected internal server error occurred. Please try again later.';
    }
  }

  // Never return stack trace to client unless explicitly in development mode
  const stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;

  return errorResponse(res, message, statusCode, stack);
}

module.exports = {
  errorHandler
};
