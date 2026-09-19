const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    req.user = { token, role: 'prototype' };
    return next();
  }

  try {
    req.user = jwt.verify(token, secret);
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

module.exports = authMiddleware;
