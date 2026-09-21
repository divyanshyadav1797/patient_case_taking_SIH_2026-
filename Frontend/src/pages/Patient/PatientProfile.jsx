import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePatient } from '../../context/PatientContext';
import api from '../../services/api';

export default function PatientProfile() {
  const { user } = useAuth();
  const { showToast } = usePatient();
  const [timeline, setTimeline] = useState([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  useEffect(() => {
    let mounted = true;
    const patientId = user?.id || 'P1001';
    setLoadingTimeline(true);

    api.getPatientHistory(patientId)
      .then((res) => {
        if (!mounted) return;
        if (res && Array.isArray(res.timeline)) {
          setTimeline(res.timeline);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch patient history:', err.message);
      })
      .finally(() => {
        if (mounted) setLoadingTimeline(false);
      });

    return () => { mounted = false; };
  }, [user]);

  return (
    <div className="page active-page" id="profile">
      <div className="page-header">
        <h1>My Profile & Health History</h1>
        <p>Manage your personal identification, ABHA health record, and chronological medical history.</p>
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

      {/* Chronological Medical History Timeline */}
      <div className="section-card" style={{ marginTop: '2rem' }}>
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Chronological Medical History</h2>
            <small style={{ color: '#64748B' }}>
              All appointments, AI clinical intake sessions, prescriptions, and records recorded across visits.
            </small>
          </div>
          <span style={{ fontSize: '0.8rem', background: '#F1F5F9', color: '#475569', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
            {timeline.length} Events Logged
          </span>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          {loadingTimeline ? (
            <p style={{ color: '#64748B', textAlign: 'center', padding: '1rem' }}>Loading health history...</p>
          ) : timeline.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', background: '#F8FAFC', borderRadius: '0.75rem', color: '#64748B' }}>
              <p style={{ margin: 0 }}>No medical timeline events recorded yet. Completed appointments and AI clinical consultations will appear here automatically.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '2px solid #E2E8F0', paddingLeft: '1.5rem', marginLeft: '1rem' }}>
              {timeline.map((evt, idx) => {
                let badgeColor = '#2563EB';
                let iconClass = 'fa-calendar-check';
                if (evt.type === 'Clinical Report') {
                  badgeColor = '#059669';
                  iconClass = 'fa-file-medical';
                } else if (evt.type === 'Prescription') {
                  badgeColor = '#7C3AED';
                  iconClass = 'fa-pills';
                } else if (evt.type === 'Medical Record') {
                  badgeColor = '#D97706';
                  iconClass = 'fa-flask';
                }

                return (
                  <div key={idx} style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '-2.15rem',
                      top: '0.2rem',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: badgeColor,
                      border: '3px solid #FFFFFF',
                      boxShadow: '0 0 0 1px #CBD5E1'
                    }} />
                    <div style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '0.75rem',
                      padding: '1rem 1.25rem',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: badgeColor, textTransform: 'uppercase' }}>
                            {evt.type}
                          </span>
                          <strong style={{ color: '#0F172A', fontSize: '0.95rem' }}>{evt.title}</strong>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                          {new Date(evt.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '0.875rem', lineHeight: 1.5 }}>
                        {evt.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
