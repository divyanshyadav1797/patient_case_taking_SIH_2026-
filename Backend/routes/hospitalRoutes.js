const express = require('express');
const router = express.Router();
const { getHospitalData } = require('../controllers/hospitalController');
router.get('/', getHospitalData);
module.exports = router;
