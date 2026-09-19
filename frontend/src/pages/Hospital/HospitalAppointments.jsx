import React, { useState } from 'react';

const appointments = [
  { id: 'APT-1001', patient: 'Sunita Devi', doctor: 'Dr. Kavita Reddy', dept: 'Gynecology', time: '09:00 AM', date: '17 Sep 2026', status: 'Completed', token: 'G-101' },
  { id: 'APT-1002', patient: 'Arjun Singh', doctor: 'Dr. Priya Mehta', dept: 'General OPD', time: '09:30 AM', date: '17 Sep 2026', status: 'In Progress', token: 'G-102' },
  { id: 'APT-1003', patient: 'Rekha Sharma', doctor: 'Dr. Neha Jain', dept: 'Eye Care', time: '10:00 AM', date: '17 Sep 2026', status: 'Waiting', token: 'G-103' },
  { id: 'APT-1004', patient: 'Deepak Verma', doctor: 'Dr. Sarah Jenkins', dept: 'Cardiology', time: '10:30 AM', date: '17 Sep 2026', status: 'Waiting', token: 'G-104' },
  { id: 'APT-1005', patient: 'Fatima Khan', doctor: 'Dr. Raj Malhotra', dept: 'Orthopedics', time: '11:00 AM', date: '17 Sep 2026', status: 'Scheduled', token: 'G-105' },
];

const statusColor = { Completed: '#10B981', 'In Progress': '#3B82F6', Waiting: '#F59E0B', Scheduled: '#8B5CF6' };

export default function HospitalAppointments() {
  const [filter, setFilter] = useState('All');
  const statuses = ['All', 'Scheduled', 'Waiting', 'In Progress', 'Completed'];
  const filtered = filter === 'All' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>Appointments</h1>
        <p style={{ color: '#64748B', margin: '0.2rem 0 0', fontSize: '0.85rem' }}>{appointments.length} appointments scheduled today</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '0.4rem 1rem', borderRadius: '20px', border: '1.5px solid', borderColor: filter === s ? '#3B82F6' : '#E2E8F0', background: filter === s ? '#EFF6FF' : '#fff', color: filter === s ? '#3B82F6' : '#64748B', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>
            {s}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['Token', 'Patient', 'Doctor', 'Department', 'Time', 'Date', 'Status'].map(h => (
                <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #E2E8F0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => (
              <tr key={a.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', fontWeight: 700, color: '#3B82F6' }}>{a.token}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#1E293B', fontWeight: 500 }}>{a.patient}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>{a.doctor}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>{a.dept}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>{a.time}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: '#94A3B8' }}>{a.date}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{ background: `${statusColor[a.status]}20`, color: statusColor[a.status], borderRadius: '20px', padding: '0.2rem 0.75rem', fontSize: '0.72rem', fontWeight: 600 }}>{a.status}</span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>No appointments found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
