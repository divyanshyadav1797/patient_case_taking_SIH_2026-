import React from 'react';

const faqs = [
  { q: 'How do I add a new patient to the system?', a: 'Go to the Patients section and click "Add Patient". Fill in the required information and submit. The patient will be assigned an ID automatically.' },
  { q: 'How do I manage OT schedules?', a: 'Navigate to Operations / OT. You can view, create, and update operation schedules by surgeon, room, and time slot.' },
  { q: 'How is bed availability updated?', a: 'Bed data is updated in real-time from the Patients module whenever a patient is admitted or discharged. The Dashboard reflects this immediately.' },
  { q: 'How can I generate monthly reports?', a: 'Visit the Reports section. Select the report type and period, then click Download to generate a PDF or CSV report.' },
  { q: 'Who do I contact for technical support?', a: 'Contact the MediCare IT Helpdesk at itsupport@medicare.gov.in or call 1800-XXX-XXXX (toll-free, 24x7).' },
];

const contacts = [
  { label: 'Technical Helpdesk', value: '1800-XXX-XXXX', icon: '📞' },
  { label: 'Email Support', value: 'itsupport@medicare.gov.in', icon: '✉️' },
  { label: 'Ministry of Health (MoHFW)', value: 'helpdesk@mohfw.gov.in', icon: '🏛️' },
];

export default function HospitalHelp() {
  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Inter, sans-serif', maxWidth: '780px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>Help & Support</h1>
        <p style={{ color: '#64748B', margin: '0.2rem 0 0', fontSize: '0.85rem' }}>Find answers, guides, and contact information</p>
      </div>

      {/* FAQs */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '1rem' }}>Frequently Asked Questions</h2>
        {faqs.map((f, i) => (
          <details key={i} style={{ borderBottom: i < faqs.length - 1 ? '1px solid #F1F5F9' : 'none', paddingBottom: '0.875rem', marginBottom: '0.875rem' }}>
            <summary style={{ cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#1E293B', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {f.q} <span style={{ color: '#3B82F6', fontSize: '1rem' }}>›</span>
            </summary>
            <p style={{ fontSize: '0.83rem', color: '#475569', marginTop: '0.5rem', lineHeight: 1.65, paddingLeft: '0.5rem', borderLeft: '3px solid #BFDBFE' }}>{f.a}</p>
          </details>
        ))}
      </div>

      {/* Contact */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '1rem' }}>Contact Support</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {contacts.map(c => (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem', background: '#F8FAFC', borderRadius: '10px' }}>
              <span style={{ fontSize: '1.5rem' }}>{c.icon}</span>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</p>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: '#1E293B' }}>{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
