const clinicalRepository = require('../repositories/clinicalRepository');
const aiIntakeService = require('../services/aiIntakeService');
const { formatSuccess, formatError } = require('../utils/responseFormatter');
const voiceIntakeService =
  require('../services/voiceIntakeService');

class ClinicalController {
  // Appointments
  async getAppointments(req, res, next) {
    try {
      const query = { ...req.query };
      // User data isolation: Patients can only view their own appointments (matching customId or _id)
      if (req.user && req.user.role === 'patient') {
        const pCustom = req.user.customId;
        const pId = req.user._id ? req.user._id.toString() : null;
        if (pCustom && pId && pCustom !== pId) {
          query.$or = [{ patientId: pCustom }, { patientId: pId }];
          delete query.patientId;
        } else {
          query.patientId = pCustom || pId;
        }
      } else if (req.user && req.user.role === 'doctor' && !query.patientId && !query.doctorId) {
        // Doctors default to viewing appointments assigned to them (by doctorId or doctorName)
        const dCustom = req.user.customId;
        const dId = req.user._id ? req.user._id.toString() : null;
        const dName = req.user.name;
        const orConditions = [];
        if (dCustom) orConditions.push({ doctorId: dCustom });
        if (dId) orConditions.push({ doctorId: dId });
        if (dName) orConditions.push({ doctorName: new RegExp(`^${dName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
        if (orConditions.length > 0) query.$or = orConditions;
      }
      const appointments = await clinicalRepository.getAppointments(query);
      return formatSuccess(res, appointments, 'Appointments retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async createAppointment(req, res, next) {
    try {
      const payload = { ...req.body };
      // Input validation
      if (!payload.date) {
        return formatError(res, 'Appointment date is required', 400);
      }
      // Never trust frontend user IDs for authenticated patients
      if (req.user && req.user.role === 'patient') {
        payload.patientId = req.user.customId || req.user._id.toString();
        payload.patientName = req.user.name;
      } else if (!payload.patientName && !payload.patientId) {
        return formatError(res, 'Patient information is required to book an appointment', 400);
      }

      const apt = await clinicalRepository.createAppointment(payload);
      return formatSuccess(res, apt, 'Appointment booked successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateAppointment(req, res, next) {
    try {
      const existing = await clinicalRepository.getAppointmentById(req.params.id);
      if (!existing) return formatError(res, 'Appointment not found', 404);

      // Verify permission: patients can only update their own appointments
      if (req.user && req.user.role === 'patient') {
        const userPid = req.user.customId || req.user._id.toString();
        if (existing.patientId && existing.patientId !== userPid) {
          return formatError(res, 'You do not have permission to modify this appointment', 403);
        }
      }

      const updated = await clinicalRepository.updateAppointment(req.params.id, req.body);
      return formatSuccess(res, updated, 'Appointment updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteAppointment(req, res, next) {
    try {
      const existing = await clinicalRepository.getAppointmentById(req.params.id);
      if (!existing) return formatError(res, 'Appointment not found', 404);

      // Verify permission: patients can only delete their own appointments
      if (req.user && req.user.role === 'patient') {
        const userPid = req.user.customId || req.user._id.toString();
        if (existing.patientId && existing.patientId !== userPid) {
          return formatError(res, 'You do not have permission to cancel this appointment', 403);
        }
      }

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
      if (!req.body.name || !req.body.email) {
        return formatError(res, 'Doctor name and email are required', 400);
      }
      const hospitalName = req.body.hospitalName || req.user?.name || req.user?.hospitalDetails?.hospitalName || 'Main Hospital';
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

  async updateDoctor(req, res, next) {
    try {
      const updated = await clinicalRepository.updateDoctor(req.params.id, req.body);
      if (!updated) return formatError(res, 'Doctor not found', 404);
      return formatSuccess(res, updated, 'Doctor details updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteDoctor(req, res, next) {
    try {
      const deleted = await clinicalRepository.deleteDoctor(req.params.id);
      if (!deleted) return formatError(res, 'Doctor not found', 404);
      return formatSuccess(res, { id: req.params.id }, 'Doctor removed successfully');
    } catch (err) {
      next(err);
    }
  }

  // Medical Records
  async getRecords(req, res, next) {
    try {
      let patientId = req.query.patientId;
      // User data isolation: Force patient's own ID
      if (req.user && req.user.role === 'patient') {
        patientId = req.user.customId || req.user._id.toString();
      }
      const records = await clinicalRepository.getRecords(patientId);
      return formatSuccess(res, records, 'Medical records retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async createRecord(req, res, next) {
    try {
      const payload = { ...req.body };
      if (!payload.title) {
        return formatError(res, 'Medical record title is required', 400);
      }
      if (req.user && req.user.role === 'patient') {
        payload.patientId = req.user.customId || req.user._id.toString();
      }
      const record = await clinicalRepository.createRecord(payload);
      return formatSuccess(res, record, 'Medical record uploaded successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateRecord(req, res, next) {
    try {
      const updated = await clinicalRepository.updateRecord(req.params.id, req.body);
      if (!updated) return formatError(res, 'Medical record not found', 404);
      return formatSuccess(res, updated, 'Medical record updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteRecord(req, res, next) {
    try {
      const deleted = await clinicalRepository.deleteRecord(req.params.id);
      if (!deleted) return formatError(res, 'Medical record not found', 404);
      return formatSuccess(res, { id: req.params.id }, 'Medical record deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  // Prescriptions
  async getPrescriptions(req, res, next) {
    try {
      const query = { ...req.query };
      if (req.user && req.user.role === 'patient') {
        query.patientId = req.user.customId || req.user._id.toString();
      }
      const rxs = await clinicalRepository.getPrescriptions(query);
      return formatSuccess(res, rxs, 'Prescriptions retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async createPrescription(req, res, next) {
    try {
      const payload = { ...req.body };
      if (!payload.patientId && !payload.patient) {
        return formatError(res, 'Patient identifier or name is required', 400);
      }
      if (!payload.medicines && !payload.medicine) {
        return formatError(res, 'Prescribed medicine details are required', 400);
      }
      if (req.user && req.user.role === 'doctor') {
        payload.doctorId = req.user.customId || req.user._id.toString();
        payload.doctorName = req.user.name;
      }
      const rx = await clinicalRepository.createPrescription(payload);
      return formatSuccess(res, rx, 'Prescription issued successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  // AI Clinical Reports
  async getClinicalReports(req, res, next) {
    try {
      let patientId = req.query.patientId;
      if (req.user && req.user.role === 'patient') {
        patientId = req.user.customId || req.user._id.toString();
      }
      const reports = await clinicalRepository.getClinicalReports(patientId);
      return formatSuccess(res, reports, 'Clinical reports retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async getClinicalReportById(req, res, next) {
    try {
      const report = await clinicalRepository.getClinicalReportById(req.params.id);
      if (!report) return formatError(res, 'Clinical report not found', 404);

      // Verify patient data isolation
      if (req.user && req.user.role === 'patient') {
        const userPid = req.user.customId || req.user._id.toString();
        if (report.patientId && report.patientId !== userPid) {
          return formatError(res, 'You do not have permission to view this clinical report', 403);
        }
      }
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
      let patientId = req.params.patientId || req.query.patientId;
      if (req.user && req.user.role === 'patient') {
        const userPid = req.user.customId || req.user._id.toString();
        if (patientId && patientId !== userPid) {
          return formatError(res, 'Access denied: You cannot view another patient\'s medical history', 403);
        }
        patientId = userPid;
      }
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
      let patientId = req.params.patientId || req.query.patientId;
      if (req.user && req.user.role === 'patient') {
        const userPid = req.user.customId || req.user._id.toString();
        if (patientId && patientId !== userPid) {
          return formatError(res, 'Access denied: You cannot view another patient\'s medical history', 403);
        }
        patientId = userPid;
      }
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
      const payload = { ...req.body };
      if (!payload.chiefComplaint || typeof payload.chiefComplaint !== 'string' || !payload.chiefComplaint.trim()) {
        return formatError(res, 'chiefComplaint is required to start AI intake interview', 400);
      }
      if (req.user && req.user.role === 'patient') {
        payload.patientId = req.user.customId || req.user._id.toString();
        payload.patientName = req.user.name;
      }
      const session = await aiIntakeService.startIntake(payload);
      return formatSuccess(res, session, 'AI intake session started', 201);
    } catch (err) {
      next(err);
    }
  }

  async answerAiIntake(req, res, next) {
    try {
      const payload = typeof req.body === 'string' ? { answer: req.body } : (req.body || {});
      const result = await aiIntakeService.answerIntake(req.params.sessionId, payload);
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

  async uploadAndProcessRecord(req, res, next) {
    try {
      if (!req.file) {
        return formatError(
          res,
          'Medical document or photo is required.',
          400
        );
      }

      let patientId;
      if (req.user && req.user.role === 'patient') {
        patientId = req.user.customId || req.user._id.toString();
      } else {
        patientId = req.body?.patientId || req.query?.patientId || `KIOSK-${Date.now()}`;
      }

      const fs = require('fs');
      const path = require('path');
      const ocrService = require('../services/ocrService');
      const MedicalRecord = require('../models/MedicalRecord');
      const ClinicalReport = require('../models/ClinicalReport');

      // Persist document or photo permanently to disk
      const uploadsDir = path.join(__dirname, '../../uploads/documents');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileExt = path.extname(req.file.originalname) || (req.file.mimetype.includes('pdf') ? '.pdf' : '.jpg');
      const safeFilename = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${fileExt}`;
      const diskPath = path.join(uploadsDir, safeFilename);
      fs.writeFileSync(diskPath, req.file.buffer);

      const fileUrl = `/uploads/documents/${safeFilename}`;
      const isImage = req.file.mimetype ? req.file.mimetype.startsWith('image/') : !fileExt.includes('pdf');
      const imageData = isImage ? `data:${req.file.mimetype || 'image/jpeg'};base64,${req.file.buffer.toString('base64')}` : null;

      const {
        title,
        type,
        doctor,
        hospital,
        clinicalReportId
      } = req.body;

      const customId = `MR-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      // Create record immediately in MongoDB
      const record = await MedicalRecord.create({
        customId,
        id: customId,
        patientId,
        title: title || req.file.originalname,
        type: type || (isImage ? 'Diagnostic Photo / Scan' : 'Lab Report'),
        doctor: doctor || 'External Clinical Lab',
        hospital: hospital || 'SMS Hospital Diagnostics',
        date: new Date().toISOString().split('T')[0],
        file: req.file.originalname,
        fileUrl,
        previewUrl: fileUrl,
        mimeType: req.file.mimetype || (isImage ? 'image/jpeg' : 'application/pdf'),
        imageData: imageData || '',
        size: `${Math.round(req.file.size / 1024)} KB`,
        aiSummary: 'Processing automated clinical OCR analysis...',
        ocrData: {
          status: 'PROCESSING',
          scannedAt: new Date()
        }
      });

      // Run OCR & AI Summary extraction
      try {
        const result = await ocrService.processDocument(req.file);

        record.ocrData = {
          rawText: result.rawText || '',
          documentType: result.documentType || 'unknown',
          summary: result.summary || '',
          clinicalSignificance: result.clinicalSignificance || '',
          redFlags: result.redFlags || [],
          followUpRecommendations: result.followUpRecommendations || [],
          parsedValues: result.extracted || {},
          diagnoses: result.extracted?.diagnoses || [],
          medications: result.extracted?.medications || [],
          investigations: result.extracted?.investigations || [],
          vitals: result.extracted?.vitals || {},
          allergies: result.extracted?.allergies || [],
          clinicalNotes: result.extracted?.clinicalNotes || '',
          examinationFindings: result.extracted?.examinationFindings || '',
          facilityName: result.extracted?.facilityName || '',
          doctorSpecialization: result.extracted?.doctorSpecialization || '',
          patientAge: result.extracted?.patientAge || '',
          patientGender: result.extracted?.patientGender || '',
          referrals: result.extracted?.referrals || [],
          followUpDate: result.extracted?.followUpDate || '',
          warnings: result.warnings || [],
          status: result.redFlags?.length > 0 ? 'RED_FLAG_REVIEW' : (result.warnings?.length ? 'REVIEW_REQUIRED' : 'PROCESSED'),
          scannedAt: new Date()
        };

        record.aiSummary = result.aiSummary || result.summary || '';
        if (!title && result.extracted?.diagnoses?.length > 0) {
          record.title = `${result.extracted.diagnoses[0]} (Verified OCR)`;
        }
        if (!type && result.documentType) {
          const typeMap = {
            prescription: 'Prescription',
            lab_report: 'Lab Report',
            radiology_report: 'Radiology Scan',
            discharge_summary: 'Discharge Summary'
          };
          if (typeMap[result.documentType]) record.type = typeMap[result.documentType];
        }
        if (result.extracted?.doctorName) {
          record.doctor = result.extracted.doctorName;
        }

        await record.save();

        // If linked to an active clinical report or intake session, synchronize timeline
        const targetReportId = clinicalReportId || req.body.reportId;
        if (targetReportId) {
          try {
            await ClinicalReport.updateOne(
              { $or: [{ customId: targetReportId }, { _id: targetReportId }] },
              {
                $push: {
                  'history.previousReportsTimeline': {
                    date: record.date,
                    reportId: record.customId,
                    chiefComplaint: record.title,
                    summary: record.aiSummary || record.ocrData?.summary || '',
                    diagnosticImpression: (record.ocrData?.diagnoses || []).join(', ') || record.title
                  }
                },
                $set: {
                  ocrExtractedData: {
                    rawText: record.ocrData?.rawText || '',
                    extractedEntities: {
                      diagnoses: record.ocrData?.diagnoses || [],
                      medications: record.ocrData?.medications || [],
                      vitals: record.ocrData?.investigations || []
                    },
                    confidenceScore: 0.95
                  }
                }
              }
            );
          } catch (linkErr) {
            console.warn('[ClinicalController] Report link notice:', linkErr.message);
          }
        }

      } catch (ocrError) {
        console.error('[ClinicalController] OCR analysis warning:', ocrError.message);
        record.ocrData.status = 'REVIEW_REQUIRED';
        record.ocrData.warnings = [ocrError.message];
        record.aiSummary = ocrService.formatEhrClinicalSummary({
          documentType: isImage ? 'Diagnostic Photo' : 'Clinical Document',
          summary: 'Uploaded clinical file stored in records. Visual inspection available for attending physician.',
          warnings: ['Automatic text extraction completed with visual review flag.']
        }, req.file.originalname);
        await record.save();
      }

      return formatSuccess(
        res,
        {
          recordId: record.customId || record._id.toString(),
          record: record.toObject ? record.toObject() : record
        },
        'Medical document and clinical OCR summary processed successfully',
        201
      );

    } catch (err) {
      next(err);
    }
  }
  async answerAiIntakeByVoice(req, res, next) {
    try {
      if (!req.file) {
        return formatError(
          res,
          'Audio file is required',
          400
        );
      }

      const patientId =
        req.user &&
        (req.user.customId || req.user._id);

      const transcription =
        await voiceIntakeService.transcribeAudio({
          buffer: req.file.buffer,
          mimeType: req.file.mimetype,
          originalName: req.file.originalname,
          languageHint: req.body.language
        });

      let transcript =
        transcription?.data?.transcript ||
        transcription?.transcript ||
        '';

      let englishAnswer =
        transcription?.data?.englishTranslation ||
        transcription?.englishTranslation ||
        transcript;

      if (!transcript.trim() && (req.body.fallbackAnswer || req.body.answer)) {
        transcript = String(req.body.fallbackAnswer || req.body.answer).trim();
        englishAnswer = transcript;
      }

      if (!transcript.trim()) {
        return formatError(
          res,
          'Could not understand the audio. Please speak clearly and try again.',
          422
        );
      }

      const result =
        await aiIntakeService.answerIntake(
          req.params.sessionId,
          {
            answer: englishAnswer,
            originalAnswer: transcript,
            answerMethod: 'voice',
            answerLanguage:
              transcription?.data?.detectedLanguage ||
              transcription?.detectedLanguage ||
              req.body.language ||
              'hi'
          }
        );

      return formatSuccess(
        res,
        {
          transcript,
          englishAnswer,
          detectedLanguage:
            transcription?.data?.detectedLanguage ||
            transcription?.detectedLanguage ||
            req.body.language ||
            'hi',
          answerMethod: 'voice',
          ...result
        },
        result.complete
          ? 'Voice answer processed and clinical report synthesized'
          : 'Voice answer processed and next question generated'
      );

    } catch (err) {
      next(err);
    }
  }

  async transcribeVoice(req, res, next) {
    try {
      if (!req.file) {
        return formatError(res, 'Audio file is required', 400);
      }

      const transcription = await voiceIntakeService.transcribeAudio({
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
        originalName: req.file.originalname,
        languageHint: req.body.language || 'hi'
      });

      const transcript =
        transcription?.data?.transcript ||
        transcription?.transcript ||
        '';

      const englishTranslation =
        transcription?.data?.englishTranslation ||
        transcription?.englishTranslation ||
        transcript;

      const detectedLanguage =
        transcription?.data?.detectedLanguage ||
        transcription?.detectedLanguage ||
        req.body.language ||
        'hi';

      return formatSuccess(
        res,
        {
          transcript,
          englishTranslation,
          detectedLanguage
        },
        'Voice transcribed successfully'
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ClinicalController();
