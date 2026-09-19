import React, { useState } from 'react';
import { useDoctor } from '../../context/DoctorContext';

export default function SettingsPage() {
  const { doctor, setDoctor, showToast } = useDoctor();

  const [name, setName] = useState(doctor.name);
  const [specialty, setSpecialty] = useState(doctor.specialty);
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('dr.sharma@medicare.health');
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [notifApt, setNotifApt] = useState(true);
  const [notifEmergency, setNotifEmergency] = useState(true);
  const [consultDuration, setConsultDuration] = useState('15');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const handleSave = (e) => {
    e.preventDefault();
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    setDoctor((prev) => ({
      ...prev,
      name,
      specialty,
      initials: initials || 'DR',
      greeting: `Good morning, ${name}`
    }));

    showToast('Settings saved successfully!');
  };

  return (
    <section id="viewSettings" className="page-view active" role="region" aria-label="Settings View">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-heading">Settings</h1>
          <p className="page-subheading">Configure practice details, account credentials, and system preferences.</p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn-primary" id="saveSettingsBtn" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>

      <div className="settings-grid">
        {/* Profile Settings Card */}
        <div className="settings-card">
          <h2 className="settings-card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profile Settings
          </h2>
          <div className="form-group">
            <label htmlFor="settingDoctorName" className="form-label">Doctor Name</label>
            <input
              type="text"
              id="settingDoctorName"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="settingSpecialty" className="form-label">Specialty</label>
            <input
              type="text"
              id="settingSpecialty"
              className="form-control"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="settingPhone" className="form-label">Phone Number</label>
            <input
              type="tel"
              id="settingPhone"
              className="form-control"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="settingEmail" className="form-label">Email Address</label>
            <input
              type="email"
              id="settingEmail"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Account Settings Card */}
        <div className="settings-card">
          <h2 className="settings-card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Account & Credentials
          </h2>
          <div className="form-group">
            <label htmlFor="settingCurrentPassword" className="form-label">Current Password</label>
            <input
              type="password"
              id="settingCurrentPassword"
              className="form-control"
              placeholder="••••••••"
              value={curPass}
              onChange={(e) => setCurPass(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="settingNewPassword" className="form-label">New Password</label>
            <input
              type="password"
              id="settingNewPassword"
              className="form-control"
              placeholder="••••••••"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
          </div>
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-dark)' }}>Notifications</h3>
            <div className="toggle-switch-row">
              <div>
                <div className="toggle-switch-label">Appointment Reminders</div>
                <div className="toggle-switch-desc">Receive notifications for upcoming patient consultations</div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifApt}
                  onChange={(e) => setNotifApt(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="toggle-switch-row">
              <div>
                <div className="toggle-switch-label">Emergency Alerts</div>
                <div className="toggle-switch-desc">Instant alerts for critical lab results & triage</div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifEmergency}
                  onChange={(e) => setNotifEmergency(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Preferences Card */}
        <div className="settings-card" style={{ gridColumn: '1 / -1' }}>
          <h2 className="settings-card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Preferences
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="settingConsultDuration" className="form-label">Default Consultation Slot</label>
              <select
                id="settingConsultDuration"
                className="form-control"
                value={consultDuration}
                onChange={(e) => setConsultDuration(e.target.value)}
              >
                <option value="15">15 Minutes</option>
                <option value="20">20 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="settingStartTime" className="form-label">Clinic Start Time</label>
              <input
                type="time"
                id="settingStartTime"
                className="form-control"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="settingEndTime" className="form-label">Clinic End Time</label>
              <input
                type="time"
                id="settingEndTime"
                className="form-control"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
