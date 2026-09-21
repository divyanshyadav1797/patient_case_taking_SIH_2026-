import React from 'react';

const procedures = [
  { id: 'OT-01', room: 'OT-01', procedure: 'Appendectomy', patient: 'Ramesh Kumar', surgeon: 'Dr. Raj Malhotra', status: 'Completed', start: '07:30 AM', end: '09:00 AM' },
  { id: 'OT-02', room: 'OT-02', procedure: 'Knee Replacement', patient: 'Amit Kumar', surgeon: 'Dr. Nitin Gupta', status: 'In Progress', start: '10:30 AM', end: '—' },
  { id: 'OT-03', room: 'OT-03', procedure: 'Cataract Surgery', patient: 'Usha Rani', surgeon: 'Dr. Neha Jain', status: 'Scheduled', start: '01:00 PM', end: '—' },
  { id: 'OT-04', room: 'OT-04', procedure: 'Cesarean Section', patient: 'Preeti Desai', surgeon: 'Dr. Kavita Sharma', status: 'Scheduled', start: '11:30 AM', end: '—' },
  { id: 'OT-05', room: 'OT-05', procedure: 'Angioplasty', patient: 'Mohan Lal', surgeon: 'Dr. Sarah Jenkins', status: 'Prep', start: '12:00 PM', end: '—' },
];

const statusColor = { Completed: '#10B981', 'In Progress': '#3B82F6', Scheduled: '#8B5CF6', Prep: '#F59E0B' };

export default function HospitalOperations() {
  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>Operations / OT Schedule</h1>
        <p style={{ color: '#64748B', margin: '0.2rem 0 0', fontSize: '0.85rem' }}>Operating Theatre management — today's schedule</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {procedures.map(p => (
          <div key={p.id} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderLeft: `4px solid ${statusColor[p.status]}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{p.room}</span>
              <span style={{ background: `${statusColor[p.status]}20`, color: statusColor[p.status], borderRadius: '20px', padding: '0.2rem 0.65rem', fontSize: '0.72rem', fontWeight: 600 }}>{p.status}</span>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', margin: '0 0 0.4rem' }}>{p.procedure}</h3>
            <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0 }}>Patient: <strong>{p.patient}</strong></p>
            <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0.2rem 0 0' }}>Surgeon: <strong>{p.surgeon}</strong></p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9', fontSize: '0.78rem', color: '#94A3B8' }}>
              <span>Start: <strong style={{ color: '#475569' }}>{p.start}</strong></span>
              <span>End: <strong style={{ color: '#475569' }}>{p.end}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
