/**
 * Quantum Care Authentication Service
 * Seamlessly integrates with the Node.js + Express backend on http://localhost:3000/api/v1/auth
 * with resilient offline fallback for local demoing.
 */

const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL) || '/api/v1';
const STORAGE_KEY = 'medicare_auth_session';
const SCHEMES_KEY = 'medicare_patient_schemes';

// Mock preset default users for fallback/demo
export const DEFAULT_USERS = {
  patient: {
    id: 'P-10249',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    role: 'patient',
    phone: '+91 98765 43210',
    abhaId: '91-4521-8890-2341'
  },
  doctor: {
    id: 'DOC-8821',
    name: 'Dr. Sarah Jenkins',
    email: 'dr.sarah@medicare.org',
    role: 'doctor',
    specialty: 'Chief Cardiologist',
    department: 'Cardiology',
    nmcId: 'NMC-2018-99412'
  },
  hospital: {
    id: 'HOSP-RAJ-01',
    name: 'SMS Hospital Jaipur',
    email: 'admin@smshospital.org',
    role: 'hospital',
    facilityType: 'Super Specialty Government Hospital',
    regNo: 'RJ-MED-2014-991'
  },
  kiosk: {
    id: 'KIOSK-TER-04',
    name: 'OPD Check-In Terminal 04',
    role: 'kiosk',
    location: 'Main Hospital Ground Floor - Reception A'
  }
};

export const authService = {
  /**
   * Log in user by role against the Backend API
   * @param {string} role - 'patient' | 'doctor' | 'hospital' | 'kiosk'
   * @param {object} credentials - { identifier, password, pin, etc. }
   * @returns {Promise<object>} User session object
   */
  async login(role, credentials = {}) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          identifier: credentials.identifier,
          password: credentials.password,
          pin: credentials.pin
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please check credentials.');
      }

      const session = {
        token: data.data.token,
        user: {
          id: data.data.user._id || data.data.user.customId,
          name: data.data.user.name,
          email: data.data.user.email,
          phone: data.data.user.phone,
          role: data.data.user.role,
          ...data.data.user
        },
        loginTime: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      return session;
    } catch (networkOrApiErr) {
      console.warn('[authService] Backend API call error:', networkOrApiErr.message);

      // If it's a 401 invalid password from the API, rethrow so the UI shows the real error!
      if (networkOrApiErr.message && !networkOrApiErr.message.includes('fetch')) {
        throw networkOrApiErr;
      }

      // Offline simulated fallback if backend server is not running
      const baseUser = DEFAULT_USERS[role] || {
        id: `${role.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        name: credentials.identifier || `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
        email: credentials.identifier || `${role}@medicare.org`,
        role
      };

      const session = {
        token: `mock_jwt_token_${role}_${Date.now()}`,
        user: {
          ...baseUser,
          identifier: credentials.identifier || baseUser.email || baseUser.id
        },
        loginTime: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      return session;
    }
  },

  /**
   * Register new user (Patient, Doctor, Hospital) against Backend API
   * @param {string} role - 'patient' | 'doctor' | 'hospital'
   * @param {object} formData - Registration fields
   * @returns {Promise<object>} User session object
   */
  async register(role, formData = {}) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          name: formData.name || formData.fullName,
          fullName: formData.name || formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password || formData.pin,
          pin: formData.pin,
          aadhaar: formData.aadhaar,
          nmcId: formData.nmcId,
          hospitalRegNo: formData.hospitalRegNo,
          schemes: formData.schemes,
          ...formData
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed.');
      }

      const session = {
        token: data.data.token,
        user: {
          id: data.data.user._id || data.data.user.customId,
          name: data.data.user.name,
          email: data.data.user.email,
          phone: data.data.user.phone,
          role: data.data.user.role,
          ...data.data.user
        },
        loginTime: new Date().toISOString()
      };

      if (role === 'patient' && formData.schemes) {
        localStorage.setItem(SCHEMES_KEY, JSON.stringify(formData.schemes));
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      return session;
    } catch (err) {
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }

      // Offline fallback
      const session = {
        token: `mock_jwt_token_${role}_${Date.now()}`,
        user: {
          id: `${role.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
          name: formData.name || formData.fullName || 'Registered User',
          email: formData.email || '',
          phone: formData.phone || '',
          role,
          ...formData
        },
        loginTime: new Date().toISOString()
      };

      if (role === 'patient' && formData.schemes) {
        localStorage.setItem(SCHEMES_KEY, JSON.stringify(formData.schemes));
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      return session;
    }
  },

  /**
   * Request Aadhaar / Mobile OTP from Backend
   */
  async requestOtp(aadhaar, phone) {
    const res = await fetch(`${API_BASE}/auth/register/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aadhaar, phone })
    });
    return res.json();
  },

  /**
   * Verify Aadhaar / Mobile OTP with Backend
   */
  async verifyOtp(sessionId, otp) {
    const res = await fetch(`${API_BASE}/auth/register/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, otp })
    });
    return res.json();
  },

  /**
   * Get active session from localStorage
   * @returns {object|null}
   */
  getCurrentSession() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  /**
   * Log out active session
   */
  async logout() {
    const session = this.getCurrentSession();
    if (session?.token) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token}`
          }
        });
      } catch (e) {
        // Continue logout locally even if network is offline
      }
    }
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Get saved schemes for patient
   */
  getSavedSchemes() {
    try {
      const data = localStorage.getItem(SCHEMES_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
};
