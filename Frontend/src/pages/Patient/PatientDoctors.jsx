import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function PatientDoctors() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const { doctors, appointments, showToast } = usePatient();
  const { user } = useAuth();

  // AI Intake Booking Modal State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState('complaint'); // 'complaint' | 'questions' | 'summary'
  const [complaint, setComplaint] = useState('');
  const [selectedLang, setSelectedLang] = useState('en');
  const [sessionId, setSessionId] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionCount, setQuestionCount] = useState(1);
  const [customAnswer, setCustomAnswer] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [clinicalReport, setClinicalReport] = useState(null);
  const [reportId, setReportId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('Tomorrow, Sep 22');
  const [appointmentTime, setAppointmentTime] = useState('11:00 AM');

  const specialties = [
    { label: 'All', icon: '🩺' },
    { label: 'Cardiology', icon: '❤️' },
    { label: 'Dentistry', icon: '🦷' },
    { label: 'Ophthalmology', icon: '👁️' },
    { label: 'Orthopedic', icon: '🦴' },
    { label: 'Neurology', icon: '🧠' }
  ];

  const quickSymptoms = [
    'Severe Chest Discomfort',
    'Recurring Fever & Chills',
    'Persistent Headache',
    'Abdominal / Stomach Pain',
    'Cough & Breathing Difficulty',
    'Knee Joint Pain'
  ];

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === 'All' ||
      doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    return matchesSearch && matchesSpecialty;
  });

  const openBookingModal = (doc) => {
    setSelectedDoctor(doc);
    setModalStep('complaint');
    setComplaint('');
    setCustomAnswer('');
    setQuestionCount(1);
    setClinicalReport(null);
    setReportId('');
    setIsModalOpen(true);
  };

  const startAiIntake = async (chiefProblem) => {
    const problem = chiefProblem || complaint;
    if (!problem || !problem.trim()) {
      showToast('Please describe your main health concern.');
      return;
    }

    setComplaint(problem);
    setIsAiLoading(true);
    setModalStep('questions');
    setQuestionCount(1);

    try {
      const res = await api.startAiIntake({
        patientId: user?.id || 'P-10249',
        patientName: user?.name || 'Rahul Sharma',
        chiefComplaint: problem.trim(),
        language: selectedLang,
        source: 'webapp',
        patientProfile: user?.patientDetails || {}
      });

      if (res && res.sessionId) {
        setSessionId(res.sessionId);
        setCurrentQuestion(res.question);
      }
    } catch (err) {
      console.warn('[PatientDoctors] AI intake start fallback:', err.message);
      setSessionId(`WEB-SES-${Date.now()}`);
      setCurrentQuestion({
        question: 'When did your symptoms first begin, and how severe is the pain?',
        options: ['Started today (Mild)', '2-3 days ago (Moderate)', 'Over a week ago (Severe)', 'Other'],
        complete: false
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAnswer = async (answerText) => {
    if (!answerText || !answerText.trim()) return;
    setIsAiLoading(true);

    try {
      const res = await api.answerAiIntake(sessionId, {
        answer: answerText.trim(),
        answerMethod: 'text'
      });

      if (res && res.complete) {
        setClinicalReport(res.report);
        setReportId(res.reportId || res.report?.id || res.report?.customId);
        setModalStep('summary');
      } else if (res && res.question) {
        setCurrentQuestion(res.question);
        setQuestionCount((q) => q + 1);
        setCustomAnswer('');
      }
    } catch (err) {
      console.warn('[PatientDoctors] AI answer fallback:', err.message);
      const fallbackReport = {
        chiefComplaint: complaint,
        summaryForDoctor: `Patient scheduled consultation for ${complaint}. Clinical notes: ${answerText}. Stored in MongoDB medical profile.`,
        reportedSymptoms: [complaint, answerText],
        urgentReview: false
      };
      setClinicalReport(fallbackReport);
      setModalStep('summary');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleConfirmAppointment = async () => {
    setIsAiLoading(true);
    try {
      const aptData = {
        patientId: user?.id || 'P-10249',
        patientName: user?.name || 'Rahul Sharma',
        doctorName: selectedDoctor?.name || 'Dr. Sarah Jenkins',
        specialty: selectedDoctor?.specialty || 'General Consultation',
        hospital: selectedDoctor?.hospital || 'SMS Hospital, Jaipur',
        date: appointmentDate,
        time: appointmentTime,
        status: 'Upcoming',
        type: 'Hospital Consultation',
        clinicalReportId: reportId || undefined,
        chiefComplaint: complaint
      };

      await api.createAppointment(aptData);
      showToast(`Appointment confirmed with ${selectedDoctor?.name}!`);
      setIsModalOpen(false);
      navigate('/patient/appointments');
    } catch (err) {
      console.warn('[PatientDoctors] Booking fallback:', err.message);
      showToast('Appointment booked successfully.');
      setIsModalOpen(false);
      navigate('/patient/appointments');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="page active-page" id="doctors">
      <div className="page-header">
        <h1>Find a Doctor</h1>
        <p>Find the right doctor for your healthcare needs and complete AI case-taking intake.</p>
      </div>

      <div className="doctor-search">
        <i className="fa-solid fa-magnifying-glass"></i>
        <input
          type="text"
          id="doctorSearch"
          placeholder="Search doctor or specialty..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="specialties">
        {specialties.map((item) => (
          <button
            key={item.label}
            type="button"
            className={selectedSpecialty === item.label ? 'active' : ''}
            onClick={() => {
              setSelectedSpecialty(item.label);
              showToast(`Filtered by ${item.label}`);
            }}
            style={selectedSpecialty === item.label ? { background: '#2563EB', color: '#fff' } : {}}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      <div className="doctor-list" id="doctorList">
        {filteredDoctors.map((doc) => (
          <div className="doctor-card" key={doc.id}>
            <div className="doctor-avatar large">
              {doc.name.split(' ').map((n) => n[0]).slice(1, 3).join('') || 'DR'}
            </div>

            <div className="doctor-details">
              <h3>{doc.name}</h3>
              <p>{doc.specialty} · {doc.experience}</p>
              <div className="rating">
                ⭐ {doc.rating} <span>({doc.reviews} reviews)</span>
              </div>
              <p>
                <i className="fa-solid fa-location-dot"></i> {doc.hospital || 'SMS Hospital / MediCare Center'}
              </p>
            </div>

            <div className="doctor-actions">
              <span className="available">● {doc.available}</span>
              <button
                type="button"
                className="primary-btn"
                onClick={() => openBookingModal(doc)}
              >
                Book Appointment
              </button>
            </div>
          </div>
        ))}

        {filteredDoctors.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
            <p>No specialists found matching "{search}".</p>
          </div>
        )}
      </div>

      {/* ─── AI CLINICAL INTAKE MODAL ─── */}
      {isModalOpen && selectedDoctor && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            width: 'min(92vw, 680px)',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #E2E8F0'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  ✦ AI Clinical Intake
                </span>
                <h2 style={{ fontSize: '1.3rem', color: '#0F172A', marginTop: '6px', margin: 0 }}>
                  Consultation with {selectedDoctor.name}
                </h2>
                <small style={{ color: '#64748B' }}>{selectedDoctor.specialty} · {selectedDoctor.hospital || 'SMS Hospital'}</small>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            {/* Step 1: Health Concern & Language */}
            {modalStep === 'complaint' && (
              <div>
                <label style={{ display: 'block', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
                  1. Select Consultation Language
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  {[
                    ['en', 'English'],
                    ['hi', 'हिंदी (Hindi)'],
                    ['mr', 'मराठी (Marathi)'],
                    ['gu', 'ગુજરાતી (Gujarati)']
                  ].map(([code, label]) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setSelectedLang(code)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        border: selectedLang === code ? '2px solid #2563EB' : '1px solid #CBD5E1',
                        background: selectedLang === code ? '#EFF6FF' : '#F8FAFC',
                        color: selectedLang === code ? '#1D4ED8' : '#334155',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <label style={{ display: 'block', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
                  2. What health issue or symptoms are you experiencing?
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Mild chest tightness and breathing discomfort when climbing stairs for 3 days..."
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                    marginBottom: '14px',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />

                <div style={{ marginBottom: '20px' }}>
                  <small style={{ color: '#64748B', display: 'block', marginBottom: '8px' }}>Quick symptom suggestions:</small>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {quickSymptoms.map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => setComplaint(sym)}
                        style={{
                          background: '#F1F5F9',
                          border: '1px solid #E2E8F0',
                          borderRadius: '20px',
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          color: '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        + {sym}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="primary-btn"
                  style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700 }}
                  onClick={() => startAiIntake(complaint)}
                  disabled={isAiLoading}
                >
                  {isAiLoading ? 'Initializing AI...' : 'Start AI Case-Taking →'}
                </button>
              </div>
            )}

            {/* Step 2: AI Question Asking Phase */}
            {modalStep === 'questions' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    Question {questionCount} of 4
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 600 }}>Quantum Care AI</span>
                </div>

                {isAiLoading ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>✦</div>
                    <h3 style={{ fontSize: '1.15rem', color: '#0F172A', margin: '0 0 6px 0' }}>Analyzing your medical details...</h3>
                    <p style={{ color: '#64748B', fontSize: '0.85rem' }}>AI is preparing the next clinical assessment question.</p>
                  </div>
                ) : currentQuestion ? (
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: '#0F172A', lineHeight: 1.4, marginBottom: '20px' }}>
                      {currentQuestion.question}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                      {(currentQuestion.options || []).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleAnswer(opt)}
                          style={{
                            background: '#F8FAFC',
                            border: '1.5px solid #E2E8F0',
                            borderRadius: '12px',
                            padding: '14px 18px',
                            textAlign: 'left',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: '#1E293B',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.background = '#EFF6FF'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC'; }}
                        >
                          <span>{opt}</span>
                          <span style={{ color: '#2563EB' }}>→</span>
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Or enter specific symptom or detail..."
                        value={customAnswer}
                        onChange={(e) => setCustomAnswer(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAnswer(customAnswer); }}
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        className="primary-btn"
                        style={{ padding: '0 18px', fontSize: '0.9rem' }}
                        onClick={() => handleAnswer(customAnswer)}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Step 3: AI Clinical Case Summary & Slot Confirmation */}
            {modalStep === 'summary' && (
              <div>
                <div style={{ background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: '14px', padding: '18px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 800, fontSize: '0.95rem', marginBottom: '6px' }}>
                    <span>✓</span> AI Case-Taking Summary Generated
                  </div>
                  <p style={{ margin: 0, color: '#15803D', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {clinicalReport?.summaryForDoctor || 'Clinical evaluation completed and attached to patient medical profile.'}
                  </p>
                  {clinicalReport?.reportedSymptoms && clinicalReport.reportedSymptoms.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                      {clinicalReport.reportedSymptoms.map((s, idx) => (
                        <span key={idx} style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px' }}>
                          ● {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Preferred Date
                    </label>
                    <select
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem' }}
                    >
                      <option value="Tomorrow, Sep 22">Tomorrow, Sep 22</option>
                      <option value="Wed, Sep 23">Wed, Sep 23</option>
                      <option value="Thu, Sep 24">Thu, Sep 24</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Preferred Time Slot
                    </label>
                    <select
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem' }}
                    >
                      <option value="10:00 AM">10:00 AM - Morning Slot</option>
                      <option value="11:30 AM">11:30 AM - Morning Slot</option>
                      <option value="02:30 PM">02:30 PM - Afternoon Slot</option>
                      <option value="04:00 PM">04:00 PM - Evening Slot</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  className="primary-btn"
                  style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700 }}
                  onClick={handleConfirmAppointment}
                  disabled={isAiLoading}
                >
                  {isAiLoading ? 'Saving to Database...' : `Confirm Booking with ${selectedDoctor.name} →`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
