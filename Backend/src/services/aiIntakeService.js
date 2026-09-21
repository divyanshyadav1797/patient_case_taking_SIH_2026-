const clinicalRepository = require('../repositories/clinicalRepository');
const userRepository = require('../repositories/userRepository');

// In-memory active intake sessions
const sessions = new Map();

/**
 * Classify complaint into a clinical category
 */
function getCategoryFromComplaint(complaint = '') {
  const c = complaint.toLowerCase();
  if (c.includes('chest') || c.includes('heart') || c.includes('palpitat') || c.includes('breath')) return 'chest';
  if (c.includes('fever') || c.includes('chill') || c.includes('temp') || c.includes('shiver')) return 'fever';
  if (c.includes('stomach') || c.includes('abdom') || c.includes('belly') || c.includes('digest') || c.includes('vomit') || c.includes('nausea') || c.includes('diarrh')) return 'stomach';
  if (c.includes('head') || c.includes('migrain') || c.includes('dizz')) return 'headache';
  if (c.includes('cough') || c.includes('cold') || c.includes('throat') || c.includes('sneeze')) return 'cough';
  if (c.includes('joint') || c.includes('back') || c.includes('knee') || c.includes('bone') || c.includes('fracture')) return 'musculoskeletal';
  if (c.includes('skin') || c.includes('rash') || c.includes('itch') || c.includes('allerg')) return 'dermatology';
  if (c.includes('eye') || c.includes('vision') || c.includes('blur')) return 'ophthalmology';
  if (c.includes('ear') || c.includes('hear') || c.includes('sinus') || c.includes('tonsil')) return 'ent';
  if (c.includes('urin') || c.includes('kidney') || c.includes('bladder')) return 'urological';
  if (c.includes('anxiety') || c.includes('depress') || c.includes('sleep') || c.includes('stress') || c.includes('panic')) return 'psychiatric';
  return 'general';
}

/**
 * CONTEXT-AWARE fallback question generator.
 * Analyzes what the patient has already answered and generates the most logical next question.
 * Falls back to this when the AI microservice is unavailable.
 */
