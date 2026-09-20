const mongoose = require('mongoose');

const BlacklistedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true, index: true },
  jti: { type: String, index: true },
  userId: { type: String, index: true },
  reason: { type: String, default: 'logout' },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }
}, {
  timestamps: true
});

module.exports = mongoose.models.BlacklistedToken || mongoose.model('BlacklistedToken', BlacklistedTokenSchema);
