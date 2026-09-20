const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getPatients, getPatientById } = require('../controllers/patientController');

router.use(authMiddleware);
router.get('/', getPatients);
router.get('/:id', getPatientById);

module.exports = router;
