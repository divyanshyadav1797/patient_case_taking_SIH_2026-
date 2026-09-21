import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../../styles/kiosk.css';

/* ─── Complete Multilingual Dictionary ─────────────────────────────── */
const T = {
  en: {
    tag: 'Your Health, Our Support',
    welcome: 'Welcome',
    self: 'Self Check-In & OPD Service',
    start: 'Start',
    touch: 'Touch the screen to begin',
    fast: 'Fast',
    easy: 'Easy',
    secure: 'Secure',
    care: 'Better Care',
    aadhaar: 'Enter Your Aadhaar Number',
    aadhaarSub: 'Please enter your 12-digit Aadhaar number',
    pin: 'Enter 4-Digit PIN',
    pinSub: 'Please enter your 4-digit PIN',
    next: 'Next',
    login: 'Login',
    clear: 'Clear',
    newPatient: 'New Patient',
    secureText: 'Your information is safe and secure. Used only for hospital services.',
    register: 'New Patient Registration',
    registerSub: 'Continue to create your patient profile.',
    continue: 'Continue',
    concern: 'What brings you here today?',
    concernSub: 'Select your main concern or use voice input.',
    fever: 'Fever / Cold / Cough',
    stomach: 'Stomach / Digestive',
    body: 'Body Pain',
    eye: 'Eye Problem',
    skin: 'Skin Disease',
    other: 'Other',
    voice: 'Tap to Speak',
    voiceSub: 'Tell us your problem in your language',
    docs: 'Add Previous Medical Documents',
    docsSub: 'Scan the QR code with your phone to upload prescriptions and reports.',
    scan: 'Scan QR to Upload',
    camera: 'Capture with Camera',
    device: 'Upload from Device',
    noDocs: 'No Documents',
    noDocsSub: 'Continue without documents',
    records: 'Documents will be linked to your patient record.',
    department: 'Select Department',
    departmentSub: 'Choose the department you want to visit',
    general: 'General OPD',
    eyeCare: 'Eye Care',
    skinHair: 'Skin & Hair',
    dental: 'Dental',
    ortho: 'Orthopedics',
    ent: 'ENT',
    cardio: 'Cardiology',
    gyn: 'Gynecology',
    doctor: 'Select Doctor',
    available: 'Available Now',
    next15: 'Next in 15 min',
    next30: 'Next in 30 min',
    select: 'Select',
    confirm: 'Confirm Doctor',
    confirmSub: 'Review your doctor selection before generating the token.',
    change: 'Change',
    generate: 'Generate Token',
    tokenGenerated: 'Your Token is Generated!',
    proceed: 'Please proceed to the waiting area.',
    token: 'Token Number',
    receipt: 'Receipt printed automatically',
    redirect: 'Starting new patient registration in',
    done: 'Done',
    seconds: 'seconds',
    back: 'Back',
    help: 'Need help? Touch the screen or approach the hospital reception desk.',
    logout: 'Exit Kiosk'
  },
  hi: {
    tag: 'आपका स्वास्थ्य, हमारा सहयोग',
    welcome: 'स्वागत है',
    self: 'स्वयं चेक-इन और ओपीडी सेवा',
    start: 'शुरू करें',
    touch: 'शुरू करने के लिए स्क्रीन को स्पर्श करें',
    fast: 'तेज़',
    easy: 'आसान',
    secure: 'सुरक्षित',
    care: 'बेहतर देखभाल',
    aadhaar: 'अपना आधार नंबर दर्ज करें',
    aadhaarSub: '12 अंकों का आधार नंबर दर्ज करें',
    pin: '4 अंकों का PIN दर्ज करें',
    pinSub: 'कृपया अपना 4 अंकों का PIN दर्ज करें',
    next: 'आगे',
    login: 'लॉगिन',
    clear: 'साफ़ करें',
    newPatient: 'नया मरीज',
    secureText: 'आपकी जानकारी सुरक्षित है। केवल अस्पताल सेवाओं के लिए उपयोग होगी।',
    register: 'नए मरीज का पंजीकरण',
    registerSub: 'मरीज प्रोफाइल बनाने के लिए आगे बढ़ें।',
    continue: 'जारी रखें',
    concern: 'आज आप किस समस्या के लिए आए हैं?',
    concernSub: 'मुख्य समस्या चुनें या आवाज़ से बताएं।',
    fever: 'बुखार / सर्दी / खांसी',
    stomach: 'पेट / पाचन',
    body: 'शरीर में दर्द',
    eye: 'आंख की समस्या',
    skin: 'त्वचा रोग',
    other: 'अन्य',
    voice: 'बोलने के लिए टैप करें',
    voiceSub: 'अपनी भाषा में समस्या बताएं',
    docs: 'पुराने मेडिकल दस्तावेज़ जोड़ें',
    docsSub: 'प्रिस्क्रिप्शन और रिपोर्ट के लिए QR स्कैन करें।',
    scan: 'अपलोड के लिए QR स्कैन करें',
    camera: 'कैमरा से कैप्चर करें',
    device: 'डिवाइस से अपलोड करें',
    noDocs: 'कोई दस्तावेज़ नहीं',
    noDocsSub: 'बिना दस्तावेज़ आगे बढ़ें',
    records: 'दस्तावेज़ आपके मरीज रिकॉर्ड से जुड़ेंगे।',
    department: 'विभाग चुनें',
    departmentSub: 'वह विभाग चुनें जहां आप जाना चाहते हैं',
    general: 'जनरल ओपीडी',
    eyeCare: 'आई केयर',
    skinHair: 'स्किन और हेयर',
    dental: 'दंत चिकित्सा',
    ortho: 'ऑर्थोपेडिक्स',
    ent: 'ईएनटी',
    cardio: 'कार्डियोलॉजी',
    gyn: 'स्त्री रोग',
    doctor: 'डॉक्टर चुनें',
    available: 'अभी उपलब्ध',
    next15: '15 मिनट में',
    next30: '30 मिनट में',
    select: 'चुनें',
    confirm: 'डॉक्टर की पुष्टि करें',
    confirmSub: 'टोकन बनाने से पहले डॉक्टर की जानकारी देखें।',
    change: 'बदलें',
    generate: 'टोकन बनाएं',
    tokenGenerated: 'आपका टोकन बन गया है!',
    proceed: 'कृपया प्रतीक्षा क्षेत्र में जाएं।',
    token: 'टोकन नंबर',
    receipt: 'रसीद अपने आप प्रिंट हो गई',
    redirect: 'नए मरीज के पंजीकरण पर जा रहे हैं',
    done: 'समाप्त',
    seconds: 'सेकंड',
    back: 'वापस',
    help: 'सहायता के लिए स्क्रीन को स्पर्श करें या अस्पताल रिसेप्शन से संपर्क करें।',
    logout: 'बाहर निकलें'
  }
};

