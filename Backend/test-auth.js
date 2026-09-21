const http = require('http');

const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${process.env.PORT || 5000}`;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const bodyData = body ? JSON.stringify(body) : null;
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      headers: {
        'Content-Type': 'application/json',
        ...(bodyData ? { 'Content-Length': Buffer.byteLength(bodyData) } : {}),
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);

    if (bodyData) {
      req.write(bodyData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('--- Quantum Care JWT Token Authentication Test Suite ---');
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
    assert(health.status === 200 && health.body.status === 'healthy', 'Server is healthy');

    // 2. Patient login: verify JWT token pair (accessToken + refreshToken)
    const patientLogin = await request('POST', '/api/v1/auth/login', {
      role: 'patient',
      identifier: 'rahul.sharma@example.com',
      password: 'patient123'
    });
    const { accessToken, refreshToken, token, tokenType } = patientLogin.body.data || {};
    assert(
      patientLogin.status === 200 &&
      accessToken &&
      refreshToken &&
      token === accessToken &&
      tokenType === 'Bearer',
      'Patient login issues JWT Access Token + Refresh Token pair'
    );

    // 3. Verify JWT token claims structure
    const tokenVerify = await request('POST', '/api/v1/auth/verify-token', {
      token: accessToken
    });
    const claims = tokenVerify.body.data?.claims || {};
    assert(
      tokenVerify.status === 200 &&
      claims.role === 'patient' &&
      claims.jti &&
      claims.tokenType === 'access',
      'JWT token inspection confirms valid claims (sub, role, jti, tokenType)'
    );

    // 4. Patient login with 12-digit Aadhaar number
    const patientAadhaarLogin = await request('POST', '/api/v1/auth/login', {
      role: 'patient',
      identifier: '123456789012',
      password: 'patient123'
    });
    assert(patientAadhaarLogin.status === 200 && patientAadhaarLogin.body.data.accessToken, 'Patient login with 12-digit Aadhaar number');

    // 5. Doctor login with NMC ID
    const docLogin = await request('POST', '/api/v1/auth/login', {
      role: 'doctor',
      identifier: 'NMC-2018-99412',
      password: 'doctor123'
    });
    assert(docLogin.status === 200 && docLogin.body.data.user.doctorDetails?.nmcId, 'Doctor login with NMC ID');

    // 6. Hospital login with Reg No
    const hospLogin = await request('POST', '/api/v1/auth/login', {
      role: 'hospital',
      identifier: 'RJ-MED-2014-991',
      password: 'hospital123'
    });
    assert(hospLogin.status === 200 && hospLogin.body.data.user.role === 'hospital', 'Hospital login with Registration No');

    // 7. Kiosk login with Terminal ID and PIN
    const kioskLogin = await request('POST', '/api/v1/auth/login', {
      role: 'kiosk',
      identifier: 'KIOSK-TER-04',
      pin: '1234'
    });
    assert(kioskLogin.status === 200 && kioskLogin.body.data.accessToken, 'Kiosk terminal login with PIN');

    // 8. Invalid credentials test (Reject invalid secret)
    const badLogin = await request('POST', '/api/v1/auth/login', {
      role: 'patient',
      identifier: 'rahul.sharma@example.com',
      password: 'wrongpassword'
    });
    assert(badLogin.status === 401 && !badLogin.body.success, 'Reject invalid password with 401');

    // 9. Register a new patient and verify JWT tokens returned
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newPatientRes = await request('POST', '/api/v1/auth/register', {
      role: 'patient',
      name: `Test Patient ${randomSuffix}`,
      email: `patient${randomSuffix}@test.com`,
      phone: `980000${randomSuffix}`,
      password: 'secretPassword123',
      aadhaar: `88887777${randomSuffix}`,
      schemes: {
        isEnrolled: true,
        hasGovScheme: true,
        govSchemeType: 'RGHS',
        govSchemeNum: `RGHS-${randomSuffix}`
      }
    });
    assert(newPatientRes.status === 201 && newPatientRes.body.data.accessToken, 'Register new Patient returns JWT tokens');

    // 10. Aadhaar OTP Flow
    const otpReq = await request('POST', '/api/v1/auth/register/request-otp', {
      aadhaar: '999988881234',
      phone: '9876500000'
    });
    assert(otpReq.status === 200 && otpReq.body.data.sessionId, 'Request Aadhaar OTP session');

    const sessionId = otpReq.body.data.sessionId;
    const devOtp = otpReq.body.data.devOtp;

    const otpVerify = await request('POST', '/api/v1/auth/register/verify-otp', {
      sessionId,
      otp: devOtp
    });
    assert(otpVerify.status === 200 && otpVerify.body.data.verificationToken, 'Verify 6-digit Aadhaar OTP');

    // 11. Protected route: GET /api/v1/auth/me with Bearer JWT
    const meRes = await request('GET', '/api/v1/auth/me', null, {
      Authorization: `Bearer ${accessToken}`
    });
    assert(meRes.status === 200 && meRes.body.data.jwtClaims?.role === 'patient', 'Protected GET /api/v1/auth/me returns profile & claims');

    // 12. Refresh Token Flow: POST /api/v1/auth/refresh
    const refreshRes = await request('POST', '/api/v1/auth/refresh', {
      refreshToken: refreshToken
    });
    const newAccessToken = refreshRes.body.data?.accessToken;
    assert(refreshRes.status === 200 && newAccessToken, 'Exchange Refresh Token for new JWT Access Token');

    // 13. Verify newly refreshed Access Token works on protected endpoint
    const meRefreshed = await request('GET', '/api/v1/auth/me', null, {
      Authorization: `Bearer ${newAccessToken}`
    });
    assert(meRefreshed.status === 200, 'Newly refreshed JWT Access Token grants access to protected routes');

    // 14. Password change
    const changePass = await request('POST', '/api/v1/auth/password/change', {
      currentPassword: 'patient123',
      newPassword: 'patientNewPassword123'
    }, {
      Authorization: `Bearer ${newAccessToken}`
    });
    assert(changePass.status === 200, 'Authenticated password change via JWT Bearer');

    // Restore password for demo consistency
    await request('POST', '/api/v1/auth/password/change', {
      currentPassword: 'patientNewPassword123',
      newPassword: 'patient123'
    }, {
      Authorization: `Bearer ${newAccessToken}`
    });

    // 15. JWT Token Revocation & Blacklisting on Logout
    const logoutRes = await request('POST', '/api/v1/auth/logout', {
      refreshToken: refreshToken
    }, {
      Authorization: `Bearer ${newAccessToken}`
    });
    assert(logoutRes.status === 200, 'Logout endpoint revokes JWT access & refresh tokens');

    // 16. Verify that revoked token is REJECTED by authMiddleware
    const revokedCheck = await request('GET', '/api/v1/auth/me', null, {
      Authorization: `Bearer ${newAccessToken}`
    });
    assert(
      revokedCheck.status === 401 &&
      revokedCheck.body.message.includes('revoked'),
      'Token Blacklist successfully blocks revoked JWT token from further use'
    );

    // 17. Reject tampered/forged JWT token
    const forgedCheck = await request('GET', '/api/v1/auth/me', null, {
      Authorization: 'Bearer invalid.forged.token'
    });
    assert(forgedCheck.status === 401, 'Reject forged/tampered JWT token with 401');

    console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
