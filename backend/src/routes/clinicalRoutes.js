const express = require('express');
const router = express.Router();
const clinicalController = require('../controllers/clinicalController');

// ── Appointments ──
router.get('/appointments', (req, res, next) => clinicalController.getAppointments(req, res, next));
router.post('/appointments', (req, res, next) => clinicalController.createAppointment(req, res, next));
router.patch('/appointments/:id', (req, res, next) => clinicalController.updateAppointment(req, res, next));
router.delete('/appointments/:id', (req, res, next) => clinicalController.deleteAppointment(req, res, next));

// ── Doctors ──
router.get('/doctors', (req, res, next) => clinicalController.getDoctors(req, res, next));

// ── Medical Records ──
router.get('/records', (req, res, next) => clinicalController.getRecords(req, res, next));
router.post('/records', (req, res, next) => clinicalController.createRecord(req, res, next));

// ── Prescriptions ──
router.get('/prescriptions', (req, res, next) => clinicalController.getPrescriptions(req, res, next));
router.post('/prescriptions', (req, res, next) => clinicalController.createPrescription(req, res, next));

// ── Kiosk ──
router.post('/kiosk/token', (req, res, next) => clinicalController.createKioskToken(req, res, next));
router.get('/kiosk/queue', (req, res, next) => clinicalController.getKioskQueue(req, res, next));

// ── Hospital Stats ──
router.get('/hospital/stats', (req, res, next) => clinicalController.getHospitalStats(req, res, next));

module.exports = router;
