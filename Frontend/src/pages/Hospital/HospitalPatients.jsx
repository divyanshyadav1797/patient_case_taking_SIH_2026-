import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const statusColor = {
  Admitted: '#3B82F6',
  OPD: '#8B5CF6',
  Waiting: '#F59E0B',
  ICU: '#EF4444',
  Completed: '#10B981',
  Discharged: '#10B981'
};

export default function HospitalPatients() {
  const { user } = useAuth();
  const [patientsList, setPatientsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewReportModal, setViewReportModal] = useState(null);

  const hospitalName = user?.hospitalDetails?.hospitalName || user?.name || 'SMS Hospital Jaipur';

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch live clinical reports and appointments
      const [reports, apts] = await Promise.allSettled([
        api.getClinicalReports(),
        api.getAppointments()
      ]);

      const repData = reports.status === 'fulfilled' && Array.isArray(reports.value) ? reports.value : [];
      const aptData = apts.status === 'fulfilled' && Array.isArray(apts.value) ? apts.value : [];

      // Combine into unified patient waiting & consultation list
      const combined = [];
      const seen = new Set();

      repData.forEach(r => {
        const id = r.patientId || r.customId || r.id;
        if (!seen.has(id)) {
          seen.add(id);
          combined.push({
            id: r.patientId || r.id,
            reportId: r.id,
            name: r.patientName || 'Patient',
            age: r.patientProfile?.age || '42',
            gender: r.patientProfile?.gender || 'Male',
            dept: r.recommendedSpecialty || 'General Medicine',
            doctor: r.doctorName || 'Attending Physician',
            status: r.urgentReview ? 'Waiting (Urgent)' : 'Waiting',
            date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Today',
            chiefComplaint: r.chiefComplaint || 'Consultation Intake',
            summaryForDoctor: r.summaryForDoctor || '',
            historyOfPresentIllness: r.historyOfPresentIllness || '',
            diagnosticImpression: r.diagnosticImpression || '',
            documents: r.attachedDocuments || []
          });
        }
      });

      aptData.forEach(a => {
        const id = a.patientId || a.id;
        if (!seen.has(id)) {
          seen.add(id);
          combined.push({
            id: a.patientId || a.id,
            reportId: a.clinicalReportId || null,
            name: a.patientName || a.patient || 'Patient',
            age: '38',
            gender: 'Female',
            dept: a.specialty || 'General Medicine',
            doctor: a.doctorName || a.doctor || 'Attending Physician',
            status: a.status || 'Waiting',
            date: a.date || 'Today',
            chiefComplaint: a.chiefComplaint || 'Hospital Consultation',
            summaryForDoctor: a.notes || '',
            historyOfPresentIllness: '',
            diagnosticImpression: '',
            documents: []
          });
        }
      });

      setPatientsList(combined);
    } catch (e) {
      console.warn('Failed to load patients for hospital:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const filtered = patientsList.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    String(p.id || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.dept || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.doctor || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>Patient Registry & Queue</h1>
          <p style={{ color: '#64748B', margin: '0.2rem 0 0', fontSize: '0.85rem' }}>
            {patientsList.length} patients registered or waiting for consultation at {hospitalName}
          </p>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, ID, or department…"
          style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.875rem', width: '280px', outline: 'none' }}
        />
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['Patient ID', 'Name', 'Department', 'Assigned Doctor', 'Status', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #E2E8F0' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Loading patients from database...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>No patients found.</td></tr>
            ) : (
              filtered.map((p, i) => {
                const s = p.status || 'Waiting';
                const color = statusColor[s] || (s.includes('Urgent') ? '#DC2626' : '#F59E0B');

                return (
                  <tr key={p.id || i} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: '#2563EB', fontWeight: 700 }}>
                      {p.id}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#1E293B', fontWeight: 600 }}>
                      {p.name}
                      <small style={{ display: 'block', color: '#64748B', fontSize: '0.75rem' }}>
                        {p.gender} · {p.age} yrs
                      </small>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>
                      {p.dept}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>
                      {p.doctor}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ background: `${color}18`, color, borderRadius: '20px', padding: '0.2rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}>
                        {s}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: '#94A3B8' }}>
                      {p.date}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <button
                        type="button"
                        onClick={() => setViewReportModal(p)}
                        style={{
                          background: '#EFF6FF',
                          color: '#2563EB',
                          border: '1px solid #BFDBFE',
                          borderRadius: '6px',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        📄 Digital Report
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Read-Only Digital Clinical Report Modal */}
      {viewReportModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem'
        }}>
          <div style={{
            background: '#fff', borderRadius: '18px', maxWidth: '650px', width: '100%',
            maxHeight: '90vh', overflowY: 'auto', padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setViewReportModal(null)}
              style={{
                position: 'absolute', top: '1.25rem', right: '1.25rem',
                background: '#F1F5F9', border: 'none', width: '32px', height: '32px',
                borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', fontWeight: 700
              }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                READ-ONLY CLINICAL ENCOUNTER BRIEF
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                ID: {viewReportModal.id}
              </span>
            </div>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#1E293B' }}>
              {viewReportModal.name} · Intake Brief
            </h2>
            <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Assigned Department: <strong>{viewReportModal.dept}</strong> | Attending: <strong>{viewReportModal.doctor}</strong>
            </p>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
              <strong style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                Chief Presenting Complaint:
              </strong>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                {viewReportModal.chiefComplaint}
              </div>
            </div>

            {viewReportModal.summaryForDoctor && (
              <div style={{ marginBottom: '1.25rem' }}>
                <strong style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  AI Synthesized Case-Taking Matrix:
                </strong>
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.88rem', lineHeight: 1.6, whiteSpace: 'pre-line', color: '#334155' }}>
                  {viewReportModal.summaryForDoctor}
                </div>
              </div>
            )}

            {viewReportModal.historyOfPresentIllness && (
              <div style={{ marginBottom: '1.25rem' }}>
                <strong style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  History of Present Illness (HPI):
                </strong>
                <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  {viewReportModal.historyOfPresentIllness}
                </p>
              </div>
            )}

            <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#92400E', marginTop: '1rem' }}>
              ℹ <strong>Hospital Policy Note:</strong> Hospital administrators have view-only access to clinical reports. Only the licensed attending physician can prescribe medications or modify medical diagnoses.
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setViewReportModal(null)}
                style={{ padding: '0.6rem 1.25rem', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
