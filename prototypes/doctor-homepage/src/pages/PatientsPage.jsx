import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDoctor } from '../context/DoctorContext';

export default function PatientsPage() {
  const navigate = useNavigate();
  const {
    patients,
    selectedPatient,
    setSelectedPatient,
    globalSearch,
    setPreviewDoc,
    setIsCreateRxOpen,
    setActiveChatId
  } = useDoctor();

  const [isViewingProfile, setIsViewingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [patientFilter, setPatientFilter] = useState('all');
  const [tableSearch, setTableSearch] = useState('');

  const currentSearch = globalSearch || tableSearch;

  const filteredPatients = patients.filter((p) => {
    if (patientFilter === 'active' && p.status.toLowerCase() !== 'active') return false;
    if (!currentSearch.trim()) return true;
    const q = currentSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.phone.toLowerCase().includes(q) ||
      p.chiefComplaint.toLowerCase().includes(q)
    );
  });

  const handleOpenProfile = (patient) => {
    setSelectedPatient(patient);
    setIsViewingProfile(true);
    setActiveTab('overview');
  };

  const handleSendMessage = (patientId) => {
    setActiveChatId(patientId);
    navigate('/messages');
  };

  return (
    <>
      {!isViewingProfile ? (
        /* ==================================================
             VIEW 2: PATIENTS DIRECTORY TABLE
             ================================================== */
        <section id="viewPatients" className="page-view active" role="region" aria-label="Patients View">
          <div className="page-header">
            <div className="page-header-left">
              <h1 className="page-heading">Patients</h1>
              <p className="page-subheading">Manage and review your patients.</p>
            </div>
          </div>

          <div className="table-card">
            <div className="table-toolbar">
              <div className="table-search-box">
                <span className="table-search-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  id="patientTableSearch"
                  className="table-search-input"
                  placeholder="Search by name, ID, phone..."
                  aria-label="Search patients"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                />
              </div>
              <div className="filter-pill-group" id="patientFilterGroup">
                <button
                  type="button"
                  className={`filter-pill ${patientFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setPatientFilter('all')}
                >
                  All Patients ({patients.length})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${patientFilter === 'active' ? 'active' : ''}`}
                  onClick={() => setPatientFilter('active')}
                >
                  Active ({patients.filter((p) => p.status === 'Active').length})
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table" aria-label="Patients List Table">
                <thead>
                  <tr>
                    <th scope="col">Patient Name</th>
                    <th scope="col">Patient ID</th>
                    <th scope="col">Age</th>
                    <th scope="col">Gender</th>
                    <th scope="col">Phone</th>
                    <th scope="col">Last Visit</th>
                    <th scope="col">Status</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody id="patientsTableBody">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                        No patients found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className={`patient-avatar ${p.avatarClass || 'avatar-rm'}`} style={{ width: '32px', height: '32px', fontSize: '0.8125rem' }}>
                              {p.initials}
                            </div>
                            <strong style={{ color: 'var(--text-dark)' }}>{p.name}</strong>
                          </div>
                        </td>
                        <td><code>{p.id}</code></td>
                        <td>{p.age}</td>
                        <td>{p.gender}</td>
                        <td>{p.phone}</td>
                        <td>{p.lastVisit}</td>
                        <td>
                          <span className={`badge-${p.status.toLowerCase()}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-outline btn-sm"
                            onClick={() => handleOpenProfile(p)}
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : (
        /* ==================================================
             VIEW 3: PATIENT PROFILE PAGE (6 TABS)
             ================================================== */
        <section id="viewPatientProfile" className="page-view active" role="region" aria-label="Patient Profile View">
          <div className="back-btn-bar">
            <button
              type="button"
              className="btn-outline"
              id="backToPatientsBtn"
              onClick={() => setIsViewingProfile(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to Patients
            </button>
          </div>

          {/* Hero Profile Card */}
          <div className="profile-hero-card">
            <div className="profile-hero-left">
              <div className="profile-hero-avatar" id="profileAvatar">
                {selectedPatient.initials}
              </div>
              <div className="profile-hero-info">
                <h2 id="profileName">{selectedPatient.name}</h2>
                <div className="profile-meta-chips">
                  <span className="profile-chip" id="profileIdChip">Patient ID: {selectedPatient.id}</span>
                  <span className="profile-chip" id="profileAgeChip">Age: {selectedPatient.age}</span>
                  <span className="profile-chip" id="profileGenderChip">Gender: {selectedPatient.gender}</span>
                  <span className="profile-chip" id="profilePhoneChip">Phone: {selectedPatient.phone}</span>
                  <span className="badge-active" id="profileStatusBadge">{selectedPatient.status}</span>
                </div>
              </div>
            </div>
            <div className="profile-hero-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsCreateRxOpen(true)}
              >
                New Prescription
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleSendMessage(selectedPatient.id)}
              >
                Send Message
              </button>
            </div>
          </div>

          {/* Profile Navigation Tabs */}
          <div className="profile-tabs-nav" role="tablist">
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              role="tab"
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'caseHistory' ? 'active' : ''}`}
              role="tab"
              onClick={() => setActiveTab('caseHistory')}
            >
              Case History
            </button>
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'records' ? 'active' : ''}`}
              role="tab"
              onClick={() => setActiveTab('records')}
            >
              Medical Records
            </button>
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
              role="tab"
              onClick={() => setActiveTab('prescriptions')}
            >
              Prescriptions
            </button>
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'vitals' ? 'active' : ''}`}
              role="tab"
              onClick={() => setActiveTab('vitals')}
            >
              Vitals
            </button>
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
              role="tab"
              onClick={() => setActiveTab('timeline')}
            >
              Timeline
            </button>
          </div>

          {/* Tab Content Panes */}
          <div className="tab-content-area">
            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="tab-pane active" id="paneOverview" role="tabpanel">
                <div className="overview-grid">
                  <div className="overview-item-card">
                    <span className="overview-label">Chief Complaint</span>
                    <p className="overview-value" id="profileComplaint">{selectedPatient.chiefComplaint}</p>
                  </div>
                  <div className="overview-item-card">
                    <span className="overview-label">Symptoms</span>
                    <p className="overview-value" id="profileSymptoms">{selectedPatient.symptoms}</p>
                  </div>
                  <div className="overview-item-card">
                    <span className="overview-label">Medical History</span>
                    <p className="overview-value" id="profileHistory">{selectedPatient.medicalHistory}</p>
                  </div>
                  <div className="overview-item-card">
                    <span className="overview-label">Allergies</span>
                    <p className="overview-value" id="profileAllergies">{selectedPatient.allergies}</p>
                  </div>
                  <div className="overview-item-card" style={{ gridColumn: '1 / -1' }}>
                    <span className="overview-label">Current Medications</span>
                    <p className="overview-value" id="profileMedications">{selectedPatient.medications}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Case History */}
            {activeTab === 'caseHistory' && (
              <div className="tab-pane active" id="paneCaseHistory" role="tabpanel">
                <div className="table-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-dark)' }}>
                    Clinical Observation Notes
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                    {selectedPatient.clinicalNotes}
                  </p>
                  <div style={{ backgroundColor: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                    <strong style={{ color: 'var(--text-dark)' }}>Diagnostic Impression:</strong> {selectedPatient.chiefComplaint} with standard clinical review. Compliance with medication and lifestyle modifications advised.
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Medical Records */}
            {activeTab === 'records' && (
              <div className="tab-pane active" id="paneRecords" role="tabpanel">
                <div className="table-card">
                  <div className="table-responsive">
                    <table className="data-table">
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
                        {(selectedPatient.records || []).map((rec, i) => (
                          <tr key={i}>
                            <td><strong>{rec.title}</strong></td>
                            <td>{rec.type}</td>
                            <td>{rec.date}</td>
                            <td>{rec.by}</td>
                            <td>
                              <button
                                type="button"
                                className="btn-outline btn-sm"
                                onClick={() => setPreviewDoc({ ...rec, patient: selectedPatient.name })}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Prescriptions */}
            {activeTab === 'prescriptions' && (
              <div className="tab-pane active" id="panePrescriptions" role="tabpanel">
                <div className="table-card">
                  <div className="table-responsive">
                    <table className="data-table">
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
                        {(selectedPatient.prescriptions || []).map((rx, i) => (
                          <tr key={i}>
                            <td>{rx.date}</td>
                            <td><strong>{rx.medicine}</strong></td>
                            <td>{rx.dosage}</td>
                            <td>{rx.freq}</td>
                            <td>{rx.duration}</td>
                            <td><span className="badge-active">{rx.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Vitals */}
            {activeTab === 'vitals' && (
              <div className="tab-pane active" id="paneVitals" role="tabpanel">
                <div className="vitals-cards-grid">
                  <div className="vital-item-card">
                    <span className="vital-item-name">Blood Pressure</span>
                    <span className="vital-item-val">{selectedPatient.vitals?.bp || '120/80'}</span>
                    <span className="vital-item-status">Optimal</span>
                  </div>
                  <div className="vital-item-card">
                    <span className="vital-item-name">Heart Rate</span>
                    <span className="vital-item-val">{selectedPatient.vitals?.hr || '72 bpm'}</span>
                    <span className="vital-item-status">Normal</span>
                  </div>
                  <div className="vital-item-card">
                    <span className="vital-item-name">Oxygen (SpO2)</span>
                    <span className="vital-item-val">{selectedPatient.vitals?.spo2 || '99%'}</span>
                    <span className="vital-item-status">Excellent</span>
                  </div>
                  <div className="vital-item-card">
                    <span className="vital-item-name">Body Temp</span>
                    <span className="vital-item-val">{selectedPatient.vitals?.temp || '98.6°F'}</span>
                    <span className="vital-item-status">Normal</span>
                  </div>
                  <div className="vital-item-card">
                    <span className="vital-item-name">BMI</span>
                    <span className="vital-item-val">{selectedPatient.vitals?.bmi || '22.4'}</span>
                    <span className="vital-item-status">Healthy Weight</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 6: Timeline */}
            {activeTab === 'timeline' && (
              <div className="tab-pane active" id="paneTimeline" role="tabpanel">
                <div className="table-card" style={{ padding: '24px' }}>
                  <ul className="activity-timeline" style={{ marginLeft: '10px' }}>
                    {(selectedPatient.timeline || []).map((tl, i) => (
                      <li key={i} className="activity-item">
                        <div className="activity-node" style={{ boxShadow: '0 0 0 4px #FFFFFF' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <div className="activity-details">
                          <p className="activity-action">{tl.title}</p>
                          <p className="activity-meta">{tl.meta}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
