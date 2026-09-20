const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    hospitalName: { type: String, trim: true },
    department: { type: String, trim: true },
    scheduledAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['booked', 'checked-in', 'completed', 'cancelled', 'rescheduled'],
      default: 'booked',
    },
    notes: { type: String, trim: true },
    qrPayload: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
