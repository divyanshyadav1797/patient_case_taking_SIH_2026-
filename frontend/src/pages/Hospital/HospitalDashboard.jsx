import React from 'react';
import { useAuth } from '../../context/AuthContext';

const stats = [
  { label: 'Total Patients Today', value: '1,248', delta: '+12% vs yesterday', icon: '👥', color: '#3B82F6' },
  { label: 'OPD Tokens Issued', value: '342', delta: '87 pending', icon: '🎫', color: '#8B5CF6' },
  { label: 'Beds Available', value: '124 / 480', delta: '26% free', icon: '🛏️', color: '#10B981' },
  { label: 'Surgeries Scheduled', value: '18', delta: '3 in progress', icon: '⚕️', color: '#F59E0B' },
  { label: 'Doctors On Duty', value: '64', delta: '8 departments', icon: '👨‍⚕️', color: '#EF4444' },
  { label: 'Emergency Cases', value: '7', delta: '2 critical', icon: '🚨', color: '#DC2626' },
];

const recentActivities = [
  { time: '09:42 AM', event: 'New admission — Manoj Tiwari (Trauma Bay 04)', type: 'admission' },
  { time: '09:28 AM', event: 'OT-02 procedure started — Knee Replacement (Dr. Malhotra)', type: 'ot' },
  { time: '09:15 AM', event: 'Dr. Sarah Jenkins checked in — Cardiology Wing', type: 'staff' },
  { time: '08:55 AM', event: 'ICU Surgical Wing at 90% capacity (18/20 beds)', type: 'alert' },
  { time: '08:30 AM', event: 'Morning shift changeover complete — 64 doctors on duty', type: 'info' },
  { time: '08:10 AM', event: 'Blood bank: O+ stock replenished (50 units)', type: 'info' },
];

const deptLoad = [
  { name: 'General OPD', patients: 187, max: 250 },
  { name: 'Cardiology', patients: 42, max: 60 },
  { name: 'Orthopedics', patients: 38, max: 50 },
  { name: 'Gynecology', patients: 29, max: 40 },
  { name: 'Dermatology', patients: 24, max: 40 },
];

export default function HospitalDashboard() {
  const { user } = useAuth();

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      {/* Welcome Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
          Hospital Dashboard
        </h1>
        <p style={{ color: '#64748B', marginTop: '0.25rem', fontSize: '0.9rem' }}>
          Welcome back, <strong>{user?.name || 'Administrator'}</strong> · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderLeft: `4px solid ${s.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1E293B', margin: '0.25rem 0 0.15rem' }}>{s.value}</p>
                <p style={{ fontSize: '0.75rem', color: s.color, margin: 0, fontWeight: 500 }}>{s.delta}</p>
              </div>
              <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: Activity + Dept Load */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Recent Activity */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E293B', marginBottom: '1rem' }}>Live Activity Feed</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentActivities.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', paddingBottom: '0.75rem', borderBottom: i < recentActivities.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                <span style={{ minWidth: '76px', fontSize: '0.72rem', color: '#94A3B8', fontWeight: 500, paddingTop: '0.1rem' }}>{a.time}</span>
                <span style={{ fontSize: '0.83rem', color: '#334155', lineHeight: 1.5 }}>{a.event}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Load */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E293B', marginBottom: '1rem' }}>Department Load</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {deptLoad.map(d => {
              const pct = Math.round((d.patients / d.max) * 100);
              const color = pct > 80 ? '#EF4444' : pct > 60 ? '#F59E0B' : '#10B981';
              return (
                <div key={d.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>{d.name}</span>
                    <span style={{ fontSize: '0.8rem', color: color, fontWeight: 600 }}>{d.patients}/{d.max}</span>
                  </div>
                  <div style={{ background: '#F1F5F9', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '99px', transition: 'width 0.4s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