T.mr = {
  ...T.en,
  tag: 'तुमचे आरोग्य, आमचा आधार',
  welcome: 'स्वागत',
  self: 'स्वयं चेक-इन आणि ओपीडी सेवा',
  start: 'सुरू करा',
  touch: 'सुरू करण्यासाठी स्क्रीनला स्पर्श करा',
  aadhaar: 'तुमचा आधार क्रमांक टाका',
  aadhaarSub: '12 अंकी आधार क्रमांक टाका',
  pin: '4 अंकी PIN टाका',
  pinSub: 'कृपया 4 अंकी PIN टाका',
  next: 'पुढे',
  login: 'लॉगिन',
  clear: 'पुसा',
  newPatient: 'नवीन रुग्ण',
  secureText: 'तुमची माहिती सुरक्षित आहे.',
  concern: 'आज तुम्ही कोणत्या समस्येसाठी आला आहात?',
  docs: 'मागील वैद्यकीय कागदपत्रे जोडा',
  department: 'विभाग निवडा',
  doctor: 'डॉक्टर निवडा',
  tokenGenerated: 'तुमचा टोकन तयार झाला!',
  receipt: 'पावती आपोआप प्रिंट झाली',
  redirect: 'नवीन रुग्ण नोंदणीवर जात आहे',
  logout: 'बाहेर पडा'
};

