import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePatient } from '../../context/PatientContext';

export default function PatientMyScheme() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = usePatient();

  return (
    <div className="page active-page" id="my-scheme">
      <div className="page-header">
        <h1>My Government Scheme</h1>
        <p>Your registered government healthcare scheme, digital beneficiary e-card, and coverage details.</p>
      </div>

      <div className="my-scheme-card">
        <div className="my-scheme-top">
          <div className="my-scheme-logo">
            <i className="fa-solid fa-building-columns"></i>
          </div>

          <div>
            <span>Registered Scheme</span>
            <h2>RGHS</h2>
            <p>Rajasthan Government Health Scheme</p>
          </div>

          <div className="active-status">
            <i className="fa-solid fa-circle"></i> Active
          </div>
        </div>

        <div className="scheme-information">
          <div>
            <span>Beneficiary ID</span>
            <strong>RGHS-RJ-2024-99120</strong>
          </div>

          <div>
            <span>Family Members</span>
            <strong>4 Enrolled Members</strong>
          </div>

          <div>
            <span>Primary Cardholder</span>
            <strong>{user?.name || 'Rahul Sharma'}</strong>
          </div>

          <div>
            <span>Status</span>
            <strong className="green-text">Verified Active</strong>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          margin: '1.5rem 0',
          padding: '1.25rem',
          background: '#F8FAFC',
          borderRadius: '0.75rem',
          border: '1px solid #E2E8F0'
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Total Annual Coverage</span>
            <h3 style={{ margin: '0.25rem 0', color: '#2563EB', fontSize: '1.5rem' }}>₹10,00,000</h3>
            <small style={{ color: '#16A34A' }}>100% Cashless Inpatient & Daycare</small>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Available Balance</span>
            <h3 style={{ margin: '0.25rem 0', color: '#16A34A', fontSize: '1.5rem' }}>₹9,54,800</h3>
            <small style={{ color: '#64748B' }}>Used: ₹45,200 (Current FY)</small>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>OPD Pharmacy Quota</span>
            <h3 style={{ margin: '0.25rem 0', color: '#7C3AED', fontSize: '1.5rem' }}>₹20,000 / yr</h3>
            <small style={{ color: '#64748B' }}>Available: ₹14,200</small>
          </div>
        </div>

        <div className="my-scheme-actions">
          <button
            type="button"
            className="primary-btn"
            onClick={() => navigate('/patient/schemes')}
          >
            <i className="fa-solid fa-hospital"></i> Find Scheme Hospitals
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={() => showToast('Digital RGHS Health Card downloaded (PDF).')}
          >
            <i className="fa-solid fa-id-card"></i> Download E-Card
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={() => showToast('Claim settlement statement generated.')}
          >
            <i className="fa-solid fa-file-invoice"></i> View Claims History
          </button>
        </div>
      </div>
    </div>
  );
}
