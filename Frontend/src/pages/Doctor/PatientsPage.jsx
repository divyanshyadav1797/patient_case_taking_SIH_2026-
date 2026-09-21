import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDoctor } from '../../context/DoctorContext';
import api from '../../services/api';

export default function PatientsPage() {
  const navigate = useNavigate();
  const {
    patients,
    selectedPatient,
    setSelectedPatient,
    globalSearch,
    setPreviewDoc,
    setIsCreateRxOpen,
    setActiveChatId,
    saveDoctorNotes
  } = useDoctor();

  const [isViewingProfile, setIsViewingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [patientFilter, setPatientFilter] = useState('all');
  const [tableSearch, setTableSearch] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editImpression, setEditImpression] = useState('');
  const [timelineItems, setTimelineItems] = useState([]);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [aiHistorySummary, setAiHistorySummary] = useState(null);
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);

  useEffect(() => {
    if (selectedPatient) {
      setEditNotes(selectedPatient.clinicalNotes || selectedPatient.summaryForDoctor || '');
      setEditImpression(selectedPatient.diagnosticImpression || '');
      setTimelineItems(selectedPatient.timeline || []);

      if (selectedPatient.pastMedicalHistorySummary) {
        setAiHistorySummary(selectedPatient.pastMedicalHistorySummary);
      } else {
        setAiHistorySummary(null);
      }

      // Attempt to fetch fresh AI Medical History Summary & timeline from MongoDB
      if (selectedPatient.id) {
        setLoadingAiSummary(true);
        api.getPatientHistory(selectedPatient.id)
          .then((res) => {
            if (res && res.aiMedicalHistorySummary) {
              setAiHistorySummary(res.aiMedicalHistorySummary);
            }
            if (res && Array.isArray(res.timeline) && res.timeline.length > 0) {
              const formatted = res.timeline.map((item) => ({
                title: `${item.title} (${item.type})`,
                meta: `${new Date(item.date).toLocaleDateString()} · ${item.description || item.summary || ''}`
              }));
              setTimelineItems(formatted);
            }
          })
          .catch(() => {
            // Keep default timeline
          })
          .finally(() => {
            setLoadingAiSummary(false);
          });
      }
    }
  }, [selectedPatient]);

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await saveDoctorNotes(selectedPatient.reportId || selectedPatient.id, {
        doctorNotes: editNotes,
        diagnosticImpression: editImpression
      });
    } finally {
      setIsSavingNotes(false);
    }
  };

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
    navigate('/doctor/messages');
  };

  return (
    <>
      {!isViewingProfile || !selectedPatient ? (
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
                        {patients.length === 0 ? 'No patients registered or checked in yet. New intake consultations and Kiosk walk-ins will appear here.' : 'No patients found matching your search.'}
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
                  {selectedPatient.summaryForDoctor && (
                    <div className="overview-item-card" style={{ gridColumn: '1 / -1', background: '#F8FAFC', border: '1px solid #CBD5E1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className="overview-label" style={{ color: '#0F766E', fontWeight: 700, fontSize: '0.875rem' }}>
                          ⚡ AI Clinical Intake Summary
                        </span>
                        {selectedPatient.urgentReview ? (
                          <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                            ⚠️ Urgent Review Advised
                          </span>
                        ) : (
                          <span style={{ background: '#DCFCE7', color: '#16A34A', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                            ✓ Standard Triage
                          </span>
                        )}
                      </div>
                      <p style={{ color: '#1E293B', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                        {selectedPatient.summaryForDoctor}
                      </p>
                      {selectedPatient.historyOfPresentIllness && (
                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #CBD5E1' }}>
                          <strong style={{ fontSize: '0.85rem', color: '#475569' }}>History of Present Illness:</strong>
                          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>{selectedPatient.historyOfPresentIllness}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Longitudinal Medical History Summary (Synthesized from previous reports) */}
                  {aiHistorySummary && (
                    <div className="overview-item-card" style={{ gridColumn: '1 / -1', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.2rem' }}>🧠</span>
                          <span className="overview-label" style={{ color: '#166534', fontWeight: 700, fontSize: '0.9rem', textTransform: 'none', margin: 0 }}>
                            AI Longitudinal Medical History Summary (Past Reports Synthesis)
                          </span>
                        </div>
                        <span style={{ background: '#DCFCE7', color: '#15803D', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #BBF7D0' }}>
                          {aiHistorySummary.previousReportsCount > 0 
                            ? `✓ Synthesized from ${aiHistorySummary.previousReportsCount} Past Report(s)`
                            : 'Baseline Encounter (0 Past Reports)'}
                        </span>
                      </div>

                      <p style={{ color: '#14532D', fontSize: '0.925rem', lineHeight: 1.6, margin: '0 0 12px 0', fontWeight: 500 }}>
                        {aiHistorySummary.executiveSummary}
                      </p>

                      {/* Structured breakdown for Doctor review */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #86EFAC' }}>
                        {Array.isArray(aiHistorySummary.keyPastDiagnoses) && aiHistorySummary.keyPastDiagnoses.length > 0 && (
                          <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #DCFCE7' }}>
                            <strong style={{ fontSize: '0.75rem', color: '#166534', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                              Past Diagnoses on Record
                            </strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {aiHistorySummary.keyPastDiagnoses.map((dx, i) => (
                                <span key={i} style={{ background: '#F3F4F6', color: '#1F2937', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                  {dx}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {Array.isArray(aiHistorySummary.chronicConditions) && aiHistorySummary.chronicConditions.length > 0 && (
                          <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #DCFCE7' }}>
                            <strong style={{ fontSize: '0.75rem', color: '#166534', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                              Recurring / Chronic Patterns
                            </strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {aiHistorySummary.chronicConditions.map((cond, i) => (
                                <span key={i} style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                  {cond}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {Array.isArray(aiHistorySummary.recentPrescriptions) && aiHistorySummary.recentPrescriptions.length > 0 && (
                          <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #DCFCE7' }}>
                            <strong style={{ fontSize: '0.75rem', color: '#166534', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                              Historical Medication Regimen
                            </strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {aiHistorySummary.recentPrescriptions.map((rx, i) => (
                                <span key={i} style={{ background: '#E0E7FF', color: '#3730A3', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                  {rx}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Previous Reports Timeline Breakdown */}
                      {Array.isArray(aiHistorySummary.previousReportsTimeline) && aiHistorySummary.previousReportsTimeline.length > 0 && (
                        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #86EFAC' }}>
                          <strong style={{ fontSize: '0.8rem', color: '#166534', display: 'block', marginBottom: '6px' }}>
                            Chronological Summary of Previous Reports:
                          </strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {aiHistorySummary.previousReportsTimeline.map((item, idx) => (
                              <div key={idx} style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.825rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{item.date} · {item.chiefComplaint}</span>
                                  <span style={{ color: '#64748B', fontSize: '0.75rem' }}>ID: {item.reportId}</span>
                                </div>
                                <p style={{ margin: 0, color: '#334155', fontSize: '0.8rem' }}>{item.summary}</p>
                                {item.diagnosticImpression && (
                                  <span style={{ color: '#0369A1', fontSize: '0.75rem', display: 'block', marginTop: '2px' }}>
                                    Doctor Finding: {item.diagnosticImpression}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

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
                <div className="table-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-dark)' }}>
                      Clinical Observation Notes
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '12px' }}>
                      Update your diagnostic impression and notes directly for this patient record.
                    </p>
                    <textarea
                      rows={4}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Enter clinical examination notes, differential diagnosis, and recommended care plan..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        fontFamily: 'inherit',
                        fontSize: '0.9rem',
                        lineHeight: 1.5,
                        resize: 'vertical',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '6px', color: 'var(--text-dark)' }}>
                      Diagnostic Impression
                    </label>
                    <input
                      type="text"
                      value={editImpression}
                      onChange={(e) => setEditImpression(e.target.value)}
                      placeholder="e.g. Acute bacterial sinusitis with tension headache"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        fontFamily: 'inherit',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleSaveNotes}
                      disabled={isSavingNotes}
                    >
                      {isSavingNotes ? 'Saving to Database...' : 'Save Clinical Notes'}
                    </button>
                  </div>

                  {/* AI Intake Interview Transcript if available */}
                  {Array.isArray(selectedPatient.conversation) && selectedPatient.conversation.length > 0 && (
                    <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-dark)' }}>
                        AI Intake Interview Transcript ({selectedPatient.conversation.length} Questions)
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {selectedPatient.conversation.map((qa, idx) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: '8px',
                              padding: '12px 16px'
                            }}
                          >
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                              <span style={{ background: '#2563EB', color: '#FFF', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>Q</span>
                              <strong style={{ color: '#1E293B', fontSize: '0.875rem' }}>{qa.question}</strong>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', paddingLeft: '28px' }}>
                              <span style={{ color: '#64748B', fontSize: '0.85rem' }}>Patient response:</span>
                              <span style={{ color: '#0F172A', fontSize: '0.85rem', fontWeight: 500 }}>"{qa.answer}"</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-dark)' }}>
                    Chronological Medical & Consultation Timeline
                  </h3>
                  {timelineItems.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', padding: '12px 0' }}>
                      No timeline events recorded yet for this patient.
                    </p>
                  ) : (
                    <ul className="activity-timeline" style={{ marginLeft: '10px' }}>
                      {timelineItems.map((tl, i) => (
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
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
