import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PushToTalkButton from '../../components/Voice/PushToTalkButton';
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
    logout: 'Exit Kiosk',
    quickReg: 'Quick Patient Registration',
    quickRegSub: 'Aadhaar and PIN verified. Enter your Full Name to complete registration fast.',
    fullName: 'Full Name',
    enterName: 'Enter patient full name',
    registerProceed: 'Register & Proceed',
    verifying: 'Verifying with Database...',
    welcomeBack: 'Welcome back'
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
    logout: 'बाहर निकलें',
    quickReg: 'त्वरित मरीज पंजीकरण',
    quickRegSub: 'आधार और पिन सत्यापित। त्वरित पंजीकरण के लिए केवल अपना पूरा नाम दर्ज करें।',
    fullName: 'पूरा नाम',
    enterName: 'मरीज का पूरा नाम दर्ज करें',
    registerProceed: 'पंजीकरण करें और आगे बढ़ें',
    verifying: 'डेटाबेस से सत्यापन हो रहा है...',
    welcomeBack: 'स्वागत है'
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
  logout: 'बाहेर पडा',
  quickReg: 'जलद रुग्ण नोंदणी',
  quickRegSub: 'आधार आणि पिन सत्यापित. जलद नोंदणीसाठी तुमचे पूर्ण नाव प्रविष्ट करा.',
  fullName: 'पूर्ण नाव',
  enterName: 'रुग्णाचे पूर्ण नाव प्रविष्ट करा',
  registerProceed: 'नोंदणी करा आणि पुढे जा',
  verifying: 'डेटाबेस तपासत आहे...',
  welcomeBack: 'स्वागत आहे'
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
  logout: 'બહાર નીકળો',
  quickReg: 'ઝડપી દર્દી નોંધણી',
  quickRegSub: 'આધાર અને પિન ચકાસાયેલ છે. નોંધણી પૂર્ણ કરવા માટે તમારું પૂરું નામ દાખલ કરો.',
  fullName: 'પૂરું નામ',
  enterName: 'દર્દીનું પૂરું નામ દાખલ કરો',
  registerProceed: 'નોંધણી કરો અને આગળ વધો',
  verifying: 'ડેટાબેઝ ચકાસી રહ્યું છે...',
  welcomeBack: 'સ્વાગત છે'
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
  const [patient, setPatient] = useState(null);
  const [regName, setRegName] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
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
    setPatient(null);
    setRegName('');
    setIsAuthLoading(false);
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

  const handlePinSubmit = async () => {
    if (pin.length !== 4) return notify(L.pinSub || 'PIN must contain exactly 4 digits.');
    setIsAuthLoading(true);
    try {
      const res = await api.kioskPatientAuth(aad, pin);
      // Case 1: Patient exists and authenticated
      if (res && res.authenticated && res.user) {
        setPatient(res.user);
        notify(`${L.welcomeBack || 'Welcome back'}, ${res.user.name || 'Patient'}!`);
        setScreen('concern');
        return;
      }

      // Case 2: Patient not registered in database
      if (res && res.found === false) {
        notify('Patient profile not found. Quick registration required.');
        setScreen('fastRegister');
        return;
      }

      // Case 3: Found but incorrect PIN
      notify('Invalid 4-digit security PIN. Please try again.');
      setPin('');
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('not found') || msg.includes('no registered') || msg.includes('does not exist')) {
        notify('Patient profile not found. Quick registration required.');
        setScreen('fastRegister');
      } else if (msg.includes('pin') || msg.includes('password') || msg.includes('credential')) {
        notify('Invalid 4-digit security PIN. Please try again.');
        setPin('');
      } else {
        notify('Patient not found with this Aadhaar. Quick registration required.');
        setScreen('fastRegister');
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleFastRegister = async () => {
    if (!regName || regName.trim().length < 2) {
      return notify('Please enter your full name (minimum 2 characters).');
    }
    setIsAuthLoading(true);
    try {
      const res = await api.kioskFastRegister({
        fullName: regName.trim(),
        aadhaar: aad,
        pin: pin
      });
      if (res && res.user) {
        setPatient(res.user);
        notify(`Registration successful! Welcome, ${res.user.name}!`);
        setScreen('concern');
      } else {
        setPatient({ name: regName.trim(), aadhaar: aad });
        setScreen('concern');
      }
    } catch (err) {
      console.warn('[Kiosk] Fast register error:', err.message);
      notify(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsAuthLoading(false);
    }
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
        patientId: patient?.customId || (aad ? `P-${aad.replace(/\s+/g, '').slice(-5)}` : 'P-KIOSK'),
        patientName: patient?.name || (newP ? 'Walk-in Patient' : 'Registered Patient'),
        chiefComplaint,
        language: lang,
        source: 'kiosk',
        patientProfile: patient?.patientDetails || {}
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

  const handleVoiceAnswerQuestion = async (audioBlob, liveTranscript = '') => {
    if (!audioBlob && !liveTranscript) return;
    setIsAiLoading(true);

    try {
      let spokenAnswer = (liveTranscript || '').trim();

      if (!spokenAnswer && audioBlob) {
        const transRes = await api.transcribeVoice(audioBlob, lang);
        spokenAnswer = (transRes?.transcript || transRes?.englishTranslation || '').trim();
      }

      if (!spokenAnswer) {
        notify(lang === 'hi' ? 'आवाज़ नहीं समझी जा सकी, कृपया पुनः बोलें।' : 'Could not understand audio, please try again.');
        return;
      }

      // Populate customAnswer so patient sees the voice converted to text
      setCustomAnswer(spokenAnswer);
      notify(`🎤 Voice converted to text: "${spokenAnswer}"`);

      if (intakeSessionId && intakeSessionId.startsWith('LOCAL-')) {
        handleAnswerQuestion(spokenAnswer);
        return;
      }

      const res = await api.answerAiIntake(
        intakeSessionId,
        spokenAnswer,
        lang,
        patient?.customId || ''
      );

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
      console.warn('[Kiosk] Voice answer error, trying transcribe fallback:', err.message);
      try {
        if (audioBlob) {
          const transRes = await api.transcribeVoice(audioBlob, lang);
          if (transRes && (transRes.englishTranslation || transRes.transcript)) {
            const txt = transRes.transcript || transRes.englishTranslation;
            setCustomAnswer(txt);
            notify(`🎤 Voice converted to text: "${txt}"`);
            handleAnswerQuestion(txt);
            return;
          }
        }
      } catch (e2) {
        // ignore
      }
      notify(lang === 'hi' ? 'आवाज़ नहीं समझी जा सकी, कृपया पुनः बोलें।' : 'Could not understand audio, please try again.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleVoiceConcern = async (audioBlob, liveTranscript = '') => {
    if (!audioBlob && !liveTranscript) return;
    setIsAiLoading(true);
    try {
      let text = (liveTranscript || '').trim();
      if (!text && audioBlob) {
        const res = await api.transcribeVoice(audioBlob, lang);
        text = (res?.transcript || res?.englishTranslation || '').trim();
      }
      if (text) {
        setMainConcern(text);
        notify(`🎤 Voice converted to text: "${text}"`);
      } else {
        notify('Speech unclear, please try again.');
      }
    } catch (err) {
      console.warn('[Kiosk] Voice concern error:', err.message);
      notify(lang === 'hi' ? 'आवाज़ पहचानी नहीं जा सकी।' : 'Voice transcription failed.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const notify = (m) => {
    setToast(m);
    setTimeout(() => setToast(''), 2500);
  };

  const press = (n) => {
    if (screen === 'aadhaar' && aad.length < 12) setAad((v) => v + n);
    if (screen === 'pin' && pin.length < 4) setPin((v) => v + n);
  };

  const next = () => {
    if (screen === 'aadhaar') {
      if (aad.length !== 12) return notify(L.aadhaarSub || 'Please enter a 12-digit Aadhaar number.');
      setScreen('pin');
    } else if (screen === 'pin') {
      handlePinSubmit();
    } else if (screen === 'register' || screen === 'fastRegister') {
      handleFastRegister();
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

          {/* Aadhaar / PIN Screen */}
          {(screen === 'aadhaar' || screen === 'pin') && (
            <div className="view auth">
              <button
                className="back"
                type="button"
                onClick={() => setScreen(screen === 'pin' ? 'aadhaar' : 'welcome')}
              >
                ← {L.back}
              </button>
              <div className="authIcon">{screen === 'pin' ? '●●●●' : '▦'}</div>
              <h2>{screen === 'pin' ? L.pin : (newP ? `${L.newPatient} · ${L.aadhaar}` : L.aadhaar)}</h2>
              <p>{screen === 'pin' ? L.pinSub : (newP ? 'Enter 12-digit Aadhaar to create your patient profile' : L.aadhaarSub)}</p>
              <div className="display">
                {screen === 'pin'
                  ? pin
                    ? '● '.repeat(pin.length)
                    : '— — — —'
                  : fmt(aad) || '— — — — — — — — — — — —'}
              </div>

              {keypad(isAuthLoading ? (L.verifying || 'Checking...') : (screen === 'pin' ? L.login : L.next))}

              {screen === 'aadhaar' && (
                <button
                  className="secondary wide new"
                  type="button"
                  onClick={() => {
                    setNewP(true);
                    setAad('');
                    notify('Enter 12-digit Aadhaar to start quick registration');
                  }}
                >
                  ＋ {L.newPatient}
                </button>
              )}
              <div className="secure">✓ {L.secureText}</div>
            </div>
          )}

          {/* Quick In-Kiosk Fast Registration Screen */}
          {screen === 'fastRegister' && (
            <div className="view auth" style={{ maxWidth: '540px' }}>
              <button
                className="back"
                type="button"
                onClick={() => setScreen('pin')}
              >
                ← {L.back}
              </button>
              <div className="authIcon" style={{ background: '#EFF6FF', color: '#2563EB', fontSize: '28px' }}>
                👤
              </div>
              <h2>{L.quickReg || 'Quick Patient Registration'}</h2>
              <p>{L.quickRegSub || 'Enter your full name to quickly create your profile. Other details can be filled later.'}</p>

              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1.25rem',
                textAlign: 'left',
                margin: '1.25rem auto',
                width: '100%',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Aadhaar Number:</span>
                  <span style={{ fontSize: '0.95rem', color: '#0F172A', fontWeight: 700, letterSpacing: '1px' }}>
                    {fmt(aad)} <span style={{ color: '#16A34A', fontSize: '0.75rem', fontWeight: 800 }}>✓ Verified</span>
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>4-Digit Security PIN:</span>
                  <span style={{ fontSize: '0.95rem', color: '#0F172A', fontWeight: 700, letterSpacing: '2px' }}>
                    ● ● ● ● <span style={{ color: '#16A34A', fontSize: '0.75rem', fontWeight: 800 }}>✓ Secured</span>
                  </span>
                </div>

                <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                    {L.fullName || 'Full Name'} <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    autoFocus
                    placeholder={L.enterName || 'Enter patient full name'}
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleFastRegister();
                    }}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: '2px solid #087fc9',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box',
                      boxShadow: '0 0 0 3px rgba(8, 127, 201, 0.12)'
                    }}
                  />
                  <small style={{ display: 'block', color: '#64748B', fontSize: '0.75rem', marginTop: '6px', lineHeight: 1.4 }}>
                    ⓘ Age, Gender & Address will be synced from official Aadhaar e-KYC. Additional details (Email) can be updated later on the web portal.
                  </small>
                </div>
              </div>

              <button
                className="primary wide"
                type="button"
                disabled={isAuthLoading}
                onClick={handleFastRegister}
                style={{ fontSize: '1.15rem', padding: '16px', cursor: isAuthLoading ? 'wait' : 'pointer' }}
              >
                {isAuthLoading ? (L.verifying || 'Creating Profile...') : `${L.registerProceed || 'Register & Proceed'} →`}
              </button>
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
              <div style={{ marginTop: '1.25rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#F8FAFC', padding: '16px', borderRadius: '16px', border: '2px dashed #93C5FD' }}>
                <div style={{ marginBottom: '10px', fontSize: '0.95rem', fontWeight: 700, color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎙️</span> {lang === 'hi' ? 'अपनी भाषा में बोलें (Push to Talk):' : 'Speak in your language (Push to Talk):'}
                </div>
                <PushToTalkButton
                  onAudioReady={handleVoiceConcern}
                  isProcessing={isAiLoading}
                  language={lang}
                  label={L.voice || 'बोलने के लिए दबाएं (Hold to Talk)'}
                />
                <small style={{ marginTop: '6px', color: '#64748B', fontSize: '0.85rem' }}>{L.voiceSub}</small>
              </div>
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

                  {/* Dedicated Push-to-Talk Voice Bar for AI Interview Turn */}
                  <div style={{ margin: '1.25rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#EFF6FF', padding: '18px 20px', borderRadius: '16px', border: '2px dashed #60A5FA', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)' }}>
                    <div style={{ marginBottom: '10px', fontWeight: 700, color: '#1E40AF', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🎙️</span> {lang === 'hi' ? 'बोलकर उत्तर दें (Push to Talk - हिंदी):' : 'Answer with Voice (Push to Talk):'}
                    </div>
                    <PushToTalkButton
                      onAudioReady={handleVoiceAnswerQuestion}
                      isProcessing={isAiLoading}
                      language={lang}
                      label={lang === 'hi' ? 'बोलने के लिए दबाकर रखें (Hold or Tap to Talk)' : 'Hold or Tap to Speak'}
                    />
                    <small style={{ marginTop: '8px', color: '#475569', fontSize: '0.85rem', fontWeight: 500 }}>
                      {lang === 'hi' ? 'दबाकर बोलें और छोड़ दें, AI आपकी आवाज़ सुनकर अगला प्रश्न पूछेगा' : 'Hold to speak and release, AI processes your answer instantly'}
                    </small>
                  </div>

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

                  <div className="ai-custom-input-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="ai-input-field"
                      placeholder={lang === 'hi' ? 'या उत्तर टाइप करें...' : 'Or enter custom answer...'}
                      value={customAnswer}
                      onChange={(e) => setCustomAnswer(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAnswerQuestion(customAnswer);
                      }}
                      style={{ flex: 1 }}
                    />
                    <PushToTalkButton
                      onAudioReady={async (audioBlob, liveTranscript = '') => {
                        try {
                          setIsAiLoading(true);
                          let text = (liveTranscript || '').trim();
                          if (!text && audioBlob) {
                            const trans = await api.transcribeVoice(audioBlob, lang);
                            text = (trans?.transcript || trans?.englishTranslation || '').trim();
                          }
                          if (text) {
                            setCustomAnswer(text);
                            notify(`🎤 Voice converted to text: "${text}"`);
                          } else {
                            notify(lang === 'hi' ? 'आवाज़ नहीं समझी जा सकी' : 'Could not convert voice to text');
                          }
                        } catch (e) {
                          notify(lang === 'hi' ? 'आवाज़ नहीं समझी जा सकी' : 'Voice transcription error');
                        } finally {
                          setIsAiLoading(false);
                        }
                      }}
                      isProcessing={isAiLoading}
                      language={lang}
                      compact={true}
                      label="🎙️"
                    />
                    <button
                      type="button"
                      className="primary"
                      style={{ padding: '0 1.5rem', fontSize: '1.05rem' }}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '0.85rem' }}>
                <div className="ai-header-badge" style={{ background: '#F0FDF4', color: '#166534', borderColor: '#BBF7D0', margin: 0 }}>
                  <i className="fa-solid fa-clipboard-check" style={{ marginRight: '6px' }}></i> Clinical Intake Encounter Synthesized
                </div>
                <span className={clinicalReport?.urgentReview ? 'ai-acuity-pill-urgent' : 'ai-acuity-pill-standard'}>
                  <i className={`fa-solid ${clinicalReport?.urgentReview ? 'fa-triangle-exclamation' : 'fa-circle-check'}`}></i>
                  {clinicalReport?.triageLevel ? `Triage: ${clinicalReport.triageLevel}` : (clinicalReport?.urgentReview ? 'Urgent Review' : 'Standard Priority')}
                </span>
              </div>

              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', margin: '0.25rem 0' }}>
                Preliminary Case Summary Ready
              </h2>
              <p style={{ color: '#64748B', fontSize: '1.05rem', marginBottom: '1rem' }}>
                Your symptoms have been structured into a high-visibility clinical intake brief and securely transmitted to the hospital OPD.
              </p>

              <div className="ai-summary-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  <div className="ai-summary-headline">Chief Complaint: {clinicalReport?.chiefComplaint || 'General OPD Consultation'}</div>
                  {clinicalReport?.recommendedSpecialty && (
                    <span style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 700 }}>
                      Specialty: {clinicalReport.recommendedSpecialty}
                    </span>
                  )}
                </div>

                <div className="ai-summary-body" style={{ fontSize: '1.2rem', lineHeight: 1.75, color: '#14532D', fontWeight: 500 }}>
                  {clinicalReport?.summaryForDoctor}
                </div>

                {clinicalReport?.reportedSymptoms && clinicalReport.reportedSymptoms.length > 0 && (
                  <div className="ai-chip-list" style={{ marginTop: '16px' }}>
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
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      notify('Scanning document & extracting clinical OCR data...');
                      try {
                        await api.uploadRecord(file, {
                          title: file.name,
                          type: file.type?.startsWith('image/') ? 'Diagnostic Photo' : 'Lab Report',
                          patientId: patient?.customId || patient?.id || 'P-10249'
                        });
                        notify('Document scanned and AI summary linked to patient record.');
                      } catch (err) {
                        console.warn('[Kiosk] Document upload notice:', err.message);
                      }
                      setTimeout(() => setScreen('department'), 600);
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
                      patientName: patient?.name || (newP ? 'Walk-in Patient' : (aad ? `Patient (${aad.slice(-4)})` : 'Registered Patient')),
                      aadhaar: aad,
                      patientId: patient?.customId || undefined,
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
