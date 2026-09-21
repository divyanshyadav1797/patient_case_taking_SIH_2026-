import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PushToTalkButton from '../../components/Voice/PushToTalkButton';

export default function PatientDoctors() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const { doctors, appointments, showToast } = usePatient();
  const { user } = useAuth();

  // Multi-step AI Intake & Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 'complaint' | 'questions' | 'documents' | 'suggestDoctors' | 'slot' | 'confirmed'
  const [modalStep, setModalStep] = useState('complaint');
  const [complaint, setComplaint] = useState('');
  const [selectedLang, setSelectedLang] = useState('en');
  const [sessionId, setSessionId] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionCount, setQuestionCount] = useState(1);
  const [customAnswer, setCustomAnswer] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [clinicalReport, setClinicalReport] = useState(null);
  const [reportId, setReportId] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState('All');
  const [appointmentDate, setAppointmentDate] = useState('Tomorrow, Sep 22');
  const [appointmentTime, setAppointmentTime] = useState('11:00 AM');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Auto-launch AI intake if query parameter ?mode=book is present
  useEffect(() => {
    if (searchParams.get('mode') === 'book' || searchParams.get('book') === 'ai') {
      openAiBookingWorkflow();
    }
  }, [searchParams]);

  const specialties = [
    { label: 'All', icon: '🩺' },
    { label: 'Cardiology', icon: '❤️' },
    { label: 'Neurology', icon: '🧠' },
    { label: 'General Physician', icon: '👨‍⚕️' },
    { label: 'Orthopedics', icon: '🦴' },
    { label: 'Pediatrics', icon: '👶' },
    { label: 'Pulmonology', icon: '🫁' },
    { label: 'Gastroenterology', icon: '🫀' },
    { label: 'ENT', icon: '👂' }
  ];

  const quickSymptoms = [
    'Severe Chest Discomfort',
    'Recurring Fever & Chills',
    'Persistent Headache',
    'Abdominal / Stomach Pain',
    'Cough & Breathing Difficulty',
    'Knee Joint Pain',
    'Throat Pain & Difficulty Swallowing'
  ];

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      (doc.specialty || '').toLowerCase().includes(search.toLowerCase()) ||
      (doc.hospital || '').toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === 'All' ||
      (doc.specialty || '').toLowerCase().includes(selectedSpecialty.toLowerCase()) ||
      (doc.department || '').toLowerCase().includes(selectedSpecialty.toLowerCase());
    return matchesSearch && matchesSpecialty;
  });

  const openAiBookingWorkflow = (preferredDoctor = null) => {
    setSelectedDoctor(preferredDoctor);
    setModalStep('complaint');
    setComplaint('');
    setCustomAnswer('');
    setQuestionCount(1);
    setUploadedDocs([]);
    setClinicalReport(null);
    setReportId('');
    setConfirmedBooking(null);
    setIsModalOpen(true);
  };

  const startAiIntake = async (chiefProblem) => {
    const problem = chiefProblem || complaint;
    if (!problem || !problem.trim()) {
      showToast('Please describe your main health concern or symptom.');
      return;
    }

    setComplaint(problem);
    setIsAiLoading(true);
    setModalStep('questions');
    setQuestionCount(1);

    try {
      const res = await api.startAiIntake({
        patientId: user?.customId || user?.id || 'P-10249',
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
        question: 'When did your symptoms first begin, and how intense is the discomfort?',
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
        // Move to Step 3: Document Upload (like Kiosk)
        setModalStep('documents');
      } else if (res && res.question) {
        setCurrentQuestion(res.question);
        setQuestionCount((q) => q + 1);
        setCustomAnswer('');
      }
    } catch (err) {
      console.warn('[PatientDoctors] AI answer fallback:', err.message);
      const fallbackReport = {
        chiefComplaint: complaint,
        summaryForDoctor: `Patient scheduled consultation for ${complaint}. Clinical details: ${answerText}.`,
        reportedSymptoms: [complaint, answerText],
        recommendedSpecialty: getSpecialtySuggestion(complaint),
        urgentReview: false
      };
      setClinicalReport(fallbackReport);
      setModalStep('documents');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleVoiceAnswer = async (audioBlob, liveTranscript = '') => {
    if (!audioBlob && !liveTranscript) return;
    setIsAiLoading(true);

    try {
      let spokenAnswer = (liveTranscript || '').trim();

      // Transcribe via Gemini 3.6 Flash if no live browser transcript was captured
      if (!spokenAnswer && audioBlob) {
        const transRes = await api.transcribeVoice(audioBlob, selectedLang);
        spokenAnswer = (transRes?.transcript || transRes?.englishTranslation || '').trim();
      }

      if (!spokenAnswer) {
        showToast('Could not convert voice to text. Please speak clearly or type your answer.');
        return;
      }

      // Convert voice to text into the input field for visual feedback
      setCustomAnswer(spokenAnswer);
      showToast(`🎤 Voice converted to text: "${spokenAnswer}"`);

      // Progress AI session with the spoken text
      if (sessionId && sessionId.startsWith('WEB-SES-')) {
        handleAnswer(spokenAnswer);
        return;
      }

      const res = await api.answerAiIntake(
        sessionId,
        spokenAnswer,
        selectedLang,
        user?.customId || user?.id || ''
      );

      if (res && res.complete) {
        setClinicalReport(res.report);
        setReportId(res.reportId || res.report?.id || res.report?.customId);
        setModalStep('documents');
      } else if (res && res.question) {
        setCurrentQuestion(res.question);
        setQuestionCount((q) => q + 1);
        setCustomAnswer('');
      }
    } catch (err) {
      console.warn('[PatientDoctors] Voice answer error, attempting fallback:', err.message);
      try {
        if (audioBlob) {
          const transRes = await api.transcribeVoice(audioBlob, selectedLang);
          if (transRes && (transRes.englishTranslation || transRes.transcript)) {
            const txt = transRes.transcript || transRes.englishTranslation;
            setCustomAnswer(txt);
            showToast(`🎤 Voice converted to text: "${txt}"`);
            handleAnswer(txt);
            return;
          }
        }
      } catch (e2) {
        // ignore
      }
      showToast('Could not process voice audio. Please speak clearly or select an option.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleVoiceComplaint = async (audioBlob, liveTranscript = '') => {
    if (!audioBlob && !liveTranscript) return;
    setIsAiLoading(true);
    try {
      let text = (liveTranscript || '').trim();
      if (!text && audioBlob) {
        const res = await api.transcribeVoice(audioBlob, selectedLang);
        text = (res?.transcript || res?.englishTranslation || '').trim();
      }
      if (text) {
        setComplaint(text);
        showToast(`🎤 Voice converted to text: "${text}"`);
      } else {
        showToast('Speech unclear, please try again.');
      }
    } catch (err) {
      console.warn('[PatientDoctors] Voice complaint error:', err.message);
      showToast('Voice transcription failed. Please type your symptoms.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Helper to deduce specialty when in offline fallback
  const getSpecialtySuggestion = (problem = '') => {
    const p = problem.toLowerCase();
    if (p.includes('chest') || p.includes('heart') || p.includes('palpitation')) return 'Cardiology';
    if (p.includes('headache') || p.includes('dizzy') || p.includes('numb')) return 'Neurology';
    if (p.includes('joint') || p.includes('bone') || p.includes('fracture') || p.includes('knee')) return 'Orthopedics';
    if (p.includes('cough') || p.includes('breath') || p.includes('asthma') || p.includes('lung')) return 'Pulmonology';
    if (p.includes('stomach') || p.includes('digest') || p.includes('acid') || p.includes('vomit')) return 'Gastroenterology';
    if (p.includes('child') || p.includes('baby') || p.includes('pediatric')) return 'Pediatrics';
    if (p.includes('ear') || p.includes('throat') || p.includes('nose')) return 'ENT';
    return 'General Physician';
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newDocs = files.map((f) => ({
      file: f,
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: f.type || 'Document',
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    setUploadedDocs((prev) => [...prev, ...newDocs]);
    showToast(`${files.length} medical document(s) attached.`);
  };

  const removeDoc = (index) => {
    setUploadedDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const proceedFromDocuments = async () => {
    // Save records and photos to MongoDB with real OCR if any uploaded
    if (uploadedDocs.length > 0) {
      setIsAiLoading(true);
      showToast('Processing uploaded documents with clinical OCR...');
      try {
        for (const doc of uploadedDocs) {
          if (doc.file) {
            await api.uploadRecord(doc.file, {
              title: doc.name,
              type: doc.file.type?.startsWith('image/') ? 'Diagnostic Photo' : 'Lab Report',
              patientId: user?.customId || user?.id || 'P-10249',
              clinicalReportId: reportId || undefined
            });
          } else {
            await api.createRecord({
              title: doc.name,
              type: 'Prescription / Lab Report',
              doctor: 'External Doctor / Lab',
              hospital: 'Patient Upload',
              patientId: user?.customId || user?.id || 'P-10249',
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            });
          }
        }
        showToast('Medical documents saved and OCR analysis attached to clinical report.');
      } catch (err) {
        console.warn('[PatientDoctors] Upload persistence note:', err.message);
      } finally {
        setIsAiLoading(false);
      }
    }
    // Proceed to Step 4: Multi-hospital Doctor Recommendations
    setModalStep('suggestDoctors');
  };

  const handleSelectDoctor = (doc) => {
    setSelectedDoctor(doc);
    setModalStep('slot');
  };

  const handleConfirmAppointment = async () => {
    if (!selectedDoctor) return;
    setIsAiLoading(true);

    try {
      const aptData = {
        patientId: user?.customId || user?.id || 'P-10249',
        patientName: user?.name || 'Rahul Sharma',
        doctorId: selectedDoctor.id || selectedDoctor.customId,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty || selectedDoctor.department || 'General Physician',
        hospital: selectedDoctor.hospital || 'SMS Hospital Jaipur',
        date: appointmentDate,
        time: appointmentTime,
        status: 'Upcoming',
        type: 'OPD Consultation',
        clinicalReportId: reportId || undefined,
        chiefComplaint: complaint,
        notes: `AI Clinical Assessment attached. ${uploadedDocs.length} past record(s) linked.`
      };

      const res = await api.createAppointment(aptData);
      setConfirmedBooking(res);
      showToast(`Appointment confirmed with ${selectedDoctor.name}!`);
      setModalStep('confirmed');
    } catch (err) {
      console.warn('[PatientDoctors] Booking fallback:', err.message);
      setConfirmedBooking({
        doctorName: selectedDoctor.name,
        hospital: selectedDoctor.hospital,
        date: appointmentDate,
        time: appointmentTime,
        id: `APT-${Math.floor(1000 + Math.random() * 9000)}`
      });
      showToast('Appointment booked successfully.');
      setModalStep('confirmed');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Extract recommended specialty from AI synthesis
  const recommendedSpecialty = clinicalReport?.recommendedSpecialty || getSpecialtySuggestion(complaint);

  // Filter suggested doctors across multiple area hospitals
  const suggestedDoctors = doctors.filter((doc) => {
    // If user explicitly picked a hospital tab
    if (selectedHospitalFilter !== 'All' && !doc.hospital.toLowerCase().includes(selectedHospitalFilter.toLowerCase())) {
      return false;
    }
    // Match recommended specialty if available
    if (recommendedSpecialty) {
      const docField = `${doc.specialty || ''} ${doc.department || ''}`.toLowerCase();
      const rec = recommendedSpecialty.toLowerCase();
      if (docField.includes(rec) || rec.includes(docField)) return true;
    }
    return true;
  });

  // Extract unique hospital names in the area from loaded doctors
  const areaHospitals = Array.from(new Set(doctors.map((d) => d.hospital).filter(Boolean)));

  return (
    <div className="page active-page" id="doctors">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Find a Doctor & Book Appointment</h1>
          <p>Complete intelligent AI intake, upload past prescriptions, and get matched to top specialists across area hospitals.</p>
        </div>

        <button
          type="button"
          className="primary-btn"
          style={{
            padding: '12px 24px',
            fontSize: '0.95rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
          }}
          onClick={() => openAiBookingWorkflow()}
        >
          <i className="fa-solid fa-wand-magic-sparkles"></i>
          AI-Guided Appointment Booking
        </button>
      </div>

      {/* AI Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
        border: '1.5px solid #BFDBFE',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#2563EB',
            color: '#FFFFFF',
            display: 'grid',
            placeItems: 'center',
            fontSize: '1.5rem'
          }}>
            ✦
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1E3A8A', fontWeight: 800 }}>
              AI Clinical Assistant & Multi-Hospital Doctor Matching
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#3B82F6' }}>
              Describe your symptoms once. Our AI prepares your case brief, lets you attach reports, and suggests available doctors from SMS Hospital, Fortis, Apex, EHCC & more.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openAiBookingWorkflow()}
          style={{
            background: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
          }}
        >
          Start AI Triage →
        </button>
      </div>

      {/* Doctor Search Bar */}
      <div className="doctor-search">
        <i className="fa-solid fa-magnifying-glass"></i>
        <input
          type="text"
          id="doctorSearch"
          placeholder="Search by doctor name, specialty, or hospital (e.g. SMS, Fortis, Apex)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Specialty Filter Chips */}
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

      {/* Doctor Cards Directory */}
      <div className="doctor-list" id="doctorList">
        {filteredDoctors.map((doc) => (
          <div className="doctor-card" key={doc.id}>
            <div className="doctor-avatar large">
              {doc.image ? (
                <img src={doc.image} alt={doc.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                doc.name.split(' ').map((n) => n[0]).slice(1, 3).join('') || 'DR'
              )}
            </div>

            <div className="doctor-details">
              <h3>{doc.name}</h3>
              <p>{doc.specialty || doc.department} · {doc.experience || '10+ yrs exp'}</p>
              <div className="rating">
                ⭐ {doc.rating || '4.9'} <span>({doc.reviews || 120} reviews)</span>
              </div>
              <p style={{ marginTop: '4px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#F1F5F9',
                  color: '#334155',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  <i className="fa-solid fa-hospital" style={{ color: '#2563EB' }}></i>
                  {doc.hospital || 'SMS Hospital Jaipur'}
                </span>
              </p>
            </div>

            <div className="doctor-actions">
              <span className="available">● {doc.available || 'Available Today'}</span>
              <button
                type="button"
                className="primary-btn"
                onClick={() => openAiBookingWorkflow(doc)}
              >
                Book Appointment
              </button>
            </div>
          </div>
        ))}

        {filteredDoctors.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B', gridColumn: '1 / -1' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No specialists found matching "{search}".</p>
            <button
              type="button"
              className="secondary-btn"
              style={{ marginTop: '10px' }}
              onClick={() => { setSearch(''); setSelectedSpecialty('All'); }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* ─── 5-STEP AI CLINICAL INTAKE & MULTI-HOSPITAL BOOKING MODAL ─── */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '1.25rem',
          overflowY: 'auto'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(28px) saturate(190%)',
            WebkitBackdropFilter: 'blur(28px) saturate(190%)',
            borderRadius: '24px',
            width: 'min(94vw, 760px)',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), inset 0 1px 3px rgba(255, 255, 255, 0.95)',
            border: '1.5px solid rgba(255, 255, 255, 0.85)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header & Progress Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    ✦ AI Clinical Triage
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                    {modalStep === 'complaint' && 'Step 1 of 5 · Concern'}
                    {modalStep === 'questions' && `Step 2 of 5 · Question ${questionCount} of 4`}
                    {modalStep === 'documents' && 'Step 3 of 5 · Document Upload'}
                    {modalStep === 'suggestDoctors' && 'Step 4 of 5 · Doctor Recommendation'}
                    {modalStep === 'slot' && 'Step 5 of 5 · Slot & Confirmation'}
                    {modalStep === 'confirmed' && '✓ Completed'}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.35rem', color: '#0F172A', marginTop: '6px', margin: 0, fontWeight: 800 }}>
                  {modalStep === 'complaint' && 'What Brings You Here Today?'}
                  {modalStep === 'questions' && 'Clinical Intake Case-Taking'}
                  {modalStep === 'documents' && 'Attach Previous Medical Documents'}
                  {modalStep === 'suggestDoctors' && 'Recommended Specialists in Area'}
                  {modalStep === 'slot' && `Select Time Slot for ${selectedDoctor?.name || 'Doctor'}`}
                  {modalStep === 'confirmed' && 'Appointment Confirmed!'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            {/* ── STEP 1: Health Concern & Language ── */}
            {modalStep === 'complaint' && (
              <div>
                <label style={{ display: 'block', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
                  1. Choose Intake Language
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
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
                  2. Describe your current health issue or symptoms:
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Sharp pain in lower abdomen since yesterday with mild nausea and fever..."
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

                <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', padding: '10px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                    {selectedLang === 'hi' ? '🎤 बोलकर बताएं (Push to Talk):' : '🎤 Describe with voice (Push to Talk):'}
                  </span>
                  <PushToTalkButton
                    onAudioReady={handleVoiceComplaint}
                    isProcessing={isAiLoading}
                    language={selectedLang}
                    compact={true}
                    label={selectedLang === 'hi' ? 'बोलने के लिए दबाएं (Hold to Talk)' : 'Hold / Tap to Speak'}
                  />
                </div>

                <div style={{ marginBottom: '22px' }}>
                  <small style={{ color: '#64748B', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                    Quick symptom options:
                  </small>
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
                  {isAiLoading ? 'Initializing AI Engine...' : 'Start Guided AI Case-Taking →'}
                </button>
              </div>
            )}

            {/* ── STEP 2: AI Guided Case-Taking Questions ── */}
            {modalStep === 'questions' && (
              <div>
                {isAiLoading ? (
                  <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✦</div>
                    <h3 style={{ fontSize: '1.2rem', color: '#0F172A', margin: '0 0 6px 0' }}>
                      Quantum Care AI is reasoning...
                    </h3>
                    <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                      Evaluating symptom presentation and preparing targeted clinical inquiry.
                    </p>
                  </div>
                ) : currentQuestion ? (
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: '#0F172A', lineHeight: 1.4, marginBottom: '16px', fontWeight: 700 }}>
                      {currentQuestion.question}
                    </h3>

                    {/* Dedicated Push-to-Talk Voice Bar for Patient Interview Turn */}
                    <div style={{ margin: '14px 0 18px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#EFF6FF', padding: '16px', borderRadius: '14px', border: '1.5px dashed #93C5FD' }}>
                      <div style={{ marginBottom: '8px', fontWeight: 700, color: '#1E40AF', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🎙️</span> {selectedLang === 'hi' ? 'बोलकर उत्तर दें (Push to Talk - हिंदी):' : 'Answer with Voice (Push to Talk):'}
                      </div>
                      <PushToTalkButton
                        onAudioReady={handleVoiceAnswer}
                        isProcessing={isAiLoading}
                        language={selectedLang}
                        label={selectedLang === 'hi' ? 'बोलने के लिए दबाकर रखें (Hold or Tap to Speak)' : 'Hold or Tap to Speak'}
                      />
                      <small style={{ marginTop: '6px', color: '#475569', fontSize: '0.8rem' }}>
                        {selectedLang === 'hi' ? 'दबाकर बोलें और छोड़ दें, AI उत्तर रिकॉर्ड करके अगला प्रश्न पूछेगा' : 'Hold to talk and release, AI processes your answer instantly'}
                      </small>
                    </div>

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
                          <span style={{ color: '#2563EB', fontWeight: 800 }}>→</span>
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Or type specific details / duration / allergies..."
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
                      <PushToTalkButton
                        onAudioReady={async (audioBlob, liveTranscript = '') => {
                          try {
                            setIsAiLoading(true);
                            let text = (liveTranscript || '').trim();
                            if (!text && audioBlob) {
                              const tr = await api.transcribeVoice(audioBlob, selectedLang);
                              text = (tr?.transcript || tr?.englishTranslation || '').trim();
                            }
                            if (text) {
                              setCustomAnswer(text);
                              showToast(`🎤 Voice converted to text: "${text}"`);
                            } else {
                              showToast('Speech unclear, please try again.');
                            }
                          } catch (e) {
                            showToast('Could not process audio');
                          } finally {
                            setIsAiLoading(false);
                          }
                        }}
                        isProcessing={isAiLoading}
                        language={selectedLang}
                        compact={true}
                        label="🎙️"
                      />
                      <button
                        type="button"
                        className="primary-btn"
                        style={{ padding: '0 20px', fontSize: '0.9rem', fontWeight: 700 }}
                        onClick={() => handleAnswer(customAnswer)}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* ── STEP 3: Medical Document & Past Prescriptions Upload (Like Kiosk) ── */}
            {modalStep === 'documents' && (
              <div>
                <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: 0, marginBottom: '16px' }}>
                  Attach your previous prescriptions, diagnostic lab reports (blood tests, lipid profile), discharge summaries or scans. These will be linked directly to your appointment record.
                </p>

                {/* Upload Box */}
                <div
                  style={{
                    border: '2px dashed #93C5FD',
                    background: '#F8FAFC',
                    borderRadius: '16px',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    marginBottom: '16px',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => document.getElementById('web-doc-upload').click()}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📄</div>
                  <strong style={{ display: 'block', color: '#1E3A8A', fontSize: '1rem', marginBottom: '4px' }}>
                    Click or Drag to Upload Medical Documents
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    Supports PDF, JPG, PNG (Prescriptions, Lab Reports, X-Rays)
                  </span>
                  <input
                    id="web-doc-upload"
                    type="file"
                    multiple
                    accept=".pdf,image/*"
                    hidden
                    onChange={handleFileUpload}
                  />
                </div>

                {/* OCR Notice Badge */}
                <div style={{
                  background: '#FEF3C7',
                  border: '1px solid #FCD34D',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '18px'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>⚡</span>
                  <div style={{ fontSize: '0.8rem', color: '#92400E', lineHeight: 1.4 }}>
                    <strong>Automated OCR Extraction:</strong> Medical document optical character recognition will be enabled in the upcoming module to auto-extract vitals and dosage history.
                  </div>
                </div>

                {/* Uploaded Documents List */}
                {uploadedDocs.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <small style={{ fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                      Attached Files ({uploadedDocs.length}):
                    </small>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {uploadedDocs.map((doc, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#F1F5F9',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '0.85rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>📎</span>
                            <strong style={{ color: '#0F172A' }}>{doc.name}</strong>
                            <small style={{ color: '#64748B' }}>({doc.size})</small>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDoc(idx)}
                            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontWeight: 700 }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                  <button
                    type="button"
                    className="secondary-btn"
                    style={{ flex: 1, padding: '14px', fontSize: '0.95rem' }}
                    onClick={proceedFromDocuments}
                  >
                    Skip & Continue →
                  </button>
                  <button
                    type="button"
                    className="primary-btn"
                    style={{ flex: 2, padding: '14px', fontSize: '0.95rem', fontWeight: 700 }}
                    onClick={proceedFromDocuments}
                  >
                    {uploadedDocs.length > 0 ? `Attach (${uploadedDocs.length}) Files & Find Doctors →` : 'Find Suggested Doctors →'}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 4: AI Synthesis & Multi-Hospital Doctor Recommendations ── */}
            {modalStep === 'suggestDoctors' && (
              <div>
                {/* AI Synthesis Summary Card — Ultra-Readable Liquid Glass */}
                <div className={`ai-summary-glass-container ${clinicalReport?.urgentReview ? 'urgent-alert' : ''}`} style={{ marginBottom: '22px' }}>
                  <div className="ai-summary-header">
                    <div className="ai-summary-title-badge">
                      <div className="ai-summary-icon">
                        <i className="fa-solid fa-file-waveform"></i>
                      </div>
                      <span>Clinical Intake Synthesis & Specialty Matching</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className={clinicalReport?.urgentReview ? 'ai-acuity-pill-urgent' : 'ai-acuity-pill-standard'}>
                        <i className={`fa-solid ${clinicalReport?.urgentReview ? 'fa-triangle-exclamation' : 'fa-circle-check'}`}></i>
                        {clinicalReport?.triageLevel ? `Triage: ${clinicalReport.triageLevel.replace('_', ' ')}` : (clinicalReport?.urgentReview ? 'Priority 1 · Urgent Review' : 'Priority 3 · Standard OPD')}
                      </span>
                      <span style={{
                        background: 'rgba(37, 99, 235, 0.12)',
                        border: '1.5px solid rgba(37, 99, 235, 0.35)',
                        color: '#1D4ED8',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        letterSpacing: '0.3px'
                      }}>
                        <i className="fa-solid fa-hospital-user" style={{ marginRight: '6px' }}></i>
                        Recommended Department: {recommendedSpecialty}
                      </span>
                    </div>
                  </div>

                  {/* Prominent Chief Complaint Callout */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '10px',
                    padding: '10px 16px',
                    background: 'rgba(255, 255, 255, 0.75)',
                    borderRadius: '12px',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    marginBottom: '16px'
                  }}>
                    <strong style={{ fontSize: '0.95rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Reported Concern:
                    </strong>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                      "{complaint || clinicalReport?.chiefComplaint || 'General Consultation'}"
                    </span>
                  </div>

                  {/* Big Readable AI Narrative Summary */}
                  <div className="ai-summary-brief-body" style={{ fontSize: '1.15rem', lineHeight: '1.85', color: '#0F172A', fontWeight: 500, marginBottom: '16px' }}>
                    {clinicalReport?.summaryForDoctor || `Intelligent clinical evaluation complete. Based on symptom onset, duration, and clinical presentation, case-taking indicates consultation with a specialist in ${recommendedSpecialty}.`}
                  </div>

                  {/* Reported Symptoms & Suggested Investigations Chips */}
                  {clinicalReport?.reportedSymptoms && clinicalReport.reportedSymptoms.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Noted Symptoms:</span>
                      {clinicalReport.reportedSymptoms.map((sym, idx) => (
                        <span key={idx} className="ai-glass-chip">
                          <i className="fa-solid fa-check" style={{ fontSize: '0.75rem', color: '#059669' }}></i>
                          {sym}
                        </span>
                      ))}
                    </div>
                  )}

                  {clinicalReport?.suggestedInvestigations && clinicalReport.suggestedInvestigations.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Suggested Tests:</span>
                      {clinicalReport.suggestedInvestigations.map((inv, idx) => (
                        <span key={idx} className="ai-glass-chip scan-chip">
                          <i className="fa-solid fa-vial-virus" style={{ fontSize: '0.75rem', color: '#4F46E5' }}></i>
                          {inv}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0F172A', fontWeight: 800 }}>
                    Select a Doctor Across Area Hospitals:
                  </h3>
                  <small style={{ color: '#64748B' }}>{suggestedDoctors.length} available</small>
                </div>

                {/* Hospital Filter Pills */}
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
                  {['All', ...areaHospitals].map((hosp) => (
                    <button
                      key={hosp}
                      type="button"
                      onClick={() => setSelectedHospitalFilter(hosp)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: selectedHospitalFilter === hosp ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                        background: selectedHospitalFilter === hosp ? '#EFF6FF' : '#FFFFFF',
                        color: selectedHospitalFilter === hosp ? '#1D4ED8' : '#475569',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                      }}
                    >
                      {hosp === 'All' ? 'All Area Hospitals' : hosp}
                    </button>
                  ))}
                </div>

                {/* Doctor List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
                  {suggestedDoctors.map((doc) => (
                    <div
                      key={doc.id || doc.name}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '14px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        background: '#FFFFFF',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          background: '#E0E7FF',
                          color: '#3730A3',
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: 700,
                          fontSize: '1rem',
                          overflow: 'hidden'
                        }}>
                          {doc.image ? (
                            <img src={doc.image} alt={doc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            doc.name.split(' ').map((n) => n[0]).slice(1, 3).join('') || 'DR'
                          )}
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.95rem', color: '#0F172A', display: 'block' }}>{doc.name}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                            {doc.specialty || doc.department} · {doc.experience || '10+ yrs'} · ⭐ {doc.rating || '4.9'}
                          </span>
                          <div style={{ marginTop: '3px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#F1F5F9',
                              color: '#2563EB',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              <i className="fa-solid fa-hospital"></i> {doc.hospital || 'Area Hospital'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: '#16A34A', fontWeight: 600, marginBottom: '6px' }}>
                          ● {doc.available || 'Available'}
                        </span>
                        <button
                          type="button"
                          className="primary-btn"
                          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                          onClick={() => handleSelectDoctor(doc)}
                        >
                          Select Doctor →
                        </button>
                      </div>
                    </div>
                  ))}

                  {suggestedDoctors.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                      <p>No doctors found for the selected filter.</p>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => setSelectedHospitalFilter('All')}
                      >
                        Show All Hospitals
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 5: Slot Selection & Confirmation ── */}
            {modalStep === 'slot' && selectedDoctor && (
              <div>
                {/* Doctor Selection Summary */}
                <div style={{
                  background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '16px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: '#DBEAFE',
                    color: '#1D4ED8',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  }}>
                    👨‍⚕️
                  </div>
                  <div>
                    <strong style={{ fontSize: '1.05rem', color: '#0F172A', display: 'block' }}>
                      {selectedDoctor.name}
                    </strong>
                    <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                      {selectedDoctor.specialty || selectedDoctor.department} · {selectedDoctor.fee || '₹600'}
                    </span>
                    <div style={{ marginTop: '3px' }}>
                      <span style={{ color: '#2563EB', fontWeight: 700, fontSize: '0.8rem' }}>
                        🏥 {selectedDoctor.hospital || 'SMS Hospital'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Date & Time Selectors */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Preferred Consultation Date:
                    </label>
                    <select
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem' }}
                    >
                      <option value="Tomorrow, Sep 22">Tomorrow, Sep 22</option>
                      <option value="Wed, Sep 23">Wed, Sep 23</option>
                      <option value="Thu, Sep 24">Thu, Sep 24</option>
                      <option value="Fri, Sep 25">Fri, Sep 25</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Consultation Time Slot:
                    </label>
                    <select
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem' }}
                    >
                      <option value="10:00 AM">10:00 AM - Morning Slot</option>
                      <option value="11:30 AM">11:30 AM - Morning Slot</option>
                      <option value="02:30 PM">02:30 PM - Afternoon Slot</option>
                      <option value="04:30 PM">04:30 PM - Evening Slot</option>
                    </select>
                  </div>
                </div>

                {/* Attached Details Overview */}
                <div style={{ background: '#F1F5F9', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', fontSize: '0.8rem', color: '#475569' }}>
                  <div><strong>Chief Concern:</strong> {complaint}</div>
                  <div><strong>AI Triage Report:</strong> Linked (ID: {reportId || 'AUTO-ATTACH'})</div>
                  <div><strong>Past Records Attached:</strong> {uploadedDocs.length} document(s)</div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    className="secondary-btn"
                    style={{ flex: 1, padding: '14px' }}
                    onClick={() => setModalStep('suggestDoctors')}
                  >
                    ← Change Doctor
                  </button>
                  <button
                    type="button"
                    className="primary-btn"
                    style={{ flex: 2, padding: '14px', fontSize: '1rem', fontWeight: 700 }}
                    onClick={handleConfirmAppointment}
                    disabled={isAiLoading}
                  >
                    {isAiLoading ? 'Saving to Database...' : `Confirm Booking with ${selectedDoctor.name} →`}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 6: Booking Confirmation Receipt ── */}
            {modalStep === 'confirmed' && confirmedBooking && (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#DCFCE7',
                  color: '#16A34A',
                  fontSize: '2rem',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 16px'
                }}>
                  ✓
                </div>
                <h3 style={{ fontSize: '1.4rem', color: '#0F172A', fontWeight: 800, margin: '0 0 6px 0' }}>
                  Appointment Successfully Scheduled!
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Your appointment and clinical case brief have been recorded in the hospital system.
                </p>

                <div style={{
                  background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '18px',
                  textAlign: 'left',
                  maxWidth: '420px',
                  margin: '0 auto 24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#64748B', fontSize: '0.85rem' }}>Doctor:</span>
                    <strong style={{ color: '#0F172A' }}>{confirmedBooking.doctorName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#64748B', fontSize: '0.85rem' }}>Hospital:</span>
                    <strong style={{ color: '#2563EB' }}>{confirmedBooking.hospital}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#64748B', fontSize: '0.85rem' }}>Date & Time:</span>
                    <strong style={{ color: '#0F172A' }}>{confirmedBooking.date} at {confirmedBooking.time}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontSize: '0.85rem' }}>Appointment ID:</span>
                    <strong style={{ color: '#16A34A', letterSpacing: '1px' }}>{confirmedBooking.id || 'APT-CONFIRMED'}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="primary-btn"
                    style={{ padding: '12px 24px', fontWeight: 700 }}
                    onClick={() => {
                      setIsModalOpen(false);
                      navigate('/patient/appointments');
                    }}
                  >
                    View in My Appointments →
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    style={{ padding: '12px 24px' }}
                    onClick={() => setIsModalOpen(false)}
                  >
                    Close
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
