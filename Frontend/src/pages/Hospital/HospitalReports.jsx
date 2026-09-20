import React, { useState } from 'react';

const reports = [
  { title: 'Daily Patient Summary', desc: 'Total patients admitted, discharged, and under care today.', generated: '17 Sep 2026 08:00 AM', type: 'Daily' },
  { title: 'OPD Footfall Report', desc: 'Token-wise breakdown of outpatient visits by department.', generated: '17 Sep 2026 08:00 AM', type: 'Daily' },
  { title: 'Bed Occupancy Report', desc: 'Real-time bed availability across all wards and ICUs.', generated: '17 Sep 2026 07:45 AM', type: 'Live' },
  { title: 'Revenue Summary — September 2026', desc: 'Month-to-date revenue from OPD, IPD, pharmacy, and labs.', generated: '17 Sep 2026 12:00 AM', type: 'Monthly' },
  { title: 'Doctor Performance Report', desc: 'Consultation count and average time per doctor for this month.', generated: '16 Sep 2026 11:59 PM', type: 'Monthly' },
  { title: 'Surgical Outcomes Report', desc: 'Post-operative complication rates and OT utilization statistics.', generated: '15 Sep 2026 11:59 PM', type: 'Weekly' },
];

const typeColor = { Daily: '#3B82F6', Live: '#10B981', Monthly: '#8B5CF6', Weekly: '#F59E0B' };

export default function HospitalReports() {
  const [filter, setFilter] = useState('All');
  const types = ['All', 'Live', 'Daily', 'Weekly', 'Monthly'];
  const filtered = filter === 'All' ? reports : reports.filter(r => r.type === filter);

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>Reports & Analytics</h1>
        <p style={{ color: '#64748B', margin: '0.2rem 0 0', fontSize: '0.85rem' }}>Generate and download operational reports</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            style={{ padding: '0.4rem 1rem', borderRadius: '20px', border: '1.5px solid', borderColor: filter === t ? '#3B82F6' : '#E2E8F0', background: filter === t ? '#EFF6FF' : '#fff', color: filter === t ? '#3B82F6' : '#64748B', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {filtered.map((r, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderTop: `3px solid ${typeColor[r.type] || '#64748B'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ background: `${typeColor[r.type]}20`, color: typeColor[r.type], borderRadius: '20px', padding: '0.15rem 0.6rem', fontSize: '0.7rem', fontWeight: 600 }}>{r.type}</span>
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1E293B', margin: '0 0 0.4rem' }}>{r.title}</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>{r.desc}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{r.generated}</span>
              <button style={{ padding: '0.35rem 0.875rem', borderRadius: '8px', background: '#EFF6FF', color: '#3B82F6', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                ↓ Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
