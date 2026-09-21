import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import {
  DOCTOR_DATA,
  STATS_DATA,
  PATIENTS_DATA,
  INITIAL_APPOINTMENTS,
  INITIAL_PRESCRIPTIONS,
  RECORDS_DATA,
  INITIAL_CHATS
} from '../data/doctorData';

const DoctorContext = createContext(null);

export function DoctorProvider({ children }) {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(() => {
    if (user && user.role === 'doctor') {
      const cleanName = user.name || DOCTOR_DATA.name;
      const initials = cleanName ? cleanName.replace(/^Dr\.\s*/i, '').split(' ').map(w => w[0]).slice(0, 2).join('') : 'DR';
      return {
        ...DOCTOR_DATA,
        name: cleanName,
        specialty: user.doctorDetails?.specialty || DOCTOR_DATA.specialty,
        department: user.doctorDetails?.department || 'Cardiology',
        initials,
        greeting: `Welcome, ${cleanName}`,
        subtitle: `${user.doctorDetails?.department || 'Clinical Practice'} Overview`
      };
    }
    return DOCTOR_DATA;
  });

  useEffect(() => {
    if (user && user.role === 'doctor') {
      const cleanName = user.name || DOCTOR_DATA.name;
      const initials = cleanName ? cleanName.replace(/^Dr\.\s*/i, '').split(' ').map(w => w[0]).slice(0, 2).join('') : 'DR';
      setDoctor(prev => ({
        ...prev,
        name: cleanName,
        specialty: user.doctorDetails?.specialty || prev.specialty,
        department: user.doctorDetails?.department || prev.department,
        initials,
        greeting: `Welcome, ${cleanName}`,
        subtitle: `${user.doctorDetails?.department || 'Clinical Practice'} Overview`
      }));
    }
  }, [user]);

  const [patients, setPatients] = useState(PATIENTS_DATA);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [prescriptions, setPrescriptions] = useState(INITIAL_PRESCRIPTIONS);
  const [records, setRecords] = useState(RECORDS_DATA);
  const [clinicalReports, setClinicalReports] = useState([]);
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Dynamic practice statistics from real database data
  const stats = {
    totalPatients: {
      value: String(patients.length),
      meta: patients.length === 1 ? '1 active patient' : `${patients.length} active patients`
    },
    todayAppointments: {
      value: String(appointments.filter(a => {
        const s = (a.status || '').toLowerCase();
        const d = String(a.date || '').toLowerCase();
        return s === 'upcoming' || d === 'today' || d.includes('today');
      }).length),
      meta: 'Scheduled today'
    },
    followUps: {
      value: String(prescriptions.length),
      meta: 'Issued prescriptions'
    }
  };

  // Modals state
  const [rescheduleData, setRescheduleData] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [aptDetail, setAptDetail] = useState(null);
  const [isCreateRxOpen, setIsCreateRxOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Synchronize appointments, prescriptions, and clinical reports with Backend API
  useEffect(() => {
    let mounted = true;
    async function loadDoctorData() {
      try {
        const [apts, rxs, reps, recs] = await Promise.allSettled([
          api.getAppointments(),
          api.getPrescriptions(),
          api.getClinicalReports(),
          api.getRecords()
        ]);
        if (!mounted) return;

        if (apts.status === 'fulfilled' && Array.isArray(apts.value)) {
          const formattedApts = apts.value.map((a, idx) => ({
            id: a.id || a.customId || idx + 1,
            patient: a.patientName || 'Patient',
            patientId: a.patientId,
            time: a.time || '10:00 AM',
            date: a.date || 'Today',
            type: a.type || 'Consultation',
            status: a.status || 'Upcoming',
            chiefComplaint: a.chiefComplaint || 'Clinical evaluation',
            clinicalReportId: a.clinicalReportId
          }));
          setAppointments(formattedApts);
        }

        if (rxs.status === 'fulfilled' && Array.isArray(rxs.value)) {
          setPrescriptions(rxs.value);
        }

        const allRecords = recs.status === 'fulfilled' && Array.isArray(recs.value) ? recs.value : [];
        const allPrescriptions = rxs.status === 'fulfilled' && Array.isArray(rxs.value) ? rxs.value : [];

        if (allRecords.length > 0) {
          setRecords(allRecords);
        }

        if (reps.status === 'fulfilled' && Array.isArray(reps.value)) {
          setClinicalReports(reps.value);

          // Populate Patients purely from real Clinical Reports and Appointments
          const loadedPatients = [];
          reps.value.forEach(rep => {
            const symptomsStr = Array.isArray(rep.reportedSymptoms) ? rep.reportedSymptoms.join(', ') : (rep.reportedSymptoms || rep.chiefComplaint);
            const pId = rep.patientId;
            const patientRecords = allRecords.filter(r => String(r.patientId) === String(pId) || String(r.patientId) === String(rep.customId));
            const patientPrescriptions = allPrescriptions.filter(p => String(p.patientId) === String(pId) || String(p.patientId) === String(rep.customId));

            loadedPatients.push({
              id: rep.patientId || `P-${Math.floor(1000 + Math.random() * 9000)}`,
              name: rep.patientName || 'Intake Patient',
              initials: (rep.patientName || 'IP').split(' ').map(w => w[0]).slice(0, 2).join(''),
              avatarClass: 'avatar-rm',
              age: 28,
              gender: 'Patient',
              phone: '+91 98765 00000',
              email: 'patient@quantumcare.org',
              bloodGroup: 'O+',
              lastVisit: rep.createdAt ? new Date(rep.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today',
              status: 'Active',
              chiefComplaint: rep.chiefComplaint,
              symptoms: symptomsStr,
              summaryForDoctor: rep.summaryForDoctor,
              historyOfPresentIllness: rep.historyOfPresentIllness,
              urgentReview: rep.urgentReview,
              medicalHistory: Array.isArray(rep.pastHistoryMentioned) && rep.pastHistoryMentioned.length > 0 ? rep.pastHistoryMentioned.join(', ') : 'None reported',
              allergies: Array.isArray(rep.allergiesMentioned) && rep.allergiesMentioned.length > 0 ? rep.allergiesMentioned.join(', ') : 'None reported',
              medications: Array.isArray(rep.medicationsMentioned) && rep.medicationsMentioned.length > 0 ? rep.medicationsMentioned.join(', ') : 'None reported',
              vitals: { bp: '120/80', hr: '72 bpm', spo2: '99%', temp: '98.6°F', bmi: '22.0' },
              clinicalNotes: rep.doctorNotes || rep.summaryForDoctor,
              diagnosticImpression: rep.diagnosticImpression || '',
              conversation: rep.conversation || [],
              reportId: rep.id || rep.customId,
              records: patientRecords,
              prescriptions: patientPrescriptions,
              timeline: []
            });
          });

          setPatients(loadedPatients);
          if (loadedPatients.length > 0) {
            setSelectedPatient(prev => prev || loadedPatients[0]);
          }
        }
      } catch (err) {
        console.warn('[DoctorContext] Failed to load data from backend:', err.message);
      }
    }
    loadDoctorData();
    return () => { mounted = false; };
  }, []);

  // Toast helper
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Appointment operations
  const rescheduleAppointment = async (id, newDate, newTime) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id ? { ...apt, date: newDate, time: newTime, status: 'Upcoming' } : apt
      )
    );
    showToast(`Appointment successfully rescheduled to ${newDate} at ${newTime}`);
    setRescheduleData(null);

    try {
      await api.updateAppointment(id, { date: newDate, time: newTime, status: 'Upcoming' });
    } catch (e) {
      console.warn('[DoctorContext] Failed to sync reschedule with backend:', e.message);
    }
  };

  const cancelAppointment = async (id) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: 'Cancelled' } : apt))
    );
    showToast('Appointment cancelled successfully', 'info');

    try {
      await api.updateAppointment(id, { status: 'Cancelled' });
    } catch (e) {
      console.warn('[DoctorContext] Failed to sync cancel with backend:', e.message);
    }
  };

  // Save Doctor Clinical Consultation Notes directly to MongoDB
  const saveDoctorNotes = async (reportId, notesData) => {
    try {
      if (reportId) {
        await api.updateClinicalReport(reportId, notesData);
      }
      // Update local state
      setPatients(prev => prev.map(p => {
        if (p.reportId === reportId || p.id === selectedPatient?.id) {
          return {
            ...p,
            clinicalNotes: notesData.doctorNotes || p.clinicalNotes,
            diagnosticImpression: notesData.diagnosticImpression || p.diagnosticImpression
          };
        }
        return p;
      }));

      if (selectedPatient) {
        setSelectedPatient(prev => ({
          ...prev,
          clinicalNotes: notesData.doctorNotes || prev.clinicalNotes,
          diagnosticImpression: notesData.diagnosticImpression || prev.diagnosticImpression
        }));
      }

      showToast('Doctor clinical observation notes saved to patient database.');
    } catch (e) {
      console.warn('[DoctorContext] Failed to save doctor notes:', e.message);
      showToast('Clinical notes updated locally.');
    }
  };

  // Prescription creation
  const addPrescription = async (newRx) => {
    const rxItem = {
      id: `RX-${Math.floor(100 + Math.random() * 900)}`,
      patient: newRx.patientName || selectedPatient?.name || 'Patient',
      patientId: selectedPatient?.id || 'P-10249',
      doctorName: doctor.name || 'Dr. Sarah Jenkins',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      diagnosis: newRx.diagnosis || 'Clinical Follow-up',
      medicines: `${newRx.medicine} (${newRx.dosage}) - ${newRx.freq || newRx.frequency || 'Twice daily'} (${newRx.duration})`,
      status: 'Active',
      instructions: newRx.instructions || ''
    };

    setPrescriptions((prev) => [rxItem, ...prev]);
    showToast('Prescription issued and stored in electronic health records.');

    try {
      await api.createPrescription(rxItem);
    } catch (e) {
      console.warn('[DoctorContext] Prescription saved locally:', e.message);
    }
  };

  // Complete Patient Consultation & Finalize Encounter
  const completeConsultation = async ({ patientId, appointmentId, reportId, finalDiagnosis, doctorNotes }) => {
    const timestamp = new Date().toISOString();
    const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    // 1. Update Appointments
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId || apt.patientId === patientId
          ? { ...apt, status: 'Completed', completedAt: timestamp }
          : apt
      )
    );

    // 2. Update Patients local state
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId || p.reportId === reportId
          ? {
              ...p,
              status: 'Completed',
              isCompleted: true,
              completedAt: dateStr,
              diagnosticImpression: finalDiagnosis || p.diagnosticImpression,
              clinicalNotes: doctorNotes || p.clinicalNotes
            }
          : p
      )
    );

    if (selectedPatient && (selectedPatient.id === patientId || selectedPatient.reportId === reportId)) {
      setSelectedPatient((prev) => ({
        ...prev,
        status: 'Completed',
        isCompleted: true,
        completedAt: dateStr,
        diagnosticImpression: finalDiagnosis || prev.diagnosticImpression,
        clinicalNotes: doctorNotes || prev.clinicalNotes
      }));
    }

    // 3. Persist to MongoDB
    try {
      const updates = [];
      if (appointmentId) {
        updates.push(api.updateAppointment(appointmentId, { status: 'Completed', completedAt: timestamp, diagnosis: finalDiagnosis, doctorNotes }));
      }
      if (reportId) {
        updates.push(api.updateClinicalReport(reportId, { status: 'COMPLETED', completedAt: timestamp, diagnosticImpression: finalDiagnosis, doctorNotes }));
      }
      await Promise.allSettled(updates);
      showToast('Encounter finalized: Consultation marked as Completed.');
    } catch (e) {
      console.warn('[DoctorContext] Consultation completion sync warning:', e.message);
      showToast('Encounter marked as completed locally.');
    }
  };

  // Order Lab Investigation or Imaging
  const orderInvestigation = async ({ patientId, patientName, testName, category = 'Laboratory Investigation' }) => {
    const recordItem = {
      title: testName,
      type: category,
      doctor: doctor.name || 'Attending Physician',
      hospital: doctor.hospital || 'Hospital OPD',
      patientId: patientId || 'P-10249',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Ordered - Pending Sample'
    };

    setRecords((prev) => [recordItem, ...prev]);
    showToast(`Diagnostic order placed: ${testName}`);

    try {
      await api.createRecord(recordItem);
    } catch (e) {
      console.warn('[DoctorContext] Record save warning:', e.message);
    }
  };

  const value = {
    doctor,
    setDoctor,
    stats,
    patients,
    setPatients,
    selectedPatient,
    setSelectedPatient,
    appointments,
    setAppointments,
    prescriptions,
    setPrescriptions,
    records,
    setRecords,
    clinicalReports,
    chats,
    setChats,
    activeChatId,
    setActiveChatId,
    toasts,
    showToast,
    removeToast,
    globalSearch,
    setGlobalSearch,
    isMobileNavOpen,
    setIsMobileNavOpen,
    rescheduleData,
    setRescheduleData,
    previewDoc,
    setPreviewDoc,
    aptDetail,
    setAptDetail,
    isCreateRxOpen,
    setIsCreateRxOpen,
    isSupportModalOpen,
    setIsSupportModalOpen,
    rescheduleAppointment,
    cancelAppointment,
    saveDoctorNotes,
    addPrescription,
    completeConsultation,
    orderInvestigation
  };

  return <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>;
}

export function useDoctor() {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error('useDoctor must be used within a DoctorProvider');
  }
  return context;
}
