import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext';
import api from '../../services/api';

export default function PatientAppointments() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();
  const { appointments, cancelAppointment, showToast } = usePatient();
  const [localAppointments, setLocalAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.getAppointments()
      .then((res) => {
        if (!mounted) return;
        if (Array.isArray(res) && res.length > 0) {
          setLocalAppointments(res);
        }
      })
      .catch((err) => {
        console.warn('Could not load appointments directly:', err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const combinedAppointments = useMemo(() => {
    const map = new Map();
    // Prioritize local direct fetch, merge with context appointments
    (Array.isArray(appointments) ? appointments : []).forEach(a => {
      const key = a.customId || a.id || a._id;
      if (key) map.set(key, a);
    });
    (Array.isArray(localAppointments) ? localAppointments : []).forEach(a => {
      const key = a.customId || a.id || a._id;
      if (key) map.set(key, a);
    });
    return Array.from(map.values());
  }, [appointments, localAppointments]);

  const appointmentGroups = useMemo(() => ({
    upcoming: combinedAppointments.filter((a) => (a.status || '').toLowerCase() === 'upcoming'),
    completed: combinedAppointments.filter((a) => {
      const s = (a.status || '').toLowerCase();
      return s === 'past' || s === 'completed';
    }),
    cancelled: combinedAppointments.filter((a) => (a.status || '').toLowerCase() === 'cancelled'),
  }), [combinedAppointments]);

  const filteredAppointments = appointmentGroups[activeTab] || [];

  const handleCancel = async (targetId) => {
    if (!targetId) return;
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.deleteAppointment(targetId);
      } catch (err) {
        console.warn('Backend cancel notice:', err.message);
      }
      cancelAppointment(targetId);
      setLocalAppointments(prev => prev.map(a => 
        (a.id === targetId || a._id === targetId || a.customId === targetId) 
          ? { ...a, status: 'cancelled' } 
          : a
      ));
      showToast('Appointment cancelled.');
    }
  };

  return (
    <div className="page active-page" id="appointments">
      <div className="page-header">
        <h1>My Appointments</h1>
        <p>Manage your upcoming and previous appointments.</p>
      </div>

      <div className="tabs">
        <button
          type="button"
          className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming ({appointmentGroups.upcoming.length})
        </button>
        <button
          type="button"
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed ({appointmentGroups.completed.length})
        </button>
        <button
          type="button"
          className={`tab ${activeTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          Cancelled ({appointmentGroups.cancelled.length})
        </button>
      </div>

      {filteredAppointments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filteredAppointments.map((appt) => {
            const initials = appt.doctorName
              ? appt.doctorName.replace('Dr. ', '').split(' ').map((n) => n[0]).slice(0, 2).join('')
              : 'DR';
            const apptId = appt.customId || appt.id || appt._id;
            const isUpcoming = (appt.status || '').toLowerCase() === 'upcoming';

            return (
              <div className="section-card" key={apptId} style={{ marginBottom: 0 }}>
                <div className="appointment">
                  <div className="doctor-avatar">
                    {initials}
                  </div>

                  <div className="doctor-info">
                    <h3>{appt.doctorName}</h3>
                    <p>{appt.specialty} {appt.type ? `· ${appt.type}` : ''}</p>

                    <div className="appointment-details">
                      <span>
                        <i className="fa-regular fa-calendar"></i>
                        {appt.date}
                      </span>
                      <span>
                        <i className="fa-regular fa-clock"></i>
                        {appt.time}
                      </span>
                      <span>
                        <i className="fa-solid fa-location-dot"></i>
                        {appt.hospital}
                      </span>
                    </div>
                  </div>

                  <div className="appointment-right">
                    <span className={`status ${isUpcoming ? 'confirmed' : ''}`} style={
                      !isUpcoming ? { background: '#F1F5F9', color: '#64748B' } : {}
                    }>
                      {isUpcoming ? 'Confirmed' : activeTab === 'completed' ? 'Completed' : 'Cancelled'}
                    </span>

                    {isUpcoming ? (
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => handleCancel(apptId)}
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="primary-btn"
                        style={{ padding: '8px 16px', fontSize: '12px' }}
                        onClick={() => navigate('/patient/doctors')}
                      >
                        Book Again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="section-card" style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
          <i className="fa-regular fa-calendar-xmark" style={{ fontSize: '3rem', color: '#94a3b8', marginBottom: '15px', display: 'block' }}></i>
          <h3 style={{ color: '#172033', marginBottom: '8px' }}>No {activeTab} appointments</h3>
          <p style={{ fontSize: '14px', marginBottom: '20px' }}>
            {activeTab === 'upcoming'
              ? 'When you schedule a consultation with a doctor, it will appear here.'
              : 'You do not have any appointments in this list.'}
          </p>
          {activeTab === 'upcoming' && (
            <button
              type="button"
              className="primary-btn"
              onClick={() => navigate('/patient/doctors?mode=book')}
            >
              <i className="fa-solid fa-plus" style={{ marginRight: '8px' }}></i>
              Book New Appointment
            </button>
          )}
        </div>
      )}
    </div>
  );
}
