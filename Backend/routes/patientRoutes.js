const express = require('express');
const router = express.Router();
const { getPatients, getPatientById } = require('../controllers/patientController');
router.get('/', getPatients);
router.get('/:id', getPatientById);
module.exports = router;
