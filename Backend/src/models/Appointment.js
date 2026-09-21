const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  customId: { type: String, unique: true, sparse: true, index: true },
  id: { type: String, index: true },
  patientId: { type: String, required: true, index: true },
  patientName: { type: String, required: true },
  doctorId: { type: String, index: true },
  doctorName: { type: String, required: true },
  specialty: { type: String, default: 'General Medicine' },
  hospital: { type: String, default: 'SMS Hospital Jaipur' },
  hospitalId: { type: String, index: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    default: 'Upcoming',
    index: true
  },
  type: { type: String, default: 'Hospital Consultation' },
  tokenNumber: { type: String },
  clinicalReportId: { type: mongoose.Schema.Types.Mixed },
  chiefComplaint: { type: String },
  notes: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
