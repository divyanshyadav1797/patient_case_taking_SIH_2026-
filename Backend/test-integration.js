/**
 * Quantum Care End-to-End Frontend-Backend Integration Test
 */
const http = require('http');

const PORT = Number(process.env.PORT || 5000);
const HOST = '127.0.0.1';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const data = body ? JSON.stringify(body) : null;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request({
      host: HOST,
      port: PORT,
      path,
      method,
      headers
    }, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode, body: parsed });
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
  console.log('🚀 Running Quantum Care Full System Integration Tests');
  console.log('======================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('GET', '/health');
    assert(health.status === 200 && health.body.status === 'healthy', 'Server /health endpoint reports healthy');

    // 2. Auth: Patient Login
    const loginRes = await request('POST', '/api/v1/auth/login', {
      role: 'patient',
      identifier: 'rahul.sharma@example.com',
      password: 'patient123'
    });
    assert(loginRes.status === 200 && loginRes.body.success === true, 'Patient login returns success with JWT');
    const token = loginRes.body.data.token;

    // 3. Appointments: Get List
    const aptsRes = await request('GET', '/api/v1/appointments', null, token);
    assert(aptsRes.status === 200 && Array.isArray(aptsRes.body.data), 'GET /api/v1/appointments returns appointments array');

    // 4. Appointments: Book New
    const newApt = {
      doctorName: 'Dr. Sarah Jenkins',
      patientName: 'Rahul Sharma',
      specialty: 'Cardiology',
      date: 'Sep 25, 2026',
      time: '11:30 AM',
      type: 'General Consultation'
    };
    const bookRes = await request('POST', '/api/v1/appointments', newApt, token);
    assert(bookRes.status === 201 && bookRes.body.data.doctorName === 'Dr. Sarah Jenkins', 'POST /api/v1/appointments books appointment');
    const createdAptId = bookRes.body.data.id;

    // 5. Appointments: Update / Reschedule
    const updateRes = await request('PATCH', `/api/v1/appointments/${createdAptId}`, {
      date: 'Sep 26, 2026',
      time: '02:00 PM',
      status: 'Upcoming'
    }, token);
    assert(updateRes.status === 200 && updateRes.body.data.time === '02:00 PM', 'PATCH /api/v1/appointments/:id reschedules appointment');

    // 6. Doctors: Get Directory
    const docRes = await request('GET', '/api/v1/doctors');
    assert(docRes.status === 200 && docRes.body.data.length > 0, 'GET /api/v1/doctors returns directory of doctors');

    // 7. Medical Records: Get and Post
    const recsRes = await request('GET', '/api/v1/records', null, token);
    assert(recsRes.status === 200 && Array.isArray(recsRes.body.data), 'GET /api/v1/records returns patient records');

    const addRecRes = await request('POST', '/api/v1/records', {
      title: 'Blood Pressure Log Report',
      doctor: 'Dr. Sarah Jenkins',
      hospital: 'SMS Hospital Jaipur',
      type: 'Vitals Chart'
    }, token);
    assert(addRecRes.status === 201 && addRecRes.body.data.title === 'Blood Pressure Log Report', 'POST /api/v1/records adds medical record');

    // 8. Prescriptions: Get and Post
    const rxRes = await request('GET', '/api/v1/prescriptions', null, token);
    assert(rxRes.status === 200 && Array.isArray(rxRes.body.data), 'GET /api/v1/prescriptions returns prescriptions');

    // Login as Doctor to issue prescription (enforces RBAC)
    const docLoginRes = await request('POST', '/api/v1/auth/login', {
      role: 'doctor',
      identifier: 'dr.sarah@medicare.org',
      password: 'doctor123'
    });
    assert(docLoginRes.status === 200 && docLoginRes.body.success === true, 'Doctor login returns success with JWT');
    const docToken = docLoginRes.body.data.token;

    const createRxRes = await request('POST', '/api/v1/prescriptions', {
      patient: 'Rahul Sharma',
      patientId: 'P-10249',
      doctorName: 'Dr. Sarah Jenkins',
      diagnosis: 'Mild Hypertension',
      medicines: 'Telmisartan 40mg once daily (30 Days)'
    }, docToken);
    assert(createRxRes.status === 201 && createRxRes.body.data.diagnosis === 'Mild Hypertension', 'POST /api/v1/prescriptions issues prescription');

    // 9. Kiosk: Generate Token & Queue
    const kioskTokenRes = await request('POST', '/api/v1/kiosk/token', {
      patientName: 'Aadhaar Walk-in Patient',
      aadhaar: '123456789012',
      department: 'Cardiology',
      doctor: 'Dr. Sarah Jenkins',
      concern: 'Chest heaviness'
    });
    assert(kioskTokenRes.status === 201 && kioskTokenRes.body.data.tokenNumber.startsWith('TK-'), 'POST /api/v1/kiosk/token generates queue token');

    const queueRes = await request('GET', '/api/v1/kiosk/queue');
    assert(queueRes.status === 200 && queueRes.body.data.length > 0, 'GET /api/v1/kiosk/queue lists active kiosk tokens');

    // 10. Hospital Stats (requires doctor/hospital/admin role)
    const statsRes = await request('GET', '/api/v1/hospital/stats', null, docToken);
    assert(statsRes.status === 200 && statsRes.body.data.departments.length > 0, 'GET /api/v1/hospital/stats returns hospital OPD metrics');

    console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Integration test failed with error:', err);
    process.exit(1);
  }
}

runTests();
