import React from 'react';
import { useDoctor } from '../../context/DoctorContext';

export default function PrescriptionsPage() {
  const { prescriptions, setIsCreateRxOpen, globalSearch, showToast } = useDoctor();

  const filteredPrescriptions = prescriptions.filter((rx) => {
    if (!globalSearch.trim()) return true;
    const q = globalSearch.toLowerCase();
    return (
      (rx.patient || '').toLowerCase().includes(q) ||
      (rx.diagnosis || '').toLowerCase().includes(q) ||
      (rx.medicines || '').toLowerCase().includes(q) ||
      (rx.id || '').toLowerCase().includes(q)
    );
  });

  return (
    <section id="viewPrescriptions" className="page-view active" role="region" aria-label="Prescriptions View">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-heading">Prescriptions</h1>
          <p className="page-subheading">Manage patient medications, dosages, and issued prescriptions.</p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn-primary"
            id="openCreatePrescriptionBtn"
            onClick={() => setIsCreateRxOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Prescription
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)' }}>Recent Prescriptions Issued</h2>
          <span className="count-pill" id="prescriptionsCountPill">
            {filteredPrescriptions.length} Prescriptions
          </span>
        </div>

        <div className="table-responsive">
          <table className="data-table" aria-label="Prescriptions Management Table">
            <thead>
              <tr>
                <th scope="col">Patient Name</th>
                <th scope="col">Date</th>
                <th scope="col">Diagnosis / Reason</th>
                <th scope="col">Medicines</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody id="prescriptionsTableBody">
              {filteredPrescriptions.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    No prescriptions found matching your query.
                  </td>
                </tr>
              ) : (
                filteredPrescriptions.map((rx) => (
                  <tr key={rx.id}>
                    <td>
                      <strong style={{ color: 'var(--text-dark)' }}>{rx.patient}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{rx.id}</div>
                    </td>
                    <td>{rx.date}</td>
                    <td>{rx.diagnosis}</td>
                    <td style={{ maxWidth: '300px' }}>
                      <code>{rx.medicines}</code>
                    </td>
                    <td>
                      <span className="badge-active">{rx.status}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-outline btn-sm"
                        onClick={() => showToast(`Printed prescription slip for ${rx.patient}`)}
                      >
                        Print Slip
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