function getFallbackQuestion(complaint, questionCount, conversation = []) {
  const cat = getCategoryFromComplaint(complaint);
  const answeredTopics = new Set();
  const allAnswersText = conversation.map(c => `${c.answer || ''}`).join(' ').toLowerCase();

  // Track what topics have already been covered
  conversation.forEach(item => {
    const q = (item.question || '').toLowerCase();
    const a = (item.answer || '').toLowerCase();
    if (q.includes('onset') || q.includes('when') || q.includes('how long') || q.includes('started')) answeredTopics.add('onset');
    if (q.includes('severe') || q.includes('scale') || q.includes('rate') || q.includes('intensity')) answeredTopics.add('severity');
    if (q.includes('where') || q.includes('location') || q.includes('which part') || q.includes('spread')) answeredTopics.add('location');
    if (q.includes('medication') || q.includes('medicine') || q.includes('drug') || q.includes('taken')) answeredTopics.add('medications');
    if (q.includes('allerg') || q.includes('reaction')) answeredTopics.add('allergies');
    if (q.includes('history') || q.includes('condition') || q.includes('chronic') || q.includes('past')) answeredTopics.add('history');
    if (q.includes('associated') || q.includes('other symptom') || q.includes('also experience')) answeredTopics.add('associated');
    if (q.includes('worse') || q.includes('better') || q.includes('trigger') || q.includes('aggravat') || q.includes('reliev')) answeredTopics.add('aggravating');
  });

  // Build adaptive question queue based on what has NOT been asked yet
  const questionQueue = [];

  // FIRST: Always ask about onset/duration if not yet covered
  if (!answeredTopics.has('onset')) {
    questionQueue.push({
      question: `When did your ${complaint.toLowerCase()} first start, and has it been getting worse?`,
      options: ['Started suddenly a few hours ago', 'Started 1-2 days ago', 'Has been going on for a week or more', 'Comes and goes over several weeks', 'Other'],
      questionRationale: 'Establishing temporal onset pattern',
      urgentFlag: false
    });
  }

  // SECOND: Ask about severity if not yet covered
  if (!answeredTopics.has('severity')) {
    questionQueue.push({
      question: `How much does the ${complaint.toLowerCase()} affect your daily activities right now?`,
      options: ['Mild — I can manage normally', 'Moderate — it slows me down', 'Severe — I can barely function', 'Unbearable — worst I have ever experienced', 'Other'],
      questionRationale: 'Assessing clinical severity for triage',
      urgentFlag: false
    });
  }

  // THIRD: Context-specific follow-up based on category and prior answers
  if (!answeredTopics.has('associated')) {
    const associatedQuestions = {
      chest: { question: 'Are you also experiencing any sweating, shortness of breath, or pain going to your arm or jaw?', options: ['Sweating and feeling uneasy', 'Shortness of breath on exertion', 'Pain spreading to left arm', 'Palpitations / rapid heartbeat', 'None of these', 'Other'], urgentFlag: true },
      fever: { question: 'Along with the fever, are you experiencing any body aches, cold symptoms, or a rash?', options: ['Severe body aches and fatigue', 'Runny nose and sore throat', 'Skin rash or spots', 'Nausea or vomiting', 'None of these', 'Other'], urgentFlag: false },
      stomach: { question: 'Are you also experiencing nausea, vomiting, changes in appetite, or blood in stool?', options: ['Nausea and vomiting', 'Loss of appetite', 'Diarrhoea or constipation', 'Blood in stool or dark stools', 'None of these', 'Other'], urgentFlag: allAnswersText.includes('blood') },
      headache: { question: 'Along with the headache, do you notice any visual changes, nausea, or neck stiffness?', options: ['Nausea or vomiting', 'Sensitivity to light and sound', 'Visual disturbances / spots', 'Stiff neck', 'None of these', 'Other'], urgentFlag: allAnswersText.includes('worst') || allAnswersText.includes('sudden') },
      cough: { question: 'Are you also experiencing any fever, wheezing, or bringing up colored phlegm?', options: ['Fever and chills', 'Wheezing or whistling sound', 'Thick yellow/green phlegm', 'Blood in phlegm', 'No other symptoms', 'Other'], urgentFlag: allAnswersText.includes('blood') },
      musculoskeletal: { question: 'Is there any swelling, redness, or difficulty moving the affected area?', options: ['Noticeable swelling', 'Redness and warmth', 'Difficulty moving / stiffness', 'Numbness or tingling', 'None of these', 'Other'], urgentFlag: false },
      dermatology: { question: 'How does the skin issue look — is it spreading, itchy, or painful?', options: ['Red and itchy patches', 'Spreading rash with bumps', 'Painful blisters or sores', 'Dry and flaking skin', 'Other'], urgentFlag: false },
      general: { question: 'Are there any other symptoms you are experiencing along with this?', options: ['Fatigue and weakness', 'Loss of appetite', 'Difficulty sleeping', 'No other symptoms', 'Other'], urgentFlag: false }
    };
    const aq = associatedQuestions[cat] || associatedQuestions.general;
    questionQueue.push({ ...aq, questionRationale: 'Identifying associated symptoms for differential diagnosis' });
  }

  // FOURTH: Aggravating/relieving factors
  if (!answeredTopics.has('aggravating') && questionQueue.length < 2) {
    questionQueue.push({
      question: `Is there anything that makes your ${complaint.toLowerCase()} better or worse?`,
      options: ['Worse with physical activity', 'Better with rest', 'Worse after eating', 'Better with medication', 'No clear pattern', 'Other'],
      questionRationale: 'Identifying aggravating and relieving factors',
      urgentFlag: false
    });
  }

  // FIFTH: Medications
  if (!answeredTopics.has('medications') && questionQueue.length < 2) {
    questionQueue.push({
      question: 'Have you taken any medication for this, or do you take regular medicines for any condition?',
      options: ['Took over-the-counter painkillers', 'Taking prescribed medication regularly', 'Tried home remedies only', 'No medication taken', 'Other'],
      questionRationale: 'Recording current medication use',
      urgentFlag: false
    });
  }

  // SIXTH: Past history and allergies
  if (!answeredTopics.has('history') && questionQueue.length < 2) {
    questionQueue.push({
      question: 'Do you have any known medical conditions or allergies the doctor should know about?',
      options: ['Diabetes', 'High blood pressure', 'Asthma or lung condition', 'Drug or food allergies', 'No known conditions', 'Other'],
      questionRationale: 'Collecting relevant past medical history',
      urgentFlag: false
    });
  }

  // Pick the next unasked question from the queue
  if (questionQueue.length > 0) {
    const next = questionQueue[0];
    return {
      question: next.question,
      options: next.options,
      questionRationale: next.questionRationale || `Clinical intake step ${questionCount + 1}`,
      urgentFlag: next.urgentFlag || false,
      allowCustomText: true,
      allowVoice: true,
      complete: false,
      reason: `Adaptive clinical intake step ${questionCount + 1}`
    };
  }

  // All topics covered — final wrap-up
  return {
    question: 'Is there anything else the doctor should know before your consultation?',
    options: ['No, that covers everything', 'I have a previous report to share', 'There is something else I want to mention', 'Other'],
    questionRationale: 'Final check before closing intake',
    urgentFlag: false,
    allowCustomText: true,
    allowVoice: true,
    complete: true,
    reason: 'Clinical intake complete — all key topics covered'
  };
}

