/**
 * Authentication Service
 * 
 * NOTE FOR BACKEND INTEGRATION:
 * This service encapsulates all authentication, registration, and session management.
 * Currently uses client-side simulated responses with localStorage persistence.
 * When backend APIs are ready, replace the mock implementations below with
 * apiRequest('/auth/login', { method: 'POST', body: ... }) from ./api.js
 * without changing the function signatures or the UI components.
 */

const STORAGE_KEY = 'medicare_auth_session';
const SCHEMES_KEY = 'medicare_patient_schemes';

// Mock preset default users for quick demo/testing if needed
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
   * Log in user by role
   * @param {string} role - 'patient' | 'doctor' | 'hospital' | 'kiosk'
   * @param {object} credentials - { identifier, password, pin, etc. }
   * @returns {Promise<object>} User session object
   */
  async login(role, credentials = {}) {
    // TODO: Replace with: const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ role, ...credentials }) }); return res.json();
    return new Promise((resolve) => {
      setTimeout(() => {
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
        resolve(session);
      }, 500);
    });
  },

  /**
   * Register new user (Patient, Doctor, Hospital)
   * @param {string} role - 'patient' | 'doctor' | 'hospital'
   * @param {object} formData - Registration fields
   * @returns {Promise<object>} User session object
   */
  async register(role, formData = {}) {
    // TODO: Replace with: const res = await fetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ role, ...formData }) }); return res.json();
    return new Promise((resolve) => {
      setTimeout(() => {
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

        // Cache scheme data if patient registered with government / private schemes
        if (role === 'patient' && formData.schemes) {
          localStorage.setItem(SCHEMES_KEY, JSON.stringify(formData.schemes));
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        resolve(session);
      }, 600);
    });
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
  logout() {
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
