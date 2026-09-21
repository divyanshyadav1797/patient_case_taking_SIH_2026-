import React, { useState, useEffect } from 'react';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function PatientRecords() {
  const { records, showToast, uploadMedicalDocument } = usePatient();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [clinicalReports, setClinicalReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.getClinicalReports()
      .then((reps) => {
        if (!mounted) return;
        if (Array.isArray(reps)) {
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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    showToast('Uploading medical document for AI OCR analysis...');

    try {
      const isImg = file.type.startsWith('image/');
      const result = await uploadMedicalDocument(file, {
        title: file.name,
        type: isImg ? 'Diagnostic Photo' : 'Lab Report',
        patientId: user?.customId || user?.id || 'P-10249'
      });
      if (result) {
        setPreviewDoc(result);
      }
    } catch (err) {
      console.error('Document upload error:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const resolveDocUrl = (doc) => {
    if (!doc) return '';
    if (doc.imageData && doc.imageData.startsWith('data:')) return doc.imageData;
    const url = doc.fileUrl || doc.previewUrl;
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    return url.startsWith('/') ? url : `/${url}`;
  };

  return (
    <div className="page active-page" id="records">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>My Health Records</h1>
          <p>Access your medical reports, AI clinical summaries, photos, scans, and diagnostic documents.</p>
        </div>

        <label
          htmlFor="patientDocUpload"
          className="primary-btn"
          style={{
            cursor: isUploading ? 'not-allowed' : 'pointer',
            opacity: isUploading ? 0.7 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.65rem 1.25rem',
            borderRadius: '10px'
          }}
        >
          {isUploading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i> Analyzing with OCR...
            </>
          ) : (
            <>
              <i className="fa-solid fa-cloud-arrow-up"></i> Upload Document / Photo
            </>
          )}
          <input
            id="patientDocUpload"
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            disabled={isUploading}
            style={{ display: 'none' }}
          />
        </label>
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

      {/* Recent Medical Files & Uploaded Documents */}
      <div className="section-card" style={{ marginTop: '2rem' }}>
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Recent Medical Files & Uploaded Photos</h2>
            <small style={{ color: '#64748B' }}>
              Your prescriptions, lab test reports, and uploaded photos with AI OCR analysis.
            </small>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
            {records.length} File(s) on Record
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          {records.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B', background: '#F8FAFC', borderRadius: '0.75rem' }}>
              <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '2.5rem', color: '#94A3B8', marginBottom: '12px', display: 'block' }}></i>
              <p style={{ margin: '0 0 10px', fontWeight: 600, color: '#334155' }}>No diagnostic records or medical photos uploaded yet.</p>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Click "Upload Document / Photo" above to attach prescriptions, lab results, or imaging scans.</p>
            </div>
          ) : (
            records.map((rec) => {
              const docUrl = resolveDocUrl(rec);
              const isImg = Boolean(rec.imageData || rec.mimeType?.startsWith('image/') || (rec.file && /\.(png|jpg|jpeg|webp)$/i.test(rec.file)));

              return (
                <div
                  key={rec.id || rec.customId || Math.random()}
                  onClick={() => setPreviewDoc(rec)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    border: '1px solid #E2E8F0',
                    borderRadius: '0.75rem',
                    background: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '0.5rem',
                      overflow: 'hidden',
                      background: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      border: '1px solid #CBD5E1',
                      flexShrink: 0
                    }}>
                      {isImg && docUrl ? (
                        <img src={docUrl} alt="doc" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <i className={`fa-solid ${rec.mimeType?.includes('pdf') || (rec.file && rec.file.endsWith('.pdf')) ? 'fa-file-pdf text-danger' : 'fa-file-medical text-primary'}`}></i>
                      )}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#172033', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {rec.title}
                        </h4>
                        {(rec.ocrData?.status === 'PROCESSED' || rec.aiSummary) && (
                          <span style={{ background: '#F0FDF4', color: '#16A34A', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            <i className="fa-solid fa-wand-magic-sparkles"></i> OCR Ready
                          </span>
                        )}
                      </div>
                      <small style={{ color: '#64748B', display: 'block', marginTop: '2px' }}>
                        {rec.type || 'Medical Document'} · {rec.doctor || 'Clinical Lab'} · {rec.date} ({rec.size || 'Verified'})
                      </small>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => setPreviewDoc(rec)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <i className="fa-solid fa-eye"></i> View & OCR
                    </button>
                    {docUrl && (
                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline"
                        style={{
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          color: '#334155',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}
                        title="Open file in new tab"
                      >
                        <i className="fa-solid fa-arrow-up-right-from-square"></i>
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Patient Document & AI OCR Inspection Modal */}
      {previewDoc && (() => {
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
        const summaryText = previewDoc.aiSummary || ocr.summary || 'Clinical document saved in medical history. Available for attending physician during your appointment.';

        return (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '1.5rem',
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setPreviewDoc(null)}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '1rem',
                maxWidth: '920px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '1.75rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {(previewDoc.type || 'Medical Document').toUpperCase()}
                    </span>
                    <span style={{ background: '#F0FDF4', color: '#16A34A', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                      <i className="fa-solid fa-circle-check"></i> OCR ANALYZED
                    </span>
                  </div>
                  <h3 style={{ margin: 0, color: '#0F172A', fontSize: '1.25rem' }}>
                    {previewDoc.title || 'Diagnostic Document'}
                  </h3>
                  <small style={{ color: '#64748B' }}>
                    Date: {previewDoc.date || 'Recent'} · Facility: {previewDoc.hospital || 'Hospital Health Records'}
                  </small>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748B' }}
                >
                  &times;
                </button>
              </div>

              {/* Two Column Document Inspection Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.25fr)', gap: '1.5rem', alignItems: 'start' }}>
                {/* Photo / Document Image Viewer Column */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                      <i className="fa-solid fa-image"></i> ATTACHED PHOTO / FILE
                    </span>
                    {docUrl && (
                      <a href={docUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>
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
                    overflow: 'hidden'
                  }}>
                    {isImg && docUrl ? (
                      <img
                        src={docUrl}
                        alt={previewDoc.title}
                        style={{ maxWidth: '100%', maxHeight: '340px', objectFit: 'contain' }}
                      />
                    ) : isPdf && docUrl ? (
                      <div style={{ textAlign: 'center', padding: '24px' }}>
                        <i className="fa-solid fa-file-pdf" style={{ fontSize: '3rem', color: '#EF4444', marginBottom: '10px' }}></i>
                        <h5 style={{ margin: '0 0 6px', color: '#1E293B' }}>PDF Document</h5>
                        <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: '#64748B' }}>Scanned medical report</p>
                        <a href={docUrl} target="_blank" rel="noopener noreferrer" className="primary-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', gap: '6px' }}>
                          <i className="fa-solid fa-eye"></i> View PDF
                        </a>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '24px' }}>
                        <i className="fa-solid fa-file-waveform" style={{ fontSize: '2.5rem', color: '#3B82F6', marginBottom: '8px' }}></i>
                        <h5 style={{ margin: '0 0 4px', color: '#1E293B' }}>{previewDoc.title}</h5>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>Verified Health Record</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI OCR Summary Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <i className="fa-solid fa-robot" style={{ color: '#16A34A' }}></i>
                      <strong style={{ fontSize: '0.8rem', color: '#166534' }}>AI OCR CLINICAL SUMMARY</strong>
                    </div>
                    <div style={{ fontSize: '0.84rem', lineHeight: '1.55', color: '#1E293B', whiteSpace: 'pre-line', maxHeight: '200px', overflowY: 'auto' }}>
                      {summaryText}
                    </div>
                  </div>

                  {diagnoses.length > 0 && (
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                        DIAGNOSES DETECTED
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {diagnoses.map((d, i) => (
                          <span key={i} style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {medications.length > 0 && (
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                        MEDICATIONS PRESCRIBED
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {medications.map((m, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '4px 6px', background: '#F8FAFC', borderRadius: '4px' }}>
                            <strong>{m.name} {m.strength ? `(${m.strength})` : ''}</strong>
                            <span style={{ color: '#64748B' }}>{m.dosage || ''} {m.frequency || ''} {m.duration ? `· ${m.duration}` : ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {investigations.length > 0 && (
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                        TEST PARAMETERS & RESULTS
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {investigations.map((t, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '4px 6px', background: t.abnormalAsReported ? '#FEF2F2' : '#F8FAFC', borderRadius: '4px' }}>
                            <span>{t.name}</span>
                            <strong style={{ color: t.abnormalAsReported ? '#DC2626' : '#1E293B' }}>
                              {t.value} {t.unit || ''} {t.abnormalAsReported ? '(ABNORMAL)' : ''}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {warnings.length > 0 && (
                    <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '8px 12px', fontSize: '0.75rem', color: '#92400E' }}>
                      <strong>Notice:</strong> {warnings.join('. ')}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  <i className="fa-solid fa-lock" style={{ marginRight: '4px', color: '#16A34A' }}></i>
                  Secure Medical Document
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn-outline" onClick={() => setPreviewDoc(null)}>
                    Close
                  </button>
                  {docUrl && (
                    <a
                      href={docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="primary-btn"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square"></i> Open Full File
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
