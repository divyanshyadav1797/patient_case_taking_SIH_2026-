const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    specialty: { type: String, required: true, trim: true },
    department: { type: String, trim: true },
    nmcId: { type: String, trim: true },
    hospital: { type: String, trim: true },
    availability: [{ day: String, slots: [String] }],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
