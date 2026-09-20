import React, { createContext, useContext, useState } from 'react';
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
  const [doctor, setDoctor] = useState(DOCTOR_DATA);
  const [stats, setStats] = useState(STATS_DATA);
  const [patients, setPatients] = useState(PATIENTS_DATA);
  const [selectedPatient, setSelectedPatient] = useState(PATIENTS_DATA[0]);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [prescriptions, setPrescriptions] = useState(INITIAL_PRESCRIPTIONS);
  const [records, setRecords] = useState(RECORDS_DATA);
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState('P1001');
  const [toasts, setToasts] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Modals state
  const [rescheduleData, setRescheduleData] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [aptDetail, setAptDetail] = useState(null);
  const [isCreateRxOpen, setIsCreateRxOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

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
  const rescheduleAppointment = (id, newDate, newTime) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id ? { ...apt, date: newDate, time: newTime, status: 'Upcoming' } : apt
      )
    );
    showToast(`Appointment successfully rescheduled to ${newDate} at ${newTime}`);
    setRescheduleData(null);
  };

  const cancelAppointment = (id) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: 'Cancelled' } : apt))
    );
    showToast('Appointment cancelled successfully', 'info');
  };

  // Prescription creation
  const addPrescription = (rx) => {
    const newRx = {
      id: `RX-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Active',
      ...rx
    };
    setPrescriptions((prev) => [newRx, ...prev]);
    showToast(`Prescription issued successfully for ${rx.patient}`);
    setIsCreateRxOpen(false);
  };

  // Chat message send
  const sendChatMessage = (text) => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'doctor', text, time: now };

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.patientId === activeChatId) {
          return {
            ...chat,
            lastTime: 'Just now',
            messages: [...chat.messages, userMsg]
          };
        }
        return chat;
      })
    );

    // Simulate reply after 1.5s
    setTimeout(() => {
      const replies = [
        "Understood, doctor. I will follow the instructions carefully.",
        "Thank you so much, Dr. Sharma! I will update you tomorrow.",
        "Noted doctor, feeling better already.",
        "Will do as advised. Thank you for the guidance."
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.patientId === activeChatId) {
            return {
              ...chat,
              messages: [...chat.messages, { sender: 'patient', text: randomReply, time: replyTime }]
            };
          }
          return chat;
        })
      );
    }, 1500);
  };

  return (
    <DoctorContext.Provider
      value={{
        doctor,
        setDoctor,
        stats,
        setStats,
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
        addPrescription,
        sendChatMessage
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
}

export function useDoctor() {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error('useDoctor must be used within DoctorProvider');
  }
  return context;
}
