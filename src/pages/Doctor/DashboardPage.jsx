import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDoctor } from '../../context/DoctorContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { stats, appointments, globalSearch, setGlobalSearch, patients, setSelectedPatient } = useDoctor();

  // Filter today's appointments (category !== 'operation' and date '2026-09-12' or first few)
  const todayApts = appointments.filter((a) => a.date === '2026-09-12' || a.id <= 4);

  const filteredApts = todayApts.filter((apt) => {
    if (!globalSearch.trim()) return true;
    const q = globalSearch.toLowerCase();
    return (
      apt.patient.toLowerCase().includes(q) ||
      apt.type.toLowerCase().includes(q) ||
      apt.time.toLowerCase().includes(q) ||
      apt.status.toLowerCase().includes(q)
    );
  });

  const handlePatientClick = (patientId, patientName) => {
    const p = patients.find((pat) => pat.id === patientId || pat.name === patientName);
    if (p) {
      setSelectedPatient(p);
    }
    navigate('/doctor/patients');
  };

  return (
    <section id="viewDashboard" className="page-view active" role="region" aria-label="Dashboard View">
      {/* TODAY'S AT A GLANCE (3 Stats Cards) */}
      <div className="overview-section" aria-label="Today's at a Glance">
        <div className="stats-grid">
          {/* Card 1: Total Patients */}
          <article className="stat-card" id="cardTotalPatients">
            <div className="stat-header">
              <span className="stat-title">Total Patients</span>
              <div className="stat-icon-badge" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
            </div>
            <div className="stat-body">
              <span className="stat-value" id="statTotalPatientsVal">{stats.totalPatients.value}</span>
              <div className="stat-meta">
                <span className="stat-badge-positive">{stats.totalPatients.meta}</span>
              </div>
            </div>
          </article>

          {/* Card 2: Today's Appointments */}
          <article className="stat-card" id="cardTodayAppointments">
            <div className="stat-header">
              <span className="stat-title">Today's Appointments</span>
              <div className="stat-icon-badge" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
            </div>
            <div className="stat-body">
              <span className="stat-value" id="statTodayAppointmentsVal">{stats.todayAppointments.value}</span>
              <div className="stat-meta">
                <span className="stat-subtext">{stats.todayAppointments.meta}</span>
              </div>
            </div>
          </article>

          {/* Card 3: Follow-ups */}
          <article className="stat-card" id="cardFollowUps">
            <div className="stat-header">
              <span className="stat-title">Follow-ups</span>
              <div className="stat-icon-badge" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              </div>
            </div>
            <div className="stat-body">
              <span className="stat-value" id="statFollowUpsVal">{stats.followUps.value}</span>
              <div className="stat-meta">
                <span className="stat-subtext">{stats.followUps.meta}</span>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* MAIN DASHBOARD GRID: TODAY'S APPOINTMENTS */}
      <div className="dashboard-main-grid">
        <section className="content-card appointments-card" aria-labelledby="appointmentsHeading">
          <div className="card-header">
            <div className="header-title-wrap">
              <h2 id="appointmentsHeading" className="card-title">Today's Appointments</h2>
              <span className="count-pill" id="appointmentsCountPill">
                {globalSearch ? `${filteredApts.length} Found` : `${filteredApts.length} Today`}
              </span>
            </div>
            <Link to="/doctor/appointments" className="view-all-link" id="viewAllAppointmentsBtn">
              View all
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>

          {/* Search Status Notification Bar */}
          {globalSearch && (
            <div className="search-feedback" id="searchFeedback" style={{ display: 'flex' }}>
              <span id="searchFeedbackText">
                Showing {filteredApts.length} of {todayApts.length} appointments for "{globalSearch}"
              </span>
              <button type="button" className="reset-filter-btn" onClick={() => setGlobalSearch('')}>Reset</button>
            </div>
          )}

          {/* Appointments List Container */}
          <div className="appointments-list" id="appointmentsList" role="list">
            {filteredApts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <p className="empty-title">No matching appointments found</p>
                <p className="empty-desc">No appointments match "{globalSearch}". Try searching by patient name, consultation type, or time.</p>
              </div>
            ) : (
              filteredApts.map((apt) => {
                const isCompleted = apt.status.toLowerCase() === 'completed';
                const statusClass = isCompleted ? 'status-completed' : 'status-upcoming';

                return (
                  <article
                    key={apt.id}
                    className="appointment-item"
                    role="listitem"
                    style={{ cursor: 'pointer' }}
                    title={`Click to view profile of ${apt.patient}`}
                    onClick={() => handlePatientClick(apt.patientId, apt.patient)}
                  >
                    <div className="appointment-left">
                      <div className={`patient-avatar ${apt.avatarClass}`} aria-label={`${apt.patient} avatar`}>
                        {apt.initials}
                      </div>
                      <div className="patient-info">
                        <h3 className="patient-name">{apt.patient}</h3>
                        <span className="patient-type">{apt.type}</span>
                      </div>
                    </div>
                    <div className="appointment-right">
                      <span className="appointment-time">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {apt.time}
                      </span>
                      <span className={`status-badge ${statusClass}`}>
                        {apt.status}
                      </span>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
