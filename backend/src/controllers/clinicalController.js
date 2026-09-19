const clinicalRepository = require('../repositories/clinicalRepository');
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
      const doctors = await clinicalRepository.getDoctors(req.query.dept);
      return formatSuccess(res, doctors, 'Doctors list retrieved successfully');
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
      const queue = await clinicalRepository.getKioskQueue();
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