class AiIntakeService {
  /**
   * Start intake session
   */
  async startIntake({ patientId, patientName, chiefComplaint, language = 'en', source = 'webapp', patientProfile }) {
    if (!chiefComplaint || !chiefComplaint.trim()) {
      throw new Error('Chief complaint is required to start AI clinical intake.');
    }

    const sessionId = `SES-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    // Resolve patient details
    let resolvedName = patientName;
    if (!resolvedName && patientId) {
      const user = await userRepository.findById(patientId);
      if (user) resolvedName = user.name;
    }
    if (!resolvedName) resolvedName = 'Patient';

    const session = {
      sessionId,
      patientId: patientId || `WALKIN-${sessionId.slice(-6).toUpperCase()}`,
      patientName: resolvedName || 'Walk-in Patient',
      chiefComplaint: chiefComplaint.trim(),
      language,
      source,
      patientProfile: patientProfile || {},
      conversation: [],
      questionCount: 0,
      maxQuestions: 4,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    // Try microservice if available
    let firstQuestion = null;
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:4100';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${aiServiceUrl}/api/v1/intake/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: session.patientId,
          chiefComplaint: session.chiefComplaint,
          language: session.language,
          patientProfile: session.patientProfile
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        if (data && data.question) {
          firstQuestion = data.question;
          session.microserviceSessionId = data.sessionId;
        }
      }
    } catch (e) {
      // Graceful fallback to resilient clinical engine
    }

    if (!firstQuestion) {
      firstQuestion = getFallbackQuestion(session.chiefComplaint, 0, []);
    }

    session.currentQuestion = firstQuestion;
    session.questionCount = 1;
    sessions.set(sessionId, session);

    return {
      sessionId,
      question: firstQuestion,
      chiefComplaint: session.chiefComplaint
    };
  }

  /**
   * Submit answer and get next question or final report
   */
  async answerIntake(
    sessionId,
    {
      answer,
      answerMethod = 'text',
      originalAnswer = null,
      answerLanguage = null,
      patientId = null
    }
  ) {
    const session = sessions.get(sessionId);
    if (!session) {
      throw new Error(`Intake session '${sessionId}' not found or expired.`);
    }
    if (
      patientId &&
      String(session.patientId) !== String(patientId)
    ) {
      throw new Error('You are not authorized to answer this intake session.');
    }

    if (session.status !== 'active') {
      throw new Error('This intake session has already been completed.');
    }

    if (!answer || !String(answer).trim()) {
      throw new Error('Answer text is required.');
    }

    const cleanAnswer = String(answer).trim();

    session.conversation.push({
      question:
        session.currentQuestion?.question ||
        'Medical query',

      options:
        session.currentQuestion?.options ||
        [],

      answer: cleanAnswer,

      originalAnswer:
        originalAnswer || cleanAnswer,

      answerLanguage:
        answerLanguage || session.language,

      answerMethod,

      timestamp: new Date()
    });

    // Check if session reached max questions or user answered final question
    const isLastQuestion = session.questionCount >= session.maxQuestions || session.currentQuestion?.complete;

    if (isLastQuestion) {
      session.status = 'completed';

      // Synthesize Structured Clinical Report
      const clinicalReport = await this.synthesizeReport(session);

      // Save into MongoDB ClinicalReport collection
      const savedReport = await clinicalRepository.createClinicalReport({
        patientId: session.patientId,
        patientName: session.patientName,
        source: session.source,
        language: session.language,
        chiefComplaint: session.chiefComplaint,
        summaryForDoctor: clinicalReport.summaryForDoctor,
        historyOfPresentIllness: clinicalReport.historyOfPresentIllness,
        reportedSymptoms: clinicalReport.reportedSymptoms,
        medicationsMentioned: clinicalReport.medicationsMentioned,
        allergiesMentioned: clinicalReport.allergiesMentioned,
        pastHistoryMentioned: clinicalReport.pastHistoryMentioned,
        pastMedicalHistorySummary: clinicalReport.pastMedicalHistorySummary,
        urgentReview: clinicalReport.urgentReview,
        triageLevel: clinicalReport.triageLevel,
        recommendedSpecialty: clinicalReport.recommendedSpecialty,
        importantUnknowns: clinicalReport.importantUnknowns,
        conversation: session.conversation,
        doctorNotes: '',
        diagnosticImpression: clinicalReport.diagnosticImpression || '',
        suggestedScans: clinicalReport.suggestedScans || [],
        status: 'COMPLETED'
      });

      session.report = savedReport;
      sessions.set(sessionId, session);

      return {
        complete: true,
        reportId: savedReport.id || savedReport.customId,
        report: savedReport
      };
    }

    // Try microservice for next question if active
    let nextQuestion = null;
    if (session.microserviceSessionId) {
      try {
        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:4100';
        const res = await fetch(`${aiServiceUrl}/api/v1/intake/${session.microserviceSessionId}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answer: cleanAnswer, answerMethod })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.complete && data.report) {
            session.status = 'completed';
            const savedReport = await clinicalRepository.createClinicalReport({
              patientId: session.patientId,
              patientName: session.patientName,
              source: session.source,
              language: session.language,
              chiefComplaint: session.chiefComplaint,
              pastMedicalHistorySummary: data.report?.pastMedicalHistorySummary || await this.generateMedicalHistorySummary(session.patientId, session.chiefComplaint),
              ...data.report,
              conversation: session.conversation
            });
            return { complete: true, reportId: savedReport.id || savedReport.customId, report: savedReport };
          }
          if (data.question) {
            nextQuestion = data.question;
          }
        }
      } catch (e) { }
    }

    if (!nextQuestion) {
      nextQuestion = getFallbackQuestion(session.chiefComplaint, session.questionCount, session.conversation);
    }

    // Propagate urgentFlag if detected
    if (nextQuestion.urgentFlag) {
      session.urgentFlagDetected = true;
    }

    session.questionCount += 1;
    session.currentQuestion = nextQuestion;
    sessions.set(sessionId, session);

    return {
      complete: false,
      question: nextQuestion
    };
  }

  /**
   * Synthesize Clinical Report from Conversation and incorporate previous reports summary
   * Generates a high-yield, structured Clinical Assistant Brief to save the doctor time.
   */
  async synthesizeReport(session) {
    const conv = session.conversation || [];
    const complaint = session.chiefComplaint || 'Clinical Consultation';
    const cat = getCategoryFromComplaint(complaint);
    const answersText = conv.map(c => `Q: ${c.question} -> A: ${c.answer}`).join('; ');
    const lowerAnswers = answersText.toLowerCase();

    // 1. Determine Clinical Specialty
    let recommendedSpecialty = 'General Physician';
    if (cat === 'chest' || lowerAnswers.includes('chest') || lowerAnswers.includes('heart') || lowerAnswers.includes('palpitat')) {
      recommendedSpecialty = 'Cardiology';
    } else if (cat === 'headache' || lowerAnswers.includes('migrain') || lowerAnswers.includes('throbbing') || lowerAnswers.includes('seizure') || lowerAnswers.includes('numbness')) {
      recommendedSpecialty = 'Neurology';
    } else if (cat === 'cough' || lowerAnswers.includes('wheez') || lowerAnswers.includes('phlegm') || lowerAnswers.includes('asthma') || lowerAnswers.includes('shortness of breath')) {
      recommendedSpecialty = 'Pulmonology';
    } else if (cat === 'stomach' || lowerAnswers.includes('abdom') || lowerAnswers.includes('vomit') || lowerAnswers.includes('diarrh') || lowerAnswers.includes('acid reflux') || lowerAnswers.includes('digest')) {
      recommendedSpecialty = 'Gastroenterology';
    } else if (lowerAnswers.includes('joint') || lowerAnswers.includes('bone') || lowerAnswers.includes('fracture') || lowerAnswers.includes('back pain') || lowerAnswers.includes('knee')) {
      recommendedSpecialty = 'Orthopedics';
    } else if (lowerAnswers.includes('skin') || lowerAnswers.includes('rash') || lowerAnswers.includes('itch') || lowerAnswers.includes('dermat')) {
      recommendedSpecialty = 'Dermatology';
    } else if (lowerAnswers.includes('eye') || lowerAnswers.includes('vision') || lowerAnswers.includes('blur')) {
      recommendedSpecialty = 'Ophthalmology';
    } else if (lowerAnswers.includes('tooth') || lowerAnswers.includes('teeth') || lowerAnswers.includes('dental') || lowerAnswers.includes('gum')) {
      recommendedSpecialty = 'Dentistry';
    } else if (lowerAnswers.includes('ear') || lowerAnswers.includes('throat') || lowerAnswers.includes('tonsil') || lowerAnswers.includes('sinus')) {
      recommendedSpecialty = 'ENT';
    } else if (cat === 'fever' && !lowerAnswers.includes('high grade')) {
      recommendedSpecialty = 'General Physician';
    }

    // 2. Acuity & Triage Analysis
    const hasChestRedFlag = cat === 'chest' && (lowerAnswers.includes('spread') || lowerAnswers.includes('pressure') || lowerAnswers.includes('sweating') || lowerAnswers.includes('shortness of breath'));
    const hasRespRedFlag = lowerAnswers.includes('shortness of breath even at rest') || lowerAnswers.includes('blood-tinged');
    const hasHighFever = lowerAnswers.includes('> 102') || lowerAnswers.includes('more than 5 days');
    const hasSeverePain = lowerAnswers.includes('severe (7-10)') || lowerAnswers.includes('hard to bear') || lowerAnswers.includes('incapacitating');
    const isUrgent = hasChestRedFlag || hasRespRedFlag || (cat === 'headache' && lowerAnswers.includes('neck stiffness')) || (cat === 'stomach' && lowerAnswers.includes('lower right abdomen')) || session.urgentFlagDetected;

    const triageLevel = isUrgent ? 'HIGH_ACUITY' : (hasSeverePain || hasHighFever ? 'PRIORITY_EVALUATION' : 'STANDARD_CONSULTATION');

    // 3. Extract Affirmative Symptoms vs Pertinent Negatives
    const affirmedSymptoms = [complaint];
    const pertinentNegatives = [];

    conv.forEach(item => {
      const ans = String(item.answer || '').trim();
      const ansLower = ans.toLowerCase();
      if (!ans || ansLower.includes('other') || ansLower === 'no') return;

      if (ansLower.includes('none') || ansLower.includes('no ') || ansLower.includes('denies') || ansLower.includes('not experienced')) {
        pertinentNegatives.push(`Denies ${ans.replace(/none of these|no /gi, '').trim()}`);
      } else {
        affirmedSymptoms.push(ans);
      }
    });

    if (cat === 'chest' && !lowerAnswers.includes('spreads to')) pertinentNegatives.push('Denies pain radiation to left upper extremity or jaw');
    if (cat === 'cough' && !lowerAnswers.includes('shortness of breath')) pertinentNegatives.push('No acute resting respiratory distress reported');
    if (cat === 'headache' && !lowerAnswers.includes('neck stiffness')) pertinentNegatives.push('No neck rigidity or photophobia described');
    if (cat === 'stomach' && !lowerAnswers.includes('vomit')) pertinentNegatives.push('No active emesis or hematemesis reported');

    // 4. Longitudinal Past Medical Summary from Database
    const pastHistorySummary = await this.generateMedicalHistorySummary(session.patientId, session.chiefComplaint);
    const pastVisitsCount = pastHistorySummary.previousReportsCount || 0;
    const chronicFlags = pastHistorySummary.chronicConditions && pastHistorySummary.chronicConditions.length > 0
      ? pastHistorySummary.chronicConditions.join(', ')
      : 'No prior chronic conditions recorded';

    // 5. Differential Diagnoses & Suggested Scans based on clinical syndrome
    let differentials = [];
    let suggestedScans = [];
    let unknownVitals = ['Blood Pressure (Systolic / Diastolic)', 'Resting Heart Rate & Pulse Rhythm', 'Pulse Oximetry (SpO2 on Room Air)', 'Temperature'];

    if (cat === 'chest') {
      differentials = [
        '1. Acute Coronary Syndrome rule-out (Angina pectoris vs. NSTEMI)',
        '2. Gastroesophageal Reflux Disease / Esophageal Spasm',
        '3. Costochondritis / Musculoskeletal Anterior Chest Wall Discomfort'
      ];
      suggestedScans = ['12-Lead Electrocardiogram (ECG)', 'Serum Cardiac Troponin I / hs-cTnI', 'Chest Radiograph (CXR PA View)'];
      unknownVitals.push('Serial ECG monitoring', 'Orthostatic vitals');
    } else if (cat === 'fever') {
      differentials = [
        '1. Acute Febrile Syndrome (Viral illness vs. Upper Respiratory Tract Infection)',
        '2. Vector-borne / Seasonal Febrile Infection (Dengue / Malaria rule-out)',
        '3. Bacterial Pharyngitis / Tonsillitis'
      ];
      suggestedScans = ['Complete Blood Count (CBC) with Platelet Indices', 'C-Reactive Protein (CRP)', 'Peripheral Blood Smear / Rapid Malarial Antigen'];
    } else if (cat === 'stomach') {
      differentials = [
        '1. Acute Gastroduodenitis / Acid Peptic Disease',
        '2. Acute Gastroenteritis / Enteric Infection',
        '3. Biliary Colic / Early Appendicitis (if lower right pain)'
      ];
      suggestedScans = ['Abdominal Ultrasonography (USG Whole Abdomen)', 'Serum Amylase & Lipase', 'Complete Blood Count & Liver Function Tests (LFT)'];
    } else if (cat === 'headache') {
      differentials = [
        '1. Migraine with/without Aura vs. Tension-Type Headache',
        '2. Cervicogenic Cephalea',
        '3. Secondary Headache (Rule out elevated intracranial pressure / Sinusitis)'
      ];
      suggestedScans = ['Non-contrast Brain CT / MRI (if red flags present)', 'Fundoscopic Examination', 'Blood Pressure profile'];
    } else if (cat === 'cough') {
      differentials = [
        '1. Acute Bronchitis / Bronchial Hyperreactivity',
        '2. Community-Acquired Respiratory Infection',
        '3. Allergic Rhinosinusitis with Post-Nasal Drip'
      ];
      suggestedScans = ['Chest Radiograph (PA View)', 'Peak Expiratory Flow Rate (PEFR)', 'CBC with Absolute Eosinophil Count'];
    } else {
      differentials = [
        `1. Primary evaluation for ${complaint}`,
        '2. Secondary physiological / metabolic strain',
        '3. Musculoskeletal or non-specific clinical presentation'
      ];
      suggestedScans = ['Routine Complete Blood Count (CBC)', 'Random Blood Glucose (RBG)', 'General Clinical Chemistry Panel'];
    }

    // 6. Clinical Assistant Executive Summary for Doctor
    const patientName = session.patientName || 'Patient';
    const patientAge = session.patientProfile?.age || 'Adult';
    const patientGender = session.patientProfile?.gender || '';
    const demoStr = `${patientAge}${patientGender ? ` (${patientGender})` : ''}`;

    const acuityLabel = isUrgent
      ? 'PRIORITY 1 - HIGH ACUITY (URGENT PHYSICIAN REVIEW REQUIRED)'
      : (hasSeverePain || hasHighFever ? 'PRIORITY 2 - PRIORITY AMBULATORY EVALUATION' : 'PRIORITY 3 - ROUTINE AMBULATORY CONSULTATION');

    const summaryForDoctor = `CLINICAL INTAKE ENCOUNTER SUMMARY\n` +
      `PATIENT: ${patientName} | DEMOGRAPHICS: ${demoStr}\n` +
      `CHIEF COMPLAINT: ${complaint}\n` +
      `CLINICAL SYMPTOM PROFILE: ${affirmedSymptoms.join(', ')}\n` +
      `PERTINENT RULE-OUTS: ${pertinentNegatives.length > 0 ? pertinentNegatives.join('; ') : 'No acute contraindications or red-flag negatives reported'}\n` +
      `TRIAGE RISK STRATIFICATION: ${acuityLabel}\n` +
      `LONGITUDINAL MEDICAL CONTEXT: ${pastVisitsCount > 0 ? `${pastVisitsCount} prior institutional encounter(s) on file. Chronic conditions: ${chronicFlags}` : 'Baseline admission encounter; no prior adverse clinical records on file'}\n` +
      `RECOMMENDED CLINICAL SPECIALTY: Department of ${recommendedSpecialty}\n` +
      `PRIMARY DIFFERENTIAL IMPRESSION: ${differentials[0] || 'Clinical correlation indicated'}`;

    const historyOfPresentIllness = `PATIENT PRESENTATION:\n` +
      `${patientName} (${demoStr}) presents for outpatient clinical evaluation regarding ${complaint}. ` +
      `The patient reports symptom onset and clinical presentation characterized by ${affirmedSymptoms.join(', ')}. ` +
      `${pertinentNegatives.length > 0 ? 'Diagnostic inquiry elicited pertinent negative findings: ' + pertinentNegatives.join('; ') + '. ' : ''}` +
      `Review of electronic health records reflects ${pastVisitsCount > 0 ? pastVisitsCount + ' previous outpatient encounters on record with: ' + chronicFlags : 'no prior chronic diagnoses or hospitalizations on file'}. ` +
      `Objective triage stratification classifies this case under ${acuityLabel}. Attending physician clinical evaluation and targeted diagnostic workup advised.`;

    // 7. Medication & Allergy Extraction
    const medicationsMentioned = [];
    if (lowerAnswers.includes('paracetamol')) medicationsMentioned.push('Paracetamol (reported by patient)');
    if (lowerAnswers.includes('inhaler') || lowerAnswers.includes('asthma')) medicationsMentioned.push('Bronchodilator / Inhaler');
    if (lowerAnswers.includes('antacid') || lowerAnswers.includes('pantoprazole')) medicationsMentioned.push('Antacid / PPI');

    const allergiesMentioned = [];
    if (lowerAnswers.includes('allergy') || lowerAnswers.includes('allergic')) {
      allergiesMentioned.push('Patient reported environmental or drug sensitivity');
    } else {
      allergiesMentioned.push('No acute drug allergies flagged during clinical intake');
    }

    const pastHistoryMentioned = [
      pastVisitsCount > 0 ? `${pastVisitsCount} prior visit(s) documented. Known conditions: ${chronicFlags}` : 'First recorded hospital visit',
      session.patientProfile?.medicalHistory || 'No additional personal history noted'
    ];

    return {
      chiefComplaint: complaint,
      recommendedSpecialty,
      triageLevel,
      summaryForDoctor,
      historyOfPresentIllness,
      reportedSymptoms: affirmedSymptoms,
      pertinentNegatives,
      medicationsMentioned: medicationsMentioned.length > 0 ? medicationsMentioned : ['None reported during intake'],
      allergiesMentioned,
      pastHistoryMentioned,
      pastMedicalHistorySummary: pastHistorySummary,
      urgentReview: isUrgent,
      importantUnknowns: unknownVitals,
      suggestedScans,
      suggestedInvestigations: suggestedScans,
      diagnosticImpression: differentials.join('\n')
    };
  }

  /**
   * Generate an AI Medical History Summary by analyzing all previous reports, records, and prescriptions
   * @param {string} patientId
   * @param {string} currentComplaint
   * @returns {Promise<object>}
   */
  async generateMedicalHistorySummary(patientId, currentComplaint = null) {
    if (!patientId) {
      return {
        executiveSummary: 'No patient ID provided for medical history analysis.',
        previousReportsCount: 0,
        keyPastDiagnoses: [],
        chronicConditions: [],
        allergiesAndRisks: [],
        recentPrescriptions: [],
        previousReportsTimeline: []
      };
    }

    try {
      const [reports, records, prescriptions] = await Promise.all([
        clinicalRepository.getClinicalReports(patientId),
        clinicalRepository.getRecords(patientId),
        clinicalRepository.getPrescriptions({ patientId })
      ]);

      const previousReports = Array.isArray(reports) ? reports : [];
      const previousRecords = Array.isArray(records) ? records : [];
      const previousRxs = Array.isArray(prescriptions) ? prescriptions : [];

      if (previousReports.length === 0 && previousRecords.length === 0 && previousRxs.length === 0) {
        return {
          executiveSummary: 'Initial baseline encounter: No previous clinical reports, lab records, or prescriptions found in hospital records. Baseline established during this consultation.',
          previousReportsCount: 0,
          keyPastDiagnoses: [],
          chronicConditions: [],
          allergiesAndRisks: ['No known historical drug allergies or adverse reactions on record'],
          recentPrescriptions: [],
          previousReportsTimeline: []
        };
      }

      // 1. Compile prior reports timeline
      const previousReportsTimeline = previousReports.map(rep => ({
        date: rep.createdAt ? new Date(rep.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Previous Encounter',
        reportId: rep.id || rep.customId,
        chiefComplaint: rep.chiefComplaint || 'Consultation',
        summary: rep.summaryForDoctor || 'Routine intake recorded',
        diagnosticImpression: rep.diagnosticImpression || rep.doctorNotes || 'Consultation completed'
      }));

      // 2. Extract key diagnoses
      const diagnosesSet = new Set();
      previousReports.forEach(r => {
        if (r.diagnosticImpression && r.diagnosticImpression.trim()) diagnosesSet.add(r.diagnosticImpression.trim());
        if (r.doctorNotes && r.doctorNotes.trim()) diagnosesSet.add(r.doctorNotes.trim());
      });
      previousRxs.forEach(p => {
        if (p.diagnosis && p.diagnosis.trim()) diagnosesSet.add(p.diagnosis.trim());
      });
      const keyPastDiagnoses = Array.from(diagnosesSet).slice(0, 8);

      // 3. Detect chronic / recurring patterns from past complaints and symptoms
      const allText = [
        ...previousReports.map(r => `${r.chiefComplaint} ${r.summaryForDoctor} ${(r.reportedSymptoms || []).join(' ')}`),
        ...previousRecords.map(rec => rec.title),
        ...previousRxs.map(rx => `${rx.diagnosis} ${rx.medicines}`)
      ].join(' ').toLowerCase();

      const chronicConditions = [];
      if (allText.includes('hyperten') || allText.includes('high bp') || allText.includes('blood pressure')) chronicConditions.push('Hypertension (Elevated BP history)');
      if (allText.includes('diabet') || allText.includes('sugar') || allText.includes('glucose')) chronicConditions.push('Diabetes Mellitus history');
      if (allText.includes('asthma') || allText.includes('bronch') || allText.includes('wheez')) chronicConditions.push('Respiratory / Asthmatic condition');
      if (allText.includes('chest') || allText.includes('angina') || allText.includes('cardio')) chronicConditions.push('Cardiovascular / Chest pain recurrence');
      if (allText.includes('migrain') || allText.includes('headache')) chronicConditions.push('Chronic / Recurring Cephalea (Headaches)');
      if (allText.includes('gastric') || allText.includes('gerd') || allText.includes('acid') || allText.includes('ulcer')) chronicConditions.push('Gastrointestinal / Acid Peptic condition');
      if (allText.includes('thyroid')) chronicConditions.push('Thyroid Disorder');
      if (chronicConditions.length === 0 && previousReports.length > 0) {
        chronicConditions.push('Episodic acute illnesses without chronic progression');
      }

      // 4. Extract allergies & risk flags
      const allergies = new Set();
      previousReports.forEach(r => {
        (r.allergiesMentioned || []).forEach(a => {
          if (a && !a.toLowerCase().includes('none') && !a.toLowerCase().includes('other')) allergies.add(a);
        });
        if (r.urgentReview) {
          allergies.add(`Prior urgent review noted on ${r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'earlier date'}`);
        }
      });
      const allergiesAndRisks = allergies.size > 0 ? Array.from(allergies) : ['No critical drug allergies flagged in previous reports'];

      // 5. Recent Prescriptions
      const recentPrescriptions = previousRxs.map(rx => `${rx.medicines} (for ${rx.diagnosis})`).slice(0, 5);

      // 6. Executive Summary for Doctor
      const pastComplaints = [...new Set(previousReports.map(r => r.chiefComplaint))].filter(Boolean);
      const complaintsSummary = pastComplaints.length > 0 ? `Past presentation(s) include: ${pastComplaints.join('; ')}.` : '';
      const dxSummary = keyPastDiagnoses.length > 0 ? `Recorded diagnoses: ${keyPastDiagnoses.join('; ')}.` : '';
      const chronicSummary = chronicConditions.length > 0 ? `Identified patterns: ${chronicConditions.join(', ')}.` : '';
      const correlationNote = currentComplaint ? `Note for Attending Physician: Correlate current complaint ('${currentComplaint}') with past longitudinal history.` : '';

      const executiveSummary = `AI Longitudinal History Synthesis: Patient has ${previousReports.length} prior clinical report(s), ${previousRecords.length} diagnostic record(s), and ${previousRxs.length} prescription(s) on file. ${complaintsSummary} ${dxSummary} ${chronicSummary} ${correlationNote}`.trim();

      return {
        executiveSummary,
        previousReportsCount: previousReports.length,
        keyPastDiagnoses,
        chronicConditions,
        allergiesAndRisks,
        recentPrescriptions,
        previousReportsTimeline
      };
    } catch (err) {
      console.warn('[AiIntake] Error generating medical history summary:', err.message);
      return {
        executiveSummary: 'Patient medical history compiled from clinical database.',
        previousReportsCount: 0,
        keyPastDiagnoses: [],
        chronicConditions: [],
        allergiesAndRisks: [],
        recentPrescriptions: [],
        previousReportsTimeline: []
      };
    }
  }

  /**
   * Get intake session status
   */
  getSession(sessionId) {
    return sessions.get(sessionId) || null;
  }
}

module.exports = new AiIntakeService();
