const clinicalRepository = require('../repositories/clinicalRepository');
const aiIntakeService = require('../services/aiIntakeService');
const { formatSuccess, formatError } = require('../utils/responseFormatter');

class ClinicalController {
  // Appointments
  async getAppointments(req, res, next) {
    try {
      const appointments = await clinicalRepository.getAppointments(req.query);
      return formatSuccess(res, appointments, 'Appointments retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async createAppointment(req, res, next) {
    try {
      const apt = await clinicalRepository.createAppointment(req.body);
      return formatSuccess(res, apt, 'Appointment booked successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateAppointment(req, res, next) {
    try {
      const updated = await clinicalRepository.updateAppointment(req.params.id, req.body);
      if (!updated) return formatError(res, 'Appointment not found', 404);
      return formatSuccess(res, updated, 'Appointment updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteAppointment(req, res, next) {
    try {
      const deleted = await clinicalRepository.deleteAppointment(req.params.id);
      if (!deleted) return formatError(res, 'Appointment not found', 404);
      return formatSuccess(res, { id: req.params.id }, 'Appointment cancelled successfully');
    } catch (err) {
      next(err);
    }
  }

  // Doctors
  async getDoctors(req, res, next) {
    try {
      const doctors = await clinicalRepository.getDoctors({
        dept: req.query.dept,
        hospital: req.query.hospital,
        hospitalId: req.query.hospitalId
      });
      return formatSuccess(res, doctors, 'Doctors list retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async createDoctor(req, res, next) {
    try {
      const hospitalName = req.body.hospitalName || req.user?.name || req.user?.hospitalDetails?.hospitalName;
      const hospitalId = req.body.hospitalId || req.user?.customId || req.user?._id?.toString();
      
      const doctor = await clinicalRepository.createDoctor({
        ...req.body,
        hospitalName,
        hospitalId
      });
      return formatSuccess(res, doctor, 'Doctor registered successfully with credentials', 201);
    } catch (err) {
      next(err);
    }
  }

  // Medical Records
  async getRecords(req, res, next) {
    try {
      const records = await clinicalRepository.getRecords(req.query.patientId);
      return formatSuccess(res, records, 'Medical records retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async createRecord(req, res, next) {
    try {
      const record = await clinicalRepository.createRecord(req.body);
      return formatSuccess(res, record, 'Medical record uploaded successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  // Prescriptions
  async getPrescriptions(req, res, next) {
    try {
      const rxs = await clinicalRepository.getPrescriptions(req.query);
      return formatSuccess(res, rxs, 'Prescriptions retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async createPrescription(req, res, next) {
    try {
      const rx = await clinicalRepository.createPrescription(req.body);
      return formatSuccess(res, rx, 'Prescription issued successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  // AI Clinical Reports
  async getClinicalReports(req, res, next) {
    try {
      const reports = await clinicalRepository.getClinicalReports(req.query.patientId);
      return formatSuccess(res, reports, 'Clinical reports retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async getClinicalReportById(req, res, next) {
    try {
      const report = await clinicalRepository.getClinicalReportById(req.params.id);
      if (!report) return formatError(res, 'Clinical report not found', 404);
      return formatSuccess(res, report, 'Clinical report details');
    } catch (err) {
      next(err);
    }
  }

  async createClinicalReport(req, res, next) {
    try {
      const report = await clinicalRepository.createClinicalReport(req.body);
      return formatSuccess(res, report, 'Clinical report saved to database', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateClinicalReport(req, res, next) {
    try {
      const updated = await clinicalRepository.updateClinicalReport(req.params.id, req.body);
      if (!updated) return formatError(res, 'Clinical report not found', 404);
      return formatSuccess(res, updated, 'Clinical report updated successfully');
    } catch (err) {
      next(err);
    }
  }

  // Comprehensive Medical History Timeline
  async getPatientHistory(req, res, next) {
    try {
      const patientId = req.params.patientId || req.query.patientId || (req.user && (req.user.customId || req.user._id));
      if (!patientId) return formatError(res, 'patientId parameter is required', 400);
      const history = await clinicalRepository.getMedicalHistory(patientId);
      const aiMedicalHistorySummary = await aiIntakeService.generateMedicalHistorySummary(patientId);
      return formatSuccess(res, { ...history, aiMedicalHistorySummary }, 'Patient medical history retrieved');
    } catch (err) {
      next(err);
    }
  }

  // AI Longitudinal Medical History Summary (Synthesizes all previous reports for doctor review)
  async getAiMedicalHistorySummary(req, res, next) {
    try {
      const patientId = req.params.patientId || req.query.patientId || (req.user && (req.user.customId || req.user._id));
      if (!patientId) return formatError(res, 'patientId parameter is required', 400);
      const summary = await aiIntakeService.generateMedicalHistorySummary(patientId, req.query.currentComplaint);
      return formatSuccess(res, summary, 'AI Medical history summary synthesized from previous reports');
    } catch (err) {
      next(err);
    }
  }

  // AI Intake Session Endpoints
  async startAiIntake(req, res, next) {
    try {
      const session = await aiIntakeService.startIntake({
        ...req.body,
        patientId: req.body.patientId || (req.user && (req.user.customId || req.user._id)),
        patientName: req.body.patientName || (req.user && req.user.name)
      });
      return formatSuccess(res, session, 'AI intake session started', 201);
    } catch (err) {
      next(err);
    }
  }

  async answerAiIntake(req, res, next) {
    try {
      const result = await aiIntakeService.answerIntake(req.params.sessionId, req.body);
      return formatSuccess(res, result, result.complete ? 'Clinical report synthesized and saved' : 'Next question generated');
    } catch (err) {
      next(err);
    }
  }

  async getAiIntakeSession(req, res, next) {
    try {
      const session = aiIntakeService.getSession(req.params.sessionId);
      if (!session) return formatError(res, 'Intake session not found', 404);
      return formatSuccess(res, session, 'Intake session data');
    } catch (err) {
      next(err);
    }
  }

  // Kiosk
  async createKioskToken(req, res, next) {
    try {
      const token = await clinicalRepository.createKioskToken(req.body);
      return formatSuccess(res, token, 'Kiosk queue token generated successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async getKioskQueue(req, res, next) {
    try {
      const queue = await clinicalRepository.getKioskQueue(req.query);
      return formatSuccess(res, queue, 'Kiosk queue retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  // Hospital
  async getHospitalStats(req, res, next) {
    try {
      const stats = await clinicalRepository.getHospitalStats();
      return formatSuccess(res, stats, 'Hospital stats retrieved successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ClinicalController();
