const mongoose = require('mongoose');

const KioskTokenSchema = new mongoose.Schema({
  tokenNumber: { type: String, required: true, unique: true, index: true },
  patientName: { type: String, required: true },
  aadhaar: { type: String, required: true },
  department: { type: String, default: 'General OPD' },
  doctor: { type: String, default: 'Duty Doctor' },
  concern: { type: String, default: 'General Consultation' },
  status: {
    type: String,
    enum: ['WAITING', 'CALLED', 'CONSULTING', 'COMPLETED', 'CANCELLED'],
    default: 'WAITING',
    index: true
  },
  hospitalName: { type: String, default: 'SMS Hospital Jaipur' },
  hospitalId: { type: String, index: true },
  clinicalReportId: { type: mongoose.Schema.Types.Mixed },
  appointmentId: { type: String },
  sessionId: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.models.KioskToken || mongoose.model('KioskToken', KioskTokenSchema);
