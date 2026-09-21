require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

// Models
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const ClinicalReport = require('../models/ClinicalReport');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const KioskToken = require('../models/KioskToken');
const OtpSession = require('../models/OtpSession');
const BlacklistedToken = require('../models/BlacklistedToken');

async function cleanDatabase() {
  console.log('====================================================');
  console.log(' Quantum Care Database Reset & Clean Slate Utility ');
  console.log('====================================================');

  try {
    await connectDB();
    console.log('[Clean] Connected to MongoDB.');

    const models = [
      { name: 'Users', model: User },
      { name: 'Appointments', model: Appointment },
      { name: 'ClinicalReports', model: ClinicalReport },
      { name: 'MedicalRecords', model: MedicalRecord },
      { name: 'Prescriptions', model: Prescription },
      { name: 'KioskTokens', model: KioskToken },
      { name: 'OtpSessions', model: OtpSession },
      { name: 'BlacklistedTokens', model: BlacklistedToken }
    ];

    console.log('[Clean] Purging documents from all collections...');

    for (const { name, model } of models) {
      const deleteResult = await model.deleteMany({});
      console.log(` - Cleared ${name}: ${deleteResult.deletedCount} documents removed.`);
    }

    console.log('====================================================');
    console.log(' Database is now 100% CLEAN and ready for fresh testing.');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('[Clean] Error cleaning database:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  cleanDatabase();
}

module.exports = { cleanDatabase };
