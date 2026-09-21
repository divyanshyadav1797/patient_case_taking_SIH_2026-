import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function HospitalSettings() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    hospitalName: user?.name || 'SMS Hospital Jaipur',
    email: user?.email || 'admin@smshospital.org',
    phone: '+91 141 256 0000',
    address: 'JLN Marg, Tonk Road, Jaipur, Rajasthan 302004',
    facilityType: user?.facilityType || 'Super Specialty Government Hospital',
    regNo: user?.regNo || 'RJ-MED-2014-991',
    bedCapacity: '480',
    emergencyContact: '+91 141 256 0911',
    notificationsEmail: true,
    notificationsSMS: true,
    autoBackup: true,
  });

  const [saved, setSaved] = useState(false);
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const save = e => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const field = (label, name, type = 'text') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{label}</label>
      <input type={type} name={name} value={form[name]} onChange={handle}
        style={{ padding: '0.6rem 0.875rem', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '0.875rem', outline: 'none', color: '#1E293B' }} />
    </div>
  );

  const toggle = (label, name) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #F1F5F9' }}>
      <span style={{ fontSize: '0.875rem', color: '#334155' }}>{label}</span>
      <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
        <input type="checkbox" name={name} checked={form[name]} onChange={handle} style={{ opacity: 0, width: 0, height: 0 }} />
        <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: form[name] ? '#3B82F6' : '#CBD5E1', borderRadius: '12px', transition: '0.2s' }}>
          <span style={{ position: 'absolute', height: '18px', width: '18px', left: form[name] ? '23px' : '3px', bottom: '3px', background: '#fff', borderRadius: '50%', transition: '0.2s' }} />
        </span>
      </label>
    </div>
  );

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Inter, sans-serif', maxWidth: '720px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>Hospital Settings</h1>
        <p style={{ color: '#64748B', margin: '0.2rem 0 0', fontSize: '0.85rem' }}>Manage hospital profile and preferences</p>
      </div>

      {saved && (
        <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: '10px', padding: '0.875rem 1rem', marginBottom: '1.25rem', color: '#065F46', fontSize: '0.875rem', fontWeight: 500 }}>
          ✓ Settings saved successfully.
        </div>
      )}

      <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '1rem' }}>Hospital Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {field('Hospital Name', 'hospitalName')}
            {field('Registration Number', 'regNo')}
            {field('Email Address', 'email', 'email')}
            {field('Phone Number', 'phone')}
            {field('Bed Capacity', 'bedCapacity', 'number')}
            {field('Emergency Contact', 'emergencyContact')}
          </div>
          <div style={{ marginTop: '1rem' }}>{field('Address', 'address')}</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.75rem' }}>Preferences</h2>
          {toggle('Email Notifications', 'notificationsEmail')}
          {toggle('SMS Notifications', 'notificationsSMS')}
          {toggle('Automatic Data Backup', 'autoBackup')}
        </div>

        <button type="submit" style={{ padding: '0.875rem', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
          Save Settings
        </button>
      </form>
    </div>
  );
}
