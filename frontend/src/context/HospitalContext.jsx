import React, { createContext, useContext, useState, useEffect } from 'react';

const HospitalContext = createContext(null);

export const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'patient', title: 'New Patient Registration', desc: 'Manoj Tiwari (P-10249) admitted to Trauma Emergency Bay 04.', time: '5 mins ago', unread: true },
  { id: 2, type: 'ot', title: 'OT Schedule Updated', desc: 'OT-02 procedure updated: Knee Replacement confirmed for Amit Kumar at 10:30 AM.', time: '22 mins ago', unread: true },
  { id: 3, type: 'doctor', title: 'Doctor Availability Changed', desc: 'Dr. Sarah Jenkins checked in for Morning Duty shift (Cardiology Wing).', time: '45 mins ago', unread: true },
  { id: 4, type: 'icu', title: 'ICU Bed Allocation Threshold', desc: 'Surgical ICU 3 currently at 90% capacity (18 of 20 beds occupied).', time: '1 hr ago', unread: true }
];

export function HospitalProvider({ children }) {
  const [liveTime, setLiveTime] = useState(new Date().toLocaleTimeString());
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);

  // Live Clock updater
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const value = {
    liveTime,
    notifications,
    unreadCount,
    markAllRead,
    isNotifOpen,
    setIsNotifOpen,
    isMobileNavOpen,
    setIsMobileNavOpen,
    globalSearch,
    setGlobalSearch,
    isAdminDropdownOpen,
    setIsAdminDropdownOpen
  };

  return <HospitalContext.Provider value={value}>{children}</HospitalContext.Provider>;
}

export function useHospital() {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within HospitalProvider');
  }
  return context;
}
