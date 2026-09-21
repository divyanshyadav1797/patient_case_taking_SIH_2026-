const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema({
  isEnrolled: { type: Boolean, default: false },
  hasGovScheme: { type: Boolean, default: false },
  govSchemeType: { type: String, default: null }, // e.g., RGHS, MAA-Y, Jan-Aadhaar
  govSchemeNum: { type: String, default: null },
  hasPrivateScheme: { type: Boolean, default: false },
  privateProvider: { type: String, default: null }, // e.g., Star Health
  privatePolicyNum: { type: String, default: null }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  customId: { type: String, index: true, unique: true, sparse: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true, index: true, sparse: true },
  phone: { type: String, trim: true, index: true, sparse: true },
  passwordHash: { type: String, required: true },
  pinHash: { type: String }, // Explicit support for 4-digit/numeric PIN
  role: {
    type: String,
    enum: ['patient', 'doctor', 'hospital', 'kiosk', 'admin'],
    required: true,
    index: true
  },
  
  // Aadhaar Identity (Privacy preserved)
  aadhaarReference: { type: String, index: true, unique: true, sparse: true }, // SHA-256 hash of raw Aadhaar
  maskedAadhaar: { type: String }, // e.g. XXXX XXXX 1234
  
  status: {
    type: String,
    enum: ['ACTIVE', 'DISABLED', 'SUSPENDED'],
    default: 'ACTIVE'
  },
  
  // Role-specific metadata
  patientDetails: {
    age: { type: Number },
    gender: { type: String },
    bloodGroup: { type: String },
    abhaId: { type: String },
    address: { type: String },
    schemes: SchemeSchema
  },
  
  doctorDetails: {
    nmcId: { type: String, index: true, sparse: true },
    specialty: { type: String },
    department: { type: String },
    hospitalId: { type: String },
    hospitalName: { type: String }
  },
  
  hospitalDetails: {
    hospitalRegNo: { type: String, index: true, sparse: true },
    licenseNumber: { type: String },
    facilityType: { type: String },
    address: { type: String }
  },
  
  kioskDetails: {
    terminalId: { type: String, index: true, sparse: true },
    hospitalId: { type: String },
    location: { type: String }
  },
  
  lastLoginAt: { type: Date }
}, {
  timestamps: true
});

// Helper method to sanitize sensitive fields before returning to client
UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject ? this.toObject() : { ...this };
  delete obj.passwordHash;
  delete obj.pinHash;
  delete obj.aadhaarReference;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
