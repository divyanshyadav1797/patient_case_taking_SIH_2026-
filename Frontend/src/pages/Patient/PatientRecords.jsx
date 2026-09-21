import React, { useState, useEffect } from 'react';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function PatientRecords() {
  const { records, showToast } = usePatient();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [clinicalReports, setClinicalReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.getClinicalReports()
      .then((reps) => {
        if (!mounted) return;
        if (Array.isArray(reps)) {
          // If logged in as patient, filter by user id or name if available
          const filtered = reps.filter(r => 
            !user?.id || r.patientId === user.id || r.patientName?.toLowerCase() === user.name?.toLowerCase() || !r.patientId
          );
          setClinicalReports(filtered.length > 0 ? filtered : reps);
        }
      })
      .catch((err) => {
        console.warn('Failed to load clinical reports:', err.message);
      });

    return () => { mounted = false; };
  }, [user]);

  return (
    <div className="page active-page" id="records">
      <div className="page-header">
        <h1>My Health Records</h1>
        <p>Access your medical reports, AI clinical summaries, scans, and diagnostic documents.</p>
      </div>

      <div className="records-grid">
        <div className="record-card" onClick={() => { setActiveCategory('prescriptions'); showToast('Viewing active prescriptions.'); }}>
          <i className="fa-solid fa-prescription-bottle-medical"></i>
          <h3>Prescriptions</h3>
          <p>Issued prescriptions</p>
          <button type="button">View Records</button>
        </div>

        <div className="record-card" onClick={() => { setActiveCategory('lab'); showToast('Viewing laboratory test reports.'); }}>
          <i className="fa-solid fa-flask"></i>
          <h3>Lab Reports</h3>
          <p>Diagnostic reports</p>
          <button type="button">View Reports</button>
        </div>

        <div className="record-card" onClick={() => { setActiveCategory('scans'); showToast('Viewing imaging & MRI scans.'); }}>
          <i className="fa-solid fa-x-ray"></i>
          <h3>Scans & X-Rays</h3>
          <p>Medical imaging</p>
          <button type="button">View Reports</button>
        </div>
      </div>

      {/* AI Clinical Intake Reports Section */}
      <div className="section-card" style={{ marginTop: '2rem' }}>
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚡</span> AI Case-Taking Summaries & Intake Reports
            </h2>
            <small style={{ color: '#64748B' }}>
              Structured clinical summaries generated during your AI intake and Kiosk check-in.
            </small>
          </div>
          <span style={{ fontSize: '0.8rem', background: '#EFF6FF', color: '#2563EB', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
            {clinicalReports.length} Reports in Database
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          {clinicalReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B', background: '#F8FAFC', borderRadius: '0.75rem' }}>
              <p style={{ margin: 0 }}>No AI intake reports on record yet. Complete an AI consultation or Kiosk check-in to generate your first clinical report.</p>
            </div>
          ) : (
            clinicalReports.map((rep) => (
              <div key={rep.id || rep._id || Math.random()} style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '1.25rem',
                border: '1px solid #E2E8F0',
                borderRadius: '0.75rem',
                background: '#FFFFFF',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                  <div style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '0.5rem',
                    background: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    flexShrink: 0
                  }}>
                    <i className="fa-solid fa-notes-medical"></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#0F172A' }}>
                        Chief Complaint: {rep.chiefComplaint}
                      </h4>
                      {rep.urgentReview ? (
                        <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '2px 8px', borderRadius: '4px', fontSize: '0.725rem', fontWeight: 700 }}>
                          Urgent Review
                        </span>
                      ) : (
                        <span style={{ background: '#DCFCE7', color: '#16A34A', padding: '2px 8px', borderRadius: '4px', fontSize: '0.725rem', fontWeight: 600 }}>
                          Standard Triage
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '4px 0 8px', color: '#475569', fontSize: '0.875rem', lineHeight: 1.5 }}>
                      {rep.summaryForDoctor ? rep.summaryForDoctor.slice(0, 160) + '...' : 'Clinical report registered in health database.'}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: '#94A3B8' }}>
                      <span><strong>Date:</strong> {rep.createdAt ? new Date(rep.createdAt).toLocaleDateString() : 'Recent'}</span>
                      <span><strong>Source:</strong> {rep.kioskTokenId ? 'Hospital Kiosk' : 'Quantum WebApp'}</span>
                      <span><strong>Symptoms:</strong> {Array.isArray(rep.reportedSymptoms) ? rep.reportedSymptoms.join(', ') : rep.reportedSymptoms}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => setSelectedReport(rep)}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', alignSelf: 'center', marginLeft: '1rem' }}
                >
                  <i className="fa-solid fa-eye"></i> View Summary
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Medical Files */}
      <div className="section-card" style={{ marginTop: '2rem' }}>
        <div className="section-header">
          <h2>Recent Medical Files</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {records.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B', background: '#F8FAFC', borderRadius: '0.75rem' }}>
              <p style={{ margin: 0 }}>No diagnostic records or medical files uploaded yet.</p>
            </div>
          ) : (
            records.map((rec) => (
              <div key={rec.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                border: '1px solid #E2E8F0',
                borderRadius: '0.75rem',
                background: '#FFFFFF'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '0.5rem',
                    background: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}>
                    <i className="fa-regular fa-file-pdf"></i>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#172033' }}>{rec.title}</h4>
                    <small style={{ color: '#64748B' }}>{rec.doctor} · {rec.hospital} · {rec.date} ({rec.size})</small>
                  </div>
                </div>

                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => showToast(`Downloading ${rec.file}...`)}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  <i className="fa-solid fa-download"></i> Download
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Clinical Report Preview Modal */}
      {selectedReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '1rem',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0F172A', fontSize: '1.25rem' }}>Clinical Intake Report</h3>
                <small style={{ color: '#64748B' }}>ID: {selectedReport.id || selectedReport._id}</small>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748B' }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Chief Complaint</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#0F172A' }}>{selectedReport.chiefComplaint}</p>
              </div>

              <div>
                <strong style={{ fontSize: '0.875rem', color: '#334155' }}>Clinical Summary:</strong>
                <p style={{ margin: '4px 0 0', color: '#475569', lineHeight: 1.6, fontSize: '0.925rem' }}>
                  {selectedReport.summaryForDoctor}
                </p>
              </div>

              {selectedReport.historyOfPresentIllness && (
                <div>
                  <strong style={{ fontSize: '0.875rem', color: '#334155' }}>History of Present Illness:</strong>
                  <p style={{ margin: '4px 0 0', color: '#475569', lineHeight: 1.6, fontSize: '0.925rem' }}>
                    {selectedReport.historyOfPresentIllness}
                  </p>
                </div>
              )}

              {selectedReport.doctorNotes && (
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '1rem', borderRadius: '0.5rem' }}>
                  <strong style={{ fontSize: '0.875rem', color: '#1E40AF' }}>Doctor Clinical Observation Notes:</strong>
                  <p style={{ margin: '4px 0 0', color: '#1E3A8A', lineHeight: 1.6, fontSize: '0.925rem' }}>
                    {selectedReport.doctorNotes}
                  </p>
                </div>
              )}

              {Array.isArray(selectedReport.conversation) && selectedReport.conversation.length > 0 && (
                <div>
                  <strong style={{ fontSize: '0.875rem', color: '#334155' }}>Intake Q&A Transcript:</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    {selectedReport.conversation.map((qa, i) => (
                      <div key={i} style={{ background: '#F1F5F9', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
                        <p style={{ margin: 0, fontWeight: 600, color: '#1E293B' }}>Q: {qa.question}</p>
                        <p style={{ margin: '4px 0 0', color: '#475569' }}>A: "{qa.answer}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => setSelectedReport(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
