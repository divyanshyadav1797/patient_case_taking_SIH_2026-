const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
  customId: { type: String, unique: true, sparse: true, index: true },
  id: { type: String, index: true },
  patientId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  doctor: { type: String, default: 'Dr. Sarah Jenkins' },
  hospital: { type: String, default: 'SMS Hospital Jaipur' },
  date: { type: String, required: true },
  type: {
    type: String,
    default: 'Lab Report',
    index: true
  },
  file: { type: String, default: 'report.pdf' },
  fileUrl: { type: String },
  size: { type: String, default: '1.5 MB' },
  ocrData: {
    rawText: { type: String, default: '' },
    summary: { type: String, default: '' },
    parsedValues: { type: mongoose.Schema.Types.Mixed, default: {} },
    scannedAt: { type: Date }
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', MedicalRecordSchema);
