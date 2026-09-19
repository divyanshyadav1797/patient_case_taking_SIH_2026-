import React, { useState } from 'react';

const tokens = [
  { token: 'G-101', patient: 'Sunita Devi', issue: 'Gynecology', status: 'Called', time: '09:00 AM' },
  { token: 'G-102', patient: 'Arjun Singh', issue: 'General OPD', status: 'In Consultation', time: '09:30 AM' },
  { token: 'G-103', patient: 'Rekha Sharma', issue: 'Eye Care', status: 'Waiting', time: '10:00 AM' },
  { token: 'G-104', patient: 'Deepak Verma', issue: 'Cardiology', status: 'Waiting', time: '10:30 AM' },
  { token: 'G-105', patient: 'Fatima Khan', issue: 'Orthopedics', status: 'Registered', time: '11:00 AM' },
  { token: 'G-106', patient: 'Mohan Das', issue: 'General OPD', status: 'Registered', time: '11:15 AM' },
  { token: 'G-107', patient: 'Neeta Patel', issue: 'Skin & Hair', status: 'Registered', time: '11:30 AM' },
];

const statusColor = { Called: '#F59E0B', 'In Consultation': '#3B82F6', Waiting: '#8B5CF6', Registered: '#10B981' };

const summary = [
  { label: 'Total Tokens Today', value: '342' },
  { label: 'Waiting', value: '124' },
  { label: 'In Consultation', value: '18' },
  { label: 'Completed', value: '200' },
];

export default function HospitalOPD() {
  const [search, setSearch] = useState('');
  const filtered = tokens.filter(t => t.patient.toLowerCase().includes(search.toLowerCase()) || t.token.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>OPD Token Management</h1>
        <p style={{ color: '#64748B', margin: '0.2rem 0 0', fontSize: '0.85rem' }}>Outpatient Department — Live Queue</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {summary.map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '10px', padding: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#1E293B' }}>{s.value}</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search token or patient…" style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '0.875rem', width: '240px', outline: 'none' }} />
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['Token #', 'Patient', 'Department / Issue', 'Scheduled Time', 'Status'].map(h => (
                <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #E2E8F0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={t.token} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#3B82F6', fontSize: '0.9rem' }}>{t.token}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#1E293B', fontWeight: 500 }}>{t.patient}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>{t.issue}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>{t.time}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{ background: `${statusColor[t.status]}20`, color: statusColor[t.status], borderRadius: '20px', padding: '0.2rem 0.75rem', fontSize: '0.72rem', fontWeight: 600 }}>{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
