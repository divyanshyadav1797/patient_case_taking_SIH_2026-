const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const dbConfig = require('../config/db');
const User = require('../models/User');
const OtpSession = require('../models/OtpSession');
const { hashAadhaar, maskAadhaar } = require('../utils/aadhaarUtils');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory fallback state with file persistence
let localDb = {
  users: [],
  otpSessions: []
};

// Load existing JSON DB if file exists
function loadLocalDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      localDb = JSON.parse(data);
    }
  } catch (err) {
    console.warn('[Repository] Failed to read db.json, using fresh memory state:', err.message);
  }
}

// Save to JSON DB
function saveLocalDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(localDb, null, 2), 'utf8');
  } catch (err) {
    console.error('[Repository] Failed to write db.json:', err.message);
  }
}

loadLocalDb();

/**
 * Default Seed Users for instant demonstration
 */
const DEFAULT_SEEDS = [
  {
    customId: 'P-10249',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '9876543210',
    plainPassword: 'patient123', // Also supports PIN '1234'
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
    customId: 'DOC-8821',
    name: 'Dr. Sarah Jenkins',
    email: 'dr.sarah@medicare.org',
    phone: '9829012345',
    plainPassword: 'doctor123',
    role: 'doctor',
    doctorDetails: {
      nmcId: 'NMC-2018-99412',
      specialty: 'Chief Cardiologist',
      department: 'Cardiology',
      hospitalName: 'SMS Hospital Jaipur'
    }
  },
  {
    customId: 'HOSP-RAJ-01',
    name: 'SMS Hospital Jaipur',
    email: 'admin@smshospital.org',
    phone: '01412560291',
    plainPassword: 'hospital123',
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
    plainPassword: '1234', // Kiosk PIN
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
   * Seed demo accounts if not present
   */
  async seedDefaultUsers() {
    for (const seed of DEFAULT_SEEDS) {
      const passwordHash = await bcrypt.hash(seed.plainPassword, 10);
      const aadhaarRef = seed.rawAadhaar ? hashAadhaar(seed.rawAadhaar) : undefined;
      const masked = seed.rawAadhaar ? maskAadhaar(seed.rawAadhaar) : undefined;

      const record = {
        customId: seed.customId,
        name: seed.name,
        email: seed.email,
        phone: seed.phone,
        passwordHash,
        role: seed.role,
        status: 'ACTIVE',
        aadhaarReference: aadhaarRef,
        maskedAadhaar: masked,
        patientDetails: seed.patientDetails,
        doctorDetails: seed.doctorDetails,
        hospitalDetails: seed.hospitalDetails,
        kioskDetails: seed.kioskDetails,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (dbConfig.isConnected) {
        try {
          const exists = await User.findOne({
            $or: [
              { email: seed.email },
              { customId: seed.customId }
            ]
          });
          if (!exists) {
            await User.create(record);
          }
        } catch (e) {
          console.warn('[Repository] Mongoose seed error:', e.message);
        }
      }

      // Also ensure localDb has the record
      const localExists = localDb.users.find(u => u.email === seed.email || u.customId === seed.customId);
      if (!localExists) {
        localDb.users.push({
          _id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...record
        });
        saveLocalDb();
      }
    }
    console.log('[Repository] Demo accounts ready: Patient, Doctor, Hospital, Kiosk.');
  }

  /**
   * Find user by database ID or customId
   */
  async findById(id) {
    if (dbConfig.isConnected) {
      try {
        const user = await User.findById(id);
        if (user) return user.toSafeObject ? user.toSafeObject() : user;
      } catch (e) {
        // Fallback to local
      }
    }
    const local = localDb.users.find(u => u._id === id || u.customId === id);
    if (!local) return null;
    const safe = { ...local };
    delete safe.passwordHash;
    delete safe.aadhaarReference;
    return safe;
  }

  /**
   * Find raw user by identifier (includes passwordHash for auth check)
   */
  async findRawByRoleAndIdentifier(role, identifier) {
    const cleanId = String(identifier || '').trim();
    const cleanLower = cleanId.toLowerCase();
    const cleanAadhaarRef = hashAadhaar(cleanId);

    if (dbConfig.isConnected) {
      try {
        const query = {
          role,
          $or: [
            { email: cleanLower },
            { phone: cleanId },
            { customId: cleanId },
            { aadhaarReference: cleanAadhaarRef },
            { 'doctorDetails.nmcId': cleanId },
            { 'hospitalDetails.hospitalRegNo': cleanId },
            { 'kioskDetails.terminalId': cleanId }
          ]
        };
        const user = await User.findOne(query);
        if (user) return user.toObject ? user.toObject() : user;
      } catch (e) {
        // Fallback to local
      }
    }

    // Search local DB
    return localDb.users.find(u => {
      if (u.role !== role) return false;
      if (u.email && u.email.toLowerCase() === cleanLower) return true;
      if (u.phone && u.phone === cleanId) return true;
      if (u.customId && u.customId === cleanId) return true;
      if (u.aadhaarReference && u.aadhaarReference === cleanAadhaarRef) return true;
      if (u.doctorDetails?.nmcId && u.doctorDetails.nmcId.toLowerCase() === cleanLower) return true;
      if (u.hospitalDetails?.hospitalRegNo && u.hospitalDetails.hospitalRegNo.toLowerCase() === cleanLower) return true;
      if (u.kioskDetails?.terminalId && u.kioskDetails.terminalId.toLowerCase() === cleanLower) return true;
      return false;
    });
  }

  /**
   * Check if email, phone, or Aadhaar already exists
   */
  async findExistingConflict({ role, email, phone, aadhaarReference, nmcId, hospitalRegNo }) {
    if (dbConfig.isConnected) {
      try {
        const conditions = [];
        if (email) conditions.push({ email: email.toLowerCase() });
        if (phone) conditions.push({ phone });
        if (aadhaarReference) conditions.push({ aadhaarReference });
        if (nmcId) conditions.push({ 'doctorDetails.nmcId': nmcId });
        if (hospitalRegNo) conditions.push({ 'hospitalDetails.hospitalRegNo': hospitalRegNo });

        if (conditions.length > 0) {
          const conflict = await User.findOne({ $or: conditions });
          if (conflict) return conflict;
        }
      } catch (e) {
        // Fallback to local
      }
    }

    return localDb.users.find(u => {
      if (email && u.email && u.email.toLowerCase() === email.toLowerCase()) return true;
      if (phone && u.phone && u.phone === phone) return true;
      if (aadhaarReference && u.aadhaarReference && u.aadhaarReference === aadhaarReference) return true;
      if (nmcId && u.doctorDetails?.nmcId && u.doctorDetails.nmcId.toLowerCase() === nmcId.toLowerCase()) return true;
      if (hospitalRegNo && u.hospitalDetails?.hospitalRegNo && u.hospitalDetails.hospitalRegNo.toLowerCase() === hospitalRegNo.toLowerCase()) return true;
      return false;
    });
  }

  /**
   * Create new user
   */
  async createUser(userData) {
    const now = new Date().toISOString();
    const newDoc = {
      ...userData,
      createdAt: now,
      updatedAt: now
    };

    if (dbConfig.isConnected) {
      try {
        const created = await User.create(newDoc);
        // Also sync local
        localDb.users.push(created.toObject ? created.toObject() : created);
        saveLocalDb();
        return created.toSafeObject ? created.toSafeObject() : created;
      } catch (e) {
        console.warn('[Repository] Mongoose create failed, using local store:', e.message);
      }
    }

    const localUser = {
      _id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...newDoc
    };
    localDb.users.push(localUser);
    saveLocalDb();

    const safe = { ...localUser };
    delete safe.passwordHash;
    delete safe.aadhaarReference;
    return safe;
  }

  /**
   * Update user details
   */
  async updateUser(id, updateData) {
    updateData.updatedAt = new Date().toISOString();

    if (dbConfig.isConnected) {
      try {
        const updated = await User.findByIdAndUpdate(id, updateData, { new: true });
        if (updated) {
          const idx = localDb.users.findIndex(u => u._id === String(id) || u.customId === String(id));
          if (idx !== -1) {
            localDb.users[idx] = { ...localDb.users[idx], ...updateData };
            saveLocalDb();
          }
          return updated.toSafeObject ? updated.toSafeObject() : updated;
        }
      } catch (e) {}
    }

    const idx = localDb.users.findIndex(u => u._id === String(id) || u.customId === String(id));
    if (idx !== -1) {
      localDb.users[idx] = { ...localDb.users[idx], ...updateData };
      saveLocalDb();
      const safe = { ...localDb.users[idx] };
      delete safe.passwordHash;
      delete safe.aadhaarReference;
      return safe;
    }
    return null;
  }

  /**
   * List all registered users (for admin/demo inspection)
   */
  async listAllUsers() {
    if (dbConfig.isConnected) {
      try {
        const users = await User.find().select('-passwordHash -aadhaarReference');
        return users;
      } catch (e) {}
    }
    return localDb.users.map(u => {
      const safe = { ...u };
      delete safe.passwordHash;
      delete safe.aadhaarReference;
      return safe;
    });
  }

  // --- OTP Session Store ---
  async saveOtpSession(sessionData) {
    if (dbConfig.isConnected) {
      try {
        await OtpSession.create(sessionData);
      } catch (e) {}
    }
    localDb.otpSessions = localDb.otpSessions.filter(s => new Date(s.expiresAt) > new Date());
    localDb.otpSessions.push(sessionData);
    saveLocalDb();
    return sessionData;
  }

  async findOtpSession(sessionId) {
    if (dbConfig.isConnected) {
      try {
        const s = await OtpSession.findOne({ sessionId });
        if (s) return s;
      } catch (e) {}
    }
    return localDb.otpSessions.find(s => s.sessionId === sessionId);
  }

  async updateOtpSession(sessionId, updates) {
    if (dbConfig.isConnected) {
      try {
        await OtpSession.findOneAndUpdate({ sessionId }, updates);
      } catch (e) {}
    }
    const idx = localDb.otpSessions.findIndex(s => s.sessionId === sessionId);
    if (idx !== -1) {
      localDb.otpSessions[idx] = { ...localDb.otpSessions[idx], ...updates };
      saveLocalDb();
    }
  }
}

module.exports = new UserRepository();
