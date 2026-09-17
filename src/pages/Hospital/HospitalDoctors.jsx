import React from 'react';

const doctors = [
  { id: 'DOC-001', name: 'Dr. Sarah Jenkins', specialty: 'Cardiology', dept: 'Cardiology Wing', status: 'On Duty', patients: 12, shift: 'Morning' },
  { id: 'DOC-002', name: 'Dr. Raj Malhotra', specialty: 'Orthopedics', dept: 'Ortho Block', status: 'In OT', patients: 4, shift: 'Morning' },
  { id: 'DOC-003', name: 'Dr. Priya Mehta', specialty: 'Internal Medicine', dept: 'General OPD', status: 'On Duty', patients: 28, shift: 'Morning' },
  { id: 'DOC-004', name: 'Dr. Neha Jain', specialty: 'Ophthalmology', dept: 'Eye Care', status: 'On Duty', patients: 9, shift: 'Morning' },
  { id: 'DOC-005', name: 'Dr. Aakash Sharma', specialty: 'Cardiology', dept: 'Cardiology Wing', status: 'Off Duty', patients: 0, shift: 'Evening' },
  { id: 'DOC-006', name: 'Dr. Kavita Reddy', specialty: 'Gynecology', dept: 'Gynaecology', status: 'On Duty', patients: 14, shift: 'Morning' },
];

const statusColor = { 'On Duty': '#10B981', 'In OT': '#F59E0B', 'Off Duty': '#94A3B8' };

export default function HospitalDoctors() {
  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>Doctors</h1>
        <p style={{ color: '#64748B', margin: '0.2rem 0 0', fontSize: '0.85rem' }}>{doctors.filter(d => d.status !== 'Off Duty').length} doctors currently on duty</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {doctors.map(d => (
          <div key={d.id} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderTop: `3px solid ${statusColor[d.status]}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👨‍⚕️</div>
              <span style={{ background: `${statusColor[d.status]}20`, color: statusColor[d.status], borderRadius: '20px', padding: '0.2rem 0.75rem', fontSize: '0.72rem', fontWeight: 600 }}>{d.status}</span>
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1E293B', margin: '0 0 0.2rem' }}>{d.name}</h3>
            <p style={{ fontSize: '0.8rem', color: '#3B82F6', margin: 0, fontWeight: 500 }}>{d.specialty}</p>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '0.1rem 0 0' }}>{d.dept}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid #F1F5F9', fontSize: '0.78rem', color: '#64748B' }}>
              <span>Patients today: <strong style={{ color: '#1E293B' }}>{d.patients}</strong></span>
              <span>Shift: <strong style={{ color: '#1E293B' }}>{d.shift}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
