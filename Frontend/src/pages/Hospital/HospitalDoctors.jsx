import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const statusColor = { 'On Duty': '#10B981', 'Available Today': '#10B981', 'In OT': '#F59E0B', 'Off Duty': '#94A3B8' };

export default function HospitalDoctors() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('General Physician');
  const [department, setDepartment] = useState('General Medicine');
  const [nmcId, setNmcId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('doctor123');
  const [pin, setPin] = useState('1234');
  const [fee, setFee] = useState('₹600');

  const hospitalName = user?.hospitalDetails?.hospitalName || user?.name || 'SMS Hospital Jaipur';
  const hospitalId = user?.customId || user?.id || user?._id;

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const data = await api.getDoctors({
        hospital: hospitalName,
        hospitalId: hospitalId
      });
      if (Array.isArray(data)) {
        setDoctors(data);
      }
    } catch (e) {
      console.warn('Failed to load doctors from API:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, [user]);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.createDoctor({
        name,
        specialty,
        department,
        nmcId: nmcId.trim() || undefined,
        email: email.trim().toLowerCase() || undefined,
        phone: phone.trim() || undefined,
        password,
        pin,
        fee,
        hospitalName,
        hospitalId
      });

      const creds = res.credentials || {
        identifier: email || nmcId || res.id,
        nmcId: res.doctorDetails?.nmcId,
        email,
        temporaryPassword: password,
        pin
      };

      setCreatedCredentials(creds);
      // Reset form
      setName('');
      setNmcId('');
      setEmail('');
      setPhone('');
      await loadDoctors();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create doctor profile');
    } finally {
      setSubmitting(false);
    }
  };

  const copyCreds = () => {
    if (!createdCredentials) return;
    const text = `Quantum Care Doctor Login Credentials:\nIdentifier: ${createdCredentials.identifier}\nPassword: ${createdCredentials.temporaryPassword}\nPIN: ${createdCredentials.pin}\nHospital: ${hospitalName}`;
    navigator.clipboard.writeText(text);
    alert('Credentials copied to clipboard! Share these with the doctor to log in.');
  };

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      {/* Header with Title & Add Doctor Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>Doctor Management</h1>
          <p style={{ color: '#64748B', margin: '0.2rem 0 0', fontSize: '0.85rem' }}>
            {doctors.length} doctors registered for {hospitalName}
          </p>
        </div>

        <button
          type="button"
          onClick={() => { setShowAddModal(true); setCreatedCredentials(null); setErrorMsg(''); }}
          style={{
            background: '#2563EB',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '0.65rem 1.25rem',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 6px rgba(37,99,235,0.25)'
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>＋</span> Add Doctor
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
          Loading hospital medical staff...
        </div>
      )}

      {/* Empty State */}
      {!loading && doctors.length === 0 && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '3rem', textAlign: 'center', border: '1px dashed #CBD5E1' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👨‍⚕️</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1E293B', margin: '0 0 0.5rem' }}>No Doctors Added Yet</h3>
          <p style={{ color: '#64748B', fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Add doctors to your hospital so they can log into their doctor portal and accept consultation appointments.
          </p>
          <button
            type="button"
            onClick={() => { setShowAddModal(true); setCreatedCredentials(null); }}
            style={{
              background: '#2563EB',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1.2rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Add First Doctor
          </button>
        </div>
      )}

      {/* Doctor Cards Grid */}
      {!loading && doctors.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
          {doctors.map((d) => {
            const status = d.available || 'Available Today';
            const color = statusColor[status] || '#10B981';

            return (
              <div
                key={d.id}
                style={{
                  background: '#fff',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  border: '1px solid #E2E8F0',
                  borderTop: `3px solid ${color}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                      👨‍⚕️
                    </div>
                    <span style={{ background: `${color}18`, color: color, borderRadius: '20px', padding: '0.2rem 0.65rem', fontSize: '0.72rem', fontWeight: 600 }}>
                      {status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E293B', margin: '0 0 0.2rem' }}>{d.name}</h3>
                  <p style={{ fontSize: '0.82rem', color: '#2563EB', margin: 0, fontWeight: 600 }}>{d.specialty}</p>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.15rem 0 0' }}>{d.department}</p>
                  {d.nmcId && (
                    <p style={{ fontSize: '0.72rem', color: '#94A3B8', margin: '0.2rem 0 0' }}>NMC: {d.nmcId}</p>
                  )}
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9', fontSize: '0.78rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Fee: <strong style={{ color: '#1E293B' }}>{d.fee || '₹600'}</strong></span>
                  <span>ID: <strong style={{ color: '#1E293B' }}>{d.id}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            maxWidth: '540px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: '#F1F5F9',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#64748B'
              }}
            >
              ✕
            </button>

            {!createdCredentials ? (
              <>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.25rem' }}>
                  Add New Doctor
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.5rem' }}>
                  Register a doctor for {hospitalName}. Login credentials will be generated to allow doctor portal access.
                </p>

                {errorMsg && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #F87171', color: '#991B1B', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleAddDoctor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      Doctor Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Ramesh Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Specialty *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Cardiologist"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Department *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Cardiology"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        NMC Registration ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. NMC-2026-8812"
                        value={nmcId}
                        onChange={(e) => setNmcId(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Consultation Fee
                      </label>
                      <input
                        type="text"
                        value={fee}
                        onChange={(e) => setFee(e.target.value)}
                        placeholder="₹600"
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Professional Email
                      </label>
                      <input
                        type="email"
                        placeholder="doctor@hospital.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="98XXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Doctor Password *
                      </label>
                      <input
                        type="text"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Doctor PIN (4-digit) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{ padding: '0.65rem 1.5rem', borderRadius: '8px', border: 'none', background: '#2563EB', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {submitting ? 'Creating Doctor...' : 'Provision Doctor Account'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success / Credentials Screen */
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 1rem' }}>
                  ✓
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem' }}>
                  Doctor Account Created!
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.5rem' }}>
                  The doctor is now enrolled under <strong>{hospitalName}</strong>. Hand these login credentials over to the doctor so they can access their dashboard:
                </p>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', textAlign: 'left', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Login Identifier / NMC ID / Email:</span>
                    <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>{createdCredentials.identifier}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Password:</span>
                    <strong style={{ fontSize: '0.95rem', color: '#2563EB' }}>{createdCredentials.temporaryPassword}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>PIN:</span>
                    <strong style={{ fontSize: '0.95rem', color: '#2563EB' }}>{createdCredentials.pin}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={copyCreds}
                    style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#fff', color: '#334155', fontWeight: 600, cursor: 'pointer' }}
                  >
                    📋 Copy Credentials
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setCreatedCredentials(null); }}
                    style={{ padding: '0.65rem 1.5rem', borderRadius: '8px', border: 'none', background: '#2563EB', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
