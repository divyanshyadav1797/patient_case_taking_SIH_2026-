const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  patient: { type: String, required: true },
  patientId: { type: String, required: true, index: true },
  doctorName: { type: String, required: true },
  doctorId: { type: String, index: true },
  date: { type: String, required: true },
  diagnosis: { type: String, required: true },
  medicines: { type: String, required: true },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Discontinued'],
    default: 'Active',
    index: true
  },
  instructions: { type: String, default: '' },
  refills: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema);
