import React, { useState } from 'react';
import { usePatient } from '../../context/PatientContext';

export default function PatientRecords() {
  const { records, showToast } = usePatient();
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <div className="page active-page" id="records">
      <div className="page-header">
        <h1>My Health Records</h1>
        <p>Access your medical reports, scans, and diagnostic documents.</p>
      </div>

      <div className="records-grid">
        <div className="record-card" onClick={() => { setActiveCategory('prescriptions'); showToast('Viewing 5 active prescriptions.'); }}>
          <i className="fa-solid fa-prescription-bottle-medical"></i>
          <h3>Prescriptions</h3>
          <p>5 documents</p>
          <button type="button">View Records</button>
        </div>

        <div className="record-card" onClick={() => { setActiveCategory('lab'); showToast('Viewing 8 laboratory test reports.'); }}>
          <i className="fa-solid fa-flask"></i>
          <h3>Lab Reports</h3>
          <p>8 reports</p>
          <button type="button">View Reports</button>
        </div>

        <div className="record-card" onClick={() => { setActiveCategory('scans'); showToast('Viewing 3 imaging & MRI scans.'); }}>
          <i className="fa-solid fa-x-ray"></i>
          <h3>Scans & X-Rays</h3>
          <p>3 reports</p>
          <button type="button">View Reports</button>
        </div>
      </div>

      <div className="section-card" style={{ marginTop: '2rem' }}>
        <div className="section-header">
          <h2>Recent Medical Files</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {records.map((rec) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}
