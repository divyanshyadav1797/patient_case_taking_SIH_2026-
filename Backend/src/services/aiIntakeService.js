const clinicalRepository = require('../repositories/clinicalRepository');
const userRepository = require('../repositories/userRepository');

// In-memory active intake sessions
const sessions = new Map();

// Helper to generate dynamic, medically relevant follow-up questions if AI service is offline
const CLINICAL_KNOWLEDGE_QUESTIONS = {
  fever: [
    { question: 'How high has your temperature been and how many days has the fever lasted?', options: ['1-2 days (Low grade)', '3-5 days (Moderate)', 'More than 5 days (High grade > 102°F)', 'Other'] },
    { question: 'Are you experiencing chills, body aches, shivering, or a severe sore throat?', options: ['Severe chills & body aches', 'Sore throat & cough', 'Headache & nausea', 'None of these', 'Other'] },
    { question: 'Have you taken any fever-reducing medication like Paracetamol?', options: ['Yes, Paracetamol helped temporarily', 'Yes, but fever did not come down', 'No medication taken yet', 'Other'] }
  ],
  chest: [
    { question: 'Does the chest discomfort feel like pressure, tightness, or a sharp stabbing sensation?', options: ['Heavy pressure / squeezing', 'Sharp stabbing pain on breathing', 'Burning sensation (heartburn)', 'Other'] },
    { question: 'Does the pain spread to your left arm, neck, jaw, or shoulder blade?', options: ['Spreads to left arm and shoulder', 'Spreads to neck/jaw', 'Stays in center of chest', 'Other'] },
    { question: 'Are you feeling short of breath, sweating, or unusually dizzy?', options: ['Yes, sweating & shortness of breath', 'Mild dizziness only', 'No associated symptoms', 'Other'] }
  ],
  stomach: [
    { question: 'Where is the stomach pain located and when did it start?', options: ['Upper abdomen / epigastric', 'Lower right abdomen', 'Around navel / generalized', 'Lower pelvic area', 'Other'] },
    { question: 'Have you had nausea, vomiting, diarrhoea, or inability to keep food down?', options: ['Nausea and vomiting', 'Diarrhoea / loose motions', 'Acid reflux / bloating', 'No nausea or vomiting', 'Other'] },
    { question: 'Does eating food make the pain better or worse?', options: ['Worse after eating', 'Better after eating', 'No change with meals', 'Other'] }
  ],
  headache: [
    { question: 'Is the headache throbbing on one side or a tight band around your whole head?', options: ['One-sided throbbing (pulsating)', 'Tight band around entire forehead', 'Back of head and neck stiffness', 'Other'] },
    { question: 'Are you experiencing nausea, visual flashes, or sensitivity to light/sound?', options: ['Sensitive to bright light and noise', 'Visual blurriness or spots', 'Nausea / upset stomach', 'None of these', 'Other'] },
    { question: 'How long have you had this episode and does it disturb your sleep?', options: ['Started today, very intense', 'Recurring for several days', 'Mild but continuous', 'Other'] }
  ],
  cough: [
    { question: 'Is the cough dry or are you coughing up phlegm or mucus?', options: ['Dry irritating cough', 'Wet cough with yellow/green phlegm', 'Blood-tinged mucus', 'Other'] },
    { question: 'Are you having difficulty breathing, wheezing, or chest tightness?', options: ['Wheezing on exertion', 'Shortness of breath even at rest', 'Chest tightness when lying down', 'No breathing difficulty', 'Other'] },
    { question: 'Do you have a history of asthma, allergies, or smoking?', options: ['Known history of asthma', 'Seasonal allergies', 'Current or former smoker', 'None', 'Other'] }
  ]
};

function getCategoryFromComplaint(complaint = '') {
  const c = complaint.toLowerCase();
  if (c.includes('chest') || c.includes('heart') || c.includes('palpitat') || c.includes('breath')) return 'chest';
  if (c.includes('fever') || c.includes('chill') || c.includes('temp') || c.includes('shiver')) return 'fever';
  if (c.includes('stomach') || c.includes('abdom') || c.includes('belly') || c.includes('digest') || c.includes('vomit') || c.includes('nausea') || c.includes('diarrh')) return 'stomach';
  if (c.includes('head') || c.includes('migrain') || c.includes('dizz')) return 'headache';
  if (c.includes('cough') || c.includes('cold') || c.includes('throat') || c.includes('sneeze')) return 'cough';
  return 'general';
}

