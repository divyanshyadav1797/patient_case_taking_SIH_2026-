const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    abhaId: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', 'unspecified'], default: 'unspecified' },
    bloodGroup: { type: String, trim: true },
    allergies: [{ type: String }],
    conditions: [{ type: String }],
    schemes: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Patient || mongoose.model('Patient', patientSchema);
