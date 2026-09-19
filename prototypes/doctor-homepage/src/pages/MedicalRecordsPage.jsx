import React, { useState } from 'react';
import { useDoctor } from '../context/DoctorContext';

export default function MedicalRecordsPage() {
  const { records, globalSearch, setPreviewDoc, showToast } = useDoctor();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [localSearch, setLocalSearch] = useState('');

  const searchKeyword = globalSearch || localSearch;

  const filteredRecords = records.filter((rec) => {
    if (categoryFilter !== 'all') {
      if (rec.filterCategory !== categoryFilter) return false;
    }
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      const matchPatient = (rec.patient || '').toLowerCase().includes(q);
      const matchTitle = (rec.title || '').toLowerCase().includes(q);
      const matchType = (rec.type || '').toLowerCase().includes(q);
      const matchBy = (rec.uploadedBy || '').toLowerCase().includes(q);
      if (!matchPatient && !matchTitle && !matchType && !matchBy) return false;
    }
    return true;
  });

  return (
    <section id="viewMedicalRecords" className="page-view active" role="region" aria-label="Medical Records View">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-heading">Medical Records</h1>
          <p className="page-subheading">Search, inspect, and manage diagnostic reports and clinical documents.</p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn-primary"
            id="openUploadRecordBtn"
            onClick={() => showToast('Record upload dialog opened. Select PDF/DICOM file.')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload Record
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-search-box">
            <span className="table-search-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              id="recordsSearchInput"
              className="table-search-input"
              placeholder="Search records by patient, type..."
              aria-label="Search records"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
          <div className="filter-pill-group" id="recordFilterGroup">
            {[
              { id: 'all', label: 'All Documents' },
              { id: 'lab', label: 'Lab Reports' },
              { id: 'prescription', label: 'Prescriptions' },
              { id: 'imaging', label: 'Imaging & Scans' }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`filter-pill ${categoryFilter === cat.id ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table" aria-label="Clinical Records Table">
            <thead>
              <tr>
                <th scope="col">Patient</th>
                <th scope="col">Record Type</th>
                <th scope="col">Date</th>
                <th scope="col">Uploaded By</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody id="recordsTableBody">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    No medical records found matching your query.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id}>
                    <td>
                      <strong style={{ color: 'var(--text-dark)' }}>{rec.patient}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{rec.patientId}</div>
                    </td>
                    <td>
                      <div>
                        <strong>{rec.title}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{rec.type}</div>
                      </div>
                    </td>
                    <td>{rec.date}</td>
                    <td>{rec.uploadedBy}</td>
                    <td>
                      <span className="badge-active" style={{ backgroundColor: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0' }}>
                        {rec.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-outline btn-sm"
                        onClick={() => setPreviewDoc(rec)}
                      >
                        View
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
  );
}