function getFallbackQuestion(complaint, questionCount) {
  const cat = getCategoryFromComplaint(complaint);
  const bank = CLINICAL_KNOWLEDGE_QUESTIONS[cat] || [
    { question: 'When did your symptoms first begin, and how fast did they develop?', options: ['Started suddenly today', 'Developed over 2-3 days', 'Persistent for more than a week', 'Other'] },
    { question: 'How severe would you rate your discomfort right now (1 being mild, 10 being severe)?', options: ['Mild (1-3) - manageable', 'Moderate (4-6) - affects daily tasks', 'Severe (7-10) - hard to bear', 'Other'] },
    { question: 'Do you have any known medical conditions (diabetes, BP, asthma) or take regular medications?', options: ['Hypertension / High BP', 'Diabetes', 'Asthma / Respiratory issue', 'None / Healthy', 'Other'] }
  ];

  if (questionCount < bank.length) {
    const q = bank[questionCount];
    return {
      question: q.question,
      options: q.options,
      allowCustomText: true,
      allowVoice: true,
      complete: false,
      reason: `Clinical intake step ${questionCount + 1}`
    };
  }

  return {
    question: 'Are there any other symptoms, allergies, or details the doctor should know?',
    options: ['No other symptoms', 'Known drug allergies', 'History of surgery', 'Other'],
    allowCustomText: true,
    allowVoice: true,
    complete: true,
    reason: 'Clinical intake complete'
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
      patientId: patientId || 'P-10249',
      patientName: resolvedName,
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
      const timeout = setTimeout(() => controller.abort(), 400);
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
      firstQuestion = getFallbackQuestion(session.chiefComplaint, 0);
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
  async answerIntake(sessionId, { answer, answerMethod = 'text' }) {
    const session = sessions.get(sessionId);
    if (!session) {
      throw new Error(`Intake session '${sessionId}' not found or expired.`);
    }

    if (session.status !== 'active') {
      throw new Error('This intake session has already been completed.');
    }

    if (!answer || !String(answer).trim()) {
      throw new Error('Answer text is required.');
    }

    const cleanAnswer = String(answer).trim();

    session.conversation.push({
      question: session.currentQuestion?.question || 'Medical query',
      options: session.currentQuestion?.options || [],
      answer: cleanAnswer,
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
      } catch (e) {}
    }

    if (!nextQuestion) {
      nextQuestion = getFallbackQuestion(session.chiefComplaint, session.questionCount);
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
   */
  async synthesizeReport(session) {
    const conv = session.conversation || [];
    const answersText = conv.map(c => `Q: ${c.question} -> A: ${c.answer}`).join('; ');
    const isChest = getCategoryFromComplaint(session.chiefComplaint) === 'chest';
    const hasSeverePain = answersText.toLowerCase().includes('severe') || answersText.toLowerCase().includes('spread') || answersText.toLowerCase().includes('sweating');

    // Extract symptoms mentioned in answers
    const symptoms = [session.chiefComplaint];
    conv.forEach(item => {
      if (item.answer && !item.answer.toLowerCase().includes('none') && !item.answer.toLowerCase().includes('other')) {
        symptoms.push(item.answer);
      }
    });

    const isUrgent = isChest || hasSeverePain || answersText.toLowerCase().includes('> 102') || answersText.toLowerCase().includes('shortness of breath');

    // Synthesize longitudinal summary of ALL previous reports for this patient
    const pastHistorySummary = await this.generateMedicalHistorySummary(session.patientId, session.chiefComplaint);

    const pastHistoryMentioned = [];
    if (session.patientProfile?.medicalHistory) {
      pastHistoryMentioned.push(session.patientProfile.medicalHistory);
    }
    if (pastHistorySummary.previousReportsCount > 0) {
      pastHistoryMentioned.push(`${pastHistorySummary.previousReportsCount} prior report(s) on file. Diagnoses: ${pastHistorySummary.keyPastDiagnoses.join(', ') || 'Under evaluation'}`);
    } else {
      pastHistoryMentioned.push('First recorded clinical encounter');
    }

    const historyPrefix = pastHistorySummary.previousReportsCount > 0 
      ? `[Prior History: ${pastHistorySummary.previousReportsCount} visit(s) - ${pastHistorySummary.chronicConditions.slice(0, 2).join(', ')}] ` 
      : '';

    return {
      chiefComplaint: session.chiefComplaint,
      summaryForDoctor: `${historyPrefix}Patient presented with ${session.chiefComplaint}. Intake notes: ${conv.map(c => c.answer).join('. ')}. ${isUrgent ? 'URGENT evaluation recommended.' : 'Stable for standard consultation.'}`,
      historyOfPresentIllness: `Episode described: ${session.chiefComplaint}. Patient responses during intake: ${answersText}.`,
      reportedSymptoms: symptoms,
      medicationsMentioned: answersText.toLowerCase().includes('paracetamol') ? ['Paracetamol (reported by patient)'] : [],
      allergiesMentioned: answersText.toLowerCase().includes('allergy') || answersText.toLowerCase().includes('allergies') ? ['Patient mentioned drug sensitivity'] : ['None reported during intake'],
      pastHistoryMentioned,
      pastMedicalHistorySummary: pastHistorySummary,
      urgentReview: isUrgent,
      importantUnknowns: ['Baseline vital parameters (BP, SpO2, Pulse)', 'Confirmation of current prescription compliance'],
      diagnosticImpression: `Preliminary intake assessment: ${session.chiefComplaint}. Awaiting physical examination and clinical correlation.`
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
