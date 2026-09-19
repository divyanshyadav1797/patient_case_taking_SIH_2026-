import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const PatientContext = createContext(null);

export const DEFAULT_SCHEME_DATA = {
  RGHS: {
    name: "RGHS",
    fullName: "Rajasthan Government Health Scheme",
    status: "● Active Beneficiary",
    cardNo: "RGHS-RJ-2024-99120",
    coverageAmount: "₹10,00,000",
    usedAmount: "₹45,200",
    benefits: [
      { icon: "fa-indian-rupee-sign", type: "green", title: "Cashless Healthcare", description: "Eligible beneficiaries can access 100% cashless treatment at empaneled hospitals." },
      { icon: "fa-hospital", type: "blue", title: "Empanelled Hospitals", description: "Access over 1,200+ government and private accredited hospitals across Rajasthan." },
      { icon: "fa-flask", type: "purple", title: "Diagnostic Services", description: "Free pathology, MRI, CT scan and radiology testing in empaneled labs." },
      { icon: "fa-pills", type: "yellow", title: "Free Medicines", description: "Doorstep and counter delivery of prescribed generic & specialty medicines." }
    ]
  },
  MAAY: {
    name: "MAA-Y",
    fullName: "Mukhyamantri Ayushman Arogya Yojana",
    status: "● Active Coverage",
    cardNo: "MAAY-RJ-7789-1102",
    coverageAmount: "₹25,00,000",
    usedAmount: "₹12,000",
    benefits: [
      { icon: "fa-shield-halved", type: "green", title: "Annual Universal Cover", description: "Up to ₹25 Lakhs comprehensive family health assurance for secondary and tertiary care." },
      { icon: "fa-heart-pulse", type: "blue", title: "Critical Illness Packages", description: "Specialized oncology, cardiology, neurosurgery, and organ transplant covers." }
    ]
  },
  ABPMJAY: {
    name: "AB-PMJAY",
    fullName: "Ayushman Bharat PM-JAY",
    status: "● National Health Cover",
    cardNo: "PMJAY-IND-5541-0982",
    coverageAmount: "₹5,00,000",
    usedAmount: "₹0",
    benefits: [
      { icon: "fa-building-columns", type: "green", title: "Pan-India Portability", description: "Cashless access to healthcare services at all empaneled public & private hospitals across India." }
    ]
  }
};

