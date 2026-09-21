import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const statusColor = {
  Completed: '#10B981',
  'In Progress': '#3B82F6',
  Waiting: '#F59E0B',
  Upcoming: '#8B5CF6',
  Scheduled: '#8B5CF6',
  Rescheduled: '#D97706',
  Cancelled: '#EF4444'
};

export default function HospitalAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Reschedule modal state
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('11:00 AM');
  const [rescheduleNote, setRescheduleNote] = useState('');
  const [savingAction, setSavingAction] = useState(false);

  const hospitalName = user?.hospitalDetails?.hospitalName || user?.name || 'SMS Hospital Jaipur';

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await api.getAppointments();
      if (Array.isArray(data)) {
        setAppointments(data);
      }
    } catch (e) {
      console.warn('Failed to load appointments from server:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const handleStatusChange = async (aptId, newStatus) => {
    try {
      await api.updateAppointment(aptId, { status: newStatus });
      setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status: newStatus } : a));
    } catch (e) {
      alert('Failed to update status: ' + e.message);
    }
  };

  const handleOpenReschedule = (apt) => {
    setRescheduleModal(apt);
    setNewDate(apt.date || new Date().toISOString().split('T')[0]);
    setNewTime(apt.time || '11:00 AM');
    setRescheduleNote('');
  };

  const handleSaveReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleModal) return;
    setSavingAction(true);
    try {
      const note = rescheduleNote ? `Rescheduled by Hospital Admin: ${rescheduleNote}` : 'Rescheduled by Hospital Admin.';
      await api.updateAppointment(rescheduleModal.id, {
        date: newDate,
        time: newTime,
        status: 'Rescheduled',
        notes: note
      });
      alert(`Appointment for ${rescheduleModal.patientName || rescheduleModal.patient} rescheduled to ${newDate} at ${newTime}. User notification dispatched.`);
      setAppointments(prev => prev.map(a => a.id === rescheduleModal.id ? { ...a, date: newDate, time: newTime, status: 'Rescheduled', notes: note } : a));
      setRescheduleModal(null);
    } catch (e) {
      alert('Failed to reschedule: ' + e.message);
    } finally {
      setSavingAction(false);
    }
  };

  const handleCancelAppointment = async (aptId, patientName) => {
    if (!window.confirm(`Are you sure you want to cancel the appointment for ${patientName}?`)) return;
    try {
      await api.updateAppointment(aptId, { status: 'Cancelled', notes: 'Cancelled by Hospital Administration' });
      setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status: 'Cancelled' } : a));
    } catch (e) {
      alert('Failed to cancel appointment: ' + e.message);
    }
  };

  const statuses = ['All', 'Upcoming', 'Waiting', 'In Progress', 'Rescheduled', 'Completed', 'Cancelled'];
  
  const filtered = appointments.filter(a => {
    const s = a.status || 'Upcoming';
    const matchesFilter = filter === 'All' || s.toLowerCase() === filter.toLowerCase();
    const patName = a.patientName || a.patient || '';
    const docName = a.doctorName || a.doctor || '';
    const matchesSearch = !search || 
      patName.toLowerCase().includes(search.toLowerCase()) || 
      docName.toLowerCase().includes(search.toLowerCase()) ||
      String(a.id || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>Hospital Appointments</h1>
          <p style={{ color: '#64748B', margin: '0.2rem 0 0', fontSize: '0.85rem' }}>
            {appointments.length} appointments recorded · Cancel or reschedule with automated patient notification
          </p>
        </div>

        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by patient, doctor, or ID…"
          style={{
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            border: '1.5px solid #CBD5E1',
            fontSize: '0.875rem',
            width: '280px',
            outline: 'none'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              border: '1.5px solid',
              borderColor: filter === s ? '#2563EB' : '#E2E8F0',
              background: filter === s ? '#EFF6FF' : '#fff',
              color: filter === s ? '#2563EB' : '#64748B',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['ID / Token', 'Patient', 'Doctor', 'Specialty', 'Schedule', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #E2E8F0' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Loading appointments from database...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>No matching appointments found.</td></tr>
            ) : (
              filtered.map((a, i) => {
                const s = a.status || 'Upcoming';
                const color = statusColor[s] || '#64748B';
                const pName = a.patientName || a.patient || 'Patient';
                const dName = a.doctorName || a.doctor || 'Attending Physician';

                return (
                  <tr key={a.id || i} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', fontWeight: 700, color: '#2563EB' }}>
                      {a.token || a.id}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#1E293B', fontWeight: 600 }}>
                      {pName}
                      {a.chiefComplaint && (
                        <small style={{ display: 'block', color: '#64748B', fontSize: '0.75rem', fontWeight: 400 }}>
                          {a.chiefComplaint}
                        </small>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>
                      {dName}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.85rem', color: '#475569' }}>
                      {a.specialty || 'General OPD'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: '#334155' }}>
                      <strong>{a.time || '10:00 AM'}</strong><br />
                      <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>{a.date || 'Today'}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <select
                        value={s}
                        onChange={(e) => handleStatusChange(a.id, e.target.value)}
                        style={{
                          background: `${color}15`,
                          color: color,
                          border: `1px solid ${color}40`,
                          borderRadius: '20px',
                          padding: '0.25rem 0.65rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Waiting">Waiting</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Rescheduled">Rescheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenReschedule(a)}
                          title="Reschedule appointment date & time"
                          style={{
                            background: '#EFF6FF',
                            color: '#2563EB',
                            border: '1px solid #BFDBFE',
                            borderRadius: '6px',
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          📅 Reschedule
                        </button>
                        {s !== 'Cancelled' && (
                          <button
                            type="button"
                            onClick={() => handleCancelAppointment(a.id, pName)}
                            title="Cancel this appointment"
                            style={{
                              background: '#FEF2F2',
                              color: '#DC2626',
                              border: '1px solid #FECACA',
                              borderRadius: '6px',
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem'
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', maxWidth: '440px', width: '100%',
            padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#1E293B' }}>
              Reschedule Appointment
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Select new date & time for <strong>{rescheduleModal.patientName || rescheduleModal.patient}</strong> with <strong>{rescheduleModal.doctorName || rescheduleModal.doctor}</strong>.
            </p>

            <form onSubmit={handleSaveReschedule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
                  New Appointment Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
                  New Time Slot
                </label>
                <input
                  type="text"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  placeholder="e.g. 11:30 AM"
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>
                  Reason / Reschedule Note (Notifies Patient)
                </label>
                <textarea
                  rows={2}
                  value={rescheduleNote}
                  onChange={e => setRescheduleNote(e.target.value)}
                  placeholder="e.g. Doctor attending emergency surgery in OT, slot moved to afternoon."
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setRescheduleModal(null)}
                  style={{ flex: 1, padding: '0.65rem', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAction}
                  style={{ flex: 1, padding: '0.65rem', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {savingAction ? 'Saving...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
