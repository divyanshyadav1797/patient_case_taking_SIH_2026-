const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getHospitalData } = require('../controllers/hospitalController');

router.use(authMiddleware);
router.get('/', getHospitalData);

module.exports = router;
