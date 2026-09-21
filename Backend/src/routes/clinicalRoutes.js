const express = require('express');
const router = express.Router();
const clinicalController = require('../controllers/clinicalController');
const {
    authenticateToken,
    authenticateOptionalToken
} = require('../middleware/authMiddleware');

const voiceUpload =
    require('../middleware/voiceUpload');

// ── Appointments ──
router.get('/appointments', (req, res, next) => clinicalController.getAppointments(req, res, next));
router.post('/appointments', (req, res, next) => clinicalController.createAppointment(req, res, next));
router.patch('/appointments/:id', (req, res, next) => clinicalController.updateAppointment(req, res, next));
router.delete('/appointments/:id', (req, res, next) => clinicalController.deleteAppointment(req, res, next));

// ── Doctors ──
router.get('/doctors', (req, res, next) => clinicalController.getDoctors(req, res, next));
router.post('/doctors', (req, res, next) => clinicalController.createDoctor(req, res, next));
router.post('/hospital/doctors', (req, res, next) => clinicalController.createDoctor(req, res, next));

// ── Medical Records ──
router.get('/records', (req, res, next) => clinicalController.getRecords(req, res, next));
router.post('/records', (req, res, next) => clinicalController.createRecord(req, res, next));

// ── Prescriptions ──
router.get('/prescriptions', (req, res, next) => clinicalController.getPrescriptions(req, res, next));
router.post('/prescriptions', (req, res, next) => clinicalController.createPrescription(req, res, next));

// ── AI Clinical Intake ──
router.post('/ai/intake/start', (req, res, next) => clinicalController.startAiIntake(req, res, next));
router.post('/ai/intake/:sessionId/answer', (req, res, next) => clinicalController.answerAiIntake(req, res, next));
router.get('/ai/intake/:sessionId', (req, res, next) => clinicalController.getAiIntakeSession(req, res, next));
router.post(
    '/ai/intake/:sessionId/voice-answer',
    authenticateToken,
    voiceUpload.single('audio'),
    (req, res, next) =>
        clinicalController.answerAiIntakeByVoice(
            req,
            res,
            next
        )
);

// Compatibility alias for direct microservice route
router.post('/intake/start', (req, res, next) => clinicalController.startAiIntake(req, res, next));
router.post('/intake/:sessionId/answer', (req, res, next) => clinicalController.answerAiIntake(req, res, next));
router.get('/intake/:sessionId', (req, res, next) => clinicalController.getAiIntakeSession(req, res, next));


// ── Clinical Reports (AI Synthesized Reports & Doctor Review) ──
router.get('/clinical-reports', (req, res, next) => clinicalController.getClinicalReports(req, res, next));
router.get('/clinical-reports/:id', (req, res, next) => clinicalController.getClinicalReportById(req, res, next));
router.post('/clinical-reports', (req, res, next) => clinicalController.createClinicalReport(req, res, next));
router.patch('/clinical-reports/:id', (req, res, next) => clinicalController.updateClinicalReport(req, res, next));

// ── Comprehensive Medical History Timeline & AI Summary ──
router.get('/patients/:patientId/history', (req, res, next) => clinicalController.getPatientHistory(req, res, next));
router.get('/patients/:patientId/ai-medical-history-summary', (req, res, next) => clinicalController.getAiMedicalHistorySummary(req, res, next));
router.get('/history', (req, res, next) => clinicalController.getPatientHistory(req, res, next));

// ── Kiosk ──
router.post('/kiosk/token', (req, res, next) => clinicalController.createKioskToken(req, res, next));
router.get('/kiosk/queue', (req, res, next) => clinicalController.getKioskQueue(req, res, next));

// ── Hospital Stats ──
router.get('/hospital/stats', (req, res, next) => clinicalController.getHospitalStats(req, res, next));

const upload =
    require('../middleware/ocrUpload');

router.post(
    '/records/upload',

    authenticateOptionalToken,

    upload.single('document'),

    (req, res, next) =>
        clinicalController.uploadAndProcessRecord(
            req,
            res,
            next
        )
);



module.exports = router;
