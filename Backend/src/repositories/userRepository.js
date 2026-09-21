const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OtpSession = require('../models/OtpSession');
const { hashAadhaar, maskAadhaar, normalizeAadhaar } = require('../utils/aadhaarUtils');

/**
 * Default Seed Users for instant demonstration
 */
const DEFAULT_SEEDS = [
  {
    customId: 'P-10249',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '9876543210',
    plainPassword: 'patient123',
    plainPin: '1234',
    role: 'patient',
    rawAadhaar: '123456789012',
    patientDetails: {
      age: 28,
      gender: 'Male',
      bloodGroup: 'B+',
      abhaId: '91-4521-8890-2341',
      address: 'Plot 42, Malviya Nagar, Jaipur, Rajasthan',
      schemes: {
        isEnrolled: true,
        hasGovScheme: true,
        govSchemeType: 'RGHS',
        govSchemeNum: 'RGHS-RJ-2024-8819',
        hasPrivateScheme: true,
        privateProvider: 'Star Health',
        privatePolicyNum: 'STAR-IND-44912'
      }
    }
  },
  {
    customId: 'DOC-8820',
    name: 'Dr. Rajesh Sharma',
    email: 'dr.sharma@hospital.com',
    phone: '9829012344',
    plainPassword: 'doctor123',
    plainPin: '1234',
    role: 'doctor',
    doctorDetails: {
      nmcId: 'NMC-2024-CARD-9912',
      specialty: 'Cardiology',
      department: 'Cardiology',
      hospitalName: 'SMS Hospital Jaipur'
    }
  },
  {
    customId: 'DOC-8821',
    name: 'Dr. Sarah Jenkins',
    email: 'dr.sarah@medicare.org',
    phone: '9829012345',
    plainPassword: 'doctor123',
    plainPin: '1234',
    role: 'doctor',
    doctorDetails: {
      nmcId: 'NMC-2018-99412',
      specialty: 'Chief Cardiologist',
      department: 'Cardiology',
      hospitalName: 'SMS Hospital Jaipur'
    }
  },
  {
    customId: 'DOC-8822',
    name: 'Dr. Michael Chang',
    email: 'dr.chang@medicare.org',
    phone: '9829012346',
    plainPassword: 'doctor123',
    plainPin: '1234',
    role: 'doctor',
    doctorDetails: {
      nmcId: 'NMC-2019-10294',
      specialty: 'Neurology',
      department: 'Neurology',
      hospitalName: 'SMS Hospital Jaipur'
    }
  },
  {
    customId: 'DOC-8823',
    name: 'Dr. Priya Patel',
    email: 'dr.patel@medicare.org',
    phone: '9829012347',
    plainPassword: 'doctor123',
    plainPin: '1234',
    role: 'doctor',
    doctorDetails: {
      nmcId: 'NMC-2020-55123',
      specialty: 'General Physician',
      department: 'General Medicine',
      hospitalName: 'SMS Hospital Jaipur'
    }
  },
  {
    customId: 'DOC-8824',
    name: 'Dr. Rajesh Gupta',
    email: 'dr.gupta@medicare.org',
    phone: '9829012348',
    plainPassword: 'doctor123',
    plainPin: '1234',
    role: 'doctor',
    doctorDetails: {
      nmcId: 'NMC-2016-88219',
      specialty: 'Orthopedics',
      department: 'Orthopedics',
      hospitalName: 'SMS Hospital Jaipur'
    }
  },
  {
    customId: 'DOC-8825',
    name: 'Dr. Ananya Roy',
    email: 'dr.roy@medicare.org',
    phone: '9829012349',
    plainPassword: 'doctor123',
    plainPin: '1234',
    role: 'doctor',
    doctorDetails: {
      nmcId: 'NMC-2021-33291',
      specialty: 'Pediatrics',
      department: 'Pediatrics',
      hospitalName: 'SMS Hospital Jaipur'
    }
  },
  {
    customId: 'HOSP-RAJ-01',
    name: 'SMS Hospital Jaipur',
    email: 'admin@smshospital.org',
    phone: '01412560291',
    plainPassword: 'hospital123',
    plainPin: '1234',
    role: 'hospital',
    hospitalDetails: {
      hospitalRegNo: 'RJ-MED-2014-991',
      licenseNumber: 'LIC-SMS-9918',
      facilityType: 'Super Specialty Government Hospital',
      address: 'Jawahar Lal Nehru Marg, Jaipur, Rajasthan 302004'
    }
  },
  {
    customId: 'KIOSK-TER-04',
    name: 'OPD Check-In Terminal 04',
    email: 'kiosk.terminal04@smshospital.org',
    phone: '9999900004',
    plainPassword: '1234',
    plainPin: '1234',
    role: 'kiosk',
    kioskDetails: {
      terminalId: 'KIOSK-TER-04',
      hospitalId: 'HOSP-RAJ-01',
      location: 'Main Hospital Ground Floor - Reception A'
    }
  }
];

