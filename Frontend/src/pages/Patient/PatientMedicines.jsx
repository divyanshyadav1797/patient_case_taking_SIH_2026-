import React from 'react';
import { usePatient } from '../../context/PatientContext';

export default function PatientMedicines() {
  const { medicines, showToast } = usePatient();

  return (
    <div className="page active-page" id="medicines">
      <div className="page-header">
        <h1>My Medicines</h1>
        <p>Keep track of your medicines, dosages, and daily reminder schedule.</p>
      </div>

      <div className="medicine-list">
        {medicines.length === 0 ? (
          <div className="section-card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#64748B' }}>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>
              No active prescriptions or medications on record. Prescriptions issued by your doctor will appear here with dosage reminders.
            </p>
          </div>
        ) : (
          medicines.map((med) => (
            <div className="medicine-card" key={med.id}>
              <div className="medicine-icon">💊</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>{med.name}</h3>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '9999px',
                    fontWeight: 600,
                    background: med.status === 'active' ? '#DCFCE7' : '#FEF3C7',
                    color: med.status === 'active' ? '#16A34A' : '#B45309'
                  }}>
                    {med.status === 'active' ? 'Active' : 'Refill Needed'}
                  </span>
                </div>
                <p>{med.dosage} · Prescribed by {med.doctor}</p>
                <div className="dose">
                  ☀️ {med.frequency} · Remaining: <strong>{med.remaining}</strong>
                </div>
                <small>Next dose reminder: Scheduled Today 8:00 PM</small>
              </div>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => showToast(`Refill request sent for ${med.name} to empaneled pharmacy.`)}
                style={{ marginLeft: '1rem', whiteSpace: 'nowrap' }}
              >
                Order Refill
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
