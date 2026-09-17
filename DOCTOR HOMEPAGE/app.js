/**
 * ==============================================================================
 * MEDICARE DOCTOR DASHBOARD - JAVASCRIPT APPLICATION LOGIC & SPA ROUTER
 * ==============================================================================
 * Clean, production-grade JavaScript for MediCare Doctor Portal.
 * 
 * TABLE OF CONTENTS:
 * 1. CLINICAL DATABASE & MOCK STORE
 * 2. TOAST NOTIFICATION SYSTEM (Reserved strictly for genuine user actions)
 * 3. HASH-BASED SPA ROUTER (Zero toasts on navigation)
 * 4. DASHBOARD CONTROLLER (Appointments list, Search filter, Stat cards)
 * 5. PATIENTS & PROFILE CONTROLLER (List, Search/Filter, Full 6-Tab Profile)
 * 6. APPOINTMENTS CONTROLLER (List, Filter, Reschedule Modal, Cancel)
 * 7. MEDICAL RECORDS CONTROLLER (Search, Filter, View Preview, Download)
 * 8. PRESCRIPTIONS CONTROLLER (List, Create Modal Form Validation)
 * 9. MESSAGES CONTROLLER (2-Column Chat, Thread switching, Simulated Replies)
 * 10. SETTINGS CONTROLLER (Profile, Credentials, Preferences, Save Changes)
 * 11. HELP & SUPPORT CONTROLLER (Accordion toggle, Search, Support Ticket)
 * 12. GENERIC MODAL MANAGER (Open, Close, Escape accessibility)
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================================
     1. CLINICAL DATABASE & MOCK STORE
     ============================================================================ */

  // Doctor Information
  const DOCTOR_DATA = {
    name: "Dr. Sharma",
    specialty: "General Physician",
    initials: "DS",
    greeting: "Good morning, Dr. Sharma",
    subtitle: "Here's your practice overview for today."
  };

  // Practice Stats Overview
  const STATS_DATA = {
    totalPatients: { value: "248", meta: "+12 this month" },
    todayAppointments: { value: "12", meta: "4 completed" },
    followUps: { value: "15", meta: "This week" }
  };

  // Patients Master Database
  const PATIENTS_DATA = [
    {
      id: "P1001",
      name: "Rahul Mehta",
      initials: "RM",
      avatarClass: "avatar-rm",
      age: 32,
      gender: "Male",
      phone: "+91 98765 43210",
      email: "rahul.mehta@example.com",
      bloodGroup: "O+",
      lastVisit: "12 Sep 2026",
      status: "Active",
      chiefComplaint: "Recurring headache",
      symptoms: "Headache for 5 days, bilateral pulsating tension, worsens with screen exposure",
      medicalHistory: "No major previous illness or surgeries",
      allergies: "No known drug allergies",
      medications: "Paracetamol 650mg SOS",
      vitals: { bp: "120/80", hr: "72 bpm", spo2: "99%", temp: "98.4°F", bmi: "22.4" },
      clinicalNotes: "Patient presented with recurring tension-type cephalalgia, predominantly bilateral and pulsating, worsening under prolonged screen exposure. Neurological examination is unremarkable. Pupils equal and reactive to light. Blood pressure within normal limits. Diagnostic Impression: Tension Headache with mild screen fatigue syndrome. Advised hydration, ergonomic posture review, and symptomatic analgesics.",
      records: [
        { title: "Complete Blood Count (CBC)", type: "Lab Report", date: "10 Sep 2026", by: "Patient Portal", status: "Verified" },
        { title: "Brain MRI Screening Scan", type: "Radiology Scan", date: "02 Aug 2026", by: "Metropolis Labs", status: "Verified" }
      ],
      prescriptions: [
        { date: "10 Sep 2026", medicine: "Paracetamol", dosage: "650mg", freq: "Twice daily after food", duration: "3 Days", status: "Active" }
      ],
      timeline: [
        { title: "General Consultation Completed", meta: "12 Sep 2026, 09:30 AM · Dr. Sharma" },
        { title: "Blood Test Report Uploaded", meta: "10 Sep 2026, 04:15 PM · Patient Portal" },
        { title: "Initial Registration & Profile Created", meta: "01 Aug 2026, 11:00 AM · Reception Desk" }
      ]
    },
    {
      id: "P1002",
      name: "Priya Sharma",
      initials: "PS",
      avatarClass: "avatar-ps",
      age: 28,
      gender: "Female",
      phone: "+91 98765 43211",
      email: "priya.sharma@example.com",
      bloodGroup: "B+",
      lastVisit: "12 Sep 2026",
      status: "Active",
      chiefComplaint: "Allergic Rhinitis & Sinusitis",
      symptoms: "Nasal congestion, sneezing bouts in morning, watery eyes",
      medicalHistory: "Mild seasonal allergies since childhood",
      allergies: "Dust mites, Sulfa antibiotics",
      medications: "Cetirizine 10mg OD",
      vitals: { bp: "116/76", hr: "68 bpm", spo2: "98%", temp: "98.6°F", bmi: "21.1" },
      clinicalNotes: "Patient reports substantial relief with antihistamines. Nasal mucosa mildly erythematous, no polyp formation. Sinus transillumination clear. Advised continuing Cetirizine at bedtime and warm saline nasal rinse.",
      records: [
        { title: "Allergy Antibody Panel (IgE)", type: "Lab Report", date: "01 Sep 2026", by: "SRL Diagnostics", status: "Verified" },
        { title: "Nasal Endoscopy Report", type: "ENT Report", date: "15 Jul 2026", by: "City ENT Clinic", status: "Verified" }
      ],
      prescriptions: [
        { date: "10 Sep 2026", medicine: "Cetirizine", dosage: "10mg", freq: "Once daily at bedtime", duration: "7 Days", status: "Active" }
      ],
      timeline: [
        { title: "Follow-up Consultation Completed", meta: "12 Sep 2026, 10:45 AM · Dr. Sharma" },
        { title: "Prescription Refill Issued", meta: "10 Sep 2026, 11:00 AM · Dr. Sharma" },
        { title: "Allergy Panel Diagnostic Uploaded", meta: "01 Sep 2026, 02:30 PM · SRL Diagnostics" }
      ]
    },
    {
      id: "P1003",
      name: "Aman Verma",
      initials: "AV",
      avatarClass: "avatar-av",
      age: 45,
      gender: "Male",
      phone: "+91 98765 43212",
      email: "aman.verma@example.com",
      bloodGroup: "A+",
      lastVisit: "10 Sep 2026",
      status: "Active",
      chiefComplaint: "Essential Hypertension checkup",
      symptoms: "Occasional morning dizziness, mild fatigue",
      medicalHistory: "Essential hypertension diagnosed in 2024",
      allergies: "None reported",
      medications: "Amlodipine 5mg OD, Telmisartan 40mg OD",
      vitals: { bp: "135/88", hr: "78 bpm", spo2: "97%", temp: "98.2°F", bmi: "26.8" },
      clinicalNotes: "Blood pressure elevated at 135/88. Patient compliant with morning medications. Advised reduced dietary sodium (<2g/day), 30 minutes brisk walking 5 times weekly, and home BP log recording.",
      records: [
        { title: "Lipid Profile & HbA1c Report", type: "Lab Report", date: "05 Sep 2026", by: "Apollo Diagnostics", status: "Verified" },
        { title: "12-Lead Electrocardiogram (ECG)", type: "Cardiology", date: "12 Jun 2026", by: "Metro Heart Institute", status: "Verified" }
      ],
      prescriptions: [
        { date: "08 Sep 2026", medicine: "Amlodipine", dosage: "5mg", freq: "Once daily in morning", duration: "30 Days", status: "Active" }
      ],
      timeline: [
        { title: "Routine Consultation Scheduled", meta: "12 Sep 2026, 12:00 PM · Dr. Sharma" },
        { title: "Lab Results Processed", meta: "05 Sep 2026, 09:15 AM · Apollo Diagnostics" }
      ]
    },
    {
      id: "P1004",
      name: "Neha Singh",
      initials: "NS",
      avatarClass: "avatar-ns",
      age: 24,
      gender: "Female",
      phone: "+91 98765 43213",
      email: "neha.singh@example.com",
      bloodGroup: "AB+",
      lastVisit: "05 Sep 2026",
      status: "Active",
      chiefComplaint: "Annual Health Screening & Fatigue",
      symptoms: "General fatigue, mild muscle ache, low energy",
      medicalHistory: "Childhood asthma, resolved",
      allergies: "Penicillin",
      medications: "Vitamin D3 60,000 IU weekly",
      vitals: { bp: "110/70", hr: "74 bpm", spo2: "99%", temp: "98.5°F", bmi: "20.5" },
      clinicalNotes: "Patient presents for annual general wellness review. Mild serum 25-hydroxy vitamin D deficiency (18 ng/mL). Thyroid function tests within normal limits. Prescribed weekly vitamin D supplementation.",
      records: [
        { title: "Chest X-Ray Digital PA View", type: "Imaging & Scans", date: "20 Aug 2026", by: "City Diagnostics", status: "Verified" },
        { title: "Vitamin D & B12 Panel", type: "Lab Report", date: "05 Sep 2026", by: "Metropolis Labs", status: "Verified" }
      ],
      prescriptions: [
        { date: "05 Sep 2026", medicine: "Cholecalciferol (Vitamin D3)", dosage: "60k IU", freq: "Once weekly with milk", duration: "8 Weeks", status: "Active" }
      ],
      timeline: [
        { title: "General Health Checkup", meta: "12 Sep 2026, 04:30 PM · Dr. Sharma" },
        { title: "Biochemical Lab Panel Uploaded", meta: "05 Sep 2026, 03:00 PM · Metropolis Labs" }
      ]
    },
    {
      id: "P1005",
      name: "Vikram Patel",
      initials: "VP",
      avatarClass: "avatar-rm",
      age: 52,
      gender: "Male",
      phone: "+91 98765 43214",
      email: "vikram.patel@example.com",
      bloodGroup: "O+",
      lastVisit: "28 Aug 2026",
      status: "Follow-up",
      chiefComplaint: "Type 2 Diabetes Mellitus Review",
      symptoms: "Mild tingling in distal lower limbs, occasional polyuria",
      medicalHistory: "Type 2 Diabetes Mellitus (6 years duration)",
      allergies: "None known",
      medications: "Metformin 500mg BD after food",
      vitals: { bp: "128/82", hr: "75 bpm", spo2: "98%", temp: "98.6°F", bmi: "25.3" },
      clinicalNotes: "HbA1c at 6.9%. Peripheral pulses palpable bilaterally. No diabetic foot ulcerations or active microvascular complications. Maintained on oral hypoglycemics.",
      records: [
        { title: "Renal Function Panel & Creatinine", type: "Lab Report", date: "28 Aug 2026", by: "Metropolis Labs", status: "Verified" }
      ],
      prescriptions: [
        { date: "28 Aug 2026", medicine: "Metformin", dosage: "500mg", freq: "Twice daily after food", duration: "60 Days", status: "Active" }
      ],
      timeline: [
        { title: "Quarterly Diabetic Screening Completed", meta: "28 Aug 2026, 11:30 AM · Dr. Sharma" }
      ]
    },
    {
      id: "P1006",
      name: "Ananya Iyer",
      initials: "AI",
      avatarClass: "avatar-ps",
      age: 38,
      gender: "Female",
      phone: "+91 98765 43215",
      email: "ananya.iyer@example.com",
      bloodGroup: "A-",
      lastVisit: "15 Aug 2026",
      status: "Active",
      chiefComplaint: "Hypothyroidism follow-up",
      symptoms: "Mild lethargy, cold sensitivity",
      medicalHistory: "Hashimoto's Thyroiditis",
      allergies: "Aspirin",
      medications: "Levothyroxine 50mcg empty stomach",
      vitals: { bp: "118/74", hr: "70 bpm", spo2: "99%", temp: "98.4°F", bmi: "23.0" },
      clinicalNotes: "TSH normal at 2.4 mIU/L on current dosage. Weight stable. Thyroid gland non-tender, no palpable nodules. Advised continuing Levothyroxine 50mcg 30 minutes before breakfast.",
      records: [
        { title: "Thyroid Profile (T3, T4, TSH)", type: "Lab Report", date: "15 Aug 2026", by: "SRL Diagnostics", status: "Verified" }
      ],
      prescriptions: [
        { date: "15 Aug 2026", medicine: "Levothyroxine", dosage: "50mcg", freq: "Once daily on empty stomach", duration: "90 Days", status: "Active" }
      ],
      timeline: [
        { title: "Endocrine Profile Review", meta: "15 Aug 2026, 10:15 AM · Dr. Sharma" }
      ]
    }
  ];

  // Appointments & Procedures Master Database (OPD & Operations)
  let APPOINTMENTS_DATA = [
    // --- OPD (Outpatient Department) Consultations ---
    {
      id: 1,
      patientId: "P1001",
      patient: "Rahul Mehta",
      initials: "RM",
      avatarClass: "avatar-rm",
      category: "opd",
      token: "OPD-01",
      department: "General Medicine",
      room: "OPD-101",
      roomLabel: "Room 101",
      time: "09:00 AM",
      date: "2026-09-12",
      type: "General Consultation",
      doctor: "Dr. Sharma",
      status: "Completed",
      notes: "Tension headache observation and ergonomic consultation."
    },
    {
      id: 2,
      patientId: "P1002",
      patient: "Priya Sharma",
      initials: "PS",
      avatarClass: "avatar-ps",
      category: "opd",
      token: "OPD-02",
      department: "General Medicine",
      room: "OPD-101",
      roomLabel: "Room 101",
      time: "10:30 AM",
      date: "2026-09-12",
      type: "Follow-up",
      doctor: "Dr. Sharma",
      status: "Completed",
      notes: "Allergic rhinitis substantially improved with Cetirizine."
    },
    {
      id: 3,
      patientId: "P1003",
      patient: "Aman Verma",
      initials: "AV",
      avatarClass: "avatar-av",
      category: "opd",
      token: "OPD-03",
      department: "General Medicine",
      room: "OPD-102",
      roomLabel: "Room 102",
      time: "12:00 PM",
      date: "2026-09-12",
      type: "General Consultation",
      doctor: "Dr. Sharma",
      status: "Upcoming",
      notes: "Hypertension review and blood pressure log assessment."
    },
    {
      id: 4,
      patientId: "P1004",
      patient: "Neha Singh",
      initials: "NS",
      avatarClass: "avatar-ns",
      category: "opd",
      token: "OPD-04",
      department: "Preventive Medicine",
      room: "OPD-101",
      roomLabel: "Room 101",
      time: "04:30 PM",
      date: "2026-09-12",
      type: "Health Checkup",
      doctor: "Dr. Sharma",
      status: "Upcoming",
      notes: "Annual general checkup & vitamin D assessment."
    },
    {
      id: 5,
      patientId: "P1005",
      patient: "Vikram Patel",
      initials: "VP",
      avatarClass: "avatar-rm",
      category: "opd",
      token: "OPD-05",
      department: "Endocrinology",
      room: "OPD-102",
      roomLabel: "Room 102",
      time: "10:00 AM",
      date: "2026-09-13",
      type: "Diabetic Review",
      doctor: "Dr. Sharma",
      status: "Upcoming",
      notes: "Quarterly HbA1c review and insulin sensitivity evaluation."
    },
    {
      id: 6,
      patientId: "P1006",
      patient: "Ananya Iyer",
      initials: "AI",
      avatarClass: "avatar-ps",
      category: "opd",
      token: "OPD-06",
      department: "Endocrinology",
      room: "OPD-102",
      roomLabel: "Room 102",
      time: "11:00 AM",
      date: "2026-09-13",
      type: "Follow-up",
      doctor: "Dr. Sharma",
      status: "Upcoming",
      notes: "Thyroid function panel follow-up."
    },
    {
      id: 7,
      patientId: "P1003",
      patient: "Aman Verma",
      initials: "AV",
      avatarClass: "avatar-av",
      category: "opd",
      token: "OPD-07",
      department: "General Medicine",
      room: "OPD-101",
      roomLabel: "Room 101",
      time: "05:15 PM",
      date: "2026-09-12",
      type: "General Consultation",
      doctor: "Dr. Sharma",
      status: "Cancelled",
      notes: "Cancelled by patient due to schedule conflict."
    },

    // --- Operation Theater (OT) & Surgical Procedures ---
    {
      id: 8,
      patientId: "P1005",
      patient: "Vikram Patel",
      initials: "VP",
      avatarClass: "avatar-rm",
      category: "operation",
      otRoom: "OT-1",
      roomLabel: "OT-1",
      time: "02:00 PM",
      duration: "60 min",
      date: "2026-09-12",
      procedure: "Appendectomy",
      type: "Appendectomy",
      surgeon: "Dr. Sharma",
      leadSurgeon: "Dr. Sharma",
      department: "General Surgery",
      anesthesia: "General Anesthesia (GA)",
      preOpClearance: "Cleared",
      status: "Upcoming",
      notes: "Laparoscopic appendectomy. Pre-op clearance approved by cardiology."
    },
    {
      id: 9,
      patientId: "P1006",
      patient: "Ananya Iyer",
      initials: "AI",
      avatarClass: "avatar-ps",
      category: "operation",
      otRoom: "OT-2",
      roomLabel: "OT-2",
      time: "08:30 AM",
      duration: "120 min",
      date: "2026-09-14",
      procedure: "Subtotal Thyroidectomy",
      type: "Subtotal Thyroidectomy",
      surgeon: "Dr. Sharma & Dr. Kulkarni",
      leadSurgeon: "Dr. Sharma & Dr. Kulkarni",
      department: "Endocrine Surgery",
      anesthesia: "Endotracheal GA",
      preOpClearance: "Cleared",
      status: "Upcoming",
      notes: "Elective procedure. NPO from midnight."
    },
    {
      id: 10,
      patientId: "P1001",
      patient: "Rahul Mehta",
      initials: "RM",
      avatarClass: "avatar-rm",
      category: "operation",
      otRoom: "OT-3",
      roomLabel: "OT-3",
      time: "11:00 AM",
      duration: "30 min",
      date: "2026-09-11",
      procedure: "Endoscopic Sinus Debridement",
      type: "Sinus Debridement",
      surgeon: "Dr. Sharma",
      leadSurgeon: "Dr. Sharma",
      department: "ENT Surgery",
      anesthesia: "Local Anesthesia",
      preOpClearance: "Cleared",
      status: "Completed",
      notes: "Day care procedure successfully completed."
    }
  ];

  // Prescriptions Master Database
  let PRESCRIPTIONS_DATA = [
    {
      id: "RX-101",
      patient: "Rahul Mehta",
      patientId: "P1001",
      date: "10 Sep 2026",
      diagnosis: "Tension Headache",
      medicines: "Paracetamol (650mg) - Twice daily after food (3 Days)",
      status: "Active"
    },
    {
      id: "RX-102",
      patient: "Priya Sharma",
      patientId: "P1002",
      date: "10 Sep 2026",
      diagnosis: "Allergic Rhinitis",
      medicines: "Cetirizine (10mg) - Once daily at bedtime (7 Days)",
      status: "Active"
    },
    {
      id: "RX-103",
      patient: "Aman Verma",
      patientId: "P1003",
      date: "08 Sep 2026",
      diagnosis: "Essential Hypertension",
      medicines: "Amlodipine (5mg) - Once daily in morning (30 Days)",
      status: "Active"
    },
    {
      id: "RX-104",
      patient: "Neha Singh",
      patientId: "P1004",
      date: "05 Sep 2026",
      diagnosis: "Vitamin D Deficiency",
      medicines: "Cholecalciferol (60,000 IU) - Once weekly (8 Weeks)",
      status: "Active"
    }
  ];

  // Medical Records Master Database
  const RECORDS_DATA = [
    {
      id: "REC-201",
      patient: "Rahul Mehta",
      patientId: "P1001",
      title: "Complete Blood Count (CBC)",
      type: "Lab Report",
      filterCategory: "lab",
      date: "10 Sep 2026",
      uploadedBy: "Patient Portal",
      status: "Verified"
    },
    {
      id: "REC-202",
      patient: "Rahul Mehta",
      patientId: "P1001",
      title: "Brain MRI Screening Scan",
      type: "Imaging & Scans",
      filterCategory: "imaging",
      date: "02 Aug 2026",
      uploadedBy: "Metropolis Labs",
      status: "Verified"
    },
    {
      id: "REC-203",
      patient: "Priya Sharma",
      patientId: "P1002",
      title: "Allergy Antibody Panel (IgE)",
      type: "Lab Report",
      filterCategory: "lab",
      date: "01 Sep 2026",
      uploadedBy: "SRL Diagnostics",
      status: "Verified"
    },
    {
      id: "REC-204",
      patient: "Priya Sharma",
      patientId: "P1002",
      title: "Prescription Slip (Follow-up)",
      type: "Prescription",
      filterCategory: "prescription",
      date: "12 Sep 2026",
      uploadedBy: "Dr. Sharma",
      status: "Verified"
    },
    {
      id: "REC-205",
      patient: "Aman Verma",
      patientId: "P1003",
      title: "Lipid Profile & HbA1c Report",
      type: "Lab Report",
      filterCategory: "lab",
      date: "05 Sep 2026",
      uploadedBy: "Apollo Diagnostics",
      status: "Verified"
    },
    {
      id: "REC-206",
      patient: "Neha Singh",
      patientId: "P1004",
      title: "Chest X-Ray Digital PA View",
      type: "Imaging & Scans",
      filterCategory: "imaging",
      date: "20 Aug 2026",
      uploadedBy: "City Diagnostics",
      status: "Verified"
    }
  ];

  // Messaging / Chat Conversations Database
  const CHATS_DATA = [
    {
      patientId: "P1001",
      patientName: "Rahul Mehta",
      avatar: "RM",
      status: "Online",
      lastTime: "10:45 AM",
      unread: 0,
      messages: [
        { sender: "patient", text: "Hello Dr. Sharma, I started the Paracetamol you prescribed.", time: "09:45 AM" },
        { sender: "doctor", text: "Good morning Rahul. Take it twice daily after meals, and ensure you drink at least 2.5 liters of water.", time: "10:15 AM" },
        { sender: "patient", text: "Thank you doctor, the headache is much better now.", time: "10:45 AM" }
      ]
    },
    {
      patientId: "P1002",
      patientName: "Priya Sharma",
      avatar: "PS",
      status: "Offline",
      lastTime: "Yesterday",
      unread: 1,
      messages: [
        { sender: "patient", text: "Dr. Sharma, the sneezing has reduced significantly.", time: "Yesterday, 04:20 PM" },
        { sender: "patient", text: "Should I continue Cetirizine for 3 more days?", time: "Yesterday, 04:21 PM" },
        { sender: "doctor", text: "Yes Priya, complete the 7-day course to prevent rebound allergic symptoms.", time: "Yesterday, 05:10 PM" }
      ]
    },
    {
      patientId: "P1003",
      patientName: "Aman Verma",
      avatar: "AV",
      status: "Online",
      lastTime: "Sep 10",
      unread: 0,
      messages: [
        { sender: "patient", text: "Dr. Sharma, I recorded my vitals with the home monitor.", time: "Sep 10, 08:30 AM" },
        { sender: "patient", text: "My morning BP reading was 130/84.", time: "Sep 10, 08:31 AM" },
        { sender: "doctor", text: "That is looking much better Aman! Keep monitoring every Tuesday and Thursday.", time: "Sep 10, 09:15 AM" }
      ]
    },
    {
      patientId: "P1004",
      patientName: "Neha Singh",
      avatar: "NS",
      status: "Offline",
      lastTime: "Sep 05",
      unread: 0,
      messages: [
        { sender: "patient", text: "Hello Dr. Sharma, here is my updated vitamin D test receipt.", time: "Sep 05, 11:20 AM" },
        { sender: "doctor", text: "Received Neha. I have reviewed the lab report and updated your medical records.", time: "Sep 05, 12:40 PM" }
      ]
    }
  ];

  // Currently Active Patient & Chat pointers
  let currentActivePatient = PATIENTS_DATA[0];
  let currentActiveChat = CHATS_DATA[0];

  /* ============================================================================
     2. TOAST NOTIFICATION SYSTEM (FOR GENUINE ACTIONS ONLY)
     ============================================================================ */

  const toastContainerEl = document.getElementById('toastContainer');

  /**
   * Displays a clean toast notification.
   * NOTE: As per strict instructions, navigation clicks do NOT trigger this.
   * Only genuine user operations (Save, Create, Reschedule, Send) trigger toasts.
   * @param {string} message 
   * @param {'info' | 'success' | 'warning'} type 
   * @param {number} duration 
   */
  function showToast(message, type = 'success', duration = 3200) {
    if (!toastContainerEl) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'status');

    let iconSvg = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
    if (type === 'warning') {
      iconSvg = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      `;
    } else if (type === 'info') {
      iconSvg = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      `;
    }

    toast.innerHTML = `
      <div class="toast-icon" aria-hidden="true">${iconSvg}</div>
      <span class="toast-message">${escapeHtml(message)}</span>
      <button type="button" class="toast-close" aria-label="Close notification">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => dismissToast(toast));

    toastContainerEl.appendChild(toast);

    const timeoutId = setTimeout(() => {
      dismissToast(toast);
    }, duration);

    function dismissToast(t) {
      clearTimeout(timeoutId);
      t.classList.add('toast-hiding');
      t.addEventListener('transitionend', () => {
        t.remove();
      }, { once: true });
    }
  }

  /* ============================================================================
     3. HASH-BASED SPA ROUTER (ZERO TOASTS ON NAVIGATION)
     ============================================================================ */

  const pageViews = {
    '#/dashboard': document.getElementById('viewDashboard'),
    '#/patients': document.getElementById('viewPatients'),
    '#/patient-profile': document.getElementById('viewPatientProfile'),
    '#/appointments': document.getElementById('viewAppointments'),
    '#/medical-records': document.getElementById('viewMedicalRecords'),
    '#/prescriptions': document.getElementById('viewPrescriptions'),
    '#/messages': document.getElementById('viewMessages'),
    '#/settings': document.getElementById('viewSettings'),
    '#/help': document.getElementById('viewHelp')
  };

  const navLinks = document.querySelectorAll('.nav-link');
  const sidebarEl = document.getElementById('sidebar');
  const sidebarBackdropEl = document.getElementById('sidebarBackdrop');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');

  function navigateToRoute(hash) {
    let targetHash = hash;

    // Direct any legacy today-appointments hash to appointments with today tab
    if (targetHash === '#/today-appointments') {
      targetHash = '#/appointments';
      if (typeof switchAppointmentTab === 'function') {
        switchAppointmentTab('today');
      }
    }

    // Determine views present on current page DOM
    const availableViews = Object.entries(pageViews).filter(([_, el]) => el !== null);

    if (availableViews.length === 1) {
      // Standalone single-view page (e.g. appointments.html, medical-records.html, etc.)
      const [_, singleView] = availableViews[0];
      singleView.classList.add('active');
    } else if (availableViews.length > 1) {
      // Multi-view page (e.g. patients.html with viewPatients & viewPatientProfile, or dashboard)
      if (!targetHash || targetHash === '#' || targetHash === '#/' || !pageViews[targetHash]) {
        if (document.getElementById('viewDashboard')) {
          targetHash = '#/dashboard';
        } else if (document.getElementById('viewPatients')) {
          targetHash = '#/patients';
        } else {
          targetHash = availableViews[0][0];
        }
      }

      // Hide all views on page
      availableViews.forEach(([_, view]) => {
        view.classList.remove('active');
      });

      // Show target view
      const targetView = pageViews[targetHash];
      if (targetView) {
        targetView.classList.add('active');
      }
    }

    // When opening appointments view, render summary metrics & table
    if (document.getElementById('viewAppointments')) {
      if (typeof renderAppointmentsTable === 'function') {
        renderAppointmentsTable();
      }
    }

    // Update active state in sidebar navigation links
    const path = window.location.pathname.replace(/\\/g, '/');
    let currentFileName = path.substring(path.lastIndexOf('/') + 1).toLowerCase();
    if (!currentFileName || currentFileName === '/') currentFileName = 'index.html';

    navLinks.forEach(link => {
      const linkHref = (link.getAttribute('href') || '').toLowerCase();
      const isMatch = linkHref === currentFileName ||
                      (currentFileName === 'index.html' && (linkHref === 'index.html' || linkHref === '#/dashboard')) ||
                      (currentFileName === 'patients.html' && (linkHref === 'patients.html' || linkHref === '#/patients')) ||
                      (currentFileName === 'appointments.html' && (linkHref === 'appointments.html' || linkHref === '#/appointments')) ||
                      (currentFileName === 'medical-records.html' && (linkHref === 'medical-records.html' || linkHref === '#/medical-records')) ||
                      (currentFileName === 'prescriptions.html' && (linkHref === 'prescriptions.html' || linkHref === '#/prescriptions')) ||
                      (currentFileName === 'messages.html' && (linkHref === 'messages.html' || linkHref === '#/messages')) ||
                      (currentFileName === 'settings.html' && (linkHref === 'settings.html' || linkHref === '#/settings')) ||
                      (currentFileName === 'help.html' && (linkHref === 'help.html' || linkHref === '#/help'));

      if (isMatch) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Scroll window smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close mobile drawer if open
    if (sidebarEl && sidebarEl.classList.contains('open')) {
      closeMobileMenu();
    }
  }

  // Listen to hash change events
  window.addEventListener('hashchange', () => {
    navigateToRoute(window.location.hash);
  });

  // Mobile drawer controls
  function openMobileMenu() {
    if (sidebarEl) sidebarEl.classList.add('open');
    if (sidebarBackdropEl) sidebarBackdropEl.classList.add('active');
    if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (sidebarEl) sidebarEl.classList.remove('open');
    if (sidebarBackdropEl) sidebarBackdropEl.classList.remove('active');
    if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      if (sidebarEl && sidebarEl.classList.contains('open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (sidebarBackdropEl) {
    sidebarBackdropEl.addEventListener('click', closeMobileMenu);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (sidebarEl && sidebarEl.classList.contains('open')) {
        closeMobileMenu();
      }
      closeAllModals();
    }
  });

  /* ============================================================================
     4. DASHBOARD CONTROLLER (Overview, Quick stats, Search filter)
     ============================================================================ */

  const appointmentsListEl = document.getElementById('appointmentsList');
  const searchInputEl = document.getElementById('patientSearchInput');
  const clearSearchBtnEl = document.getElementById('clearSearchBtn');
  const searchFeedbackEl = document.getElementById('searchFeedback');
  const searchFeedbackTextEl = document.getElementById('searchFeedbackText');
  const resetFilterBtnEl = document.getElementById('resetFilterBtn');
  const countPillEl = document.getElementById('appointmentsCountPill');

  function renderDashboardAppointments(appointments, filterQuery = "") {
    if (!appointmentsListEl) return;
    appointmentsListEl.innerHTML = "";

    if (appointments.length === 0) {
      appointmentsListEl.innerHTML = `
        <div class="empty-appointments-state">
          <div class="empty-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <p class="empty-title">No matching appointments found</p>
          <p class="empty-desc">No appointments match "${escapeHtml(filterQuery)}". Try searching by patient name, consultation type, or time.</p>
        </div>
      `;
      if (countPillEl) countPillEl.textContent = "0 Found";
      return;
    }

    if (countPillEl) {
      countPillEl.textContent = filterQuery ? `${appointments.length} Found` : `${appointments.length} Today`;
    }

    appointments.forEach(apt => {
      const isCompleted = apt.status.toLowerCase() === 'completed';
      const statusClass = isCompleted ? 'status-completed' : 'status-upcoming';

      const itemEl = document.createElement('article');
      itemEl.className = 'appointment-item';
      itemEl.setAttribute('role', 'listitem');
      itemEl.style.cursor = 'pointer';
      itemEl.title = `Click to view profile of ${apt.patient}`;
      itemEl.innerHTML = `
        <div class="appointment-left">
          <div class="patient-avatar ${apt.avatarClass}" aria-label="${escapeHtml(apt.patient)} avatar">
            ${escapeHtml(apt.initials)}
          </div>
          <div class="patient-info">
            <h3 class="patient-name">${escapeHtml(apt.patient)}</h3>
            <span class="patient-type">${escapeHtml(apt.type)}</span>
          </div>
        </div>
        <div class="appointment-right">
          <span class="appointment-time">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${escapeHtml(apt.time)}
          </span>
          <span class="status-badge ${statusClass}">
            ${escapeHtml(apt.status)}
          </span>
        </div>
      `;

      // Clicking an appointment opens patient profile directly
      itemEl.addEventListener('click', () => {
        openPatientProfileById(apt.patientId);
      });

      appointmentsListEl.appendChild(itemEl);
    });
  }

  function handleDashboardSearch() {
    if (!searchInputEl) return;
    const query = searchInputEl.value.trim().toLowerCase();

    if (clearSearchBtnEl) {
      if (query.length > 0) clearSearchBtnEl.classList.add('visible');
      else clearSearchBtnEl.classList.remove('visible');
    }

    const filtered = APPOINTMENTS_DATA.filter(apt => {
      return (
        apt.patient.toLowerCase().includes(query) ||
        apt.type.toLowerCase().includes(query) ||
        apt.time.toLowerCase().includes(query) ||
        apt.status.toLowerCase().includes(query)
      );
    });

    if (searchFeedbackEl && searchFeedbackTextEl) {
      if (query.length > 0) {
        searchFeedbackEl.style.display = 'flex';
        searchFeedbackTextEl.textContent = `Showing ${filtered.length} of ${APPOINTMENTS_DATA.length} appointments for "${searchInputEl.value.trim()}"`;
      } else {
        searchFeedbackEl.style.display = 'none';
      }
    }

    renderDashboardAppointments(filtered, searchInputEl.value.trim());
  }

  if (searchInputEl) searchInputEl.addEventListener('input', handleDashboardSearch);
  if (clearSearchBtnEl) {
    clearSearchBtnEl.addEventListener('click', () => {
      searchInputEl.value = "";
      handleDashboardSearch();
      searchInputEl.focus();
    });
  }
  if (resetFilterBtnEl) {
    resetFilterBtnEl.addEventListener('click', () => {
      searchInputEl.value = "";
      handleDashboardSearch();
    });
  }

  // Dashboard Today's Appointments Category Pills (Today / OPD / Operation)
  const dashAptPills = document.getElementById('dashAptPills');
  let currentDashAptCat = 'today';

  function filterDashboardAppointments() {
    const todayApts = APPOINTMENTS_DATA.filter(a => a.date === '2026-09-12');
    let filtered = todayApts;
    if (currentDashAptCat === 'opd') {
      filtered = todayApts.filter(a => a.category === 'opd');
    } else if (currentDashAptCat === 'operation') {
      filtered = todayApts.filter(a => a.category === 'operation');
    }
    renderDashboardAppointments(filtered);
  }

  if (dashAptPills) {
    dashAptPills.querySelectorAll('.dash-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        dashAptPills.querySelectorAll('.dash-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDashAptCat = btn.getAttribute('data-dash-cat') || 'today';
        filterDashboardAppointments();
      });
    });
  }

  function applyDoctorData() {
    const greetingEl = document.getElementById('doctorGreeting');
    const initialsEl = document.getElementById('doctorInitials');
    const nameEl = document.getElementById('doctorName');
    const specialtyEl = document.getElementById('doctorSpecialty');

    if (greetingEl && DOCTOR_DATA.greeting) greetingEl.textContent = DOCTOR_DATA.greeting;
    if (initialsEl && DOCTOR_DATA.initials) initialsEl.textContent = DOCTOR_DATA.initials;
    if (nameEl && DOCTOR_DATA.name) nameEl.textContent = DOCTOR_DATA.name;
    if (specialtyEl && DOCTOR_DATA.specialty) specialtyEl.textContent = DOCTOR_DATA.specialty;
  }

  function applyStatsData() {
    const totalPatientsVal = document.getElementById('statTotalPatientsVal');
    const todayAppointmentsVal = document.getElementById('statTodayAppointmentsVal');
    const followUpsVal = document.getElementById('statFollowUpsVal');

    if (totalPatientsVal) totalPatientsVal.textContent = PATIENTS_DATA.length.toString();
    if (todayAppointmentsVal) todayAppointmentsVal.textContent = APPOINTMENTS_DATA.filter(a => a.date === '2026-09-12').length.toString();
    if (followUpsVal && STATS_DATA.followUps) followUpsVal.textContent = STATS_DATA.followUps.value;
  }

  /* ============================================================================
     5. PATIENTS & PROFILE CONTROLLER (List, Search/Filter, Full 6-Tab Profile)
     ============================================================================ */

  const patientsTableBody = document.getElementById('patientsTableBody');
  const patientTableSearch = document.getElementById('patientTableSearch');
  const patientFilterGroup = document.getElementById('patientFilterGroup');
  let currentPatientFilter = 'all';

  function renderPatientsTable() {
    if (!patientsTableBody) return;
    patientsTableBody.innerHTML = '';

    const query = patientTableSearch ? patientTableSearch.value.trim().toLowerCase() : '';

    const filtered = PATIENTS_DATA.filter(p => {
      const matchesFilter = currentPatientFilter === 'all' || 
                            (currentPatientFilter === 'active' && p.status.toLowerCase() === 'active');
      const matchesSearch = !query ||
                            p.name.toLowerCase().includes(query) ||
                            p.id.toLowerCase().includes(query) ||
                            p.phone.includes(query) ||
                            p.gender.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
      patientsTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 36px 20px; color: var(--text-secondary);">
            No patients found matching your search.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(patient => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="patient-cell">
            <div class="patient-avatar ${patient.avatarClass}">${patient.initials}</div>
            <div>
              <div class="patient-cell-name">${escapeHtml(patient.name)}</div>
              <small style="color: var(--text-secondary); font-size: 0.75rem;">${escapeHtml(patient.chiefComplaint)}</small>
            </div>
          </div>
        </td>
        <td><span class="patient-id-badge">${escapeHtml(patient.id)}</span></td>
        <td>${escapeHtml(patient.age)}</td>
        <td>${escapeHtml(patient.gender)}</td>
        <td>${escapeHtml(patient.phone)}</td>
        <td>${escapeHtml(patient.lastVisit)}</td>
        <td><span class="badge-active">${escapeHtml(patient.status)}</span></td>
        <td>
          <button type="button" class="btn-outline btn-sm view-patient-btn" data-patient-id="${patient.id}">
            View Profile
          </button>
        </td>
      `;

      const viewBtn = tr.querySelector('.view-patient-btn');
      viewBtn.addEventListener('click', () => {
        openPatientProfileById(patient.id);
      });

      patientsTableBody.appendChild(tr);
    });
  }

  if (patientTableSearch) {
    patientTableSearch.addEventListener('input', renderPatientsTable);
  }

  if (patientFilterGroup) {
    patientFilterGroup.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        patientFilterGroup.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentPatientFilter = pill.getAttribute('data-filter') || 'all';
        renderPatientsTable();
      });
    });
  }

  // Open Patient Profile Function
  function openPatientProfileById(patientId) {
    const patient = PATIENTS_DATA.find(p => p.id === patientId) || PATIENTS_DATA[0];
    currentActivePatient = patient;
    try {
      sessionStorage.setItem('selectedPatientId', patient.id);
    } catch (e) {}

    const profileView = document.getElementById('viewPatientProfile');
    if (profileView) {
      populatePatientProfile(patient);
      window.location.hash = '#/patient-profile';
    } else {
      window.location.href = `patients.html?patient=${encodeURIComponent(patient.id)}#/patient-profile`;
    }
  }

  function populatePatientProfile(patient) {
    // Header & Meta Chips
    const avatarEl = document.getElementById('profileAvatar');
    const nameEl = document.getElementById('profileName');
    const idChip = document.getElementById('profileIdChip');
    const ageChip = document.getElementById('profileAgeChip');
    const genderChip = document.getElementById('profileGenderChip');
    const phoneChip = document.getElementById('profilePhoneChip');
    const statusBadge = document.getElementById('profileStatusBadge');

    if (avatarEl) avatarEl.textContent = patient.initials;
    if (nameEl) nameEl.textContent = patient.name;
    if (idChip) idChip.textContent = `Patient ID: ${patient.id}`;
    if (ageChip) ageChip.textContent = `Age: ${patient.age}`;
    if (genderChip) genderChip.textContent = `Gender: ${patient.gender}`;
    if (phoneChip) phoneChip.textContent = `Phone: ${patient.phone}`;
    if (statusBadge) statusBadge.textContent = patient.status;

    // Overview Tab
    const complaintEl = document.getElementById('profileComplaint');
    const symptomsEl = document.getElementById('profileSymptoms');
    const historyEl = document.getElementById('profileHistory');
    const allergiesEl = document.getElementById('profileAllergies');
    const medsEl = document.getElementById('profileMedications');

    if (complaintEl) complaintEl.textContent = patient.chiefComplaint;
    if (symptomsEl) symptomsEl.textContent = patient.symptoms;
    if (historyEl) historyEl.textContent = patient.medicalHistory;
    if (allergiesEl) allergiesEl.textContent = patient.allergies;
    if (medsEl) medsEl.textContent = patient.medications;

    // Case History Tab
    const caseHistoryPane = document.getElementById('paneCaseHistory');
    if (caseHistoryPane) {
      caseHistoryPane.innerHTML = `
        <div class="table-card" style="padding: 24px;">
          <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 12px; color: var(--text-dark);">
            Clinical Observation Notes — ${escapeHtml(patient.name)}
          </h3>
          <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
            ${escapeHtml(patient.clinicalNotes)}
          </p>
          <div style="background-color: #F8FAFC; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px;">
            <strong style="color: var(--text-dark);">Diagnostic Impression:</strong> ${escapeHtml(patient.chiefComplaint)} under ongoing outpatient clinical management. Follow-up consultation scheduled.
          </div>
        </div>
      `;
    }

    // Records Tab
    const recordsPane = document.getElementById('paneRecords');
    if (recordsPane) {
      const records = patient.records || [];
      recordsPane.innerHTML = `
        <div class="table-card">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Document Title</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Uploaded By</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${records.length > 0 ? records.map(r => `
                  <tr>
                    <td><strong>${escapeHtml(r.title)}</strong></td>
                    <td>${escapeHtml(r.type)}</td>
                    <td>${escapeHtml(r.date)}</td>
                    <td>${escapeHtml(r.by)}</td>
                    <td><button type="button" class="btn-outline btn-sm view-doc-btn" data-doc-title="${escapeHtml(r.title)}" data-patient="${escapeHtml(patient.name)}">View</button></td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="5" style="text-align: center; padding: 24px; color: var(--text-secondary);">No medical records for this patient.</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      `;

      recordsPane.querySelectorAll('.view-doc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          openDocPreview(btn.getAttribute('data-doc-title'), btn.getAttribute('data-patient'));
        });
      });
    }

    // Prescriptions Tab
    const prescriptionsPane = document.getElementById('panePrescriptions');
    if (prescriptionsPane) {
      const rxs = patient.prescriptions || [];
      prescriptionsPane.innerHTML = `
        <div class="table-card">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${rxs.length > 0 ? rxs.map(rx => `
                  <tr>
                    <td>${escapeHtml(rx.date)}</td>
                    <td><strong>${escapeHtml(rx.medicine)}</strong></td>
                    <td>${escapeHtml(rx.dosage)}</td>
                    <td>${escapeHtml(rx.freq)}</td>
                    <td>${escapeHtml(rx.duration)}</td>
                    <td><span class="badge-active">${escapeHtml(rx.status)}</span></td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="6" style="text-align: center; padding: 24px; color: var(--text-secondary);">No active prescriptions.</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // Vitals Tab
    const vitalsPane = document.getElementById('paneVitals');
    if (vitalsPane && patient.vitals) {
      vitalsPane.innerHTML = `
        <div class="vitals-cards-grid">
          <div class="vital-item-card">
            <span class="vital-item-name">Blood Pressure</span>
            <span class="vital-item-val">${escapeHtml(patient.vitals.bp)}</span>
            <span class="vital-item-status">Optimal</span>
          </div>
          <div class="vital-item-card">
            <span class="vital-item-name">Heart Rate</span>
            <span class="vital-item-val">${escapeHtml(patient.vitals.hr)}</span>
            <span class="vital-item-status">Normal</span>
          </div>
          <div class="vital-item-card">
            <span class="vital-item-name">Oxygen (SpO2)</span>
            <span class="vital-item-val">${escapeHtml(patient.vitals.spo2)}</span>
            <span class="vital-item-status">Excellent</span>
          </div>
          <div class="vital-item-card">
            <span class="vital-item-name">Body Temp</span>
            <span class="vital-item-val">${escapeHtml(patient.vitals.temp)}</span>
            <span class="vital-item-status">Normal</span>
          </div>
          <div class="vital-item-card">
            <span class="vital-item-name">BMI</span>
            <span class="vital-item-val">${escapeHtml(patient.vitals.bmi)}</span>
            <span class="vital-item-status">Healthy</span>
          </div>
        </div>
      `;
    }

    // Timeline Tab
    const timelinePane = document.getElementById('paneTimeline');
    if (timelinePane) {
      const timeline = patient.timeline || [];
      timelinePane.innerHTML = `
        <div class="table-card" style="padding: 24px;">
          <ul class="activity-timeline" style="margin-left: 10px;">
            ${timeline.map(t => `
              <li class="activity-item">
                <div class="activity-node" style="box-shadow: 0 0 0 4px #FFFFFF;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div class="activity-details">
                  <p class="activity-action">${escapeHtml(t.title)}</p>
                  <p class="activity-meta">${escapeHtml(t.meta)}</p>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }
  }

  // Profile Tab Buttons Click Controller
  const profileTabButtons = document.querySelectorAll('.profile-tab-btn');
  profileTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      profileTabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const tabKey = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      const paneId = `pane${tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}`;
      const targetPane = document.getElementById(paneId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // "Back to Patients" Button
  const backToPatientsBtn = document.getElementById('backToPatientsBtn');
  if (backToPatientsBtn) {
    backToPatientsBtn.addEventListener('click', () => {
      window.location.hash = '#/patients';
    });
  }


  /* ============================================================================
     6. APPOINTMENTS CONTROLLER (Today's Appointments, OPD, Operation & All Schedule)
     ============================================================================ */

  const appointmentsTableHead = document.getElementById('appointmentsTableHead');
  const appointmentsTableBody = document.getElementById('appointmentsTableBody');
  const appointmentTabs = document.getElementById('appointmentTabs');
  const appointmentSearchInput = document.getElementById('appointmentSearchInput');
  const appointmentStatusFilterGroup = document.getElementById('appointmentStatusFilterGroup');
  const appointmentRoomFilter = document.getElementById('appointmentRoomFilter');
  const appointmentDateFilter = document.getElementById('appointmentDateFilter');

  let currentAppointmentCategory = 'today'; // 'today' | 'opd' | 'operation' | 'all'
  let currentAppointmentStatus = 'all'; // 'all' | 'completed' | 'cancelled'

  // Summary Metrics Counters (Visually Compact Row)
  function updateAppointmentSummaryMetrics() {
    const todayApts = APPOINTMENTS_DATA.filter(a => a.date === '2026-09-12').length;
    const opdApts = APPOINTMENTS_DATA.filter(a => a.category === 'opd').length;
    const otApts = APPOINTMENTS_DATA.filter(a => a.category === 'operation').length;
    const completedApts = APPOINTMENTS_DATA.filter(a => a.status.toLowerCase() === 'completed').length;

    const summaryTodayEl = document.getElementById('summaryTodayApts');
    const summaryOpdEl = document.getElementById('summaryOpdApts');
    const summaryOtEl = document.getElementById('summaryOtApts');
    const summaryCompletedEl = document.getElementById('summaryCompletedApts');

    if (summaryTodayEl) summaryTodayEl.textContent = todayApts.toString();
    if (summaryOpdEl) summaryOpdEl.textContent = opdApts.toString();
    if (summaryOtEl) summaryOtEl.textContent = otApts.toString();
    if (summaryCompletedEl) summaryCompletedEl.textContent = completedApts.toString();
  }

  // Horizontal Tab Switcher (JavaScript Filter, Zero Toasts, No Page Reload)
  function switchAppointmentTab(tabKey) {
    currentAppointmentCategory = tabKey;

    if (appointmentTabs) {
      appointmentTabs.querySelectorAll('.horizontal-tab-btn').forEach(btn => {
        const isMatch = btn.getAttribute('data-tab') === tabKey;
        btn.classList.toggle('active', isMatch);
        btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      });
    }

    renderAppointmentsTable();
  }

  // Bind Horizontal Tabs
  if (appointmentTabs) {
    appointmentTabs.querySelectorAll('.horizontal-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab') || 'today';
        switchAppointmentTab(tab);
      });
    });
  }

  // Render Dynamic Table Header depending on Active Tab
  function renderAppointmentsHeader() {
    if (!appointmentsTableHead) return;

    if (currentAppointmentCategory === 'today') {
      appointmentsTableHead.innerHTML = `
        <tr>
          <th scope="col">Patient Name</th>
          <th scope="col">Time</th>
          <th scope="col">Consultation Type / Procedure</th>
          <th scope="col">Room / OT</th>
          <th scope="col">Status</th>
          <th scope="col">Actions</th>
        </tr>
      `;
    } else if (currentAppointmentCategory === 'opd') {
      appointmentsTableHead.innerHTML = `
        <tr>
          <th scope="col">Patient Name</th>
          <th scope="col">Time</th>
          <th scope="col">Department</th>
          <th scope="col">Room</th>
          <th scope="col">Consultation Type</th>
          <th scope="col">Status</th>
          <th scope="col">Actions</th>
        </tr>
      `;
    } else if (currentAppointmentCategory === 'operation') {
      appointmentsTableHead.innerHTML = `
        <tr>
          <th scope="col">Patient Name</th>
          <th scope="col">Operation / Procedure</th>
          <th scope="col">Time</th>
          <th scope="col">OT Room</th>
          <th scope="col">Surgeon</th>
          <th scope="col">Status</th>
          <th scope="col">Actions</th>
        </tr>
      `;
    } else {
      // All Schedule
      appointmentsTableHead.innerHTML = `
        <tr>
          <th scope="col">Patient Name</th>
          <th scope="col">Time & Date</th>
          <th scope="col">Category</th>
          <th scope="col">Department / Facility</th>
          <th scope="col">Details / Procedure</th>
          <th scope="col">Status</th>
          <th scope="col">Actions</th>
        </tr>
      `;
    }
  }

  // Main Render Appointments Table
  function renderAppointmentsTable() {
    if (!appointmentsTableBody) return;
    updateAppointmentSummaryMetrics();
    renderAppointmentsHeader();

    appointmentsTableBody.innerHTML = '';

    const query = appointmentSearchInput ? appointmentSearchInput.value.trim().toLowerCase() : '';
    const selectedRoom = appointmentRoomFilter ? appointmentRoomFilter.value : 'all';
    const selectedDate = appointmentDateFilter ? appointmentDateFilter.value : '';

    const filtered = APPOINTMENTS_DATA.filter(apt => {
      // Tab Category Match
      let matchesCategory = true;
      if (currentAppointmentCategory === 'today') {
        matchesCategory = apt.date === '2026-09-12';
      } else if (currentAppointmentCategory === 'opd') {
        matchesCategory = apt.category === 'opd';
      } else if (currentAppointmentCategory === 'operation') {
        matchesCategory = apt.category === 'operation';
      } // 'all' includes all categories

      // Status Match
      let matchesStatus = true;
      if (currentAppointmentStatus === 'completed') {
        matchesStatus = apt.status.toLowerCase() === 'completed';
      } else if (currentAppointmentStatus === 'cancelled') {
        matchesStatus = apt.status.toLowerCase() === 'cancelled';
      }

      // Facility / Room Match
      let matchesRoom = true;
      if (selectedRoom !== 'all') {
        matchesRoom = apt.room === selectedRoom || 
                      apt.otRoom === selectedRoom || 
                      apt.roomLabel === selectedRoom ||
                      (selectedRoom.startsWith('OPD') && apt.room && apt.room.includes(selectedRoom.split('-')[1])) ||
                      (selectedRoom.startsWith('OT') && apt.otRoom === selectedRoom);
      }

      // Date Match
      let matchesDate = true;
      if (selectedDate && currentAppointmentCategory !== 'today') {
        matchesDate = apt.date === selectedDate || !apt.date;
      }

      // Search Query
      const matchesSearch = !query ||
                            apt.patient.toLowerCase().includes(query) ||
                            (apt.type && apt.type.toLowerCase().includes(query)) ||
                            (apt.procedure && apt.procedure.toLowerCase().includes(query)) ||
                            (apt.department && apt.department.toLowerCase().includes(query)) ||
                            (apt.doctor && apt.doctor.toLowerCase().includes(query)) ||
                            (apt.surgeon && apt.surgeon.toLowerCase().includes(query)) ||
                            (apt.leadSurgeon && apt.leadSurgeon.toLowerCase().includes(query)) ||
                            (apt.token && apt.token.toLowerCase().includes(query)) ||
                            (apt.roomLabel && apt.roomLabel.toLowerCase().includes(query)) ||
                            (apt.otRoom && apt.otRoom.toLowerCase().includes(query));

      return matchesCategory && matchesStatus && matchesRoom && matchesDate && matchesSearch;
    });

    if (filtered.length === 0) {
      let emptyMsg = 'No appointments found matching your filters.';
      if (currentAppointmentCategory === 'today') emptyMsg = 'No appointments scheduled for today matching filters.';
      else if (currentAppointmentCategory === 'opd') emptyMsg = 'No OPD consultations found matching filters.';
      else if (currentAppointmentCategory === 'operation') emptyMsg = 'No Operation / OT schedules found matching filters.';

      appointmentsTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
            ${emptyMsg}
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(apt => {
      const isCompleted = apt.status.toLowerCase() === 'completed';
      const isCancelled = apt.status.toLowerCase() === 'cancelled';
      const isOperation = apt.category === 'operation';
      
      // Status badge: Subtle amber (#F59E0B) for Operation / OT upcoming
      let statusBadgeHtml = '<span class="badge-available">Upcoming</span>';
      if (isCompleted) {
        statusBadgeHtml = '<span class="badge-active">Completed</span>';
      } else if (isCancelled) {
        statusBadgeHtml = '<span class="badge-cancelled">Cancelled</span>';
      } else if (isOperation) {
        statusBadgeHtml = '<span class="badge-ot">Upcoming</span>';
      }

      const tr = document.createElement('tr');

      if (currentAppointmentCategory === 'today') {
        // Tab 1: Today's Appointments
        tr.innerHTML = `
          <td>
            <div class="patient-cell">
              <div class="patient-avatar ${apt.avatarClass}">${apt.initials}</div>
              <div>
                <div class="patient-cell-name">${escapeHtml(apt.patient)}</div>
                <small style="color: var(--text-secondary); font-size: 0.75rem;">${escapeHtml(apt.patientId)}</small>
              </div>
            </div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--text-dark);">${escapeHtml(apt.time)}</div>
            <small style="color: var(--text-secondary); font-size: 0.75rem;">Today</small>
          </td>
          <td>
            <strong>${escapeHtml(apt.procedure || apt.type)}</strong>
            <small style="display: block; color: var(--text-secondary); font-size: 0.75rem;">
              ${isOperation ? `Surgeon: ${escapeHtml(apt.surgeon || apt.leadSurgeon || 'Dr. Sharma')}` : escapeHtml(apt.department || 'General Medicine')}
            </small>
          </td>
          <td>
            <span style="font-weight: 600; color: var(--text-dark);">${escapeHtml(apt.roomLabel || apt.otRoom || apt.room)}</span>
          </td>
          <td>${statusBadgeHtml}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <button type="button" class="btn-outline btn-sm view-patient-btn" data-patient-id="${apt.patientId}">View Patient</button>
              <button type="button" class="btn-outline btn-sm view-details-btn" data-apt-id="${apt.id}">View Details</button>
              ${!isCompleted && !isCancelled && !isOperation ? `
                <button type="button" class="btn-action-primary btn-sm start-consult-btn" data-apt-id="${apt.id}">Start Consultation</button>
              ` : ''}
            </div>
          </td>
        `;
      } else if (currentAppointmentCategory === 'opd') {
        // Tab 2: OPD Consultations (Patient Name, Time, Department, Room, Consultation Type, Status, Actions)
        tr.innerHTML = `
          <td>
            <div class="patient-cell">
              <div class="patient-avatar ${apt.avatarClass}">${apt.initials}</div>
              <div>
                <div class="patient-cell-name">${escapeHtml(apt.patient)}</div>
                <small style="color: var(--text-secondary); font-size: 0.75rem;">${escapeHtml(apt.token || apt.patientId)}</small>
              </div>
            </div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--text-dark);">${escapeHtml(apt.time)}</div>
            <small style="color: var(--text-secondary); font-size: 0.75rem;">${escapeHtml(apt.date || '2026-09-12')}</small>
          </td>
          <td><span style="font-weight: 500; color: var(--text-dark);">${escapeHtml(apt.department || 'General Medicine')}</span></td>
          <td><span style="font-weight: 600; color: var(--text-dark);">${escapeHtml(apt.roomLabel || apt.room)}</span></td>
          <td><strong>${escapeHtml(apt.type)}</strong></td>
          <td>${statusBadgeHtml}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <button type="button" class="btn-outline btn-sm view-patient-btn" data-patient-id="${apt.patientId}">View Patient</button>
              <button type="button" class="btn-outline btn-sm view-details-btn" data-apt-id="${apt.id}">View Details</button>
              ${!isCompleted && !isCancelled ? `
                <button type="button" class="btn-action-primary btn-sm start-consult-btn" data-apt-id="${apt.id}">Start Consultation</button>
              ` : ''}
            </div>
          </td>
        `;
      } else if (currentAppointmentCategory === 'operation') {
        // Tab 3: Operation / OT (Patient Name, Operation / Procedure, Time, OT Room, Surgeon, Status, Actions)
        tr.innerHTML = `
          <td>
            <div class="patient-cell">
              <div class="patient-avatar ${apt.avatarClass}">${apt.initials}</div>
              <div>
                <div class="patient-cell-name">${escapeHtml(apt.patient)}</div>
                <small style="color: var(--text-secondary); font-size: 0.75rem;">${escapeHtml(apt.patientId)}</small>
              </div>
            </div>
          </td>
          <td>
            <strong style="color: var(--text-dark);">${escapeHtml(apt.procedure || apt.type)}</strong>
            <small style="display: block; color: var(--text-secondary); font-size: 0.75rem;">Est. ${escapeHtml(apt.duration || '60 min')}</small>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; color: #B45309;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              ${escapeHtml(apt.time)}
            </div>
            <small style="color: var(--text-secondary); font-size: 0.75rem;">${escapeHtml(apt.date)}</small>
          </td>
          <td>
            <span style="font-weight: 600; color: #B45309; background-color: #FEF3C7; padding: 2px 8px; border-radius: var(--radius-sm); font-size: 0.8125rem;">
              ${escapeHtml(apt.roomLabel || apt.otRoom)}
            </span>
          </td>
          <td>
            <div style="font-size: 0.875rem; font-weight: 600; color: var(--text-dark);">${escapeHtml(apt.surgeon || apt.leadSurgeon || 'Dr. Sharma')}</div>
            <small style="color: var(--text-secondary); font-size: 0.75rem;">${escapeHtml(apt.department || 'General Surgery')}</small>
          </td>
          <td>${statusBadgeHtml}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <button type="button" class="btn-outline btn-sm view-details-btn" data-apt-id="${apt.id}">View Details</button>
              <button type="button" class="btn-outline btn-sm view-patient-btn" data-patient-id="${apt.patientId}">View Patient</button>
            </div>
          </td>
        `;
      } else {
        // Tab 4: All Schedule (Patient Name, Time & Date, Category, Department / Facility, Details / Procedure, Status, Actions)
        tr.innerHTML = `
          <td>
            <div class="patient-cell">
              <div class="patient-avatar ${apt.avatarClass}">${apt.initials}</div>
              <div>
                <div class="patient-cell-name">${escapeHtml(apt.patient)}</div>
                <small style="color: var(--text-secondary); font-size: 0.75rem;">${escapeHtml(apt.patientId)}</small>
              </div>
            </div>
          </td>
          <td>
            <div style="font-weight: 600; color: var(--text-dark);">${escapeHtml(apt.time)}</div>
            <small style="color: var(--text-secondary); font-size: 0.75rem;">${escapeHtml(apt.date || '2026-09-12')}</small>
          </td>
          <td>
            <span class="${isOperation ? 'badge-ot' : 'badge-available'}">
              ${isOperation ? 'Operation / OT' : 'OPD'}
            </span>
          </td>
          <td>
            <span style="font-weight: 600; color: var(--text-dark);">${escapeHtml(apt.department || 'General Medicine')}</span>
            <small style="display: block; color: var(--text-secondary); font-size: 0.75rem;">${escapeHtml(apt.roomLabel || apt.otRoom || apt.room)}</small>
          </td>
          <td>
            <strong>${escapeHtml(apt.procedure || apt.type)}</strong>
            <small style="display: block; color: var(--text-secondary); font-size: 0.75rem;">
              ${isOperation ? `Surgeon: ${escapeHtml(apt.surgeon || apt.leadSurgeon || 'Dr. Sharma')}` : `Doctor: ${escapeHtml(apt.doctor || 'Dr. Sharma')}`}
            </small>
          </td>
          <td>${statusBadgeHtml}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <button type="button" class="btn-outline btn-sm view-patient-btn" data-patient-id="${apt.patientId}">View Patient</button>
              <button type="button" class="btn-outline btn-sm view-details-btn" data-apt-id="${apt.id}">View Details</button>
              ${!isCompleted && !isCancelled && !isOperation ? `
                <button type="button" class="btn-action-primary btn-sm start-consult-btn" data-apt-id="${apt.id}">Start Consultation</button>
              ` : ''}
            </div>
          </td>
        `;
      }

      // Event bindings for row actions
      const viewPatientBtn = tr.querySelector('.view-patient-btn');
      if (viewPatientBtn) {
        viewPatientBtn.addEventListener('click', () => {
          openPatientProfileById(apt.patientId);
        });
      }

      const viewDetailsBtn = tr.querySelector('.view-details-btn');
      if (viewDetailsBtn) {
        viewDetailsBtn.addEventListener('click', () => {
          openAppointmentDetailsModal(apt);
        });
      }

      const startConsultBtn = tr.querySelector('.start-consult-btn');
      if (startConsultBtn) {
        startConsultBtn.addEventListener('click', () => {
          startConsultation(apt.id);
        });
      }

      appointmentsTableBody.appendChild(tr);
    });
  }

  // Appointment / OT Details Modal Viewer
  function openAppointmentDetailsModal(apt) {
    const modalAptBody = document.getElementById('modalAptBody');
    const modalAptTitle = document.getElementById('modalAptTitle');
    const modalAptViewPatientBtn = document.getElementById('modalAptViewPatientBtn');
    const modalAptStartBtn = document.getElementById('modalAptStartBtn');

    if (modalAptTitle) {
      modalAptTitle.textContent = apt.category === 'operation' ? 'Operation / OT Schedule Details' : 'Appointment Details';
    }

    const isOp = apt.category === 'operation';
    let statusBadgeHtml = '<span class="badge-available">Upcoming</span>';
    if (apt.status.toLowerCase() === 'completed') {
      statusBadgeHtml = '<span class="badge-active">Completed</span>';
    } else if (apt.status.toLowerCase() === 'cancelled') {
      statusBadgeHtml = '<span class="badge-cancelled">Cancelled</span>';
    } else if (isOp) {
      statusBadgeHtml = '<span class="badge-ot">Upcoming</span>';
    }

    if (modalAptBody) {
      modalAptBody.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div class="patient-avatar ${apt.avatarClass}" style="width: 46px; height: 46px; font-size: 1.1rem;">${apt.initials}</div>
            <div>
              <h4 style="font-size: 1.15rem; font-weight: 700; color: var(--text-dark); margin: 0 0 4px;">${escapeHtml(apt.patient)}</h4>
              <span style="font-size: 0.8125rem; color: var(--text-secondary); font-family: monospace;">Patient ID: ${escapeHtml(apt.patientId)}</span>
            </div>
          </div>
          <div>${statusBadgeHtml}</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;">
          <div style="background: #F8FAFC; padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <span style="font-size: 0.75rem; color: var(--text-secondary); display: block; font-weight: 600; text-transform: uppercase;">
              ${isOp ? 'Operation / Procedure' : 'Consultation Type'}
            </span>
            <strong style="color: var(--text-dark); font-size: 0.95rem;">${escapeHtml(apt.procedure || apt.type)}</strong>
          </div>
          <div style="background: #F8FAFC; padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <span style="font-size: 0.75rem; color: var(--text-secondary); display: block; font-weight: 600; text-transform: uppercase;">Time & Date</span>
            <strong style="color: var(--text-dark); font-size: 0.95rem;">${escapeHtml(apt.time)} · ${escapeHtml(apt.date || '2026-09-12')}</strong>
          </div>
          <div style="background: #F8FAFC; padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <span style="font-size: 0.75rem; color: var(--text-secondary); display: block; font-weight: 600; text-transform: uppercase;">Department</span>
            <strong style="color: var(--text-dark); font-size: 0.95rem;">${escapeHtml(apt.department || 'General Medicine')}</strong>
          </div>
          <div style="background: #F8FAFC; padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <span style="font-size: 0.75rem; color: var(--text-secondary); display: block; font-weight: 600; text-transform: uppercase;">
              ${isOp ? 'OT Room' : 'Consultation Room'}
            </span>
            <strong style="color: var(--text-dark); font-size: 0.95rem;">${escapeHtml(apt.roomLabel || apt.otRoom || apt.room)}</strong>
          </div>
          <div style="background: #F8FAFC; padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color); grid-column: 1 / -1;">
            <span style="font-size: 0.75rem; color: var(--text-secondary); display: block; font-weight: 600; text-transform: uppercase;">
              ${isOp ? 'Surgeon' : 'Consulting Doctor'}
            </span>
            <strong style="color: var(--text-dark); font-size: 0.95rem;">${escapeHtml(apt.surgeon || apt.leadSurgeon || apt.doctor || 'Dr. Sharma')}</strong>
            ${isOp && apt.anesthesia ? `<span style="font-size: 0.8rem; color: var(--text-secondary); display: block; margin-top: 2px;">Anesthesia: ${escapeHtml(apt.anesthesia)} | Clearance: ${escapeHtml(apt.preOpClearance || 'Cleared')}</span>` : ''}
          </div>
        </div>

        ${apt.notes ? `
          <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: var(--radius-md); padding: 12px 14px;">
            <span style="font-size: 0.75rem; color: var(--primary); font-weight: 700; text-transform: uppercase; display: block; margin-bottom: 2px;">Clinical Note</span>
            <p style="font-size: 0.875rem; color: var(--text-dark); margin: 0;">${escapeHtml(apt.notes)}</p>
          </div>
        ` : ''}
      `;
    }

    if (modalAptViewPatientBtn) {
      modalAptViewPatientBtn.onclick = () => {
        closeModal('modalAptDetails');
        openPatientProfileById(apt.patientId);
      };
    }

    if (modalAptStartBtn) {
      if (!isOp && apt.status.toLowerCase() === 'upcoming') {
        modalAptStartBtn.style.display = 'inline-flex';
        modalAptStartBtn.onclick = () => {
          closeModal('modalAptDetails');
          startConsultation(apt.id);
        };
      } else {
        modalAptStartBtn.style.display = 'none';
      }
    }

    openModal('modalAptDetails');
  }

  // Start Consultation Handler
  function startConsultation(aptId) {
    const apt = APPOINTMENTS_DATA.find(a => a.id === aptId);
    if (apt) {
      apt.status = 'Completed';
      renderAppointmentsTable();
      renderDashboardAppointments(APPOINTMENTS_DATA);
      updateAppointmentSummaryMetrics();
      showToast(`Consultation completed for ${apt.patient}!`, 'success');
    }
  }

  // Search filter
  if (appointmentSearchInput) {
    appointmentSearchInput.addEventListener('input', renderAppointmentsTable);
  }

  // Status Filter Group (All, Completed, Cancelled)
  if (appointmentStatusFilterGroup) {
    appointmentStatusFilterGroup.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        appointmentStatusFilterGroup.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentAppointmentStatus = pill.getAttribute('data-filter') || 'all';
        renderAppointmentsTable();
      });
    });
  }

  // Facility / Room Filter
  if (appointmentRoomFilter) {
    appointmentRoomFilter.addEventListener('change', renderAppointmentsTable);
  }

  // Date Filter
  if (appointmentDateFilter) {
    appointmentDateFilter.addEventListener('change', renderAppointmentsTable);
  }

  // Reschedule Modal Logic
  let activeRescheduleAptId = null;

  function openRescheduleModal(aptId, patientName) {
    activeRescheduleAptId = aptId;
    const nameLabel = document.getElementById('reschedulePatientName');
    if (nameLabel) nameLabel.textContent = patientName;
    openModal('modalReschedule');
  }

  const formReschedule = document.getElementById('formReschedule');
  if (formReschedule) {
    formReschedule.addEventListener('submit', (e) => {
      e.preventDefault();
      const newDate = document.getElementById('rescheduleDate').value;
      const newTime = document.getElementById('rescheduleTime').value;

      const apt = APPOINTMENTS_DATA.find(a => a.id === activeRescheduleAptId);
      if (apt) {
        apt.date = newDate;
        apt.time = newTime;
        apt.status = 'Upcoming';
        renderAppointmentsTable();
        renderDashboardAppointments(APPOINTMENTS_DATA);
        closeModal('modalReschedule');
        showToast(`Appointment for ${apt.patient} rescheduled to ${newTime} on ${newDate}!`, 'success');
      }
    });
  }

  function cancelAppointment(aptId, patientName) {
    const apt = APPOINTMENTS_DATA.find(a => a.id === aptId);
    if (apt) {
      apt.status = 'Cancelled';
      renderAppointmentsTable();
      renderDashboardAppointments(APPOINTMENTS_DATA);
      showToast(`Appointment for ${patientName} has been cancelled.`, 'warning');
    }
  }

  /* ============================================================================
     7. MEDICAL RECORDS CONTROLLER (Search, Filter, View Preview, Download)
     ============================================================================ */

  const recordsTableBody = document.getElementById('recordsTableBody');
  const recordsSearchInput = document.getElementById('recordsSearchInput');
  const recordFilterGroup = document.getElementById('recordFilterGroup');
  let currentRecordFilter = 'all';

  function renderRecordsTable() {
    if (!recordsTableBody) return;
    recordsTableBody.innerHTML = '';

    const query = recordsSearchInput ? recordsSearchInput.value.trim().toLowerCase() : '';

    const filtered = RECORDS_DATA.filter(rec => {
      const matchesFilter = currentRecordFilter === 'all' || rec.filterCategory === currentRecordFilter;
      const matchesSearch = !query ||
                            rec.patient.toLowerCase().includes(query) ||
                            rec.title.toLowerCase().includes(query) ||
                            rec.type.toLowerCase().includes(query) ||
                            rec.uploadedBy.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
      recordsTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 36px 20px; color: var(--text-secondary);">
            No medical records found matching criteria.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(rec => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <strong>${escapeHtml(rec.patient)}</strong>
          <small style="display: block; font-size: 0.75rem; color: var(--text-secondary);">${escapeHtml(rec.title)}</small>
        </td>
        <td><span class="badge-available">${escapeHtml(rec.type)}</span></td>
        <td>${escapeHtml(rec.date)}</td>
        <td>${escapeHtml(rec.uploadedBy)}</td>
        <td><span class="badge-active">${escapeHtml(rec.status)}</span></td>
        <td>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn-outline btn-sm view-rec-btn">View</button>
            <button type="button" class="btn-secondary btn-sm download-rec-btn">Download</button>
          </div>
        </td>
      `;

      tr.querySelector('.view-rec-btn').addEventListener('click', () => {
        openDocPreview(rec.title, rec.patient);
      });

      tr.querySelector('.download-rec-btn').addEventListener('click', () => {
        showToast(`Downloading ${rec.title} (PDF)...`, 'info');
      });

      recordsTableBody.appendChild(tr);
    });
  }

  if (recordsSearchInput) recordsSearchInput.addEventListener('input', renderRecordsTable);

  if (recordFilterGroup) {
    recordFilterGroup.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        recordFilterGroup.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentRecordFilter = pill.getAttribute('data-filter') || 'all';
        renderRecordsTable();
      });
    });
  }

  function openDocPreview(title, patientName) {
    const titleEl = document.getElementById('previewDocTitle');
    const metaEl = document.getElementById('previewDocMeta');
    if (titleEl) titleEl.textContent = title;
    if (metaEl) metaEl.textContent = `Patient: ${patientName} · Diagnostic lab verification complete.`;
    openModal('modalDocPreview');
  }

  const downloadDocBtn = document.getElementById('downloadDocBtn');
  if (downloadDocBtn) {
    downloadDocBtn.addEventListener('click', () => {
      const title = document.getElementById('previewDocTitle')?.textContent || "Document";
      closeModal('modalDocPreview');
      showToast(`Downloaded verified document: ${title} (PDF)`, 'success');
    });
  }

  const openUploadRecordBtn = document.getElementById('openUploadRecordBtn');
  if (openUploadRecordBtn) {
    openUploadRecordBtn.addEventListener('click', () => {
      showToast('Document upload dialog initialized. Select clinical file.', 'info');
    });
  }

  /* ============================================================================
     8. PRESCRIPTIONS CONTROLLER (List, Create Modal Form Validation)
     ============================================================================ */

  const prescriptionsTableBody = document.getElementById('prescriptionsTableBody');
  const prescriptionsCountPill = document.getElementById('prescriptionsCountPill');

  function renderPrescriptionsTable() {
    if (!prescriptionsTableBody) return;
    prescriptionsTableBody.innerHTML = '';

    if (prescriptionsCountPill) {
      prescriptionsCountPill.textContent = `${PRESCRIPTIONS_DATA.length} Prescriptions`;
    }

    PRESCRIPTIONS_DATA.forEach(rx => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <strong>${escapeHtml(rx.patient)}</strong>
          <small style="display: block; font-size: 0.75rem; color: var(--text-secondary);">${escapeHtml(rx.patientId)}</small>
        </td>
        <td>${escapeHtml(rx.date)}</td>
        <td>${escapeHtml(rx.diagnosis)}</td>
        <td><strong>${escapeHtml(rx.medicines)}</strong></td>
        <td><span class="badge-active">${escapeHtml(rx.status)}</span></td>
        <td>
          <button type="button" class="btn-outline btn-sm view-rx-patient-btn">View Patient</button>
        </td>
      `;

      tr.querySelector('.view-rx-patient-btn').addEventListener('click', () => {
        openPatientProfileById(rx.patientId);
      });

      prescriptionsTableBody.appendChild(tr);
    });
  }

  const openCreatePrescriptionBtn = document.getElementById('openCreatePrescriptionBtn');
  if (openCreatePrescriptionBtn) {
    openCreatePrescriptionBtn.addEventListener('click', () => {
      openModal('modalCreatePrescription');
    });
  }

  const formCreatePrescription = document.getElementById('formCreatePrescription');
  if (formCreatePrescription) {
    formCreatePrescription.addEventListener('submit', (e) => {
      e.preventDefault();
      const patientName = document.getElementById('rxPatientSelect').value;
      const medicine = document.getElementById('rxMedicineName').value.trim();
      const dosage = document.getElementById('rxDosage').value.trim();
      const frequency = document.getElementById('rxFrequency').value;
      const duration = document.getElementById('rxDuration').value.trim();
      const instructions = document.getElementById('rxInstructions').value.trim();

      const matchedPatient = PATIENTS_DATA.find(p => p.name === patientName) || PATIENTS_DATA[0];

      const newRx = {
        id: `RX-${100 + PRESCRIPTIONS_DATA.length + 1}`,
        patient: patientName,
        patientId: matchedPatient.id,
        date: "Today",
        diagnosis: matchedPatient.chiefComplaint || "General Care",
        medicines: `${medicine} (${dosage}) - ${frequency} (${duration})`,
        status: "Active"
      };

      PRESCRIPTIONS_DATA.unshift(newRx);

      // Also append to patient's prescription array
      matchedPatient.prescriptions.unshift({
        date: "Today",
        medicine: medicine,
        dosage: dosage,
        freq: frequency,
        duration: duration,
        status: "Active"
      });

      renderPrescriptionsTable();
      closeModal('modalCreatePrescription');
      formCreatePrescription.reset();

      // Genuine Action Toast
      showToast(`Prescription for ${patientName} created successfully!`, 'success');
    });
  }

  /* ============================================================================
     9. MESSAGES CONTROLLER (2-Column Chat, Thread switching, Simulated Replies)
     ============================================================================ */

  const conversationListEl = document.getElementById('conversationList');
  const chatMessagesEl = document.getElementById('chatMessages');
  const chatFormEl = document.getElementById('chatForm');
  const chatInputEl = document.getElementById('chatInput');
  const chatActiveAvatar = document.getElementById('chatActiveAvatar');
  const chatActiveName = document.getElementById('chatActiveName');
  const chatViewPatientBtn = document.getElementById('chatViewPatientBtn');
  const conversationSearchInput = document.getElementById('conversationSearchInput');

  function renderConversationList() {
    if (!conversationListEl) return;
    conversationListEl.innerHTML = '';

    const query = conversationSearchInput ? conversationSearchInput.value.trim().toLowerCase() : '';

    CHATS_DATA.filter(c => !query || c.patientName.toLowerCase().includes(query)).forEach(chat => {
      const isActive = currentActiveChat && currentActiveChat.patientId === chat.patientId;
      const lastMsg = chat.messages[chat.messages.length - 1];

      const li = document.createElement('li');
      li.className = `conversation-item ${isActive ? 'active' : ''}`;
      li.innerHTML = `
        <div class="convo-avatar ${chat.status === 'Online' ? 'avatar-rm' : 'avatar-ps'}">${chat.avatar}</div>
        <div class="convo-info">
          <div class="convo-name-row">
            <span class="convo-name">${escapeHtml(chat.patientName)}</span>
            <span class="convo-time">${escapeHtml(chat.lastTime)}</span>
          </div>
          <p class="convo-snippet">${escapeHtml(lastMsg ? lastMsg.text : 'Start conversation')}</p>
        </div>
      `;

      li.addEventListener('click', () => {
        currentActiveChat = chat;
        renderConversationList();
        renderActiveChatMessages();
      });

      conversationListEl.appendChild(li);
    });
  }

  function renderActiveChatMessages() {
    if (!chatMessagesEl || !currentActiveChat) return;

    if (chatActiveAvatar) chatActiveAvatar.textContent = currentActiveChat.avatar;
    if (chatActiveName) chatActiveName.textContent = currentActiveChat.patientName;

    chatMessagesEl.innerHTML = '';

    currentActiveChat.messages.forEach(msg => {
      const isDoctor = msg.sender === 'doctor';
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble ${isDoctor ? 'outgoing' : 'incoming'}`;
      bubble.innerHTML = `
        <p>${escapeHtml(msg.text)}</p>
        <div class="chat-time-tag">${escapeHtml(msg.time)} ${isDoctor ? '· Delivered' : ''}</div>
      `;
      chatMessagesEl.appendChild(bubble);
    });

    // Auto-scroll to latest message
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  }

  if (conversationSearchInput) {
    conversationSearchInput.addEventListener('input', renderConversationList);
  }

  if (chatFormEl && chatInputEl) {
    chatFormEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInputEl.value.trim();
      if (!text || !currentActiveChat) return;

      const nowTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date());

      // Add doctor message
      currentActiveChat.messages.push({
        sender: 'doctor',
        text: text,
        time: nowTime
      });

      currentActiveChat.lastTime = "Just now";
      chatInputEl.value = '';
      renderConversationList();
      renderActiveChatMessages();

      // Trigger simulated patient reply after 1000ms
      setTimeout(() => {
        const patientReplies = [
          "Thank you Dr. Sharma, I will follow these instructions carefully.",
          "Understood Doctor, will see you at the scheduled follow-up consultation.",
          "Got it, I will take the dose right after meals as advised.",
          "Thank you for the prompt clarification, Doctor!"
        ];
        const randomReply = patientReplies[Math.floor(Math.random() * patientReplies.length)];

        currentActiveChat.messages.push({
          sender: 'patient',
          text: randomReply,
          time: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date())
        });

        renderConversationList();
        renderActiveChatMessages();
      }, 1000);
    });
  }

  if (chatViewPatientBtn) {
    chatViewPatientBtn.addEventListener('click', () => {
      if (currentActiveChat) {
        openPatientProfileById(currentActiveChat.patientId);
      }
    });
  }

  /* ============================================================================
     10. SETTINGS CONTROLLER (Profile, Credentials, Preferences, Save Changes)
     ============================================================================ */

  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const settingDoctorName = document.getElementById('settingDoctorName');
  const settingSpecialty = document.getElementById('settingSpecialty');

  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
      if (settingDoctorName && settingDoctorName.value.trim()) {
        DOCTOR_DATA.name = settingDoctorName.value.trim();
      }
      if (settingSpecialty && settingSpecialty.value.trim()) {
        DOCTOR_DATA.specialty = settingSpecialty.value.trim();
      }

      applyDoctorData();

      // Genuine Action Toast
      showToast("Account settings saved successfully!", "success");
    });
  }

  /* ============================================================================
     11. HELP & SUPPORT CONTROLLER (Accordion toggle, Search, Support Ticket)
     ============================================================================ */

  const faqAccordion = document.getElementById('faqAccordion');
  const helpSearchInput = document.getElementById('helpSearchInput');
  const openContactSupportBtn = document.getElementById('openContactSupportBtn');
  const formContactSupport = document.getElementById('formContactSupport');

  if (faqAccordion) {
    const faqCards = faqAccordion.querySelectorAll('.faq-card');
    faqCards.forEach(card => {
      const btn = card.querySelector('.faq-question-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          const isOpen = card.classList.contains('open');
          // Toggle current card
          if (isOpen) {
            card.classList.remove('open');
          } else {
            card.classList.add('open');
          }
        });
      }
    });
  }

  if (helpSearchInput && faqAccordion) {
    helpSearchInput.addEventListener('input', () => {
      const query = helpSearchInput.value.trim().toLowerCase();
      const faqCards = faqAccordion.querySelectorAll('.faq-card');
      faqCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (!query || text.includes(query)) {
          card.style.display = 'block';
          if (query.length > 2) card.classList.add('open');
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  if (openContactSupportBtn) {
    openContactSupportBtn.addEventListener('click', () => {
      openModal('modalContactSupport');
    });
  }

  if (formContactSupport) {
    formContactSupport.addEventListener('submit', (e) => {
      e.preventDefault();
      closeModal('modalContactSupport');
      formContactSupport.reset();

      // Genuine Action Toast
      showToast("Support ticket submitted! Ticket #MC-9428 created.", "success");
    });
  }

  /* ============================================================================
     12. GENERIC MODAL MANAGER (Open, Close, Escape accessibility)
     ============================================================================ */

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop.open').forEach(modal => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    });
    document.body.style.overflow = '';
  }

  // Bind all data-close-modal buttons
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      closeModal(modalId);
    });
  });

  // Close when clicking directly on the backdrop
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop.id);
      }
    });
  });

  /* ============================================================================
     HELPER: XSS ESCAPING
     ============================================================================ */
  function escapeHtml(string) {
    if (!string) return '';
    return String(string)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ============================================================================
     INITIALIZATION ON LOAD
     ============================================================================ */
  // Check if patient specified in query param or sessionStorage
  const urlParams = new URLSearchParams(window.location.search);
  const paramPatientId = urlParams.get('patient') || (function() {
    try { return sessionStorage.getItem('selectedPatientId'); } catch(e) { return null; }
  })();

  const initialPatient = (paramPatientId && PATIENTS_DATA.find(p => p.id === paramPatientId)) || PATIENTS_DATA[0];
  currentActivePatient = initialPatient;

  applyDoctorData();
  applyStatsData();
  filterDashboardAppointments();
  renderPatientsTable();
  populatePatientProfile(initialPatient);
  renderAppointmentsTable();
  renderRecordsTable();
  renderPrescriptionsTable();
  renderConversationList();
  renderActiveChatMessages();

  // Initialize Route
  navigateToRoute(window.location.hash || '');

  // Export helper for console/testing
  window.MediCare = {
    navigateTo: (hash) => { window.location.hash = hash; },
    openPatient: openPatientProfileById,
    setAppointmentCategory,
    showToast
  };

});
