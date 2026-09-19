import React, { useState } from 'react';

const records = [
  { id: 'REC-5001', patient: 'P-10249', name: 'Manoj Tiwari', type: 'Admission Report', dept: 'Trauma Emergency', date: '17 Sep 2026', doctor: 'Dr. Priya Mehta', status: 'Active' },
  { id: 'REC-5002', patient: 'P-10247', name: 'Rakesh Gupta', type: 'ICU Progress Note', dept: 'Cardiology', date: '17 Sep 2026', doctor: 'Dr. Sarah Jenkins', status: 'Active' },
  { id: 'REC-5003', patient: 'P-10246', name: 'Priya Nair', type: 'Discharge Summary', dept: 'Orthopedics', date: '16 Sep 2026', doctor: 'Dr. Malhotra', status: 'Archived' },
  { id: 'REC-5004', patient: 'P-10244', name: 'Kavitha Reddy', type: 'Lab Report', dept: 'Dermatology', date: '15 Sep 2026', doctor: 'Dr. Anjali Rao', status: 'Active' },
  { id: 'REC-5005', patient: 'P-10243', name: 'Suresh Pillai', type: 'Radiology Scan', dept: 'General OPD', date: '14 Sep 2026', doctor: 'Dr. Mehta', status: 'Archived' },
];

const statusColor = { Active: '#10B981', Archived: '#94A3B8' };

export default function HospitalRecords() {
  const [search, setSearch] = useState('');
  const filtered = records.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>Medical Records</h1>
          <p style={{ color: '#64748B', margin: '0.2rem 0 0', fontSize: '0.85rem' }}>Central medical record registry</p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by patient or record ID…" style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '0.875rem', width: '260px', outline: 'none' }} />
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['Record ID', 'Patient', 'Record Type', 'Department', 'Doctor', 'Date', 'Status'].map(h => (
                <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #E2E8F0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', fontWeight: 600, color: '#3B82F6' }}>{r.id}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#1E293B', fontWeight: 500 }}>{r.name}<br /><small style={{ color: '#94A3B8' }}>{r.patient}</small></td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>{r.type}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>{r.dept}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>{r.doctor}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: '#94A3B8' }}>{r.date}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{ background: `${statusColor[r.status]}20`, color: statusColor[r.status], borderRadius: '20px', padding: '0.2rem 0.75rem', fontSize: '0.72rem', fontWeight: 600 }}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
