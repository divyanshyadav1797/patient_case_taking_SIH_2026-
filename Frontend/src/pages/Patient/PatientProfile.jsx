import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePatient } from '../../context/PatientContext';
import api from '../../services/api';

export default function PatientProfile() {
  const { user } = useAuth();
  const { showToast } = usePatient();
  const [timeline, setTimeline] = useState([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [showHealthProfileModal, setShowHealthProfileModal] = useState(false);

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

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
          <button
            type="button"
            className="primary-btn"
            onClick={() => setShowHealthProfileModal(true)}
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              padding: '0.75rem 1.4rem',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            <i className="fa-solid fa-id-card-clip"></i>
            Request Digital Health Profile
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={() => showToast('Profile edit mode enabled. You can update emergency contacts.')}
            style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              color: '#334155',
              fontWeight: 600,
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            Edit Profile
          </button>
        </div>
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

      {/* =========================================================================
          DIGITAL HEALTH PROFILE & ABDM / ABHA HEALTH PASS MODAL
          ========================================================================= */}
      {showHealthProfileModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="healthProfileTitle"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setShowHealthProfileModal(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              border: '1px solid #E2E8F0',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tricolor Government / ABDM Top Banner */}
            <div style={{ height: '6px', width: '100%', background: 'linear-gradient(90deg, #FF9933 0%, #FF9933 33.3%, #FFFFFF 33.3%, #FFFFFF 66.6%, #138808 66.6%, #138808 100%)' }} />

            {/* Health Pass Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <i className="fa-solid fa-hospital-user" style={{ fontSize: '1.2rem' }}></i>
                </div>
                <div>
                  <h3 id="healthProfileTitle" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                    Ayushman Bharat Digital Health Pass
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748B' }}>
                    National Health Authority (NHA) · ABHA Integrated
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHealthProfileModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '1.25rem', padding: '4px 8px' }}
                aria-label="Close Health Profile"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Health Pass Body */}
            <div style={{ padding: '1.5rem' }}>
              {/* ID Card Box */}
              <div style={{
                background: 'linear-gradient(145deg, #1E293B 0%, #0F172A 100%)',
                color: '#FFFFFF',
                borderRadius: '16px',
                padding: '1.5rem',
                position: 'relative',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
                border: '1px solid #334155'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', fontWeight: 600 }}>
                      Digital Health ID / ABHA
                    </span>
                    <h4 style={{ margin: '4px 0 0', fontSize: '1.25rem', letterSpacing: '1px', color: '#38BDF8', fontWeight: 700 }}>
                      91-4521-8890-2341
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>
                      {user?.name?.toLowerCase().replace(/\s+/g, '') || 'rahul.sharma'}@abdm
                    </span>
                  </div>
                  <span style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid #10B981',
                    color: '#34D399',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <i className="fa-solid fa-circle-check"></i> Aadhaar Verified
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F8FAFC' }}>
                      {user?.name || 'Rahul Sharma'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
                      DOB: 12 Mar 1998 · Age: 28 · Gender: Male
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
                      Blood Group: <strong style={{ color: '#F87171' }}>B Positive (B+)</strong> · Donor: <strong style={{ color: '#34D399' }}>Registered</strong>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#E2E8F0', marginTop: '8px', background: 'rgba(255,255,255,0.08)', padding: '4px 8px', borderRadius: '6px' }}>
                      Scheme: <strong>RGHS (Beneficiary #2024-99120)</strong>
                    </div>
                  </div>

                  {/* QR Code Graphic for Kiosk Walk-in Check-in */}
                  <div style={{ background: '#FFFFFF', padding: '6px', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <svg width="86" height="86" viewBox="0 0 100 100" fill="#0F172A">
                      {/* Corner 1 */}
                      <rect x="5" y="5" width="30" height="30" rx="4" fill="#0F172A" />
                      <rect x="10" y="10" width="20" height="20" rx="2" fill="#FFFFFF" />
                      <rect x="15" y="15" width="10" height="10" rx="1" fill="#0F172A" />
                      {/* Corner 2 */}
                      <rect x="65" y="5" width="30" height="30" rx="4" fill="#0F172A" />
                      <rect x="70" y="10" width="20" height="20" rx="2" fill="#FFFFFF" />
                      <rect x="75" y="15" width="10" height="10" rx="1" fill="#0F172A" />
                      {/* Corner 3 */}
                      <rect x="5" y="65" width="30" height="30" rx="4" fill="#0F172A" />
                      <rect x="10" y="70" width="20" height="20" rx="2" fill="#FFFFFF" />
                      <rect x="15" y="75" width="10" height="10" rx="1" fill="#0F172A" />
                      {/* QR Pattern Data Dots */}
                      <rect x="42" y="8" width="6" height="14" rx="1" />
                      <rect x="52" y="18" width="8" height="6" rx="1" />
                      <rect x="40" y="28" width="18" height="6" rx="1" />
                      <rect x="8" y="42" width="12" height="6" rx="1" />
                      <rect x="25" y="45" width="8" height="12" rx="1" />
                      <rect x="42" y="42" width="16" height="16" rx="2" fill="#2563EB" />
                      <rect x="65" y="45" width="12" height="8" rx="1" />
                      <rect x="82" y="42" width="10" height="14" rx="1" />
                      <rect x="42" y="66" width="14" height="8" rx="1" />
                      <rect x="62" y="62" width="8" height="14" rx="1" />
                      <rect x="75" y="65" width="18" height="8" rx="1" />
                      <rect x="45" y="82" width="14" height="10" rx="1" />
                      <rect x="68" y="80" width="12" height="12" rx="1" />
                      <rect x="85" y="82" width="8" height="10" rx="1" />
                    </svg>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                      SCAN AT KIOSK
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#94A3B8' }}>
                  <span>Patient ID: <strong>{user?.id || 'MC-10245'}</strong></span>
                  <span>Emergency: <strong>{user?.phone || '+91 98765 43210'}</strong></span>
                </div>
              </div>

              {/* ABDM Interoperability Notice */}
              <div style={{ marginTop: '1rem', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '0.85rem', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <i className="fa-solid fa-shield-halved" style={{ color: '#2563EB', fontSize: '1.1rem', marginTop: '2px' }}></i>
                <div style={{ fontSize: '0.8rem', color: '#1E40AF', lineHeight: 1.45 }}>
                  <strong>Digital Health Card Benefits:</strong> Present this QR pass at any Quantum Care Hospital Kiosk or Partner Hospital for zero-wait registration, instant consent-driven medical timeline sharing, and biometric validation.
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    showToast('Digital Health Pass sent to printer / PDF exporter.');
                  }}
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    fontWeight: 600,
                    padding: '0.6rem 1.1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem'
                  }}
                >
                  <i className="fa-solid fa-print"></i> Print Card
                </button>

                <button
                  type="button"
                  onClick={() => {
                    showToast('ABHA Digital Health Pass downloaded for offline Kiosk check-in.');
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  <i className="fa-solid fa-download"></i> Download QR Pass
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
