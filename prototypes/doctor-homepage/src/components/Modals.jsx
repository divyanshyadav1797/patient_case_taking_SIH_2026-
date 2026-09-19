import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDoctor } from '../context/DoctorContext';

export default function Modals() {
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
    setSelectedPatient,
    showToast
  } = useDoctor();

  // Create Prescription Form state
  const [rxForm, setRxForm] = useState({
    patient: 'Rahul Mehta',
    patientId: 'P1001',
    medicine: '',
    dosage: '',
    frequency: 'Twice daily',
    duration: '',
    instructions: ''
  });

  // Reschedule Form state
  const [reschedDate, setReschedDate] = useState('2026-09-13');
  const [reschedTime, setReschedTime] = useState('09:30 AM');

  // Support Form state
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');

  const handleCreateRxSubmit = (e) => {
    e.preventDefault();
    if (!rxForm.medicine || !rxForm.dosage || !rxForm.duration) {
      showToast('Please complete all required prescription fields', 'warning');
      return;
    }

    const patientObj = patients.find((p) => p.name === rxForm.patient);
    addPrescription({
      patient: rxForm.patient,
      patientId: patientObj ? patientObj.id : 'P1001',
      diagnosis: 'Clinical Consultation',
      medicines: `${rxForm.medicine} (${rxForm.dosage}) - ${rxForm.frequency} (${rxForm.duration})`
    });

    setRxForm({
      patient: 'Rahul Mehta',
      patientId: 'P1001',
      medicine: '',
      dosage: '',
      frequency: 'Twice daily',
      duration: '',
      instructions: ''
    });
  };

  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    if (rescheduleData) {
      rescheduleAppointment(rescheduleData.appointmentId, reschedDate, reschedTime);
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

  return (
    <>
      {/* 1. Modal: Create Prescription */}
      {isCreateRxOpen && (
        <div className="modal-backdrop open" id="modalCreatePrescription" role="dialog" aria-modal="true">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title" id="modalPrescriptionTitle">Create Prescription</h3>
              <button type="button" className="modal-close-btn" onClick={() => setIsCreateRxOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateRxSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="rxPatientSelect" className="form-label">Select Patient</label>
                  <select
                    id="rxPatientSelect"
                    className="form-control"
                    value={rxForm.patient}
                    onChange={(e) => setRxForm({ ...rxForm, patient: e.target.value })}
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
        <div className="modal-backdrop open" id="modalReschedule" role="dialog" aria-modal="true">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title" id="modalRescheduleTitle">Reschedule Appointment</h3>
              <button type="button" className="modal-close-btn" onClick={() => setRescheduleData(null)}>&times;</button>
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

      {/* 3. Modal: Document Preview */}
      {previewDoc && (
        <div className="modal-backdrop open" id="modalDocPreview" role="dialog" aria-modal="true">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title" id="modalDocTitle">Document Preview</h3>
              <button type="button" className="modal-close-btn" onClick={() => setPreviewDoc(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ backgroundColor: '#F8FAFC', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '32px', textAlign: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" style={{ marginBottom: '12px' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-dark)', marginBottom: '6px' }}>
                  {previewDoc.title || 'Clinical Diagnostic Document'}
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Patient: {previewDoc.patient || 'Patient'} · {previewDoc.date || 'Verified Record'} · Uploaded by: {previewDoc.uploadedBy || 'Clinical Labs'}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-outline" onClick={() => setPreviewDoc(null)}>Close</button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  showToast(`Downloading "${previewDoc.title || 'Document'}.pdf"...`);
                  setPreviewDoc(null);
                }}
              >
                Download Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: Appointment / OT Details */}
      {aptDetail && (
        <div className="modal-backdrop open" id="modalAptDetails" role="dialog" aria-modal="true">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title" id="modalAptTitle">
                {aptDetail.category === 'operation' ? 'Surgical Procedure Details' : 'Appointment Details'}
              </h3>
              <button type="button" className="modal-close-btn" onClick={() => setAptDetail(null)}>&times;</button>
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
                  navigate('/patients');
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
                    setAptDetail(null);
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
        <div className="modal-backdrop open" id="modalContactSupport" role="dialog" aria-modal="true">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title" id="modalSupportTitle">Contact Support Desk</h3>
              <button type="button" className="modal-close-btn" onClick={() => setIsSupportModalOpen(false)}>&times;</button>
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