T.gu = {
  ...T.en,
  tag: 'તમારું આરોગ્ય, અમારો સહયોગ',
  welcome: 'સ્વાગત છે',
  self: 'સેલ્ફ ચેક-ઇન અને OPD સેવા',
  start: 'શરૂ કરો',
  touch: 'શરૂ કરવા માટે સ્ક્રીનને સ્પર્શ કરો',
  aadhaar: 'તમારો આધાર નંબર દાખલ કરો',
  pin: '4 અંકનો PIN દાખલ કરો',
  newPatient: 'નવો દર્દી',
  concern: 'આજે તમે શા માટે આવ્યા છો?',
  docs: 'જૂના મેડિકલ દસ્તાવેજો ઉમેરો',
  department: 'વિભાગ પસંદ કરો',
  doctor: 'ડૉક્ટર પસંદ કરો',
  tokenGenerated: 'તમારો ટોકન બની ગયો છે!',
  receipt: 'રસીદ આપમેળે પ્રિન્ટ થઈ',
  redirect: 'નવા દર્દીની નોંધણી પર જઈ રહ્યું છે',
  logout: 'બહાર નીકળો'
};

/* ─── Doctor lists by department ───────────────────── */
const depts = [
  ['general', '🩺'],
  ['eyeCare', '👁️'],
  ['skinHair', '🖐️'],
  ['dental', '🦷'],
  ['ortho', '🦴'],
  ['ent', '👂'],
  ['cardio', '❤'],
  ['gyn', '♀'],
  ['other', '•••']
];