class UserRepository {
  /**
   * Seed demo accounts in MongoDB if not present
   */
  async seedDefaultUsers() {
    try {
      for (const seed of DEFAULT_SEEDS) {
        const passwordHash = await bcrypt.hash(seed.plainPassword, 10);
        const pinHash = seed.plainPin ? await bcrypt.hash(seed.plainPin, 10) : undefined;
        const aadhaarRef = seed.rawAadhaar ? hashAadhaar(seed.rawAadhaar) : undefined;
        const masked = seed.rawAadhaar ? maskAadhaar(seed.rawAadhaar) : undefined;

        const record = {
          customId: seed.customId,
          name: seed.name,
          email: seed.email,
          phone: seed.phone,
          passwordHash,
          pinHash,
          role: seed.role,
          status: 'ACTIVE',
          aadhaarReference: aadhaarRef,
          maskedAadhaar: masked,
          patientDetails: seed.patientDetails,
          doctorDetails: seed.doctorDetails,
          hospitalDetails: seed.hospitalDetails,
          kioskDetails: seed.kioskDetails
        };

        const conditions = [];
        if (seed.email) conditions.push({ email: seed.email.toLowerCase() });
        if (seed.customId) conditions.push({ customId: seed.customId });

        const existing = await User.findOne({ $or: conditions });
        if (!existing) {
          await User.create(record);
        } else {
          // Ensure pinHash and other essential fields are up to date
          const updates = {};
          if (!existing.pinHash && pinHash) updates.pinHash = pinHash;
          if (!existing.aadhaarReference && aadhaarRef) updates.aadhaarReference = aadhaarRef;
          if (!existing.maskedAadhaar && masked) updates.maskedAadhaar = masked;
          if (Object.keys(updates).length > 0) {
            await User.updateOne({ _id: existing._id }, { $set: updates });
          }
        }
      }
      console.log('[UserRepository] Demo accounts verified in MongoDB (Patient, Doctors, Hospital, Kiosk).');
    } catch (err) {
      console.error('[UserRepository] Error seeding demo users in MongoDB:', err.message);
    }
  }

  /**
   * Find user by database ID or customId
   */
  async findById(id) {
    if (!id) return null;
    try {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(String(id));
      const query = isObjectId ? { $or: [{ _id: id }, { customId: id }] } : { customId: id };
      const user = await User.findOne(query);
      if (user) {
        return user.toSafeObject ? user.toSafeObject() : user;
      }
      return null;
    } catch (e) {
      console.error('[UserRepository] findById error:', e.message);
      return null;
    }
  }

  /**
   * Find raw user by identifier (includes passwordHash and pinHash for auth check)
   */
  async findRawByRoleAndIdentifier(role, identifier) {
    const rawId = String(identifier || '').trim();
    const cleanLower = rawId.toLowerCase();
    
    // Normalize Aadhaar if it looks like numeric digits (e.g. 12 digits or formatted)
    const digitsOnly = rawId.replace(/\D/g, '');
    const cleanAadhaarRef = digitsOnly.length === 12 ? hashAadhaar(digitsOnly) : hashAadhaar(rawId);

    const conditions = [
      { email: cleanLower },
      { phone: rawId },
      { phone: digitsOnly },
      ...(digitsOnly.length >= 10 ? [{ phone: new RegExp(digitsOnly.slice(-10) + '$') }] : []),
      { customId: rawId },
      { aadhaarReference: cleanAadhaarRef },
      { 'doctorDetails.nmcId': rawId },
      { 'doctorDetails.nmcId': cleanLower },
      { 'hospitalDetails.hospitalRegNo': rawId },
      { 'hospitalDetails.hospitalRegNo': cleanLower },
      { 'hospitalDetails.licenseNumber': rawId },
      { 'hospitalDetails.licenseNumber': cleanLower },
      { name: new RegExp('^' + rawId.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '$', 'i') },
      { 'kioskDetails.terminalId': rawId },
      { 'kioskDetails.terminalId': cleanLower }
    ];

    // If identifier matches an ObjectId format
    if (/^[0-9a-fA-F]{24}$/.test(rawId)) {
      conditions.push({ _id: rawId });
    }

    try {
      const query = {
        role,
        $or: conditions
      };

      const user = await User.findOne(query);
      if (user) {
        return user.toObject ? user.toObject() : user;
      }
      return null;
    } catch (e) {
      console.error('[UserRepository] findRawByRoleAndIdentifier error:', e.message);
      return null;
    }
  }

