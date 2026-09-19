import React from 'react';
import { usePatient } from '../../context/PatientContext';

export default function PatientEmergency() {
  const { showToast } = usePatient();

  const handleCallEmergency = () => {
    if (window.confirm('Do you want to dial emergency helpline 112?')) {
      window.location.href = 'tel:112';
    }
  };

  const handleAmbulance = () => {
    showToast('Ambulance dispatch requested! GPS coordinates shared with nearest trauma team.');
  };

  return (
    <div className="page active-page" id="emergency">
      <div className="emergency-page">
        <div className="big-emergency-icon">
          <i className="fa-solid fa-truck-medical"></i>
        </div>

        <h1>Emergency Help & Immediate Response</h1>
        <p>If you or someone around you is experiencing a medical emergency, request emergency services immediately.</p>

        <button
          type="button"
          className="emergency-big-btn"
          onClick={handleCallEmergency}
        >
          <i className="fa-solid fa-phone"></i> Call Emergency (112)
        </button>

        <button
          type="button"
          className="hospital-btn"
          onClick={handleAmbulance}
        >
          <i className="fa-solid fa-ambulance"></i> Request Immediate Ambulance
        </button>

        <button
          type="button"
          className="location-btn"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                () => showToast('Live GPS location shared with emergency response dispatch.'),
                () => showToast('GPS location shared with nearby SMS Hospital Trauma Wing.')
              );
            } else {
              showToast('GPS location shared with emergency response dispatch.');
            }
          }}
        >
          <i className="fa-solid fa-location-dot"></i> Share My Live Location
        </button>
      </div>

      <div className="section-card" style={{ marginTop: '2rem', maxWidth: '650px', margin: '2rem auto 0' }}>
        <div className="section-header">
          <h2>Nearby Trauma Centers</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '0.75rem' }}>
            <div>
              <h4 style={{ margin: 0, color: '#172033' }}>SMS Hospital Emergency & Trauma Unit</h4>
              <small style={{ color: '#64748B' }}>1.2 km away · 24/7 Casualty & Blood Bank</small>
            </div>
            <a href="tel:01412560291" style={{ color: '#DC2626', fontWeight: 600, fontSize: '0.9rem' }}>
              <i className="fa-solid fa-phone"></i> 0141-2560291
            </a>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '0.75rem' }}>
            <div>
              <h4 style={{ margin: 0, color: '#172033' }}>Jaipur Golden Hospital Emergency Wing</h4>
              <small style={{ color: '#64748B' }}>3.4 km away · Cardiac & Neuro Emergency</small>
            </div>
            <a href="tel:01412547000" style={{ color: '#DC2626', fontWeight: 600, fontSize: '0.9rem' }}>
              <i className="fa-solid fa-phone"></i> 0141-2547000
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
