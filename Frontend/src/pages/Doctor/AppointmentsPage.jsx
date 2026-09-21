import React, { useState } from 'react';
import { useDoctor } from '../../context/DoctorContext';

export default function AppointmentsPage() {
  const {
    appointments,
    globalSearch,
    setRescheduleData,
    cancelAppointment,
    setAptDetail
  } = useDoctor();

  const [categoryTab, setCategoryTab] = useState('today');
  const [statusFilter, setStatusFilter] = useState('all');
  const [localSearch, setLocalSearch] = useState('');

  const searchKeyword = globalSearch || localSearch;

  // Counts for summary chips
  const todayCount = appointments.filter((a) => a.date === 'Today' || a.date?.toLowerCase().includes('today') || (a.status || '').toLowerCase() === 'upcoming').length;
  const opdCount = appointments.filter((a) => (a.category || a.type || '').toLowerCase().includes('opd') || (a.category || a.type || '').toLowerCase().includes('consultation')).length;
  const otCount = appointments.filter((a) => (a.category || a.type || '').toLowerCase().includes('operation') || (a.category || a.type || '').toLowerCase().includes('ot')).length;
  const completedCount = appointments.filter((a) => (a.status || '').toLowerCase() === 'completed').length;

  const filteredAppointments = appointments.filter((apt) => {
    // Category filter
    if (categoryTab === 'today') {
      if (apt.date !== 'Today' && !apt.date?.toLowerCase().includes('today') && (apt.status || '').toLowerCase() !== 'upcoming') return false;
    } else if (categoryTab === 'opd') {
      if (!(apt.category || apt.type || '').toLowerCase().includes('opd') && !(apt.category || apt.type || '').toLowerCase().includes('consultation')) return false;
    } else if (categoryTab === 'operation') {
      if (!(apt.category || apt.type || '').toLowerCase().includes('operation') && !(apt.category || apt.type || '').toLowerCase().includes('ot')) return false;
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (apt.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    }

    // Search query
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      const patientMatch = (apt.patient || '').toLowerCase().includes(q);
      const typeMatch = (apt.type || apt.procedure || '').toLowerCase().includes(q);
      const roomMatch = (apt.roomLabel || apt.room || apt.otRoom || '').toLowerCase().includes(q);
      const doctorMatch = (apt.doctor || apt.surgeon || '').toLowerCase().includes(q);
      if (!patientMatch && !typeMatch && !roomMatch && !doctorMatch) return false;
    }

    return true;
  });

  return (
    <section id="viewAppointments" className="page-view active" role="region" aria-label="Appointments View">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-heading">Appointments</h1>
          <p className="page-subheading">Manage today's appointments, OPD consultations, and Operation / OT schedules.</p>
        </div>
      </div>

      {/* Appointments Summary Row */}
      <div className="appointment-summary-compact">
        <div className="apt-summary-chip">
          <span className="apt-chip-label">Today's Schedule</span>
          <strong className="apt-chip-val text-blue" id="summaryTodayApts">{todayCount}</strong>
        </div>
        <div className="apt-summary-chip">
          <span className="apt-chip-label">OPD Consultations</span>
          <strong className="apt-chip-val text-blue" id="summaryOpdApts">{opdCount}</strong>
        </div>
        <div className="apt-summary-chip">
          <span className="apt-chip-label">Operation / OT</span>
          <strong className="apt-chip-val text-amber" id="summaryOtApts">{otCount}</strong>
        </div>
        <div className="apt-summary-chip">
          <span className="apt-chip-label">Completed</span>
          <strong className="apt-chip-val text-green" id="summaryCompletedApts">{completedCount}</strong>
        </div>
      </div>

      {/* Main Appointments Table Card */}
      <div className="table-card">
        {/* Horizontal Tabs System */}
        <div className="horizontal-tabs-container">
          <div className="horizontal-tabs-nav" id="appointmentTabs" role="tablist">
            <button
              type="button"
              className={`horizontal-tab-btn ${categoryTab === 'today' ? 'active' : ''}`}
              role="tab"
              onClick={() => setCategoryTab('today')}
            >
              Today's Appointments
            </button>
            <button
              type="button"
              className={`horizontal-tab-btn ${categoryTab === 'opd' ? 'active' : ''}`}
              role="tab"
              onClick={() => setCategoryTab('opd')}
            >
              OPD Consultations
            </button>
            <button
              type="button"
              className={`horizontal-tab-btn ${categoryTab === 'operation' ? 'active' : ''}`}
              role="tab"
              onClick={() => setCategoryTab('operation')}
            >
              Operation / OT
            </button>
            <button
              type="button"
              className={`horizontal-tab-btn ${categoryTab === 'all' ? 'active' : ''}`}
              role="tab"
              onClick={() => setCategoryTab('all')}
            >
              All Schedule
            </button>
          </div>
        </div>

        {/* Toolbar with Search, Status Filters */}
        <div className="table-toolbar">
          <div className="table-search-box" style={{ width: '260px' }}>
            <span className="table-search-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              id="appointmentSearchInput"
              className="table-search-input"
              placeholder="Search patient or procedure..."
              aria-label="Search appointments"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>

          <div className="filter-pill-group" id="appointmentStatusFilterGroup">
            {['all', 'upcoming', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                type="button"
                className={`filter-pill ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="data-table" aria-label="Appointments Table">
            <thead>
              <tr>
                <th scope="col">Patient</th>
                <th scope="col">Type / Department</th>
                <th scope="col">Room / OT</th>
                <th scope="col">Date & Time</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody id="appointmentTableBody">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    No appointments match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className={`patient-avatar ${apt.avatarClass || 'avatar-rm'}`} style={{ width: '32px', height: '32px', fontSize: '0.8125rem' }}>
                          {apt.initials}
                        </div>
                        <div>
                          <strong style={{ color: 'var(--text-dark)' }}>{apt.patient}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{apt.token || apt.patientId}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{apt.type || apt.procedure}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{apt.department}</div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-room" style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: '#F1F5F9', fontSize: '0.8125rem', fontWeight: 600 }}>
                        {apt.roomLabel || apt.room || apt.otRoom}
                      </span>
                    </td>
                    <td>
                      <div>{apt.date}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{apt.time}</div>
                    </td>
                    <td>
                      <span className={`status-pill status-${apt.status.toLowerCase()}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn-outline btn-sm"
                          onClick={() => setAptDetail(apt)}
                        >
                          Details
                        </button>
                        {apt.status === 'Upcoming' && (
                          <>
                            <button
                              type="button"
                              className="btn-outline btn-sm"
                              onClick={() =>
                                setRescheduleData({
                                  appointmentId: apt.id,
                                  patientName: apt.patient,
                                  currentDate: apt.date,
                                  currentTime: apt.time
                                })
                              }
                            >
                              Reschedule
                            </button>
                            <button
                              type="button"
                              className="btn-outline btn-sm text-danger"
                              style={{ color: 'var(--danger, #DC2626)', borderColor: '#FECACA' }}
                              onClick={() => cancelAppointment(apt.id)}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
