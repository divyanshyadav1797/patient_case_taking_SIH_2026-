import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDoctor } from '../../context/DoctorContext';
import api from '../../services/api';

export default function PatientsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    patients,
    selectedPatient,
    setSelectedPatient,
    records,
    globalSearch,
    setPreviewDoc,
    setIsCreateRxOpen,
    setActiveChatId,
    saveDoctorNotes,
    completeConsultation,
    orderInvestigation
  } = useDoctor();

  const [isViewingProfile, setIsViewingProfile] = useState(Boolean(location.state?.viewProfile));
  const [activeTab, setActiveTab] = useState('overview');
  const [patientFilter, setPatientFilter] = useState('all');
  const [tableSearch, setTableSearch] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editImpression, setEditImpression] = useState('');
  const [timelineItems, setTimelineItems] = useState([]);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isCompletingConsultation, setIsCompletingConsultation] = useState(false);
  const [aiHistorySummary, setAiHistorySummary] = useState(null);
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);

  useEffect(() => {
    if (location.state?.viewProfile) {
      if (location.state?.patientId && patients.length > 0) {
        const found = patients.find(p => p.id === location.state.patientId);
        if (found) setSelectedPatient(found);
      }
      setIsViewingProfile(true);
      setActiveTab('overview');
    }
  }, [location, patients, setSelectedPatient]);

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

  const handleCompleteConsultation = async () => {
    if (!selectedPatient) return;
    setIsCompletingConsultation(true);
    try {
      await completeConsultation({
        patientId: selectedPatient.id,
        appointmentId: selectedPatient.appointmentId || selectedPatient.aptId,
        reportId: selectedPatient.reportId,
        finalDiagnosis: editImpression || selectedPatient.diagnosticImpression,
        doctorNotes: editNotes || selectedPatient.clinicalNotes
      });
    } finally {
      setIsCompletingConsultation(false);
    }
  };

  const handleOrderInvestigation = async (testName) => {
    if (!selectedPatient) return;
    await orderInvestigation({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      testName,
      category: 'Diagnostic Order'
    });
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
                  <span className={selectedPatient.status === 'Completed' || selectedPatient.isCompleted ? 'badge-completed' : 'badge-active'} id="profileStatusBadge" style={selectedPatient.status === 'Completed' || selectedPatient.isCompleted ? { background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC' } : {}}>
                    {selectedPatient.status === 'Completed' || selectedPatient.isCompleted ? 'Consultation Completed' : (selectedPatient.status || 'Active')}
                  </span>
                </div>
              </div>
            </div>
            <div className="profile-hero-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {selectedPatient.status === 'Completed' || selectedPatient.isCompleted ? (
                <button
                  type="button"
                  className="btn-secondary"
                  disabled
                  style={{
                    background: '#ECFDF5',
                    color: '#065F46',
                    border: '1.5px solid #6EE7B7',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="fa-solid fa-check"></i>
                  Encounter Completed
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleCompleteConsultation}
                  disabled={isCompletingConsultation}
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    border: '1px solid #047857',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    cursor: isCompletingConsultation ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  <i className={`fa-solid ${isCompletingConsultation ? 'fa-spinner fa-spin' : 'fa-clipboard-check'}`}></i>
                  {isCompletingConsultation ? 'Finalizing...' : 'Complete Consultation'}
                </button>
              )}

              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsCreateRxOpen(true)}
                style={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <i className="fa-solid fa-file-prescription"></i>
                New Prescription
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleSendMessage(selectedPatient.id)}
                style={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <i className="fa-solid fa-comment-medical"></i>
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
                    <div className={`overview-item-card ai-summary-glass-container ${selectedPatient.urgentReview ? 'urgent-alert' : ''}`} style={{ gridColumn: '1 / -1' }}>
                      {/* Top Header Bar - Formal EHR Header */}
                      <div className="ai-summary-header">
                        <div className="ai-summary-title-badge">
                          <div className="ai-summary-icon">
                            <i className="fa-solid fa-file-waveform"></i>
                          </div>
                          <div>
                            <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '1.2rem' }}>
                              Clinical Intake Encounter Brief & Decision Support
                            </span>
                            <small style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: selectedPatient.urgentReview ? '#991B1B' : '#065F46', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                              Electronic Health Record · Structured Clinical Triage
                            </small>
                          </div>
                        </div>

                        {selectedPatient.urgentReview ? (
                          <span className="ai-acuity-pill-urgent">
                            <i className="fa-solid fa-triangle-exclamation"></i>
                            PRIORITY 1 · IMMEDIATE PHYSICIAN EVALUATION
                          </span>
                        ) : (
                          <span className="ai-acuity-pill-standard">
                            <i className="fa-solid fa-circle-check"></i>
                            PRIORITY 3 · STANDARD AMBULATORY CONSULTATION
                          </span>
                        )}
                      </div>

                      {/* Prominent Chief Complaint Banner */}
                      <div style={{
                        background: selectedPatient.urgentReview ? 'rgba(254, 226, 226, 0.75)' : 'rgba(236, 253, 245, 0.85)',
                        border: selectedPatient.urgentReview ? '1.5px solid rgba(239, 68, 68, 0.4)' : '1.5px solid rgba(16, 185, 129, 0.4)',
                        borderRadius: '16px',
                        padding: '18px 24px',
                        marginBottom: '18px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: selectedPatient.urgentReview ? '#991B1B' : '#065F46', display: 'block', marginBottom: '4px' }}>
                            Chief Presenting Concern & Reason for Visit:
                          </span>
                          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                            {selectedPatient.chiefComplaint || 'Outpatient Clinical Consultation'}
                          </h3>
                        </div>

                        <span style={{
                          background: 'rgba(37, 99, 235, 0.12)',
                          color: '#1D4ED8',
                          border: '1.5px solid rgba(37, 99, 235, 0.35)',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          letterSpacing: '0.3px'
                        }}>
                          <i className="fa-solid fa-hospital-user" style={{ marginRight: '6px' }}></i>
                          Department: {selectedPatient.recommendedSpecialty || 'General Medicine'}
                        </span>
                      </div>

                      {/* Main Structured Clinical Encounter Matrix */}
                      <div style={{ marginBottom: '20px' }}>
                        <strong style={{ fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
                          Intake Case-Taking Assessment Matrix:
                        </strong>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(selectedPatient.summaryForDoctor || '').split('\n').filter(Boolean).map((line, idx) => {
                            if (line.includes(':')) {
                              const colonIdx = line.indexOf(':');
                              const label = line.substring(0, colonIdx).trim().replace(/^\[|\]$/g, '');
                              const val = line.substring(colonIdx + 1).trim();
                              return (
                                <div key={idx} style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'minmax(180px, 260px) 1fr',
                                  gap: '12px',
                                  alignItems: 'baseline',
                                  padding: '10px 14px',
                                  background: 'rgba(255, 255, 255, 0.75)',
                                  borderRadius: '10px',
                                  border: '1px solid rgba(226, 232, 240, 0.85)'
                                }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {label}:
                                  </span>
                                  <span style={{ fontSize: '1.05rem', color: '#0F172A', fontWeight: 600, lineHeight: 1.5 }}>
                                    {val}
                                  </span>
                                </div>
                              );
                            }
                            return (
                              <div key={idx} style={{ padding: '6px 12px', fontSize: '1.05rem', color: '#1E293B', lineHeight: 1.6, fontWeight: 500 }}>
                                {line}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* History of Present Illness (HPI) Formal Callout */}
                      {selectedPatient.historyOfPresentIllness && (
                        <div className="ai-hpi-callout" style={{ margin: '20px 0' }}>
                          <div className="ai-hpi-callout-title">
                            <i className="fa-solid fa-stethoscope"></i> History of Present Illness (HPI Clinical Narrative)
                          </div>
                          <p className="ai-hpi-callout-text" style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#0F172A', whiteSpace: 'pre-line' }}>
                            {selectedPatient.historyOfPresentIllness}
                          </p>
                        </div>
                      )}

                      {/* Attached Documents & Visual Photos with OCR AI Summaries */}
                      {(() => {
                        const patientDocs = (records || []).filter(r =>
                          selectedPatient && (
                            String(r.patientId) === String(selectedPatient.id) ||
                            String(r.patientId) === String(selectedPatient.customId) ||
                            String(r.patientId) === String(selectedPatient.reportId)
                          )
                        );
                        if (patientDocs.length === 0) return null;

                        return (
                          <div style={{
                            margin: '20px 0',
                            padding: '16px 20px',
                            background: 'rgba(255, 255, 255, 0.85)',
                            borderRadius: '14px',
                            border: '1.5px solid rgba(59, 130, 246, 0.25)',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.05)'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <strong style={{ fontSize: '0.85rem', color: '#1E40AF', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
                                <i className="fa-solid fa-file-waveform"></i>
                                Attached Diagnostic Documents & Photos ({patientDocs.length})
                              </strong>
                              <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>
                                <i className="fa-solid fa-wand-magic-sparkles"></i> AI OCR Analyzed
                              </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                              {patientDocs.map((doc, dIdx) => {
                                const docUrl = doc.imageData || doc.fileUrl || doc.previewUrl;
                                const isImg = Boolean(doc.imageData || doc.mimeType?.startsWith('image/') || (doc.file && /\.(png|jpg|jpeg|webp)$/i.test(doc.file)));

                                return (
                                  <div
                                    key={doc.id || dIdx}
                                    onClick={() => setPreviewDoc({ ...doc, patient: selectedPatient.name })}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '12px',
                                      padding: '10px 12px',
                                      background: '#F8FAFC',
                                      borderRadius: '10px',
                                      border: '1px solid #E2E8F0',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    <div style={{
                                      width: '42px',
                                      height: '42px',
                                      borderRadius: '6px',
                                      overflow: 'hidden',
                                      background: '#FFFFFF',
                                      border: '1px solid #CBD5E1',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0
                                    }}>
                                      {isImg && docUrl ? (
                                        <img src={docUrl} alt="doc" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      ) : (
                                        <i className="fa-solid fa-file-pdf text-danger" style={{ fontSize: '1.2rem' }}></i>
                                      )}
                                    </div>
                                    <div style={{ overflow: 'hidden', flex: 1 }}>
                                      <strong style={{ fontSize: '0.85rem', color: '#0F172A', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                        {doc.title}
                                      </strong>
                                      <small style={{ fontSize: '0.74rem', color: '#64748B' }}>
                                        {doc.type || 'Document'} · {doc.date}
                                      </small>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: '#2563EB' }}>
                                      <i className="fa-solid fa-chevron-right"></i>
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Diagnostic Differentials & Investigations Grid with Functional Order Buttons */}
                      {(selectedPatient.diagnosticImpression || (selectedPatient.suggestedScans && selectedPatient.suggestedScans.length > 0)) && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                          gap: '18px',
                          marginTop: '20px',
                          paddingTop: '20px',
                          borderTop: '1.5px dashed rgba(16, 185, 129, 0.35)'
                        }}>
                          {selectedPatient.diagnosticImpression && (
                            <div style={{ background: 'rgba(255, 255, 255, 0.88)', padding: '18px 22px', borderRadius: '16px', border: '1.5px solid rgba(99, 102, 241, 0.25)', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.06)' }}>
                              <strong style={{ fontSize: '0.85rem', color: '#3730A3', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', letterSpacing: '0.5px' }}>
                                <i className="fa-solid fa-list-check"></i>
                                Working Differential Hypotheses (Ranked)
                              </strong>
                              <div style={{ whiteSpace: 'pre-line', fontSize: '1.05rem', fontWeight: 600, color: '#1E1B4B', lineHeight: 1.7 }}>
                                {selectedPatient.diagnosticImpression}
                              </div>
                            </div>
                          )}

                          {selectedPatient.suggestedScans && selectedPatient.suggestedScans.length > 0 && (
                            <div style={{ background: 'rgba(255, 255, 255, 0.88)', padding: '18px 22px', borderRadius: '16px', border: '1.5px solid rgba(16, 185, 129, 0.25)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.06)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <strong style={{ fontSize: '0.85rem', color: '#065F46', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
                                  <i className="fa-solid fa-flask-vial"></i>
                                  Suggested Diagnostic Workup & Labs
                                </strong>
                                <small style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Click to Order</small>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {selectedPatient.suggestedScans.map((scan, sIdx) => (
                                  <div
                                    key={sIdx}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '8px 12px',
                                      background: 'rgba(240, 253, 244, 0.8)',
                                      border: '1px solid rgba(16, 185, 129, 0.3)',
                                      borderRadius: '10px'
                                    }}
                                  >
                                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#065F46' }}>
                                      ● {scan}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleOrderInvestigation(scan)}
                                      style={{
                                        background: '#059669',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '4px 10px',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <i className="fa-solid fa-plus"></i> Order Lab
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Longitudinal Medical History Summary (Synthesized from previous reports) */}
                  {aiHistorySummary && (
                    <div className="overview-item-card ai-longitudinal-glass-card" style={{ gridColumn: '1 / -1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                        <div className="ai-longitudinal-title">
                          <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: '1.3rem', color: '#6D28D9' }}></i>
                          <span>Longitudinal Institutional Medical History Synthesis</span>
                        </div>
                        <span style={{ background: 'rgba(124, 58, 237, 0.12)', color: '#6D28D9', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800, border: '1px solid rgba(124, 58, 237, 0.25)' }}>
                          {aiHistorySummary.previousReportsCount > 0 
                            ? `Synthesized from ${aiHistorySummary.previousReportsCount} Past Encounter(s)`
                            : 'Baseline Encounter (0 Past Encounters on Record)'}
                        </span>
                      </div>

                      <p className="ai-longitudinal-summary-text">
                        {aiHistorySummary.executiveSummary}
                      </p>

                      {/* Structured breakdown for Doctor review */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed rgba(139, 92, 246, 0.35)' }}>
                        {Array.isArray(aiHistorySummary.keyPastDiagnoses) && aiHistorySummary.keyPastDiagnoses.length > 0 && (
                          <div style={{ background: 'rgba(255, 255, 255, 0.85)', padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(167, 139, 250, 0.35)' }}>
                            <strong style={{ fontSize: '0.8rem', color: '#5B21B6', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>
                              Past Diagnoses on Record
                            </strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {aiHistorySummary.keyPastDiagnoses.map((dx, i) => (
                                <span key={i} style={{ background: '#EDE9FE', color: '#4C1D95', padding: '4px 10px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                                  {dx}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {Array.isArray(aiHistorySummary.chronicConditions) && aiHistorySummary.chronicConditions.length > 0 && (
                          <div style={{ background: 'rgba(255, 255, 255, 0.85)', padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(251, 191, 36, 0.35)' }}>
                            <strong style={{ fontSize: '0.8rem', color: '#92400E', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>
                              Recurring / Chronic Patterns
                            </strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {aiHistorySummary.chronicConditions.map((cond, i) => (
                                <span key={i} style={{ background: '#FEF3C7', color: '#92400E', padding: '4px 10px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                                  {cond}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {Array.isArray(aiHistorySummary.recentPrescriptions) && aiHistorySummary.recentPrescriptions.length > 0 && (
                          <div style={{ background: 'rgba(255, 255, 255, 0.85)', padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(99, 102, 241, 0.35)' }}>
                            <strong style={{ fontSize: '0.8rem', color: '#3730A3', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>
                              Historical Medication Regimen
                            </strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {aiHistorySummary.recentPrescriptions.map((rx, i) => (
                                <span key={i} style={{ background: '#E0E7FF', color: '#3730A3', padding: '4px 10px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                                  {rx}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Previous Reports Timeline Breakdown */}
                      {Array.isArray(aiHistorySummary.previousReportsTimeline) && aiHistorySummary.previousReportsTimeline.length > 0 && (
                        <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px dashed rgba(139, 92, 246, 0.35)' }}>
                          <strong style={{ fontSize: '0.85rem', color: '#5B21B6', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Chronological Summary of Previous Reports:
                          </strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {aiHistorySummary.previousReportsTimeline.map((item, idx) => (
                              <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)', fontSize: '0.95rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{item.date} · {item.chiefComplaint}</span>
                                  <span style={{ color: '#6D28D9', fontSize: '0.8rem', fontWeight: 600 }}>ID: {item.reportId}</span>
                                </div>
                                <p style={{ margin: 0, color: '#334155', fontSize: '0.9rem', lineHeight: 1.5 }}>{item.summary}</p>
                                {item.diagnosticImpression && (
                                  <span style={{ color: '#0369A1', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginTop: '4px' }}>
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

            {/* Tab 2: Case History & Diagnosis Workspace */}
            {activeTab === 'caseHistory' && (
              <div className="tab-pane active" id="paneCaseHistory" role="tabpanel">
                <div className="table-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  
                  {/* Encounter Status & Complete Consultation Card */}
                  <div style={{
                    background: selectedPatient.status === 'Completed' || selectedPatient.isCompleted ? '#ECFDF5' : 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
                    border: selectedPatient.status === 'Completed' || selectedPatient.isCompleted ? '1.5px solid #6EE7B7' : '1.5px solid #BFDBFE',
                    borderRadius: '16px',
                    padding: '18px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className={`fa-solid ${selectedPatient.status === 'Completed' || selectedPatient.isCompleted ? 'fa-circle-check' : 'fa-stethoscope'}`} style={{ color: selectedPatient.status === 'Completed' || selectedPatient.isCompleted ? '#059669' : '#2563EB', fontSize: '1.2rem' }}></i>
                        <strong style={{ fontSize: '1rem', color: selectedPatient.status === 'Completed' || selectedPatient.isCompleted ? '#065F46' : '#1E3A8A' }}>
                          {selectedPatient.status === 'Completed' || selectedPatient.isCompleted ? 'Consultation Encounter Finalized' : 'Active Patient Consultation Encounter'}
                        </strong>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: selectedPatient.status === 'Completed' || selectedPatient.isCompleted ? '#047857' : '#475569' }}>
                        {selectedPatient.status === 'Completed' || selectedPatient.isCompleted
                          ? `Encounter concluded and saved to hospital EHR on ${selectedPatient.completedAt || 'today'}.`
                          : 'Review clinical intake brief, record your diagnostic impressions, issue prescriptions, and conclude the encounter.'}
                      </p>
                    </div>

                    {selectedPatient.status !== 'Completed' && !selectedPatient.isCompleted ? (
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleCompleteConsultation}
                        disabled={isCompletingConsultation}
                        style={{
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                          border: '1px solid #047857',
                          color: '#FFFFFF',
                          padding: '12px 24px',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          borderRadius: '10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: isCompletingConsultation ? 'wait' : 'pointer',
                          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                        }}
                      >
                        <i className={`fa-solid ${isCompletingConsultation ? 'fa-spinner fa-spin' : 'fa-clipboard-check'}`}></i>
                        {isCompletingConsultation ? 'Saving Encounter...' : 'Complete Consultation & Finalize'}
                      </button>
                    ) : (
                      <span style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
                        ✓ Finalized & Archived
                      </span>
                    )}
                  </div>

                  {/* Diagnostic Impression Section */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fa-solid fa-bullseye" style={{ color: '#2563EB' }}></i>
                        Attending Physician Final Diagnostic Impression
                      </label>
                      {selectedPatient.diagnosticImpression && (
                        <small style={{ color: '#64748B', fontWeight: 600 }}>ICD Clinical Target</small>
                      )}
                    </div>
                    <input
                      type="text"
                      value={editImpression}
                      onChange={(e) => setEditImpression(e.target.value)}
                      placeholder="e.g. Acute bacterial sinusitis with tension headache / Essential hypertension"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid var(--border-color)',
                        fontFamily: 'inherit',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: '#0F172A',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Clinical Examination Notes & Care Plan */}
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px', color: 'var(--text-dark)' }}>
                      <i className="fa-solid fa-notes-medical" style={{ color: '#2563EB', marginRight: '6px' }}></i>
                      Clinical Examination Notes, Findings & Management Plan
                    </label>
                    <textarea
                      rows={5}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Document physical examination findings, vitals correlation, treatment plan, patient counseling, and follow-up timeline..."
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '8px',
                        border: '1.5px solid var(--border-color)',
                        fontFamily: 'inherit',
                        fontSize: '0.95rem',
                        lineHeight: 1.6,
                        resize: 'vertical',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Clinical Action Buttons */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleSaveNotes}
                      disabled={isSavingNotes}
                      style={{ padding: '10px 20px', fontSize: '0.9rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <i className={`fa-solid ${isSavingNotes ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}></i>
                      {isSavingNotes ? 'Saving to Database...' : 'Save Clinical Notes & Diagnosis'}
                    </button>

                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setIsCreateRxOpen(true)}
                      style={{ padding: '10px 18px', fontSize: '0.9rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <i className="fa-solid fa-file-prescription"></i>
                      Issue Prescription for this Case
                    </button>
                  </div>

                  {/* Diagnostic Lab Ordering Section */}
                  {selectedPatient.suggestedScans && selectedPatient.suggestedScans.length > 0 && (
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginTop: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <strong style={{ fontSize: '0.9rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <i className="fa-solid fa-flask-vial" style={{ color: '#059669' }}></i>
                          Recommended Diagnostic Investigations & Lab Workup
                        </strong>
                        <small style={{ color: '#64748B' }}>Direct Hospital Lab Dispatch</small>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                        {selectedPatient.suggestedScans.map((scan, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: '#FFFFFF',
                              border: '1px solid #CBD5E1',
                              borderRadius: '8px',
                              padding: '10px 14px'
                            }}
                          >
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
                              {scan}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOrderInvestigation(scan)}
                              style={{
                                background: '#2563EB',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '5px 12px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <i className="fa-solid fa-paper-plane"></i> Order
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Intake Interview Transcript */}
                  {Array.isArray(selectedPatient.conversation) && selectedPatient.conversation.length > 0 && (
                    <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fa-solid fa-comments" style={{ color: '#64748B' }}></i>
                        Patient AI Intake Interview Record ({selectedPatient.conversation.length} Clinical Questions)
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {selectedPatient.conversation.map((qa, idx) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: '10px',
                              padding: '14px 18px'
                            }}
                          >
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                              <span style={{ background: '#2563EB', color: '#FFF', borderRadius: '4px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 800, height: 'fit-content' }}>Q{idx + 1}</span>
                              <strong style={{ color: '#0F172A', fontSize: '0.95rem' }}>{qa.question}</strong>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', paddingLeft: '32px', alignItems: 'baseline' }}>
                              <span style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Response:</span>
                              <span style={{ color: '#1E293B', fontSize: '0.95rem', fontWeight: 700 }}>"{qa.answer}"</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Medical Records & OCR Documents */}
            {activeTab === 'records' && (() => {
              const pRecords = (records || []).filter(r =>
                selectedPatient && (
                  String(r.patientId) === String(selectedPatient.id) ||
                  String(r.patientId) === String(selectedPatient.customId) ||
                  String(r.patientId) === String(selectedPatient.reportId)
                )
              );
              const displayRecords = pRecords.length > 0 ? pRecords : (selectedPatient.records || []);

              return (
                <div className="tab-pane active" id="paneRecords" role="tabpanel">
                  <div className="table-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0F172A', fontWeight: 700 }}>
                          Patient Medical Records & Document Repository
                        </h3>
                        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                          Physical and digital files uploaded by patient, kiosk check-in, or clinical laboratories. Click any document or photo to view the visual file and AI OCR extraction.
                        </p>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>
                        Total: {displayRecords.length} Document(s)
                      </span>
                    </div>

                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th style={{ width: '60px' }}>Preview</th>
                            <th>Document Title</th>
                            <th>Category</th>
                            <th>Date</th>
                            <th>Facility / Doctor</th>
                            <th>OCR Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayRecords.length === 0 ? (
                            <tr>
                              <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                                <i className="fa-solid fa-folder-open" style={{ fontSize: '2.4rem', color: '#94A3B8', marginBottom: '10px', display: 'block' }}></i>
                                No medical records or document scans uploaded for this patient yet.
                              </td>
                            </tr>
                          ) : (
                            displayRecords.map((rec, i) => {
                              const docUrl = rec.imageData || rec.fileUrl || rec.previewUrl;
                              const isImg = Boolean(
                                rec.imageData ||
                                rec.mimeType?.startsWith('image/') ||
                                (rec.file && /\.(png|jpg|jpeg|webp)$/i.test(rec.file))
                              );

                              return (
                                <tr key={rec.id || i} style={{ cursor: 'pointer' }} onClick={() => setPreviewDoc({ ...rec, patient: selectedPatient.name })}>
                                  <td onClick={(e) => e.stopPropagation()}>
                                    <div
                                      onClick={() => setPreviewDoc({ ...rec, patient: selectedPatient.name })}
                                      style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        background: '#F1F5F9',
                                        border: '1px solid #CBD5E1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      {isImg && docUrl ? (
                                        <img
                                          src={docUrl}
                                          alt="thumb"
                                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                      ) : (
                                        <i className={`fa-solid ${rec.mimeType?.includes('pdf') || (rec.file && rec.file.endsWith('.pdf')) ? 'fa-file-pdf text-danger' : 'fa-file-medical text-primary'}`} style={{ fontSize: '1.25rem' }}></i>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <strong>{rec.title}</strong>
                                    {rec.file && <small style={{ display: 'block', color: '#64748B' }}>{rec.file} · {rec.size || 'Digital'}</small>}
                                  </td>
                                  <td>
                                    <span style={{
                                      background: '#F1F5F9',
                                      color: '#334155',
                                      padding: '3px 8px',
                                      borderRadius: '6px',
                                      fontSize: '0.75rem',
                                      fontWeight: 600
                                    }}>
                                      {rec.type || 'Medical Document'}
                                    </span>
                                  </td>
                                  <td>{rec.date}</td>
                                  <td>{rec.hospital || rec.doctor || rec.by || 'SMS Hospital Diagnostics'}</td>
                                  <td>
                                    {rec.ocrData?.status === 'PROCESSED' || rec.aiSummary ? (
                                      <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        background: '#F0FDF4',
                                        color: '#16A34A',
                                        padding: '3px 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.72rem',
                                        fontWeight: 600
                                      }}>
                                        <i className="fa-solid fa-circle-check"></i> OCR Ready
                                      </span>
                                    ) : (
                                      <span style={{
                                        background: '#EFF6FF',
                                        color: '#2563EB',
                                        padding: '3px 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.72rem',
                                        fontWeight: 600
                                      }}>
                                        Cataloged
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                                      <button
                                        type="button"
                                        className="btn-primary btn-sm"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                        onClick={() => setPreviewDoc({ ...rec, patient: selectedPatient.name })}
                                      >
                                        <i className="fa-solid fa-eye"></i> View & OCR
                                      </button>
                                      {docUrl && (
                                        <a
                                          href={docUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="btn-outline btn-sm"
                                          style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
                                          title="Open original file"
                                        >
                                          <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                        </a>
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
                  </div>
                </div>
              );
            })()}

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
