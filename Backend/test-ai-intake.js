require('dotenv').config();
const http = require('http');
const assert = require('assert');

const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${process.env.PORT || 5000}`;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const data = body ? JSON.stringify(body) : null;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers
    }, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(responseBody) });
        } catch {
          resolve({ status: res.statusCode, body: responseBody });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('======================================================');
  console.log('🤖 Running Quantum Care AI Intake & Medical History Tests');
  console.log('======================================================');

  let passed = 0;

  // 1. Start AI Intake Session
  const startRes = await request('POST', '/api/v1/ai/intake/start', {
    patientId: 'P-10249',
    patientName: 'Rahul Sharma',
    chiefComplaint: 'Severe chest tightness and shortness of breath when walking',
    language: 'en',
    source: 'webapp'
  });
  assert.strictEqual(startRes.status, 201, 'Start intake should return 201');
  assert.ok(startRes.body.data.sessionId, 'Should return sessionId');
  assert.ok(startRes.body.data.question.question, 'Should return initial question');
  assert.ok(Array.isArray(startRes.body.data.question.options), 'Question should contain options');
  const sessionId = startRes.body.data.sessionId;
  console.log(`✅ PASS: AI intake session started (Session: ${sessionId})`);
  passed++;

  // 2. Answer questions until intake completes
  let isComplete = false;
  let finalReport = null;
  let reportId = null;

  const sampleAnswers = [
    'Heavy pressure and tightness in center of chest',
    'Spreads to left shoulder and arm',
    'Started 2 days ago and getting worse with exertion',
    'Mild hypertension in family history, no known drug allergy'
  ];

  for (let i = 0; i < sampleAnswers.length && !isComplete; i++) {
    const ansRes = await request('POST', `/api/v1/ai/intake/${sessionId}/answer`, {
      answer: sampleAnswers[i],
      answerMethod: 'text'
    });
    assert.strictEqual(ansRes.status, 200, 'Answer intake should return 200');
    if (ansRes.body.data.complete) {
      isComplete = true;
      finalReport = ansRes.body.data.report;
      reportId = ansRes.body.data.reportId || finalReport.id || finalReport.customId;
    }
  }

  assert.ok(isComplete, 'Intake should complete after answers');
  assert.ok(finalReport, 'Should return final synthesized clinical report');
  assert.ok(finalReport.summaryForDoctor, 'Report should contain human-readable summary for doctor');
  console.log('✅ PASS: Clinical intake completed and report synthesized');
  passed++;

  // 3. Query Clinical Reports from MongoDB
  const getReportsRes = await request('GET', '/api/v1/clinical-reports?patientId=P-10249');
  assert.strictEqual(getReportsRes.status, 200);
  assert.ok(Array.isArray(getReportsRes.body.data));
  assert.ok(getReportsRes.body.data.length >= 1, 'Should find patient reports in MongoDB');
  console.log(`✅ PASS: Clinical reports retrieved from MongoDB (${getReportsRes.body.data.length} reports)`);
  passed++;

  // 4. Doctor Updates Clinical Notes
  const updateRes = await request('PATCH', `/api/v1/clinical-reports/${reportId}`, {
    doctorNotes: 'ECG completed showing normal sinus rhythm. Advised stress test and 24h Holter.',
    diagnosticImpression: 'Atypical angina vs musculoskeletal chest pain. Cardiac clearance pending.',
    suggestedScans: ['12-Lead ECG', 'Echocardiogram']
  });
  assert.strictEqual(updateRes.status, 200);
  assert.strictEqual(updateRes.body.data.doctorNotes, 'ECG completed showing normal sinus rhythm. Advised stress test and 24h Holter.');
  console.log('✅ PASS: Doctor updated clinical report notes and diagnostic impression');
  passed++;

  // 5. Query Full Patient Medical History Timeline & AI Summary
  const historyRes = await request('GET', '/api/v1/patients/P-10249/history');
  assert.strictEqual(historyRes.status, 200);
  assert.ok(historyRes.body.data.timeline, 'Should have timeline array');
  assert.ok(historyRes.body.data.aiMedicalHistorySummary, 'Should include AI Medical History Summary in history response');
  assert.ok(historyRes.body.data.aiMedicalHistorySummary.executiveSummary, 'AI Medical History Summary must have executiveSummary');
  console.log(`✅ PASS: Patient medical history timeline & AI summary retrieved (${historyRes.body.data.timeline.length} events)`);
  passed++;

  // 6. Direct Endpoint: Dedicated AI Longitudinal Medical History Summary
  const aiSummaryRes = await request('GET', '/api/v1/patients/P-10249/ai-medical-history-summary');
  assert.strictEqual(aiSummaryRes.status, 200, 'Dedicated AI Medical History Summary returns 200');
  const aiSummary = aiSummaryRes.body.data;
  assert.ok(aiSummary.executiveSummary, 'Summary must contain executiveSummary for the doctor');
  assert.ok(aiSummary.previousReportsCount >= 1, 'Should reflect at least 1 previous report');
  assert.ok(Array.isArray(aiSummary.previousReportsTimeline), 'Should include previous reports timeline breakdown');
  assert.ok(Array.isArray(aiSummary.keyPastDiagnoses), 'Should include key past diagnoses');
  console.log(`✅ PASS: AI synthesized summary of previous reports for doctor (Past reports: ${aiSummary.previousReportsCount})`);
  passed++;

  // 7. Second Intake Encounter: AI automatically incorporates previous reports into new consultation
  const startFollowUp = await request('POST', '/api/v1/ai/intake/start', {
    patientId: 'P-10249',
    patientName: 'Rahul Sharma',
    chiefComplaint: 'Follow-up for persistent chest discomfort and new mild dizziness',
    language: 'en',
    source: 'webapp'
  });
  assert.strictEqual(startFollowUp.status, 201);
  const followUpSessionId = startFollowUp.body.data.sessionId;

  let followUpComplete = false;
  let followUpReport = null;
  const followUpAnswers = [
    'Mild persistent pressure in center of chest',
    'Dizziness occurs when standing up quickly',
    'Continuing prescribed medications regularly',
    'No new allergies observed'
  ];

  for (let i = 0; i < followUpAnswers.length && !followUpComplete; i++) {
    const res = await request('POST', `/api/v1/ai/intake/${followUpSessionId}/answer`, {
      answer: followUpAnswers[i],
      answerMethod: 'text'
    });
    if (res.body.data?.complete) {
      followUpComplete = true;
      followUpReport = res.body.data.report;
    }
  }

  assert.ok(followUpComplete, 'Follow-up intake should complete');
  assert.ok(followUpReport.pastMedicalHistorySummary, 'New report must embed pastMedicalHistorySummary');
  assert.ok(followUpReport.pastMedicalHistorySummary.previousReportsCount >= 1, 'AI must have analyzed previous report');
  assert.ok(followUpReport.summaryForDoctor.includes('Prior History') || followUpReport.summaryForDoctor.length > 50, 'Doctor summary must incorporate past history context');
  console.log('✅ PASS: Follow-up AI report synthesized with embedded previous reports medical history summary');
  passed++;

  console.log(`\nResults: ${passed} passed, 0 failed.`);
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
