import React from 'react';

const staff = [
  { id: 'STF-001', name: 'Anita Rajan', role: 'Head Nurse', dept: 'General OPD', shift: 'Morning', status: 'On Duty', phone: '+91 98765 00001' },
  { id: 'STF-002', name: 'Ravi Kumar', role: 'Lab Technician', dept: 'Pathology', shift: 'Morning', status: 'On Duty', phone: '+91 98765 00002' },
  { id: 'STF-003', name: 'Meena Sharma', role: 'Pharmacist', dept: 'Pharmacy', shift: 'Morning', status: 'On Duty', phone: '+91 98765 00003' },
  { id: 'STF-004', name: 'Suresh Babu', role: 'Radiographer', dept: 'Radiology', shift: 'Evening', status: 'Off Duty', phone: '+91 98765 00004' },
  { id: 'STF-005', name: 'Kavya Nair', role: 'Staff Nurse', dept: 'ICU', shift: 'Night', status: 'Off Duty', phone: '+91 98765 00005' },
  { id: 'STF-006', name: 'Prakash Iyer', role: 'Ward Boy', dept: 'Surgical Ward', shift: 'Morning', status: 'On Duty', phone: '+91 98765 00006' },
];

const roleColors = {
  'Head Nurse': '#3B82F6', 'Lab Technician': '#8B5CF6', 'Pharmacist': '#10B981',
  'Radiographer': '#F59E0B', 'Staff Nurse': '#EF4444', 'Ward Boy': '#64748B',
};

export default function HospitalStaff() {
  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>Staff Directory</h1>
        <p style={{ color: '#64748B', margin: '0.2rem 0 0', fontSize: '0.85rem' }}>{staff.filter(s => s.status === 'On Duty').length} of {staff.length} staff members on duty</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        {staff.map(s => {
          const roleColor = roleColors[s.role] || '#64748B';
          return (
            <div key={s.id} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderTop: `3px solid ${roleColor}` }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: `${roleColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>👩‍⚕️</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#1E293B' }}>{s.name}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: roleColor, fontWeight: 500 }}>{s.role}</p>
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span>Department: <strong style={{ color: '#475569' }}>{s.dept}</strong></span>
                <span>Shift: <strong style={{ color: '#475569' }}>{s.shift}</strong></span>
                <span>Phone: <strong style={{ color: '#475569' }}>{s.phone}</strong></span>
              </div>
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{s.id}</span>
                <span style={{ background: s.status === 'On Duty' ? '#D1FAE520' : '#F1F5F9', color: s.status === 'On Duty' ? '#10B981' : '#94A3B8', borderRadius: '20px', padding: '0.15rem 0.6rem', fontSize: '0.7rem', fontWeight: 600, border: `1px solid ${s.status === 'On Duty' ? '#10B98130' : '#E2E8F0'}` }}>
                  {s.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
