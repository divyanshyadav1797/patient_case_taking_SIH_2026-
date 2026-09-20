/**
 * Quantum Care Unified API Client
 * Seamlessly interfaces with Backend routes (/api/v1)
 * Uses active JWT bearer token when available with automatic fallback.
 */

const BASE_URL = (import.meta.env && import.meta.env.VITE_API_URL) || '/api/v1';
const STORAGE_KEY = 'medicare_auth_session';

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (session && session.token) {
      headers['Authorization'] = `Bearer ${session.token}`;
    }
  } catch (e) {
    // Ignore localStorage parse errors
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options
  };

  try {
    const res = await fetch(url, config);
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.message || `API error ${res.status}`);
    }
    return json.data !== undefined ? json.data : json;
  } catch (err) {
    console.warn(`[apiClient] Request to ${endpoint} failed:`, err.message);
    throw err;
  }
}

export const api = {
  // ── Appointments ──
  async getAppointments(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return request(`/appointments${qs ? `?${qs}` : ''}`);
  },

  async createAppointment(appointmentData) {
    return request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });
  },

  async updateAppointment(id, updateData) {
    return request(`/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
  },

  async cancelAppointment(id) {
    return request(`/appointments/${id}`, {
      method: 'DELETE'
    });
  },

  // ── Doctors ──
  async getDoctors(dept) {
    const qs = dept ? `?dept=${encodeURIComponent(dept)}` : '';
    return request(`/doctors${qs}`);
  },

  // ── Medical Records ──
  async getRecords(patientId) {
    const qs = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
    return request(`/records${qs}`);
  },

  async createRecord(recordData) {
    return request('/records', {
      method: 'POST',
      body: JSON.stringify(recordData)
    });
  },

  // ── Prescriptions ──
  async getPrescriptions(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return request(`/prescriptions${qs ? `?${qs}` : ''}`);
  },

  async createPrescription(rxData) {
    return request('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(rxData)
    });
  },

  // ── Kiosk ──
  async createKioskToken(tokenData) {
    return request('/kiosk/token', {
      method: 'POST',
      body: JSON.stringify(tokenData)
    });
  },

  async getKioskQueue() {
    return request('/kiosk/queue');
  },

  // ── Hospital ──
  async getHospitalStats() {
    return request('/hospital/stats');
  }
};

export default api;
