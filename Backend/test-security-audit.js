/**
 * Automated Security & Hardening Audit Suite
 * Tests 25-point security requirements:
 * 1. Security Headers & CORS
 * 2. Protected Admin / Doctor routes (RBAC)
 * 3. User Data Isolation & IDOR prevention
 * 4. NoSQL Operator Sanitization
 * 5. XSS Content Sanitization
 * 6. Rate Limiting on API and Auth
 * 7. File Upload Extension & MIME Protection
 * 8. Error masking and detail suppression
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:5000';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const postData = body ? JSON.stringify(body) : null;

    const reqHeaders = {
      ...headers
    };
    if (postData) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(url, {
      method,
      headers: reqHeaders
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch (_) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed
        });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runAudit() {
  console.log('====================================================');
  console.log('   QUANTUM CARE SECURITY & HARDENING AUDIT');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(title, condition, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`  [PASS] ${title}`);
    } else {
      console.error(`  [FAIL] ${title} - ${details}`);
    }
  }

  // ── 1. Security Headers Audit ──
  console.log('--- 1. Security Headers Audit ---');
  const healthRes = await request('GET', '/health');
  assert('X-Content-Type-Options is nosniff', healthRes.headers['x-content-type-options'] === 'nosniff');
  assert('X-Frame-Options is SAMEORIGIN', healthRes.headers['x-frame-options'] === 'SAMEORIGIN');
  assert('X-XSS-Protection is enabled', healthRes.headers['x-xss-protection']?.includes('1'));
  assert('X-Powered-By is hidden', !healthRes.headers['x-powered-by']);
  assert('Strict-Transport-Security is present', Boolean(healthRes.headers['strict-transport-security']));

  // ── 2. Admin & Staff Route RBAC Protection ──
  console.log('\n--- 2. Route Protection & RBAC Audit ---');
  const unauthDoctorCreate = await request('POST', '/api/v1/doctors', { name: 'Dr. Hack', email: 'hack@med.org' });
  assert('Unauthenticated user cannot create doctor (401)', unauthDoctorCreate.statusCode === 401);

  const unauthPrescriptionCreate = await request('POST', '/api/v1/prescriptions', { medicines: 'Antibiotics' });
  assert('Unauthenticated user cannot issue prescriptions (401)', unauthPrescriptionCreate.statusCode === 401);

  const unauthHospitalStats = await request('GET', '/api/v1/hospital/stats');
  assert('Unauthenticated user cannot view hospital stats (401)', unauthHospitalStats.statusCode === 401);

  // Register a dynamic test patient
  const testEmail = `audit.patient.${Date.now()}@test.org`;
  const registerRes = await request('POST', '/api/v1/auth/register', {
    role: 'patient',
    name: 'Audit Patient',
    email: testEmail,
    password: 'Password@123'
  });

  const patientToken = registerRes.body?.data?.accessToken;
  assert('Can register a clean patient account without test data hardcoding', registerRes.statusCode === 201 && Boolean(patientToken));

  if (patientToken) {
    const patientHeaders = { Authorization: `Bearer ${patientToken}` };

    // Patient trying to access doctor/admin routes
    const patientCreateDoctor = await request('POST', '/api/v1/doctors', { name: 'Dr. Malicious', email: 'mal@doc.org' }, patientHeaders);
    assert('Patient role blocked from creating doctors (403 Forbidden)', patientCreateDoctor.statusCode === 403);

    const patientCreateRx = await request('POST', '/api/v1/prescriptions', { medicines: 'Restricted Meds' }, patientHeaders);
    assert('Patient role blocked from creating prescriptions (403 Forbidden)', patientCreateRx.statusCode === 403);

    const patientStats = await request('GET', '/api/v1/hospital/stats', null, patientHeaders);
    assert('Patient role blocked from accessing hospital stats (403 Forbidden)', patientStats.statusCode === 403);

    const patientAdminUsers = await request('GET', '/api/v1/auth/users', null, patientHeaders);
    assert('Patient role blocked from inspecting admin users (403 Forbidden)', patientAdminUsers.statusCode === 403);

    // ── 3. User Data Isolation & IDOR Audit ──
    console.log('\n--- 3. User Data Isolation & IDOR Audit ---');
    const patientOtherHistory = await request('GET', '/api/v1/patients/P-OTHER-SECRET/history', null, patientHeaders);
    assert('Patient cannot access another patient history (403 Forbidden)', patientOtherHistory.statusCode === 403);

    const patientOtherSummary = await request('GET', '/api/v1/patients/P-OTHER-SECRET/ai-medical-history-summary', null, patientHeaders);
    assert('Patient cannot access another patient AI medical summary (403 Forbidden)', patientOtherSummary.statusCode === 403);

    const patientAptCancelOther = await request('DELETE', '/api/v1/appointments/APT-NONEXISTENT', null, patientHeaders);
    assert('Patient cannot delete non-owned or invalid appointment (403/404)', [403, 404].includes(patientAptCancelOther.statusCode));
  }

  // ── 4. NoSQL Operator Sanitization Audit ──
  console.log('\n--- 4. NoSQL Operator & Injection Sanitization ---');
  const nosqlInjectRes = await request('POST', '/api/v1/ai/intake/start', {
    chiefComplaint: { "$gt": "" },
    source: "kiosk"
  });
  // Should reject because chiefComplaint is empty/sanitized string, not operator
  assert('NoSQL query operator ($gt) is stripped from payload', nosqlInjectRes.statusCode === 400 || nosqlInjectRes.body?.success === false);

  // ── 5. XSS Input Sanitization Audit ──
  console.log('\n--- 5. XSS Script Sanitization Audit ---');
  const xssRes = await request('POST', '/api/v1/ai/intake/start', {
    chiefComplaint: 'Severe Migraine <script>alert("xss")</script>',
    source: 'webapp'
  });
  if (xssRes.statusCode === 201) {
    assert('XSS script tags stripped from chiefComplaint', !xssRes.body.data?.chiefComplaint?.includes('<script>'));
  } else {
    assert('XSS attempt processed safely without error leakage', xssRes.statusCode < 500);
  }

  // ── 6. Rate Limiting Headers Audit ──
  console.log('\n--- 6. Rate Limiting Audit ---');
  const apiHealthRes = await request('GET', '/api/health');
  assert('Rate limit header present on API', Boolean(apiHealthRes.headers['x-ratelimit-limit']));
  assert('Rate limit remaining header present', apiHealthRes.headers['x-ratelimit-remaining'] !== undefined);

  // ── 7. Error Detail Masking & 404 Route Audit ──
  console.log('\n--- 7. Error Masking & 404 Audit ---');
  const notFoundRes = await request('GET', '/api/v1/nonexistent-endpoint-test');
  assert('Unknown endpoint returns clean 404', notFoundRes.statusCode === 404);
  assert('Error message does not leak stack trace', !JSON.stringify(notFoundRes.body).includes('at Object.'));

  // ── 8. Secure Static Uploads ──
  console.log('\n--- 8. Uploads Storage Protection Audit ---');
  const exeBlocked = await request('GET', '/uploads/exploit.exe');
  assert('Executable files in /uploads return 403 Forbidden', exeBlocked.statusCode === 403);

  console.log('\n====================================================');
  console.log(`   AUDIT RESULTS: ${passed}/${total} CHECKS PASSED`);
  console.log('====================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAudit().catch(err => {
  console.error('Fatal audit execution error:', err);
  process.exit(1);
});