  /**
   * Check if email, phone, or Aadhaar already exists in MongoDB
   */
  async findExistingConflict({ role, email, phone, aadhaarReference, nmcId, hospitalRegNo }) {
    const conditions = [];
    if (email) conditions.push({ email: String(email).trim().toLowerCase() });
    if (phone) {
      const cleanPhone = String(phone).trim();
      conditions.push({ phone: cleanPhone });
    }
    if (aadhaarReference) conditions.push({ aadhaarReference });
    if (nmcId) conditions.push({ 'doctorDetails.nmcId': String(nmcId).trim() });
    if (hospitalRegNo) conditions.push({ 'hospitalDetails.hospitalRegNo': String(hospitalRegNo).trim() });

    if (conditions.length === 0) return null;

    try {
      const conflict = await User.findOne({ $or: conditions });
      return conflict ? (conflict.toObject ? conflict.toObject() : conflict) : null;
    } catch (e) {
      console.error('[UserRepository] findExistingConflict error:', e.message);
      return null;
    }
  }

  /**
   * Create new user in MongoDB
   */
  async createUser(userData) {
    try {
      const created = await User.create(userData);
      return created.toSafeObject ? created.toSafeObject() : created;
    } catch (e) {
      console.error('[UserRepository] createUser error:', e.message);
      throw e;
    }
  }

  /**
   * Update user details in MongoDB
   */
  async updateUser(id, updateData) {
    if (!id) return null;
    try {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(String(id));
      const query = isObjectId ? { $or: [{ _id: id }, { customId: id }] } : { customId: id };

      const updated = await User.findOneAndUpdate(query, updateData, { new: true });
      if (updated) {
        return updated.toSafeObject ? updated.toSafeObject() : updated;
      }
      return null;
    } catch (e) {
      console.error('[UserRepository] updateUser error:', e.message);
      return null;
    }
  }

  /**
   * List all registered users from MongoDB (for admin/inspection)
   */
  async listAllUsers() {
    try {
      const users = await User.find().select('-passwordHash -pinHash -aadhaarReference').lean();
      return users;
    } catch (e) {
      console.error('[UserRepository] listAllUsers error:', e.message);
      return [];
    }
  }

  // ── OTP Session Store in MongoDB ──
  async saveOtpSession(sessionData) {
    try {
      const session = await OtpSession.create(sessionData);
      return session ? (session.toObject ? session.toObject() : session) : sessionData;
    } catch (e) {
      console.error('[UserRepository] saveOtpSession error:', e.message);
      throw e;
    }
  }

  async findOtpSession(sessionId) {
    if (!sessionId) return null;
    try {
      const s = await OtpSession.findOne({
        $or: [{ sessionId }, { verificationToken: sessionId }]
      }).lean();
      return s;
    } catch (e) {
      console.error('[UserRepository] findOtpSession error:', e.message);
      return null;
    }
  }

  async findOtpSessionByToken(verificationToken) {
    if (!verificationToken) return null;
    try {
      const s = await OtpSession.findOne({ verificationToken }).lean();
      return s;
    } catch (e) {
      console.error('[UserRepository] findOtpSessionByToken error:', e.message);
      return null;
    }
  }

  async updateOtpSession(sessionId, updates) {
    if (!sessionId) return null;
    try {
      const s = await OtpSession.findOneAndUpdate(
        { $or: [{ sessionId }, { verificationToken: sessionId }] },
        updates,
        { new: true }
      ).lean();
      return s;
    } catch (e) {
      console.error('[UserRepository] updateOtpSession error:', e.message);
      return null;
    }
  }
}

module.exports = new UserRepository();
