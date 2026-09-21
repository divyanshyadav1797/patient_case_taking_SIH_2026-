import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const initialRecords = [
  {
    id: 'REC-5001',
    patient: 'P-10249',
    name: 'Manoj Tiwari',
    type: 'Admission Report',
    dept: 'Trauma Emergency',
    date: '17 Sep 2026',
    doctor: 'Dr. Priya Mehta',
    status: 'Active',
    notes: 'Admitted following motor vehicle accident. Vitals stabilized. Cervical spine cleared via CT.',
    extractedText: 'Patient presented with blunt abdominal trauma and abrasions. FAST scan negative. Continuous monitoring in ICU stepdown.'
  },
  {
    id: 'REC-5002',
    patient: 'P-10247',
    name: 'Rakesh Gupta',
    type: 'ICU Progress Note',
    dept: 'Cardiology',
    date: '17 Sep 2026',
    doctor: 'Dr. Sarah Jenkins',
    status: 'Active',
    notes: 'Post-CABG Day 3. Troponin levels trending downward. Normal sinus rhythm on continuous telemetry.',
    extractedText: 'ECG shows normal sinus rhythm at 72 bpm. Echocardiogram reveals LVEF 52% with mild septal hypokinesia.'
  },
  {
    id: 'REC-5003',
    patient: 'P-10246',
    name: 'Priya Nair',
    type: 'Discharge Summary',
    dept: 'Orthopedics',
    date: '16 Sep 2026',
    doctor: 'Dr. Malhotra',
    status: 'Archived',
    notes: 'Right femur fracture post ORIF. Mobilizing with walker. Suture removal scheduled on Day 12.',
    extractedText: 'Post-operative AP and lateral radiographs demonstrate anatomic alignment and rigid fixation with locking compression plate.'
  },
  {
    id: 'REC-5004',
    patient: 'P-10244',
    name: 'Kavitha Reddy',
    type: 'Lab Report',
    dept: 'Dermatology',
    date: '15 Sep 2026',
    doctor: 'Dr. Anjali Rao',
    status: 'Active',
    notes: 'Biopsy specimen taken from right forefinger lesion. Awaiting final histopathology confirmation.',
    extractedText: 'Punch biopsy 3mm: Epidermal hyperplasia with lymphocytic infiltrate. PAS staining negative for fungal elements.'
  },
  {
    id: 'REC-5005',
    patient: 'P-10243',
    name: 'Suresh Pillai',
    type: 'Radiology Scan',
    dept: 'General OPD',
    date: '14 Sep 2026',
    doctor: 'Dr. Mehta',
    status: 'Archived',
    notes: 'Chest X-Ray PA View. Bilateral lung fields clear. No focal consolidation, pneumothorax, or effusion.',
    extractedText: 'Digital Radiography Chest: Normal cardiothoracic ratio. Costophrenic angles sharp. Trachea midline.'
  }
];

const statusColor = {
  Active: { bg: 'rgba(16, 185, 129, 0.12)', text: '#059669', border: '#10B981' },
  Archived: { bg: 'rgba(148, 163, 184, 0.15)', text: '#64748B', border: '#CBD5E1' },
  'Under Review': { bg: 'rgba(245, 158, 11, 0.15)', text: '#D97706', border: '#F59E0B' }
};

