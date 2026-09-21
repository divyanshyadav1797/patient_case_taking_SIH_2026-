import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDoctor } from '../../context/DoctorContext';
import api from '../../services/api';

export default function DoctorModals() {
  const navigate = useNavigate();
  const {
    isCreateRxOpen,
    setIsCreateRxOpen,
    addPrescription,
    rescheduleData,
    setRescheduleData,
    rescheduleAppointment,
    previewDoc,
    setPreviewDoc,
    aptDetail,
    setAptDetail,
    isSupportModalOpen,
    setIsSupportModalOpen,
    patients,
    selectedPatient,
    setSelectedPatient,
    showToast
  } = useDoctor();

  // Create Prescription Form state
  const [rxForm, setRxForm] = useState({
    patient: '',
    patientId: '',
    medicine: '',
    dosage: '',
    frequency: 'Twice daily',
    duration: '',
    instructions: ''
  });

  // Reschedule Form state
  const [reschedDate, setReschedDate] = useState('2026-09-22');
  const [reschedTime, setReschedTime] = useState('09:30 AM');

  // Support Form state
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');

  // AI Medical History Summary for active appointment consultation
  const [aptAiSummary, setAptAiSummary] = useState(null);

  // Sync default patient into prescription form when opened
  useEffect(() => {
    if (isCreateRxOpen) {
      const activePatient = selectedPatient || (patients && patients.length > 0 ? patients[0] : null);
      setRxForm((prev) => ({
        ...prev,
        patient: activePatient?.name || prev.patient || 'Patient',
        patientId: activePatient?.id || prev.patientId || 'P1001'
      }));
    }
  }, [isCreateRxOpen, selectedPatient, patients]);

  // Global ESC key listener to close active modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsCreateRxOpen(false);
        setRescheduleData(null);
        setPreviewDoc(null);
        setAptDetail(null);
        setIsSupportModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsCreateRxOpen, setRescheduleData, setPreviewDoc, setAptDetail, setIsSupportModalOpen]);

  useEffect(() => {
    if (aptDetail && (aptDetail.patientId || aptDetail.patient)) {
      const pid = aptDetail.patientId || aptDetail.patient;
      api.getAiMedicalHistorySummary(pid, aptDetail.type || aptDetail.procedure || '')
        .then((res) => {
          if (res && res.executiveSummary) setAptAiSummary(res);
          else if (res && res.data && res.data.executiveSummary) setAptAiSummary(res.data);
        })
        .catch(() => setAptAiSummary(null));
    } else {
      setAptAiSummary(null);
    }
  }, [aptDetail]);

  const handleCreateRxSubmit = (e) => {
    e.preventDefault();
    if (!rxForm.medicine || !rxForm.dosage || !rxForm.duration) {
      showToast('Please complete all required prescription fields', 'warning');
      return;
    }

    const patientObj = patients.find((p) => p.name === rxForm.patient);
    addPrescription({
      patient: rxForm.patient,
      patientName: rxForm.patient,
      patientId: patientObj ? patientObj.id : (rxForm.patientId || selectedPatient?.id || 'P-10249'),
      diagnosis: selectedPatient?.diagnosticImpression || selectedPatient?.chiefComplaint || 'Clinical Consultation',
      medicine: rxForm.medicine,
      dosage: rxForm.dosage,
      frequency: rxForm.frequency,
      duration: rxForm.duration,
      instructions: rxForm.instructions
    });

    setRxForm({
      patient: selectedPatient?.name || (patients[0]?.name || ''),
      patientId: selectedPatient?.id || (patients[0]?.id || ''),
      medicine: '',
      dosage: '',
      frequency: 'Twice daily',
      duration: '',
      instructions: ''
    });

    setIsCreateRxOpen(false);
  };

  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    if (rescheduleData) {
      rescheduleAppointment(rescheduleData.appointmentId, reschedDate, reschedTime);
      setRescheduleData(null);
    }
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportSubject || !supportMessage) {
      showToast('Please fill out the subject and message', 'warning');
      return;
    }
    showToast('Support ticket submitted successfully! Ticket ID #MED-8492');
    setSupportSubject('');
    setSupportMessage('');
    setIsSupportModalOpen(false);
  };

  // Shared inline style for bulletproof modal overlays
  const backdropOverlayStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    opacity: 1,
    pointerEvents: 'auto',
    padding: '20px'
  };

  return (
    <>
      {/* 1. Modal: Create Prescription */}
      {isCreateRxOpen && (
        <div
          className="modal-backdrop open active doctor-modal-backdrop"
          id="modalCreatePrescription"
          role="dialog"
          aria-modal="true"
          style={backdropOverlayStyle}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateRxOpen(false);
          }}
        >
          <div
            className="modal-box doctor-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title" id="modalPrescriptionTitle">Create Prescription</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsCreateRxOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateRxSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="rxPatientSelect" className="form-label">Select Patient</label>
                  <select
                    id="rxPatientSelect"
                    className="form-control"
                    value={rxForm.patient}
                    onChange={(e) => {
                      const selectedP = patients.find((p) => p.name === e.target.value);
                      setRxForm({
                        ...rxForm,
                        patient: e.target.value,
                        patientId: selectedP ? selectedP.id : rxForm.patientId
                      });
                    }}
                    required
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="rxMedicineName" className="form-label">Medicine Name</label>
                  <input
                    type="text"
                    id="rxMedicineName"
                    className="form-control"
                    placeholder="e.g. Amoxicillin, Paracetamol"
                    value={rxForm.medicine}
                    onChange={(e) => setRxForm({ ...rxForm, medicine: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label htmlFor="rxDosage" className="form-label">Dosage</label>
                    <input
                      type="text"
                      id="rxDosage"
                      className="form-control"
                      placeholder="e.g. 500mg"
                      value={rxForm.dosage}
                      onChange={(e) => setRxForm({ ...rxForm, dosage: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="rxFrequency" className="form-label">Frequency</label>
                    <select
                      id="rxFrequency"
                      className="form-control"
                      value={rxForm.frequency}
                      onChange={(e) => setRxForm({ ...rxForm, frequency: e.target.value })}
                    >
                      <option value="Once daily">Once daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Thrice daily">Thrice daily</option>
                      <option value="As needed">As needed (SOS)</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="rxDuration" className="form-label">Duration</label>
                  <input
                    type="text"
                    id="rxDuration"
                    className="form-control"
                    placeholder="e.g. 5 Days, 1 Week"
                    value={rxForm.duration}
                    onChange={(e) => setRxForm({ ...rxForm, duration: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="rxInstructions" className="form-label">Instructions / Notes</label>
                  <textarea
                    id="rxInstructions"
                    className="form-control"
                    rows={2}
                    placeholder="e.g. Take after meals with warm water."
                    value={rxForm.instructions}
                    onChange={(e) => setRxForm({ ...rxForm, instructions: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsCreateRxOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Prescription</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Reschedule Appointment */}
      {rescheduleData && (
        <div
          className="modal-backdrop open active doctor-modal-backdrop"
          id="modalReschedule"
          role="dialog"
          aria-modal="true"
          style={backdropOverlayStyle}
          onClick={(e) => {
            if (e.target === e.currentTarget) setRescheduleData(null);
          }}
        >
          <div
            className="modal-box doctor-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title" id="modalRescheduleTitle">Reschedule Appointment</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setRescheduleData(null)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleRescheduleSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Rescheduling consultation for: <strong style={{ color: 'var(--text-dark)' }}>{rescheduleData.patientName}</strong>
                </p>
                <div className="form-group">
                  <label htmlFor="rescheduleDate" className="form-label">Select Date</label>
                  <input
                    type="date"
                    id="rescheduleDate"
                    className="form-control"
                    value={reschedDate}
                    onChange={(e) => setReschedDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="rescheduleTime" className="form-label">Select Time Slot</label>
                  <select
                    id="rescheduleTime"
                    className="form-control"
                    value={reschedTime}
                    onChange={(e) => setReschedTime(e.target.value)}
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setRescheduleData(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Confirm Reschedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Document Preview & AI OCR Clinical Summary */}
      {previewDoc && (() => {
        const resolveDocUrl = (doc) => {
          if (!doc) return '';
          if (doc.imageData && doc.imageData.startsWith('data:')) return doc.imageData;
          const url = doc.fileUrl || doc.previewUrl;
          if (!url) return '';
          if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
          return url.startsWith('/') ? url : `/${url}`;
        };

        const docUrl = resolveDocUrl(previewDoc);
        const fileName = (previewDoc.file || previewDoc.title || '').toLowerCase();
        const isImg = Boolean(
          previewDoc.imageData ||
          previewDoc.mimeType?.startsWith('image/') ||
          fileName.endsWith('.png') ||
          fileName.endsWith('.jpg') ||
          fileName.endsWith('.jpeg') ||
          fileName.endsWith('.webp')
        );
        const isPdf = Boolean(previewDoc.mimeType?.includes('pdf') || fileName.endsWith('.pdf'));

        const ocr = previewDoc.ocrData || {};
        const diagnoses = Array.isArray(ocr.diagnoses) ? ocr.diagnoses : [];
        const medications = Array.isArray(ocr.medications) ? ocr.medications : [];
        const investigations = Array.isArray(ocr.investigations) ? ocr.investigations : [];
        const warnings = Array.isArray(ocr.warnings) ? ocr.warnings : [];
        const summaryText = previewDoc.aiSummary || ocr.summary || 'Clinical document cataloged in electronic medical history. Physical record verified by health center.';

        return (
          <div
            className="modal-backdrop open active doctor-modal-backdrop"
            id="modalDocPreview"
            role="dialog"
            aria-modal="true"
            style={{ ...backdropOverlayStyle, zIndex: 100000 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setPreviewDoc(null);
            }}
          >
            <div
              className="modal-box doctor-modal-box"
              style={{ maxWidth: '920px', width: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: '#EFF6FF',
                      color: '#2563EB',
                      padding: '3px 9px',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.5px'
                    }}>
                      <i className="fa-solid fa-file-medical"></i>
                      {(previewDoc.type || 'Clinical Document').toUpperCase()}
                    </span>
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
                      <i className="fa-solid fa-circle-check"></i> OCR ANALYZED
                    </span>
                  </div>
                  <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    {previewDoc.title || 'Clinical Diagnostic Document'}
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                    Patient: <strong>{previewDoc.patient || 'Verified Patient'}</strong> · Date: {previewDoc.date || 'Recent'} · Facility / Lab: {previewDoc.hospital || previewDoc.doctor || 'SMS Hospital Diagnostics'}
                  </p>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setPreviewDoc(null)}
                  aria-label="Close"
                  style={{ fontSize: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
                >
                  &times;
                </button>
              </div>

              <div className="modal-body" style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Two-Column Grid: Visual Document Left, AI OCR Summary Right */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.25fr)',
                  gap: '20px',
                  alignItems: 'start'
                }}>
                  {/* Visual Document / Photo Inspection Column */}
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', letterSpacing: '0.5px' }}>
                        <i className="fa-solid fa-image" style={{ marginRight: '6px' }}></i>
                        DOCUMENT PHOTO / FILE
                      </span>
                      {docUrl && (
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '0.75rem', color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}
                        >
                          Open Full Resolution <i className="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                      )}
                    </div>

                    <div style={{
                      minHeight: '260px',
                      background: '#FFFFFF',
                      border: '1px dashed #CBD5E1',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      {isImg && docUrl ? (
                        <img
                          src={docUrl}
                          alt={previewDoc.title}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '340px',
                            objectFit: 'contain',
                            display: 'block'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                          }}
                        />
                      ) : isPdf && docUrl ? (
                        <div style={{ textAlign: 'center', padding: '24px' }}>
                          <i className="fa-solid fa-file-pdf" style={{ fontSize: '3rem', color: '#EF4444', marginBottom: '12px' }}></i>
                          <h5 style={{ margin: '0 0 6px', color: '#1E293B', fontSize: '0.95rem' }}>PDF Diagnostic Report</h5>
                          <p style={{ margin: '0 0 14px', fontSize: '0.78rem', color: '#64748B' }}>Digital vector / scanned document</p>
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                          >
                            <i className="fa-solid fa-eye"></i> View PDF In New Tab
                          </a>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '24px' }}>
                          <i className="fa-solid fa-file-waveform" style={{ fontSize: '2.8rem', color: '#3B82F6', marginBottom: '10px' }}></i>
                          <h5 style={{ margin: '0 0 4px', color: '#1E293B', fontSize: '0.9rem' }}>{previewDoc.title}</h5>
                          <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>Verified Hospital Clinical Record ({previewDoc.size || 'Verified'})</p>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748B' }}>
                      <span>Format: {previewDoc.mimeType || (isImg ? 'Image (JPG/PNG)' : 'PDF')}</span>
                      <span>Size: {previewDoc.size || 'Standard'}</span>
                    </div>
                  </div>

                  {/* AI OCR Clinical Summary Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{
                      background: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      borderRadius: '10px',
                      padding: '14px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <i className="fa-solid fa-robot" style={{ color: '#16A34A', fontSize: '1rem' }}></i>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', letterSpacing: '0.5px' }}>
                          AI OCR CLINICAL EXTRACTION & SUMMARY
                        </span>
                      </div>
                      <div style={{
                        fontSize: '0.84rem',
                        lineHeight: '1.55',
                        color: '#1E293B',
                        whiteSpace: 'pre-line',
                        maxHeight: '220px',
                        overflowY: 'auto',
                        paddingRight: '4px'
                      }}>
                        {summaryText}
                      </div>
                    </div>

                    {/* Diagnoses Identified */}
                    {diagnoses.length > 0 && (
                      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                          <i className="fa-solid fa-stethoscope" style={{ marginRight: '6px', color: '#2563EB' }}></i>
                          DOCUMENTED DIAGNOSES / FINDINGS
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {diagnoses.map((d, idx) => (
                            <span key={idx} style={{
                              background: '#EFF6FF',
                              color: '#1D4ED8',
                              border: '1px solid #DBEAFE',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 600
                            }}>
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Identified Medications */}
                    {medications.length > 0 && (
                      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                          <i className="fa-solid fa-pills" style={{ marginRight: '6px', color: '#059669' }}></i>
                          EXTRACTED MEDICATIONS & REGIMEN
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {medications.map((m, idx) => (
                            <div key={idx} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '0.78rem',
                              padding: '6px 8px',
                              background: '#F8FAFC',
                              borderRadius: '6px'
                            }}>
                              <strong>{m.name || 'Medicine'} {m.strength ? `(${m.strength})` : ''}</strong>
                              <span style={{ color: '#64748B' }}>{m.dosage || ''} {m.frequency || ''} {m.duration ? `· ${m.duration}` : ''}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Investigations / Lab Values */}
                    {investigations.length > 0 && (
                      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                          <i className="fa-solid fa-flask-vial" style={{ marginRight: '6px', color: '#7C3AED' }}></i>
                          LABORATORY INVESTIGATION VALUES
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {investigations.map((t, idx) => (
                            <div key={idx} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '0.78rem',
                              padding: '6px 8px',
                              background: t.abnormalAsReported ? '#FEF2F2' : '#F8FAFC',
                              borderLeft: t.abnormalAsReported ? '3px solid #EF4444' : '3px solid #10B981',
                              borderRadius: '4px'
                            }}>
                              <div>
                                <strong>{t.name}</strong>
                                {t.referenceRange && <small style={{ color: '#64748B', display: 'block' }}>Ref: {t.referenceRange}</small>}
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontWeight: 700, color: t.abnormalAsReported ? '#DC2626' : '#1E293B' }}>
                                  {t.value} {t.unit || ''}
                                </span>
                                {t.abnormalAsReported && (
                                  <span style={{ display: 'block', fontSize: '0.68rem', color: '#DC2626', fontWeight: 700 }}>
                                    ABNORMAL
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Warnings */}
                    {warnings.length > 0 && (
                      <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '10px 12px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400E' }}>
                          <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
                          CLINICAL ADVISORY
                        </span>
                        <ul style={{ margin: '4px 0 0', paddingLeft: '18px', fontSize: '0.78rem', color: '#78350F' }}>
                          {warnings.map((w, idx) => <li key={idx}>{w}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  <i className="fa-solid fa-shield-halved" style={{ marginRight: '5px', color: '#16A34A' }}></i>
                  HIPAA & EHR Compliant Digital Record
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="btn-outline" onClick={() => setPreviewDoc(null)}>
                    Close
                  </button>
                  {docUrl && (
                    <a
                      href={docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square"></i> Open Original File
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 4. Modal: Appointment / OT Details */}
      {aptDetail && (
        <div
          className="modal-backdrop open active doctor-modal-backdrop"
          id="modalAptDetails"
          role="dialog"
          aria-modal="true"
          style={backdropOverlayStyle}
          onClick={(e) => {
            if (e.target === e.currentTarget) setAptDetail(null);
          }}
        >
          <div
            className="modal-box doctor-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title" id="modalAptTitle">
                {aptDetail.category === 'operation' ? 'Surgical Procedure Details' : 'Appointment Details'}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setAptDetail(null)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', color: 'var(--text-dark)', fontWeight: 700 }}>{aptDetail.patient}</h4>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Patient ID: {aptDetail.patientId}</span>
                  </div>
                  <span className={`status-pill status-${(aptDetail.status || 'upcoming').toLowerCase()}`}>
                    {aptDetail.status}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Type / Procedure</span>
                    <p style={{ fontWeight: 600, color: 'var(--text-dark)', marginTop: '2px' }}>{aptDetail.type || aptDetail.procedure}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Room / Allocation</span>
                    <p style={{ fontWeight: 600, color: 'var(--text-dark)', marginTop: '2px' }}>{aptDetail.roomLabel || aptDetail.room || aptDetail.otRoom || 'Consultation'}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Date & Time</span>
                    <p style={{ fontWeight: 600, color: 'var(--text-dark)', marginTop: '2px' }}>{aptDetail.date}, {aptDetail.time}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Doctor In-charge</span>
                    <p style={{ fontWeight: 600, color: 'var(--text-dark)', marginTop: '2px' }}>{aptDetail.doctor || aptDetail.surgeon || 'Dr. Sharma'}</p>
                  </div>
                </div>
                {aptDetail.notes && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Clinical Notes</span>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-dark)', marginTop: '4px', lineHeight: 1.5 }}>{aptDetail.notes}</p>
                  </div>
                )}

                {/* AI Longitudinal Medical History Summary from past reports */}
                {aptAiSummary && (
                  <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🧠</span>
                        <strong style={{ fontSize: '0.825rem', color: '#166534' }}>AI Medical History Summary (Past Reports)</strong>
                      </div>
                      <span style={{ background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700 }}>
                        {aptAiSummary.previousReportsCount > 0 ? `${aptAiSummary.previousReportsCount} Prior Reports` : 'Baseline Visit'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: '#14532D', margin: '0 0 8px 0', lineHeight: 1.5 }}>
                      {aptAiSummary.executiveSummary}
                    </p>
                    {Array.isArray(aptAiSummary.keyPastDiagnoses) && aptAiSummary.keyPastDiagnoses.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {aptAiSummary.keyPastDiagnoses.map((dx, i) => (
                          <span key={i} style={{ background: '#FFFFFF', border: '1px solid #BBF7D0', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontSize: '0.725rem' }}>
                            {dx}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-outline" onClick={() => setAptDetail(null)}>Close</button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  const p = patients.find((pat) => pat.id === aptDetail.patientId || pat.name === aptDetail.patient);
                  if (p) setSelectedPatient(p);
                  setAptDetail(null);
                  navigate('/doctor/patients', { state: { viewProfile: true, patientId: aptDetail.patientId } });
                }}
              >
                View Patient Profile
              </button>
              {aptDetail.status === 'Upcoming' && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    showToast(`Consultation started with ${aptDetail.patient}`);
                    const p = patients.find((pat) => pat.id === aptDetail.patientId || pat.name === aptDetail.patient);
                    if (p) setSelectedPatient(p);
                    setAptDetail(null);
                    navigate('/doctor/patients', { state: { viewProfile: true, patientId: aptDetail.patientId } });
                  }}
                >
                  Start Consultation
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal: Contact Support */}
      {isSupportModalOpen && (
        <div
          className="modal-backdrop open active doctor-modal-backdrop"
          id="modalContactSupport"
          role="dialog"
          aria-modal="true"
          style={backdropOverlayStyle}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSupportModalOpen(false);
          }}
        >
          <div
            className="modal-box doctor-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title" id="modalSupportTitle">Contact Support Desk</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsSupportModalOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSupportSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="supportSubject" className="form-label">Subject</label>
                  <input
                    type="text"
                    id="supportSubject"
                    className="form-control"
                    placeholder="e.g. Portal sync issue"
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="supportMessage" className="form-label">Message Details</label>
                  <textarea
                    id="supportMessage"
                    className="form-control"
                    rows={3}
                    placeholder="Describe the issue you are experiencing..."
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsSupportModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
