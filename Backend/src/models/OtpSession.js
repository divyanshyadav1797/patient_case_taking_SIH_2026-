const mongoose = require('mongoose');

const OtpSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  phone: { type: String, default: 'NA', index: true },
  aadhaarReference: { type: String, index: true },
  maskedAadhaar: { type: String },
  otpHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, index: true, sparse: true },
  expiresAt: { type: Date, required: true, index: { expires: '10m' } }
}, {
  timestamps: true
});

module.exports = mongoose.models.OtpSession || mongoose.model('OtpSession', OtpSessionSchema);
