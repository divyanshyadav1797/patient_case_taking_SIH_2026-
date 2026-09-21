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
  async getDoctors(params = {}) {
    let qs = '';
    if (typeof params === 'string') {
      qs = params ? `?dept=${encodeURIComponent(params)}` : '';
    } else if (params && typeof params === 'object') {
      const sp = new URLSearchParams();
      if (params.dept) sp.append('dept', params.dept);
      if (params.hospital) sp.append('hospital', params.hospital);
      if (params.hospitalId) sp.append('hospitalId', params.hospitalId);
      const str = sp.toString();
      if (str) qs = `?${str}`;
    }
    return request(`/doctors${qs}`);
  },

  async createDoctor(doctorData) {
    return request('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData)
    });
  },

  async updateDoctor(id, updateData) {
    return request(`/doctors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
  },

  async deleteDoctor(id) {
    return request(`/doctors/${id}`, {
      method: 'DELETE'
    });
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

  async updateRecord(id, updateData) {
    return request(`/records/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
  },

  async deleteRecord(id) {
    return request(`/records/${id}`, {
      method: 'DELETE'
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

  // ── AI Clinical Intake (Question Asking Phase) ──
  async startAiIntake(intakeData) {
    return request('/ai/intake/start', {
      method: 'POST',
      body: JSON.stringify(intakeData)
    });
  },

  async answerAiIntake(sessionId, answerData, language = 'en', patientId = '') {
    const payload = typeof answerData === 'string'
      ? { answer: answerData, language, patientId }
      : { ...answerData };
    if (!payload.language && language) payload.language = language;
    if (!payload.patientId && patientId) payload.patientId = patientId;
    return request(`/ai/intake/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async answerAiIntakeVoice(sessionId, audioBlob, language = 'hi', patientId = '') {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const form = new FormData();
    form.append('audio', audioBlob, 'answer.webm');
    if (language) form.append('language', language);
    if (patientId) form.append('patientId', patientId);

    const headers = {};
    if (session && session.token) {
      headers['Authorization'] = `Bearer ${session.token}`;
    }

    const response = await fetch(`${BASE_URL}/ai/intake/${sessionId}/voice-answer`, {
      method: 'POST',
      headers,
      body: form
    });

    const json = await response.json();
    if (!response.ok || json.success === false) {
      throw new Error(json.message || json.error?.message || `Voice intake error ${response.status}`);
    }
    return json.data !== undefined ? json.data : json;
  },

  async transcribeVoice(audioBlob, language = 'hi') {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const form = new FormData();
    form.append('audio', audioBlob, 'speech.webm');
    if (language) form.append('language', language);

    const headers = {};
    if (session && session.token) {
      headers['Authorization'] = `Bearer ${session.token}`;
    }

    const response = await fetch(`${BASE_URL}/ai/voice/transcribe`, {
      method: 'POST',
      headers,
      body: form
    });

    const json = await response.json();
    if (!response.ok || json.success === false) {
      throw new Error(json.message || json.error?.message || `Voice transcription error ${response.status}`);
    }
    return json.data !== undefined ? json.data : json;
  },

  async getAiIntakeSession(sessionId) {
    return request(`/ai/intake/${sessionId}`);
  },

  // ── Clinical Reports (AI Synthesized & Doctor Review) ──
  async getClinicalReports(patientId) {
    const qs = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
    return request(`/clinical-reports${qs}`);
  },

  async getClinicalReportById(id) {
    return request(`/clinical-reports/${id}`);
  },

  async updateClinicalReport(id, updateData) {
    return request(`/clinical-reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
  },

  // ── Comprehensive Medical History Timeline ──
  async getPatientHistory(patientId) {
    const endpoint = patientId ? `/patients/${encodeURIComponent(patientId)}/history` : '/history';
    return request(endpoint);
  },

  // ── AI Longitudinal Medical History Summary (Synthesizes previous reports) ──
  async getAiMedicalHistorySummary(patientId, currentComplaint = '') {
    const qs = currentComplaint ? `?currentComplaint=${encodeURIComponent(currentComplaint)}` : '';
    const endpoint = patientId ? `/patients/${encodeURIComponent(patientId)}/ai-medical-history-summary${qs}` : `/history${qs}`;
    return request(endpoint);
  },

  // ── Kiosk ──
  async kioskPatientAuth(aadhaar, pin) {
    return request('/auth/kiosk/patient-auth', {
      method: 'POST',
      body: JSON.stringify({ aadhaar, pin })
    });
  },

  async kioskFastRegister(data) {
    return request('/auth/kiosk/fast-register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

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
  },

  async uploadMedicalDocument(file, metadata = {}) {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const form = new FormData();

    form.append('document', file);

    Object.entries(metadata).forEach(([key, val]) => {
      if (val !== undefined && val !== null && key !== 'file') {
        form.append(key, val);
      }
    });

    const headers = {};
    if (session.token) {
      headers.Authorization = `Bearer ${session.token}`;
    }

    const response = await fetch(`${BASE_URL}/records/upload`, {
      method: 'POST',
      headers,
      body: form
    });

    const json = await response.json();
    if (!response.ok || json.success === false) {
      throw new Error(json.message || json.error?.message || `API error ${response.status}`);
    }

    return json.data !== undefined ? json.data : json;
  },

  async uploadRecord(file, metadata = {}) {
    return this.uploadMedicalDocument(file, metadata);
  }
};



export default api;
