import React, { useState } from 'react';

const initialPatients = [
  { id: 'P-10249', name: 'Manoj Tiwari', age: 45, dept: 'Trauma Emergency', doctor: 'Dr. Mehta', status: 'Admitted', bed: 'Bay 04', date: '17 Sep 2026' },
  { id: 'P-10248', name: 'Sunita Devi', age: 32, dept: 'Gynecology', doctor: 'Dr. Sharma', status: 'OPD', bed: '—', date: '17 Sep 2026' },
  { id: 'P-10247', name: 'Rakesh Gupta', age: 58, dept: 'Cardiology', doctor: 'Dr. Jain', status: 'ICU', bed: 'ICU-03', date: '16 Sep 2026' },
  { id: 'P-10246', name: 'Priya Nair', age: 27, dept: 'Orthopedics', doctor: 'Dr. Malhotra', status: 'Discharged', bed: '—', date: '16 Sep 2026' },
  { id: 'P-10245', name: 'Arjun Singh', age: 19, dept: 'General OPD', doctor: 'Dr. Sharma', status: 'OPD', bed: '—', date: '17 Sep 2026' },
  { id: 'P-10244', name: 'Kavitha Reddy', age: 41, dept: 'Dermatology', doctor: 'Dr. Rao', status: 'Admitted', bed: 'Ward-B-12', date: '15 Sep 2026' },
];

const statusColor = { Admitted: '#3B82F6', OPD: '#8B5CF6', ICU: '#EF4444', Discharged: '#10B981' };

export default function HospitalPatients() {
  const [search, setSearch] = useState('');
  const filtered = initialPatients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>Patient Management</h1>
          <p style={{ color: '#64748B', margin: '0.2rem 0 0', fontSize: '0.85rem' }}>{initialPatients.length} records today</p>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, ID, or department…"
          style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '0.875rem', width: '260px', outline: 'none' }}
        />
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['Patient ID', 'Name', 'Age', 'Department', 'Doctor', 'Status', 'Bed / Room', 'Date'].map(h => (
                <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #E2E8F0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: '#3B82F6', fontWeight: 600 }}>{p.id}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#1E293B', fontWeight: 500 }}>{p.name}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>{p.age}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>{p.dept}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>{p.doctor}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{ background: `${statusColor[p.status]}20`, color: statusColor[p.status], borderRadius: '20px', padding: '0.2rem 0.75rem', fontSize: '0.75rem', fontWeight: 600 }}>{p.status}</span>
                </td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>{p.bed}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: '#94A3B8' }}>{p.date}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.9rem' }}>No patients found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