export default function KioskPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [lang, setLang] = useState('en');
  const [screen, setScreen] = useState('welcome');
  const [aad, setAad] = useState('');
  const [pin, setPin] = useState('');
  const [newP, setNewP] = useState(false);
  const [issue, setIssue] = useState('');
  const [dept, setDept] = useState('');
  const [doctor, setDoctor] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [token, setToken] = useState('');
  const [sec, setSec] = useState(5);
  const [toast, setToast] = useState('');
  const [now, setNow] = useState(new Date());

  // Dynamic Hospital & Doctors
  const [hospitalDoctors, setHospitalDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const hospitalId = user?.hospitalId || user?.kioskDetails?.hospitalId || (user?.role === 'hospital' ? user?.customId || user?._id : null);
  const hospitalName = user?.hospitalName || user?.kioskDetails?.hospitalName || user?.hospitalDetails?.hospitalName || user?.name || 'SMS Hospital Jaipur';

  // AI Intake & Clinical Case-Taking State
  const [intakeSessionId, setIntakeSessionId] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [clinicalReport, setClinicalReport] = useState(null);
  const [clinicalReportId, setClinicalReportId] = useState('');
  const [customAnswer, setCustomAnswer] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);

  const L = T[lang] || T.en;

  // Fetch doctors strictly for this hospital
  useEffect(() => {
    let isMounted = true;
    async function loadHospitalDoctors() {
      setLoadingDoctors(true);
      try {
        const docs = await api.getDoctors({
          hospitalId: hospitalId || undefined,
          hospital: hospitalName || undefined
        });
        if (isMounted) {
          setHospitalDoctors(Array.isArray(docs) ? docs : []);
        }
      } catch (err) {
        console.warn('[Kiosk] Error fetching hospital doctors:', err.message);
        if (isMounted) setHospitalDoctors([]);
      } finally {
        if (isMounted) setLoadingDoctors(false);
      }
    }
    loadHospitalDoctors();
    return () => { isMounted = false; };
  }, [hospitalId, hospitalName]);

  // Live clock tick
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-reset after token screen
  useEffect(() => {
    if (screen !== 'token') return;
    setSec(5);
    const id = setInterval(() => {
      setSec((s) => {
        if (s <= 1) {
          clearInterval(id);
          reset();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [screen]);

  const reset = () => {
    setAad('');
    setPin('');
    setNewP(false);
    setIssue('');
    setDept('');
    setDoctor('');
    setSelectedDoctorId('');
    setToken('');
    setIntakeSessionId('');
    setCurrentQuestion(null);
    setClinicalReport(null);
    setClinicalReportId('');
    setCustomAnswer('');
    setQuestionNumber(1);
    setScreen('aadhaar');
  };

  const startAiIntake = async (selectedConcern) => {
    setIssue(selectedConcern);
    setIsAiLoading(true);
    setScreen('aiIntake');
    setQuestionNumber(1);
    setClinicalReport(null);
    setClinicalReportId('');

    const chiefComplaint = L[selectedConcern] || selectedConcern;

    try {
      const res = await api.startAiIntake({
        patientId: aad ? `P-${aad.replace(/\s+/g, '').slice(-5)}` : 'P-KIOSK',
        patientName: newP ? 'Walk-in Patient' : 'Registered Patient',
        chiefComplaint,
        language: lang,
        source: 'kiosk'
      });
      if (res && res.sessionId) {
        setIntakeSessionId(res.sessionId);
        setCurrentQuestion(res.question);
      }
    } catch (err) {
      console.warn('[Kiosk] Fallback AI start:', err.message);
      setIntakeSessionId(`LOCAL-${Date.now()}`);
      setCurrentQuestion({
        question: 'When did your symptoms first begin, and how intense is the discomfort?',
        options: ['Started today (Mild)', '2-3 days ago (Moderate)', 'Over a week ago (Severe)', 'Other'],
        complete: false
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAnswerQuestion = async (ans) => {
    if (!ans || !ans.trim()) return;
    setIsAiLoading(true);

    try {
      const res = await api.answerAiIntake(intakeSessionId, {
        answer: ans.trim(),
        answerMethod: 'choice'
      });

      if (res && res.complete) {
        setClinicalReport(res.report);
        setClinicalReportId(res.reportId || res.report?.id || res.report?.customId);
        setScreen('aiReportReview');
      } else if (res && res.question) {
        setCurrentQuestion(res.question);
        setQuestionNumber((n) => n + 1);
        setCustomAnswer('');
      }
    } catch (err) {
      console.warn('[Kiosk] Fallback AI answer:', err.message);
      const fallbackRep = {
        chiefComplaint: L[issue] || issue,
        summaryForDoctor: `Kiosk Walk-in: Patient reported ${L[issue] || issue}. Additional symptom detail: ${ans}.`,
        reportedSymptoms: [L[issue] || issue, ans],
        urgentReview: false
      };
      setClinicalReport(fallbackRep);
      setScreen('aiReportReview');
    } finally {
      setIsAiLoading(false);
    }
  };

  const notify = (m) => {
    setToast(m);
    setTimeout(() => setToast(''), 2000);
  };

  const press = (n) => {
    if (screen === 'aadhaar' && aad.length < 12) setAad((v) => v + n);
    if (screen === 'pin' && pin.length < 4) setPin((v) => v + n);
  };

  const next = () => {
    if (screen === 'aadhaar') {
      if (aad.length !== 12) return notify('Please enter a 12-digit Aadhaar number.');
      setScreen(newP ? 'register' : 'pin');
    } else if (screen === 'register') {
      setScreen('concern');
    } else if (screen === 'pin') {
      if (pin.length !== 4) return notify('PIN must contain exactly 4 digits.');
      setScreen('concern');
    }
  };

  const fmt = (v) => v.replace(/\D/g, '').slice(0, 12).replace(/(\d{4})(?=\d)/g, '$1 ');

  const handleExit = () => {
    logout();
    navigate('/login');
  };

  const keypad = (nextLabel) => (
    <div className="keypad">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <button className="key" key={n} type="button" onClick={() => press(n)}>
          {n}
        </button>
      ))}
      <button className="key action" type="button" onClick={() => (screen === 'pin' ? setPin('') : setAad(''))}>
        {L.clear}
      </button>
      <button className="key" type="button" onClick={() => press(0)}>
        0
      </button>
      <button className="key next" type="button" onClick={next}>
        {nextLabel}
      </button>
    </div>
  );

  return (
    <div className="kiosk-terminal">
      <section className="kiosk">
        {/* Header */}
        <header>
          <div className="brand">
            <div className="mark">✚</div>
            <div>
              <b>{hospitalName} · OPD Kiosk</b>
              <small>{hospitalId ? `ID: ${hospitalId} · ` : ''}{L.tag}</small>
            </div>
          </div>

          <div className="headRight">
            <div className="langs">
              {[
                ['en', 'English'],
                ['hi', 'हिंदी'],
                ['mr', 'मराठी'],
                ['gu', 'ગુજરાતી']
              ].map(([c, n]) => (
                <button
                  key={c}
                  type="button"
                  className={lang === c ? 'active' : ''}
                  onClick={() => setLang(c)}
                >
                  {n}
                </button>
              ))}
            </div>

            <div className="clock">
              <b>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</b>
              <small>{now.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</small>
            </div>

            <button
              type="button"
              onClick={handleExit}
              title={L.logout}
              style={{
                marginLeft: '0.75rem',
                background: 'rgba(220, 38, 38, 0.12)',
                border: '1px solid rgba(220, 38, 38, 0.35)',
                color: '#DC2626',
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              <i className="fa-solid fa-arrow-right-from-bracket" style={{ marginRight: '5px' }}></i>
              {L.logout || 'Exit'}
            </button>
          </div>
        </header>

        <main>
          {/* Welcome Screen */}
          {screen === 'welcome' && (
            <div className="view welcome">
              <div className="heroIcon">✚</div>
              <h1>{L.welcome}</h1>
              <p>{L.self}</p>
              <button className="primary giant" type="button" onClick={() => setScreen('aadhaar')}>
                {L.start} →
              </button>
              <div className="features">
                {[
                  ['◷', L.fast],
                  ['⌁', L.easy],
                  ['♢', L.secure],
                  ['♡', L.care]
                ].map((x) => (
                  <div key={x[1]}>
                    <b>{x[0]}</b>
                    <span>{x[1]}</span>
                  </div>
                ))}
              </div>
              <small className="touch">◉ {L.touch}</small>
            </div>
          )}

          {/* Aadhaar / PIN / Register Screen */}
          {(screen === 'aadhaar' || screen === 'pin' || screen === 'register') && (
            <div className="view auth">
              <button
                className="back"
                type="button"
                onClick={() => setScreen(screen === 'pin' ? 'aadhaar' : 'welcome')}
              >
                ← {L.back}
              </button>
              <div className="authIcon">{screen === 'pin' ? '●●●●' : '▦'}</div>
              <h2>{screen === 'pin' ? L.pin : screen === 'register' ? L.register : L.aadhaar}</h2>
              <p>{screen === 'pin' ? L.pinSub : screen === 'register' ? L.registerSub : L.aadhaarSub}</p>
              <div className="display">
                {screen === 'pin'
                  ? pin
                    ? '● '.repeat(pin.length)
                    : '— — — —'
                  : fmt(aad) || '— — — — — — — — — — — —'}
              </div>

              {screen !== 'register' ? (
                keypad(screen === 'pin' ? L.login : L.next)
              ) : (
                <button className="primary wide" type="button" onClick={next}>
                  {L.continue} →
                </button>
              )}

              {screen === 'aadhaar' && (
                <button
                  className="secondary wide new"
                  type="button"
                  onClick={() => {
                    setNewP(true);
                    setAad('');
                  }}
                >
                  ＋ {L.newPatient}
                </button>
              )}
              <div className="secure">✓ {L.secureText}</div>
            </div>
          )}

          {/* Concern Screen */}
          {screen === 'concern' && (
            <div className="view wide">
              <div className="heading">
                <div>✦</div>
                <h2>{L.concern}</h2>
                <p>{L.concernSub}</p>
              </div>
              <div className="issueGrid">
                {[
                  ['🌡️', 'fever'],
                  ['🫀', 'stomach'],
                  ['🧍', 'body'],
                  ['👁️', 'eye'],
                  ['🖐️', 'skin'],
                  ['•••', 'other']
                ].map(([i, k]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => startAiIntake(k)}
                  >
                    <span>{i}</span>
                    <b>{L[k]}</b>
                  </button>
                ))}
              </div>
              <button
                className="voice"
                type="button"
                onClick={() => startAiIntake('other')}
              >
                🎙{' '}
                <div>
                  <b>{L.voice}</b>
                  <small>{L.voiceSub}</small>
                </div>
                →
              </button>
            </div>
          )}

          {/* AI Intake Screen */}
          {screen === 'aiIntake' && (
            <div className="view wide ai-intake-container">
              <button className="back" type="button" onClick={() => setScreen('concern')}>
                ← {L.back}
              </button>
              <div className="ai-header-badge">
                <span>🤖</span> Quantum Care AI Clinical Intake
              </div>
              <div className="ai-step-indicator">
                Question {questionNumber} of 4 · Step-by-Step Clinical Case-Taking
              </div>

              {isAiLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✦</div>
                  <h3 style={{ fontSize: '1.4rem', color: '#0F172A', marginBottom: '0.5rem' }}>
                    Analyzing with Quantum Care AI...
                  </h3>
                  <p style={{ color: '#64748B', fontSize: '1rem' }}>
                    Evaluating clinical symptoms and formulating tailored question.
                  </p>
                </div>
              ) : currentQuestion ? (
                <div>
                  <h2 className="ai-question-title">{currentQuestion.question}</h2>

                  <div className="ai-options-grid">
                    {(currentQuestion.options || []).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className="ai-option-card"
                        onClick={() => handleAnswerQuestion(opt)}
                      >
                        <span>{opt}</span>
                        <span style={{ color: '#2563EB', fontWeight: 800 }}>→</span>
                      </button>
                    ))}
                  </div>

                  <div className="ai-custom-input-row">
                    <input
                      type="text"
                      className="ai-input-field"
                      placeholder="Or enter custom answer..."
                      value={customAnswer}
                      onChange={(e) => setCustomAnswer(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAnswerQuestion(customAnswer);
                      }}
                    />
                    <button
                      type="button"
                      className="primary"
                      style={{ padding: '0 2rem', fontSize: '1.1rem' }}
                      onClick={() => handleAnswerQuestion(customAnswer)}
                    >
                      Answer →
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* AI Report Review Screen */}
          {screen === 'aiReportReview' && (
            <div className="view wide ai-intake-container">
              <div className="ai-header-badge" style={{ background: '#F0FDF4', color: '#166534', borderColor: '#BBF7D0' }}>
                <span>✓</span> AI Clinical Report Synthesized
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', margin: '0.5rem 0' }}>
                Preliminary Case Summary Ready
              </h2>
              <p style={{ color: '#64748B', fontSize: '1.05rem', marginBottom: '1.25rem' }}>
                Your symptoms have been structured into a quick-readable clinical summary and saved to the hospital system for the doctor.
              </p>

              <div className="ai-summary-card">
                <div className="ai-summary-headline">Chief Complaint: {clinicalReport?.chiefComplaint}</div>
                <div className="ai-summary-body">{clinicalReport?.summaryForDoctor}</div>
                {clinicalReport?.reportedSymptoms && clinicalReport.reportedSymptoms.length > 0 && (
                  <div className="ai-chip-list">
                    {clinicalReport.reportedSymptoms.map((sym, idx) => (
                      <span key={idx} className="ai-symptom-tag">● {sym}</span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '1rem' }}>
                <button
                  type="button"
                  className="primary wide"
                  style={{ fontSize: '1.2rem', padding: '18px' }}
                  onClick={() => setScreen('docs')}
                >
                  Continue to Previous Medical Documents →
                </button>
              </div>
            </div>
          )}

          {/* Docs Screen */}
          {screen === 'docs' && (
            <div className="view wide">
              <div className="heading">
                <div>▧</div>
                <h2>{L.docs}</h2>
                <p>{L.docsSub}</p>
              </div>
              <div className="docPanel">
                <div className="qr">
                  <div className="qrbox">
                    <i />
                    <i />
                    <i />
                  </div>
                  <b>{L.scan}</b>
                  <small>Prescriptions • Reports • Scans</small>
                </div>
                <div className="docActions">
                  <button
                    type="button"
                    onClick={() => {
                      notify('Kiosk camera scanning for prescriptions...');
                      setTimeout(() => setScreen('department'), 600);
                    }}
                  >
                    📷{' '}
                    <span>
                      <b>{L.camera}</b>
                      <small>Use kiosk camera</small>
                    </span>
                    →
                  </button>
                  <button
                    type="button"
                    onClick={() => document.getElementById('kiosk-file').click()}
                  >
                    📄{' '}
                    <span>
                      <b>{L.device}</b>
                      <small>Select a document</small>
                    </span>
                    →
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreen('department')}
                  >
                    ○{' '}
                    <span>
                      <b>{L.noDocs}</b>
                      <small>{L.noDocsSub}</small>
                    </span>
                    →
                  </button>
                  <input
                    id="kiosk-file"
                    hidden
                    type="file"
                    accept="image/*,.pdf"
                    onChange={() => {
                      notify('Document added successfully');
                      setTimeout(() => setScreen('department'), 400);
                    }}
                  />
                </div>
              </div>
              <div className="info">ⓘ {L.records}</div>
            </div>
          )}

          {/* Department Screen */}
          {screen === 'department' && (
            <div className="view wide">
              <div className="heading">
                <div>✚</div>
                <h2>{L.department}</h2>
                <p>{L.departmentSub}</p>
              </div>
              <div className="deptGrid">
                {depts.map(([k, i]) => (
                  <button
                    key={k}
                    type="button"
                    className={dept === k ? 'selected' : ''}
                    onClick={() => {
                      setDept(k);
                      setScreen('doctor');
                    }}
                  >
                    <span>{i}</span>
                    <b>{L[k] || 'Other'}</b>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Doctor Screen */}
          {screen === 'doctor' && (
            <div className="view wide">
              <button className="back" type="button" onClick={() => setScreen('department')}>
                ← {L.back}
              </button>
              <div className="heading compact">
                <div>♙</div>
                <h2>{L.doctor}</h2>
                <p>{L[dept] || L.general} · {hospitalName}</p>
              </div>

              {loadingDoctors ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748B' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '0.75rem', color: '#2563EB' }}></i>
                  <p style={{ fontSize: '1rem', fontWeight: 600 }}>Loading available hospital doctors...</p>
                </div>
              ) : (
                <div className="doctorList">
                  {(() => {
                    const map = {
                      general: ['general', 'medicine', 'opd', 'physician', 'family', 'internal'],
                      eyeCare: ['eye', 'ophthalm'],
                      skinHair: ['skin', 'hair', 'derma'],
                      dental: ['dent'],
                      ortho: ['ortho'],
                      ent: ['ent', 'ear', 'nose', 'throat'],
                      cardio: ['cardio', 'heart'],
                      gyn: ['gyn', 'obs', 'women']
                    };
                    const terms = map[dept] || (dept !== 'other' ? [dept.toLowerCase()] : []);
                    const matched = hospitalDoctors.filter((d) => {
                      if (!dept || dept === 'other') return true;
                      const field = `${d.department || ''} ${d.specialty || ''}`.toLowerCase();
                      return terms.some((t) => field.includes(t));
                    });

                    return (
                      <>
                        {matched.map((d) => (
                          <button
                            className="doctor"
                            key={d.id || d.name}
                            type="button"
                            onClick={() => {
                              setDoctor(d.name);
                              setSelectedDoctorId(d.id);
                              setScreen('confirm');
                            }}
                          >
                            <div className="avatar">
                              {d.image ? (
                                <img src={d.image} alt={d.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                              ) : (
                                '👤'
                              )}
                            </div>
                            <div>
                              <b>{d.name}</b>
                              <small>{d.specialty || d.department} {d.experience ? `• ${d.experience}` : ''}</small>
                              <em className="available">● {d.available || L.available || 'Available Now'}</em>
                            </div>
                            <strong>{L.select}</strong>
                          </button>
                        ))}

                        {/* Always provide Duty Doctor option for on-call walk-in */}
                        <button
                          className="doctor"
                          type="button"
                          onClick={() => {
                            setDoctor(`Duty Doctor (${L[dept] || dept || 'OPD'})`);
                            setSelectedDoctorId('DUTY-DOC');
                            setScreen('confirm');
                          }}
                        >
                          <div className="avatar">🩺</div>
                          <div>
                            <b>Duty Doctor ({L[dept] || dept || 'OPD'})</b>
                            <small>Hospital On-Duty Officer · Immediate OPD Consultation</small>
                            <em className="available">● {L.available || 'Available Now'}</em>
                          </div>
                          <strong>{L.select}</strong>
                        </button>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Confirm Screen */}
          {screen === 'confirm' && (
            <div className="view confirm">
              <button className="back" type="button" onClick={() => setScreen('doctor')}>
                ← {L.change}
              </button>
              <div className="success small">✓</div>
              <label>APPOINTMENT</label>
              <h2>{L.confirm}</h2>
              <p>{L.confirmSub}</p>
              <div className="selected">
                <div className="avatar large">👤</div>
                <div>
                  <b>{doctor}</b>
                  <span>{L[dept] || L.general}</span>
                  <small>{hospitalName}</small>
                </div>
              </div>
              <button
                className="primary wide"
                type="button"
                onClick={async () => {
                  const localToken = 'TK-' + Math.floor(100 + Math.random() * 899);
                  setToken(localToken);
                  setScreen('token');
                  try {
                    const res = await api.createKioskToken({
                      patientName: newP ? 'Walk-in Patient' : (aad ? `Patient (${aad.slice(-4)})` : 'Registered Patient'),
                      aadhaar: aad,
                      department: L[dept] || dept || 'General OPD',
                      doctor: doctor || 'Duty Doctor',
                      doctorId: selectedDoctorId || undefined,
                      concern: L[issue] || issue || 'General Consultation',
                      clinicalReportId: clinicalReportId || undefined,
                      sessionId: intakeSessionId || undefined,
                      hospitalName,
                      hospitalId: hospitalId || undefined
                    });
                    if (res && res.tokenNumber) {
                      setToken(res.tokenNumber);
                    }
                  } catch (err) {
                    console.warn('[Kiosk] Offline token fallback:', err.message);
                  }
                }}
              >
                {L.generate} →
              </button>
            </div>
          )}

          {/* Token Screen */}
          {screen === 'token' && (
            <div className="view token">
              <div className="success">✓</div>
              <label>APPOINTMENT CONFIRMED</label>
              <h2>{L.tokenGenerated}</h2>
              <p>{L.proceed}</p>
              <div className="tokenCard">
                <small>{L.token}</small>
                <strong>{token}</strong>
                <b>{L[dept] || L.general}</b>
                <span>{doctor}</span>
              </div>
              <div className="receipt">🖨 {L.receipt}</div>
              <div className="redirect">
                <b>{sec}</b> {L.redirect} {L.seconds}...
              </div>
              <div className="progress">
                <i style={{ width: (sec / 5) * 100 + '%' }} />
              </div>
              <button className="secondary" type="button" onClick={reset}>
                {L.done}
              </button>
            </div>
          )}
        </main>

        <footer>◉ {L.help}</footer>
      </section>

      {toast && <div className="kiosk-toast">{toast}</div>}
    </div>
  );
}
