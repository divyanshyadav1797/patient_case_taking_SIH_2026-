// Doctor Information
export const DOCTOR_DATA = {
  name: "Dr. Sharma",
  specialty: "General Physician",
  initials: "DS",
  greeting: "Good morning, Dr. Sharma",
  subtitle: "Here's your practice overview for today."
};

// Practice Stats Overview
export const STATS_DATA = {
  totalPatients: { value: "248", meta: "+12 this month" },
  todayAppointments: { value: "12", meta: "4 completed" },
  followUps: { value: "15", meta: "This week" }
};

// Patients Master Database
export const PATIENTS_DATA = [
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

// Master Appointments Database
export const INITIAL_APPOINTMENTS = [
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
export const INITIAL_PRESCRIPTIONS = [
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
export const RECORDS_DATA = [
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
export const INITIAL_CHATS = [
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
