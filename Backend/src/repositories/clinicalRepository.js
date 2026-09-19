const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let localDb = {
  users: [],
  otpSessions: [],
  blacklistedTokens: [],
  appointments: [],
  doctors: [],
  records: [],
  prescriptions: [],
  kioskTokens: []
};

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(data);
      localDb = { ...localDb, ...parsed };
    }
  } catch (err) {
    console.warn('[ClinicalRepo] Failed to read db.json:', err.message);
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(localDb, null, 2), 'utf8');
  } catch (err) {
    console.error('[ClinicalRepo] Failed to write db.json:', err.message);
  }
}

loadDb();

const DEFAULT_DOCTORS = [
  { id: 1, name: "Dr. Sarah Jenkins", specialty: "Cardiology", department: "Cardiology", experience: "14 yrs exp", rating: "4.9", reviews: 142, available: "Available Today", fee: "₹800", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300", hospital: "SMS Hospital Jaipur" },
  { id: 2, name: "Dr. Michael Chang", specialty: "Neurology", department: "Neurology", experience: "12 yrs exp", rating: "4.8", reviews: 98, available: "Next slot: Tomorrow", fee: "₹1,000", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300", hospital: "SMS Hospital Jaipur" },
  { id: 3, name: "Dr. Priya Patel", specialty: "General Physician", department: "General Medicine", experience: "9 yrs exp", rating: "4.9", reviews: 210, available: "Available Today", fee: "₹500", image: "https://images.unsplash.com/photo-1594824813581-9b16866b1a20?auto=format&fit=crop&q=80&w=300", hospital: "SMS Hospital Jaipur" },
  { id: 4, name: "Dr. Rajesh Gupta", specialty: "Orthopedics", department: "Orthopedics", experience: "16 yrs exp", rating: "4.7", reviews: 175, available: "Available Today", fee: "₹900", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300", hospital: "SMS Hospital Jaipur" },
  { id: 5, name: "Dr. Ananya Roy", specialty: "Pediatrics", department: "Pediatrics", experience: "8 yrs exp", rating: "4.9", reviews: 89, available: "Next slot: Monday", fee: "₹600", image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=300", hospital: "SMS Hospital Jaipur" }
];

const DEFAULT_APPOINTMENTS = [
  { id: 'APT-101', patientId: 'P-10249', patientName: 'Rahul Sharma', doctorName: 'Dr. Sarah Jenkins', specialty: 'Cardiology', hospital: 'SMS Hospital, Jaipur', date: 'Tomorrow, Sep 19', time: '10:30 AM', status: 'Upcoming', type: 'Hospital Consultation' },
  { id: 'APT-102', patientId: 'P-10249', patientName: 'Rahul Sharma', doctorName: 'Dr. Priya Patel', specialty: 'General Physician', hospital: 'Apollo Clinic', date: 'Sep 24, 2026', time: '02:00 PM', status: 'Upcoming', type: 'Routine Follow-up' },
  { id: 'APT-098', patientId: 'P-10249', patientName: 'Rahul Sharma', doctorName: 'Dr. Rajesh Gupta', specialty: 'Orthopedics', hospital: 'Fortis Hospital', date: 'Aug 14, 2026', time: '11:15 AM', status: 'Completed', type: 'Knee Joint Consultation' },
  { id: 'APT-095', patientId: 'P-10249', patientName: 'Rahul Sharma', doctorName: 'Dr. Michael Chang', specialty: 'Neurology', hospital: 'Eternal Heart Care', date: 'Jul 28, 2026', time: '04:00 PM', status: 'Cancelled', type: 'Migraine Review' }
];

const DEFAULT_RECORDS = [
  { id: 'REC-01', patientId: 'P-10249', title: 'Comprehensive Lipid & Blood Profile', doctor: 'Dr. Sarah Jenkins', hospital: 'SMS Central Lab', date: 'Sep 10, 2026', type: 'Lab Report', file: 'blood_report_sep2026.pdf', size: '1.8 MB' },
  { id: 'REC-02', patientId: 'P-10249', title: 'Chest X-Ray Digital Imaging', doctor: 'Dr. Rajesh Gupta', hospital: 'Radiology Wing B', date: 'Aug 14, 2026', type: 'Diagnostic Scan', file: 'chest_xray_aug2026.pdf', size: '4.2 MB' },
  { id: 'REC-03', patientId: 'P-10249', title: 'Hypertension Discharge Summary', doctor: 'Dr. Priya Patel', hospital: 'SMS Hospital', date: 'Jul 28, 2026', type: 'Discharge Summary', file: 'discharge_jul2026.pdf', size: '2.5 MB' }
];

const DEFAULT_PRESCRIPTIONS = [
  { id: 'RX-101', patient: 'Rahul Sharma', patientId: 'P-10249', doctorName: 'Dr. Sarah Jenkins', date: '10 Sep 2026', diagnosis: 'Tension Headache', medicines: 'Paracetamol (650mg) - Twice daily after food (3 Days)', status: 'Active' },
  { id: 'RX-102', patient: 'Priya Sharma', patientId: 'P1002', doctorName: 'Dr. Sarah Jenkins', date: '10 Sep 2026', diagnosis: 'Allergic Rhinitis', medicines: 'Cetirizine (10mg) - Once daily at bedtime (7 Days)', status: 'Active' },
  { id: 'RX-103', patient: 'Aman Verma', patientId: 'P1003', doctorName: 'Dr. Sarah Jenkins', date: '08 Sep 2026', diagnosis: 'Essential Hypertension', medicines: 'Amlodipine (5mg) - Once daily in morning (30 Days)', status: 'Active' }
];

class ClinicalRepository {
  async seedDefaults() {
    loadDb();
    let updated = false;

    if (!localDb.doctors || localDb.doctors.length === 0) {
      localDb.doctors = DEFAULT_DOCTORS;
      updated = true;
    }
    if (!localDb.appointments || localDb.appointments.length === 0) {
      localDb.appointments = DEFAULT_APPOINTMENTS;
      updated = true;
    }
    if (!localDb.records || localDb.records.length === 0) {
      localDb.records = DEFAULT_RECORDS;
      updated = true;
    }
    if (!localDb.prescriptions || localDb.prescriptions.length === 0) {
      localDb.prescriptions = DEFAULT_PRESCRIPTIONS;
      updated = true;
    }
    if (!localDb.kioskTokens) {
      localDb.kioskTokens = [];
      updated = true;
    }

    if (updated) {
      saveDb();
      console.log('[ClinicalRepo] Clinical default records initialized in db.json');
    }
  }

  // ── Appointments ──
  async getAppointments(filters = {}) {
    loadDb();
    let res = [...(localDb.appointments || [])];
    if (filters.patientId) {
      res = res.filter(a => a.patientId === filters.patientId);
    }
    if (filters.doctorName) {
      res = res.filter(a => a.doctorName.toLowerCase().includes(filters.doctorName.toLowerCase()));
    }
    if (filters.status) {
      res = res.filter(a => a.status.toLowerCase() === filters.status.toLowerCase());
    }
    return res;
  }

  async createAppointment(aptData) {
    loadDb();
    const newApt = {
      id: aptData.id || `APT-${Math.floor(100 + Math.random() * 900)}`,
      patientId: aptData.patientId || 'P-10249',
      patientName: aptData.patientName || 'Rahul Sharma',
      doctorName: aptData.doctorName || 'Dr. Sarah Jenkins',
      specialty: aptData.specialty || 'General Consultation',
      hospital: aptData.hospital || 'SMS Hospital, Jaipur',
      date: aptData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: aptData.time || '11:00 AM',
      status: aptData.status || 'Upcoming',
      type: aptData.type || 'Consultation',
      createdAt: new Date().toISOString()
    };
    localDb.appointments.unshift(newApt);
    saveDb();
    return newApt;
  }

  async updateAppointment(id, updateData) {
    loadDb();
    const idx = localDb.appointments.findIndex(a => String(a.id) === String(id));
    if (idx === -1) return null;
    localDb.appointments[idx] = { ...localDb.appointments[idx], ...updateData, updatedAt: new Date().toISOString() };
    saveDb();
    return localDb.appointments[idx];
  }

  async deleteAppointment(id) {
    loadDb();
    const initialLen = localDb.appointments.length;
    localDb.appointments = localDb.appointments.filter(a => String(a.id) !== String(id));
    if (localDb.appointments.length !== initialLen) {
      saveDb();
      return true;
    }
    return false;
  }

  // ── Doctors ──
  async getDoctors(dept) {
    loadDb();
    let docs = localDb.doctors || [];
    if (dept) {
      docs = docs.filter(d => d.department.toLowerCase() === dept.toLowerCase());
    }
    return docs;
  }

  // ── Medical Records ──
  async getRecords(patientId) {
    loadDb();
    let records = localDb.records || [];
    if (patientId) {
      records = records.filter(r => r.patientId === patientId);
    }
    return records;
  }

  async createRecord(recordData) {
    loadDb();
    const newRec = {
      id: recordData.id || `REC-${Math.floor(10 + Math.random() * 90)}`,
      patientId: recordData.patientId || 'P-10249',
      title: recordData.title || 'Clinical Diagnostic Report',
      doctor: recordData.doctor || 'Dr. Sarah Jenkins',
      hospital: recordData.hospital || 'SMS Hospital Jaipur',
      date: recordData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: recordData.type || 'Lab Report',
      file: recordData.file || 'report.pdf',
      size: recordData.size || '1.2 MB',
      createdAt: new Date().toISOString()
    };
    localDb.records.unshift(newRec);
    saveDb();
    return newRec;
  }

  // ── Prescriptions ──
  async getPrescriptions(filters = {}) {
    loadDb();
    let rxs = localDb.prescriptions || [];
    if (filters.patientId) {
      rxs = rxs.filter(r => r.patientId === filters.patientId);
    }
    return rxs;
  }

  async createPrescription(rxData) {
    loadDb();
    const newRx = {
      id: rxData.id || `RX-${Math.floor(100 + Math.random() * 900)}`,
      patient: rxData.patient || 'Rahul Sharma',
      patientId: rxData.patientId || 'P-10249',
      doctorName: rxData.doctorName || 'Dr. Sarah Jenkins',
      date: rxData.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      diagnosis: rxData.diagnosis || 'Clinical Follow-up',
      medicines: rxData.medicines || rxData.medicine || 'Generic medication',
      status: rxData.status || 'Active',
      createdAt: new Date().toISOString()
    };
    localDb.prescriptions.unshift(newRx);
    saveDb();
    return newRx;
  }

  // ── Kiosk Queue & Tokens ──
  async createKioskToken(tokenData) {
    loadDb();
    const queueCount = (localDb.kioskTokens || []).length + 1;
    const padNum = String(queueCount).padStart(3, '0');
    const newToken = {
      tokenNumber: `TK-${padNum}`,
      patientName: tokenData.patientName || 'Walk-in Patient',
      aadhaar: tokenData.aadhaar ? `XXXX XXXX ${tokenData.aadhaar.slice(-4)}` : 'XXXX XXXX 1234',
      department: tokenData.department || 'General OPD',
      doctor: tokenData.doctor || 'Duty Doctor',
      concern: tokenData.concern || 'General Consultation',
      status: 'WAITING',
      timestamp: new Date().toISOString()
    };

    if (!localDb.kioskTokens) localDb.kioskTokens = [];
    localDb.kioskTokens.unshift(newToken);

    // Also auto-add to appointments so doctors see the kiosk appointment in real time!
    const kioskApt = {
      id: `APT-K${padNum}`,
      patientId: 'P-KIOSK',
      patientName: newToken.patientName,
      doctorName: newToken.doctor,
      specialty: newToken.department,
      hospital: 'SMS Hospital Jaipur',
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Upcoming',
      type: `Kiosk Check-In (${newToken.tokenNumber})`,
      createdAt: new Date().toISOString()
    };
    localDb.appointments.unshift(kioskApt);

    saveDb();
    return newToken;
  }

  async getKioskQueue() {
    loadDb();
    return localDb.kioskTokens || [];
  }

  // ── Hospital Overview Stats ──
  async getHospitalStats() {
    loadDb();
    return {
      activePatients: (localDb.users || []).filter(u => u.role === 'patient').length + 245,
      totalAppointments: (localDb.appointments || []).length,
      upcomingAppointments: (localDb.appointments || []).filter(a => a.status === 'Upcoming').length,
      kioskTokensToday: (localDb.kioskTokens || []).length,
      emergencyCapacity: '85%',
      departments: [
        { name: 'General Medicine', activeDoctors: 4, waiting: 8 },
        { name: 'Cardiology', activeDoctors: 2, waiting: 5 },
        { name: 'Orthopedics', activeDoctors: 3, waiting: 6 },
        { name: 'Pediatrics', activeDoctors: 2, waiting: 3 },
        { name: 'Neurology', activeDoctors: 1, waiting: 2 }
      ]
    };
  }
}

module.exports = new ClinicalRepository();
