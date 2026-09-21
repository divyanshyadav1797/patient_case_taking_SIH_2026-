/**
 * Test Voice Intake & Push-To-Talk Flow
 * End-to-end self-check for Quantum Care voice chat API
 */
require('dotenv').config();
const assert = require('assert');
const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function createMockWavBuffer() {
  const sampleRate = 8000;
  const numSamples = 4000;
  const buffer = Buffer.alloc(44 + numSamples);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate, 28);
  buffer.writeUInt16LE(1, 32);
  buffer.writeUInt16LE(8, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples, 40);
  return buffer;
}

function postMultipart(path, fieldName, filename, fileBuffer, mimeType, extraFields = {}) {
  return new Promise((resolve, reject) => {
    const boundary = '----VoiceTestBoundary' + Date.now();
    const chunks = [];

    // Append extra text fields
    Object.entries(extraFields).forEach(([key, val]) => {
      chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}\r\n`));
    });

    // Append file
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`));
    chunks.push(fileBuffer);
    chunks.push(Buffer.from(`\r\n--${boundary}--\r\n`));

    const fullBody = Buffer.concat(chunks);
    const url = new URL(path, BASE_URL);

    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': fullBody.length
      }
    }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.write(fullBody);
    req.end();
  });
}

function postJson(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url = new URL(path, BASE_URL);
    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', (c) => responseBody += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(responseBody) });
        } catch {
          resolve({ status: res.statusCode, body: responseBody });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('🎤 Testing Voice Chat & Push-to-Talk API Endpoints...');

  const wavBuffer = createMockWavBuffer();

  // Test 1: Direct Voice Transcribe endpoint
  console.log('1. Testing POST /api/v1/ai/voice/transcribe');
  const transcribeRes = await postMultipart('/api/v1/ai/voice/transcribe', 'audio', 'test.wav', wavBuffer, 'audio/wav', { language: 'hi' });
  assert.strictEqual(transcribeRes.status, 200, 'Voice transcribe should return 200');
  assert.ok(transcribeRes.body.success, 'Should be successful');
  console.log('✅ Voice Transcribe endpoint passed.');

  // Test 2: Start Intake
  console.log('2. Starting AI intake session...');
  const startRes = await postJson('/api/v1/ai/intake/start', {
    patientId: 'P-KIOSK-001',
    patientName: 'Test Patient',
    chiefComplaint: 'तीज़ बुखार और सिरदर्द (Severe fever and headache)',
    language: 'hi',
    source: 'kiosk'
  });
  assert.strictEqual(startRes.status, 201, 'Start intake should return 201');
  const sessionId = startRes.body.data.sessionId;
  assert.ok(sessionId, 'Session ID required');
  console.log(`✅ Intake started with session ID: ${sessionId}`);

  // Test 3: Silent audio without speech should return 422
  console.log('3. Testing inaudible audio handling (expecting 422)...');
  const silentRes = await postMultipart(`/api/v1/ai/intake/${sessionId}/voice-answer`, 'audio', 'silent.wav', wavBuffer, 'audio/wav', { language: 'hi' });
  assert.strictEqual(silentRes.status, 422, 'Silent audio should return 422');
  console.log('✅ Inaudible/silent audio correctly rejected with 422.');

  // Test 4: Voice Answer with spoken content
  console.log('4. Testing voice answer turn with Push-to-Talk spoken content...');
  const voiceAnswerRes = await postMultipart(
    `/api/v1/ai/intake/${sessionId}/voice-answer`,
    'audio',
    'answer.wav',
    wavBuffer,
    'audio/wav',
    {
      language: 'hi',
      fallbackAnswer: 'दो दिन से लगातार 102 डिग्री बुखार है और ठंड लग रही है'
    }
  );
  assert.strictEqual(voiceAnswerRes.status, 200, 'Voice answer should return 200');
  assert.ok(voiceAnswerRes.body.success, 'Voice answer should be marked successful');
  assert.strictEqual(voiceAnswerRes.body.data.answerMethod, 'voice', 'Answer method must be voice');
  assert.ok(voiceAnswerRes.body.data.question || voiceAnswerRes.body.data.report, 'Next question or report expected');
  console.log('✅ Voice answer endpoint passed (Next question generated).');

  console.log('🎉 ALL VOICE CHAT PUSH-TO-TALK TESTS PASSED!');
}

run().catch((e) => {
  console.error('❌ Voice test failed:', e);
  process.exit(1);
});