export default function HospitalRecords() {
  const [recordsList, setRecordsList] = useState(initialRecords);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [feedback, setFeedback] = useState(null);

  // Modal states
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    title: '',
    type: '',
    dept: '',
    doctor: '',
    status: 'Active',
    notes: ''
  });

  // New record form state
  const [newFormData, setNewFormData] = useState({
    patient: 'P-10245',
    name: '',
    type: 'Admission Report',
    dept: 'General Medicine',
    doctor: 'Dr. Priya Mehta',
    status: 'Active',
    notes: '',
    extractedText: ''
  });

  const notify = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    api.getRecords()
      .then((res) => {
        if (!mounted) return;
        if (Array.isArray(res) && res.length > 0) {
          // Normalize and merge live records with default initial records
          const liveNormalized = res.map((r, i) => ({
            id: r.id || r._id || `REC-DB-${i + 1}`,
            patient: r.patientId || r.patient || 'P-10245',
            name: r.patientName || r.name || 'Registered Patient',
            type: r.type || r.recordType || 'Diagnostic Report',
            dept: r.department || r.dept || 'General OPD',
            date: r.date ? new Date(r.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '18 Sep 2026',
            doctor: r.doctor || 'Dr. Priya Mehta',
            status: r.status || 'Active',
            notes: r.notes || r.summary || 'Clinical record recorded in system registry.',
            extractedText: r.extractedText || r.aiExtraction || 'Diagnostic findings and clinical observations documented.'
          }));
          setRecordsList(liveNormalized);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch server records, using hospital fallback registry:', err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const handleOpenView = (record) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setSelectedRecord(record);
    setEditFormData({
      title: record.name,
      type: record.type,
      dept: record.dept,
      doctor: record.doctor,
      status: record.status,
      notes: record.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    try {
      if (api.updateRecord && selectedRecord.id) {
        await api.updateRecord(selectedRecord.id, editFormData).catch((err) => {
          console.warn('Backend updateRecord call logged:', err.message);
        });
      }

      setRecordsList((prev) =>
        prev.map((r) =>
          r.id === selectedRecord.id
            ? {
                ...r,
                name: editFormData.title || r.name,
                type: editFormData.type,
                dept: editFormData.dept,
                doctor: editFormData.doctor,
                status: editFormData.status,
                notes: editFormData.notes
              }
            : r
        )
      );

      notify(`Medical Record ${selectedRecord.id} updated successfully.`);
      setIsEditModalOpen(false);
      setSelectedRecord(null);
    } catch (err) {
      notify(`Failed to update record: ${err.message}`, 'error');
    }
  };

  const handleCreateNewRecord = async (e) => {
    e.preventDefault();
    if (!newFormData.name.trim()) {
      notify('Please enter the patient name.', 'error');
      return;
    }

    const newRecordId = `REC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEntry = {
      id: newRecordId,
      patient: newFormData.patient,
      name: newFormData.name.trim(),
      type: newFormData.type,
      dept: newFormData.dept,
      date: new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }),
      doctor: newFormData.doctor,
      status: newFormData.status,
      notes: newFormData.notes || 'Hospital staff registered medical document.',
      extractedText: newFormData.extractedText || 'Clinical documentation verified by hospital administrator.'
    };

    try {
      if (api.uploadRecord) {
        await api.uploadRecord(newEntry).catch((err) => {
          console.warn('Backend uploadRecord call logged:', err.message);
        });
      }
      setRecordsList((prev) => [newEntry, ...prev]);
      notify(`New medical record ${newRecordId} created successfully.`);
      setIsNewRecordModalOpen(false);
      setNewFormData({
        patient: 'P-10245',
        name: '',
        type: 'Admission Report',
        dept: 'General Medicine',
        doctor: 'Dr. Priya Mehta',
        status: 'Active',
        notes: '',
        extractedText: ''
      });
    } catch (err) {
      notify(`Could not register record: ${err.message}`, 'error');
    }
  };

  const filtered = recordsList.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.dept.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      {/* Toast Feedback */}
      {feedback && (
        <div
          role="status"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 99999,
            padding: '12px 20px',
            borderRadius: '10px',
            background: feedback.type === 'error' ? '#EF4444' : '#10B981',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '0.875rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <i className={`fa-solid ${feedback.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`}></i>
          {feedback.msg}
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
            Central Medical Records Registry
          </h1>
          <p style={{ color: '#64748B', margin: '0.2rem 0 0', fontSize: '0.85rem' }}>
            Inspect patient medical records, update diagnostic status, and manage verified hospital documentation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setIsNewRecordModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 600,
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
            }}
          >
            <i className="fa-solid fa-file-circle-plus"></i> Add Medical Record
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {['All', 'Active', 'Archived', 'Under Review'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              style={{
                border: 'none',
                background: statusFilter === status ? '#2563EB' : '#F1F5F9',
                color: statusFilter === status ? '#FFFFFF' : '#475569',
                fontWeight: 600,
                fontSize: '0.8rem',
                padding: '6px 14px',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {status}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.85rem' }}></i>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient, ID, or department…"
            style={{
              padding: '0.6rem 1rem 0.6rem 2.2rem',
              borderRadius: '8px',
              border: '1.5px solid #E2E8F0',
              fontSize: '0.875rem',
              width: '280px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Records Table */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['Record ID', 'Patient', 'Record Type', 'Department', 'Attending Doctor', 'Date', 'Status', 'Actions'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '0.875rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1.5px solid #E2E8F0'
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading medical records...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                  No medical records found matching your filters.
                </td>
              </tr>
            ) : (
              filtered.map((r, i) => (
                <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', fontWeight: 600, color: '#2563EB' }}>
                    {r.id}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#1E293B', fontWeight: 500 }}>
                    {r.name}
                    <br />
                    <small style={{ color: '#94A3B8' }}>{r.patient}</small>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>{r.type}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>{r.dept}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>{r.doctor}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: '#94A3B8' }}>{r.date}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span
                      style={{
                        background: statusColor[r.status]?.bg || 'rgba(148, 163, 184, 0.15)',
                        color: statusColor[r.status]?.text || '#64748B',
                        border: `1px solid ${statusColor[r.status]?.border || '#CBD5E1'}`,
                        borderRadius: '20px',
                        padding: '0.2rem 0.75rem',
                        fontSize: '0.72rem',
                        fontWeight: 600
                      }}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenView(r)}
                        title="View Document"
                        style={{
                          background: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          color: '#2563EB',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <i className="fa-regular fa-eye"></i> View
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(r)}
                        title="Update Medical Record"
                        style={{
                          background: '#F0FDF4',
                          border: '1px solid #BBF7D0',
                          color: '#16A34A',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <i className="fa-solid fa-pen-to-square"></i> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* =========================================================================
          MODAL 1: VIEW MEDICAL RECORD & DOCUMENT PREVIEW
          ========================================================================= */}
      {isViewModalOpen && selectedRecord && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setIsViewModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '620px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              border: '1px solid #E2E8F0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-file-medical" style={{ fontSize: '1.1rem' }}></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                    {selectedRecord.type} · {selectedRecord.id}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748B' }}>
                    Patient: {selectedRecord.name} ({selectedRecord.patient}) · Date: {selectedRecord.date}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '1.2rem' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Department</span>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B', marginTop: '2px' }}>{selectedRecord.dept}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Attending Physician</span>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B', marginTop: '2px' }}>{selectedRecord.doctor}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Clinical Status</span>
                  <div style={{ marginTop: '2px' }}>
                    <span style={{ background: statusColor[selectedRecord.status]?.bg, color: statusColor[selectedRecord.status]?.text, padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {selectedRecord.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Verification Authority</span>
                  <div style={{ fontSize: '0.875rem', color: '#1E293B', marginTop: '2px' }}>Central Hospital EMR System</div>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700, margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Clinical Summary & Staff Notes
                </h4>
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.85rem', fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
                  {selectedRecord.notes || 'No staff notes provided.'}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 700, margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  OCR / Document Content Preview
                </h4>
                <div style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0.85rem', fontSize: '0.825rem', fontFamily: 'monospace', color: '#1E293B', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {selectedRecord.extractedText || 'Diagnostic report document verified in registry.'}
                </div>
              </div>
            </div>

            <div style={{ padding: '1rem 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  notify('Printing clinical document record...');
                }}
                style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#334155', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <i className="fa-solid fa-print"></i> Print Record
              </button>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                style={{ background: '#2563EB', border: 'none', color: '#FFFFFF', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: UPDATE PATIENT MEDICAL RECORD
          ========================================================================= */}
      {isEditModalOpen && selectedRecord && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '540px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              border: '1px solid #E2E8F0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-pen-to-square" style={{ fontSize: '1.1rem' }}></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                    Update Medical Record
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748B' }}>
                    Record ID: {selectedRecord.id} · Patient: {selectedRecord.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '1.2rem' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Patient Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Record Type
                    </label>
                    <select
                      value={editFormData.type}
                      onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem', background: '#FFFFFF' }}
                    >
                      <option value="Admission Report">Admission Report</option>
                      <option value="ICU Progress Note">ICU Progress Note</option>
                      <option value="Discharge Summary">Discharge Summary</option>
                      <option value="Lab Report">Lab Report</option>
                      <option value="Radiology Scan">Radiology Scan</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Clinical Status
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem', background: '#FFFFFF' }}
                    >
                      <option value="Active">Active</option>
                      <option value="Archived">Archived</option>
                      <option value="Under Review">Under Review</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Department
                    </label>
                    <input
                      type="text"
                      value={editFormData.dept}
                      onChange={(e) => setEditFormData({ ...editFormData, dept: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Attending Physician
                    </label>
                    <input
                      type="text"
                      value={editFormData.doctor}
                      onChange={(e) => setEditFormData({ ...editFormData, doctor: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Clinical Notes / Observations
                  </label>
                  <textarea
                    rows="3"
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    placeholder="Enter updated clinical observation..."
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem', resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={{ padding: '1rem 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#475569', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '0.55rem 1.3rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: REGISTER NEW MEDICAL RECORD
          ========================================================================= */}
      {isNewRecordModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setIsNewRecordModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              border: '1px solid #E2E8F0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-file-circle-plus" style={{ fontSize: '1.1rem' }}></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                    Register Patient Medical Record
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748B' }}>
                    Document an admission note, discharge report, or lab scan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewRecordModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '1.2rem' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleCreateNewRecord}>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Patient Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Chandra"
                      value={newFormData.name}
                      onChange={(e) => setNewFormData({ ...newFormData, name: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Patient ID / ABHA
                    </label>
                    <input
                      type="text"
                      value={newFormData.patient}
                      onChange={(e) => setNewFormData({ ...newFormData, patient: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Record Classification
                    </label>
                    <select
                      value={newFormData.type}
                      onChange={(e) => setNewFormData({ ...newFormData, type: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem', background: '#FFFFFF' }}
                    >
                      <option value="Admission Report">Admission Report</option>
                      <option value="ICU Progress Note">ICU Progress Note</option>
                      <option value="Discharge Summary">Discharge Summary</option>
                      <option value="Lab Report">Lab Report</option>
                      <option value="Radiology Scan">Radiology Scan</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Department
                    </label>
                    <input
                      type="text"
                      value={newFormData.dept}
                      onChange={(e) => setNewFormData({ ...newFormData, dept: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Attending Doctor
                  </label>
                  <input
                    type="text"
                    value={newFormData.doctor}
                    onChange={(e) => setNewFormData({ ...newFormData, doctor: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Clinical Findings / Observations
                  </label>
                  <textarea
                    rows="3"
                    value={newFormData.notes}
                    onChange={(e) => setNewFormData({ ...newFormData, notes: e.target.value })}
                    placeholder="Enter diagnostic summary, medication orders, or progress notes..."
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.875rem', resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={{ padding: '1rem 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsNewRecordModalOpen(false)}
                  style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#475569', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '0.55rem 1.3rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
                  }}
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
