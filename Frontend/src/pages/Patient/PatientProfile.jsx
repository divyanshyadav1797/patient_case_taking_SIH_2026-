import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePatient } from '../../context/PatientContext';

export default function PatientProfile() {
  const { user } = useAuth();
  const { showToast } = usePatient();

  return (
    <div className="page active-page" id="profile">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal identification, ABHA health record, and contact details.</p>
      </div>

      <div className="profile-card">
        <div className="profile-large">
          {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'RS'}
        </div>

        <h2>{user?.name || 'Rahul Sharma'}</h2>
        <p>Patient ID: {user?.id || 'MC-10245'} · ABHA: 91-4521-8890-2341</p>

        <div className="profile-info">
          <div>
            <span>Phone Number</span>
            <strong>{user?.phone || '+91 98765 43210'}</strong>
          </div>

          <div>
            <span>Email Address</span>
            <strong>{user?.email || 'rahul.sharma@example.com'}</strong>
          </div>

          <div>
            <span>Date of Birth</span>
            <strong>12 March 1998 (Age 28)</strong>
          </div>

          <div>
            <span>Blood Group</span>
            <strong style={{ color: '#DC2626' }}>B Positive (B+)</strong>
          </div>

          <div>
            <span>Active Government Scheme</span>
            <strong>RGHS (Beneficiary #2024-99120)</strong>
          </div>

          <div>
            <span>Emergency Contact</span>
            <strong>Pooja Sharma (Spouse) · +91 98765 11223</strong>
          </div>
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={() => showToast('Profile edit mode enabled.')}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}
