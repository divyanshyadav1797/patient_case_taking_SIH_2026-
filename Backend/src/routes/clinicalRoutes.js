const express = require('express');
const router = express.Router();
const clinicalController = require('../controllers/clinicalController');
const {
    authenticateToken,
    authenticateOptionalToken,
    requireRole
} = require('../middleware/authMiddleware');

const voiceUpload = require('../middleware/voiceUpload');
const upload = require('../middleware/ocrUpload');

// ── Appointments ──
// GET: Protected. Patients view only their own, doctors view their schedule
router.get('/appointments', authenticateToken, (req, res, next) => clinicalController.getAppointments(req, res, next));
// POST: Walk-in kiosk or authenticated patient
router.post('/appointments', authenticateOptionalToken, (req, res, next) => clinicalController.createAppointment(req, res, next));
// PATCH: Authenticated patient, doctor, or staff
router.patch('/appointments/:id', authenticateToken, (req, res, next) => clinicalController.updateAppointment(req, res, next));
// DELETE: Authenticated patient (own) or admin/doctor
router.delete('/appointments/:id', authenticateToken, (req, res, next) => clinicalController.deleteAppointment(req, res, next));

// ── Doctors ──
// GET: Public list so kiosk patients or app users can browse specialties
router.get('/doctors', authenticateOptionalToken, (req, res, next) => clinicalController.getDoctors(req, res, next));
// POST: Only Hospital Admin or System Admin can register new physicians
router.post('/doctors', authenticateToken, requireRole('admin', 'hospital'), (req, res, next) => clinicalController.createDoctor(req, res, next));
router.post('/hospital/doctors', authenticateToken, requireRole('admin', 'hospital'), (req, res, next) => clinicalController.createDoctor(req, res, next));
router.patch('/doctors/:id', authenticateToken, requireRole('admin', 'hospital'), (req, res, next) => clinicalController.updateDoctor(req, res, next));
router.delete('/doctors/:id', authenticateToken, requireRole('admin', 'hospital'), (req, res, next) => clinicalController.deleteDoctor(req, res, next));

// ── Medical Records ──
// GET: Protected. Patients isolated to their own records; doctors/staff view patient's
router.get('/records', authenticateToken, (req, res, next) => clinicalController.getRecords(req, res, next));
router.post('/records', authenticateToken, (req, res, next) => clinicalController.createRecord(req, res, next));
router.patch('/records/:id', authenticateToken, requireRole('admin', 'hospital', 'doctor'), (req, res, next) => clinicalController.updateRecord(req, res, next));
router.delete('/records/:id', authenticateToken, requireRole('admin', 'hospital'), (req, res, next) => clinicalController.deleteRecord(req, res, next));

// ── Prescriptions ──
// GET: Protected. Patients view their own; doctors view their issued prescriptions
router.get('/prescriptions', authenticateToken, (req, res, next) => clinicalController.getPrescriptions(req, res, next));
// POST: Strictly protected. Only licensed doctors or admin can write prescriptions
router.post('/prescriptions', authenticateToken, requireRole('doctor', 'admin'), (req, res, next) => clinicalController.createPrescription(req, res, next));

// ── AI Clinical Intake (Walk-in kiosk & registered patients) ──
router.post('/ai/intake/start', authenticateOptionalToken, (req, res, next) => clinicalController.startAiIntake(req, res, next));
router.post('/ai/intake/:sessionId/answer', authenticateOptionalToken, (req, res, next) => clinicalController.answerAiIntake(req, res, next));
router.get('/ai/intake/:sessionId', authenticateOptionalToken, (req, res, next) => clinicalController.getAiIntakeSession(req, res, next));
router.post(
    '/ai/intake/:sessionId/voice-answer',
    authenticateOptionalToken,
    voiceUpload.single('audio'),
    (req, res, next) => clinicalController.answerAiIntakeByVoice(req, res, next)
);

router.post(
    '/ai/voice/transcribe',
    authenticateOptionalToken,
    voiceUpload.single('audio'),
    (req, res, next) => clinicalController.transcribeVoice(req, res, next)
);

// Compatibility aliases for direct microservice routes
router.post('/intake/start', authenticateOptionalToken, (req, res, next) => clinicalController.startAiIntake(req, res, next));
router.post('/intake/:sessionId/answer', authenticateOptionalToken, (req, res, next) => clinicalController.answerAiIntake(req, res, next));
router.post(
    '/intake/:sessionId/voice-answer',
    authenticateOptionalToken,
    voiceUpload.single('audio'),
    (req, res, next) => clinicalController.answerAiIntakeByVoice(req, res, next)
);
router.post(
    '/voice/transcribe',
    authenticateOptionalToken,
    voiceUpload.single('audio'),
    (req, res, next) => clinicalController.transcribeVoice(req, res, next)
);
router.get('/intake/:sessionId', authenticateOptionalToken, (req, res, next) => clinicalController.getAiIntakeSession(req, res, next));

// ── Clinical Reports (AI Synthesized Reports & Doctor Review) ──
// Patients can view only their reports; doctors/hospital staff view clinical reports
router.get('/clinical-reports', authenticateToken, (req, res, next) => clinicalController.getClinicalReports(req, res, next));
router.get('/clinical-reports/:id', authenticateToken, (req, res, next) => clinicalController.getClinicalReportById(req, res, next));
router.post('/clinical-reports', authenticateOptionalToken, (req, res, next) => clinicalController.createClinicalReport(req, res, next));
// Only doctors or admin can modify clinical diagnosis, prescriptions, or doctor notes
router.patch('/clinical-reports/:id', authenticateToken, requireRole('doctor', 'admin'), (req, res, next) => clinicalController.updateClinicalReport(req, res, next));

// ── Comprehensive Medical History Timeline & AI Summary ──
router.get('/patients/:patientId/history', authenticateToken, (req, res, next) => clinicalController.getPatientHistory(req, res, next));
router.get('/patients/:patientId/ai-medical-history-summary', authenticateToken, (req, res, next) => clinicalController.getAiMedicalHistorySummary(req, res, next));
router.get('/history', authenticateToken, (req, res, next) => clinicalController.getPatientHistory(req, res, next));

// ── Kiosk ──
router.post('/kiosk/token', (req, res, next) => clinicalController.createKioskToken(req, res, next));
router.get('/kiosk/queue', (req, res, next) => clinicalController.getKioskQueue(req, res, next));

// ── Hospital Stats (Executive/Staff Only) ──
router.get('/hospital/stats', authenticateToken, requireRole('admin', 'hospital', 'doctor'), (req, res, next) => clinicalController.getHospitalStats(req, res, next));

// ── Medical Document / Scan Upload ──
router.post(
    '/records/upload',
    authenticateOptionalToken,
    upload.single('document'),
    (req, res, next) => clinicalController.uploadAndProcessRecord(req, res, next)
);

module.exports = router;
