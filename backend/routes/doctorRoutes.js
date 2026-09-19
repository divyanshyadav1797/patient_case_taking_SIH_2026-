const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getDoctors, getDoctorById } = require('../controllers/doctorController');

router.use(authMiddleware);
router.get('/', getDoctors);
router.get('/:id', getDoctorById);

module.exports = router;