export const INITIAL_PATIENT_DOCTORS = [
  { id: 1, name: "Dr. Sarah Jenkins", specialty: "Cardiology", experience: "14 yrs exp", rating: "4.9", reviews: 142, available: "Available Today", fee: "₹800", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300" },
  { id: 2, name: "Dr. Michael Chang", specialty: "Neurology", experience: "12 yrs exp", rating: "4.8", reviews: 98, available: "Next slot: Tomorrow", fee: "₹1,000", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300" },
  { id: 3, name: "Dr. Priya Patel", specialty: "General Physician", experience: "9 yrs exp", rating: "4.9", reviews: 210, available: "Available Today", fee: "₹500", image: "https://images.unsplash.com/photo-1594824813581-9b16866b1a20?auto=format&fit=crop&q=80&w=300" },
  { id: 4, name: "Dr. Rajesh Gupta", specialty: "Orthopedics", experience: "16 yrs exp", rating: "4.7", reviews: 175, available: "Available Today", fee: "₹900", image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300" },
  { id: 5, name: "Dr. Ananya Roy", specialty: "Pediatrics", experience: "8 yrs exp", rating: "4.9", reviews: 89, available: "Next slot: Monday", fee: "₹600", image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=300" }
];

export const INITIAL_APPOINTMENTS = [
  { id: 'APT-101', doctorName: 'Dr. Sarah Jenkins', specialty: 'Cardiology', hospital: 'SMS Hospital, Jaipur', date: 'Tomorrow, Sep 19', time: '10:30 AM', status: 'upcoming', type: 'Hospital Consultation' },
  { id: 'APT-102', doctorName: 'Dr. Priya Patel', specialty: 'General Physician', hospital: 'Apollo Clinic', date: 'Sep 24, 2026', time: '02:00 PM', status: 'upcoming', type: 'Routine Follow-up' },
  { id: 'APT-098', doctorName: 'Dr. Rajesh Gupta', specialty: 'Orthopedics', hospital: 'Fortis Hospital', date: 'Aug 14, 2026', time: '11:15 AM', status: 'past', type: 'Knee Joint Consultation' },
  { id: 'APT-095', doctorName: 'Dr. Michael Chang', specialty: 'Neurology', hospital: 'Eternal Heart Care', date: 'Jul 28, 2026', time: '04:00 PM', status: 'cancelled', type: 'Migraine Review' }
];

export const INITIAL_RECORDS = [
  { id: 'REC-01', title: 'Comprehensive Lipid & Blood Profile', doctor: 'Dr. Sarah Jenkins', hospital: 'SMS Central Lab', date: 'Sep 10, 2026', type: 'Lab Report', file: 'blood_report_sep2026.pdf', size: '1.8 MB' },
  { id: 'REC-02', title: 'Chest X-Ray Digital Imaging', doctor: 'Dr. Rajesh Gupta', hospital: 'Radiology Wing B', date: 'Aug 14, 2026', type: 'Diagnostic Scan', file: 'chest_xray_aug2026.pdf', size: '4.2 MB' },
  { id: 'REC-03', title: 'Hypertension Discharge Summary', doctor: 'Dr. Priya Patel', hospital: 'SMS Hospital', date: 'Jul 28, 2026', type: 'Discharge Summary', file: 'discharge_jul2026.pdf', size: '2.5 MB' }
];

export const INITIAL_MEDICINES = [
  { id: 'MED-1', name: 'Atorvastatin (Lipitor)', dosage: '20 mg', frequency: 'Once Daily (Night)', duration: '30 Days', remaining: '18 tablets', status: 'active', doctor: 'Dr. Sarah Jenkins' },
  { id: 'MED-2', name: 'Amlodipine (Norvasc)', dosage: '5 mg', frequency: 'Once Daily (Morning)', duration: '60 Days', remaining: '42 tablets', status: 'active', doctor: 'Dr. Priya Patel' },
  { id: 'MED-3', name: 'Metformin HCl', dosage: '500 mg', frequency: 'Twice Daily (Post-meals)', duration: '30 Days', remaining: '8 tablets', status: 'refill_needed', doctor: 'Dr. Priya Patel' }
];

export function PatientProvider({ children }) {
  const [doctors, setDoctors] = useState(INITIAL_PATIENT_DOCTORS);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [medicines, setMedicines] = useState(INITIAL_MEDICINES);
  const [schemes] = useState(DEFAULT_SCHEME_DATA);
  const [toastMessage, setToastMessage] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Synchronize data with Backend API on mount
  useEffect(() => {
    let mounted = true;
    async function loadBackendData() {
      try {
        const [apts, docs, recs] = await Promise.allSettled([
          api.getAppointments(),
          api.getDoctors(),
          api.getRecords()
        ]);
        if (!mounted) return;
        if (apts.status === 'fulfilled' && Array.isArray(apts.value) && apts.value.length > 0) {
          setAppointments(apts.value);
        }
        if (docs.status === 'fulfilled' && Array.isArray(docs.value) && docs.value.length > 0) {
          setDoctors(docs.value);
        }
        if (recs.status === 'fulfilled' && Array.isArray(recs.value) && recs.value.length > 0) {
          setRecords(recs.value);
        }
      } catch (err) {
        console.warn('[PatientContext] Using offline demo state:', err.message);
      }
    }
    loadBackendData();
    return () => { mounted = false; };
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const bookAppointment = async (doctorName, hospital = 'SMS Hospital, Jaipur', date = 'Sep 22, 2026', time = '11:00 AM') => {
    const newApt = {
      id: `APT-${Math.floor(100 + Math.random() * 900)}`,
      doctorName,
      specialty: 'Clinical Consultation',
      hospital,
      date,
      time,
      status: 'Upcoming',
      type: 'Confirmed Consultation'
    };
    setAppointments(prev => [newApt, ...prev]);
    showToast(`Appointment booked successfully with ${doctorName}!`);

    try {
      await api.createAppointment(newApt);
    } catch (e) {
      console.warn('[PatientContext] Backend sync failed, saved locally:', e.message);
    }
  };

  const cancelAppointment = async (id) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Cancelled' } : a));
    showToast('Appointment has been cancelled.');

    try {
      await api.cancelAppointment(id);
    } catch (e) {
      console.warn('[PatientContext] Backend sync failed, updated locally:', e.message);
    }
  };

  const value = {
    doctors,
    appointments,
    records,
    medicines,
    schemes,
    toastMessage,
    showToast,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    bookAppointment,
    cancelAppointment
  };

  return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>;
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
}
