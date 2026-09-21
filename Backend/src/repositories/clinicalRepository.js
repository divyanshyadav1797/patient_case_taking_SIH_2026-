const Appointment = require('../models/Appointment');
const ClinicalReport = require('../models/ClinicalReport');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const KioskToken = require('../models/KioskToken');
const User = require('../models/User');

const DEFAULT_DOCTORS = [
  {
    name: "Dr. Sarah Jenkins",
    specialty: "Cardiology",
    department: "Cardiology",
    experience: "14 yrs exp",
    rating: "4.9",
    reviews: 142,
    available: "Available Today",
    fee: "₹800",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
    hospital: "SMS Hospital Jaipur",
    email: "dr.sarah@medicare.org",
    phone: "9829012345"
  },
  {
    name: "Dr. Michael Chang",
    specialty: "Neurology",
    department: "Neurology",
    experience: "12 yrs exp",
    rating: "4.8",
    reviews: 98,
    available: "Next slot: Tomorrow",
    fee: "₹1,000",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
    hospital: "Fortis Escorts Hospital",
    email: "dr.chang@fortis.org",
    phone: "9829012346"
  },
  {
    name: "Dr. Priya Patel",
    specialty: "General Physician",
    department: "General Medicine",
    experience: "9 yrs exp",
    rating: "4.9",
    reviews: 210,
    available: "Available Today",
    fee: "₹500",
    image: "https://images.unsplash.com/photo-1594824813581-9b16866b1a20?auto=format&fit=crop&q=80&w=300",
    hospital: "Apex Hospital Mansarovar",
    email: "dr.patel@apex.org",
    phone: "9829012347"
  },
  {
    name: "Dr. Rajesh Gupta",
    specialty: "Orthopedics",
    department: "Orthopedics",
    experience: "16 yrs exp",
    rating: "4.7",
    reviews: 175,
    available: "Available Today",
    fee: "₹900",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300",
    hospital: "Narayana Multispeciality Hospital",
    email: "dr.gupta@narayana.org",
    phone: "9829012348"
  },
  {
    name: "Dr. Ananya Roy",
    specialty: "Pediatrics",
    department: "Pediatrics",
    experience: "8 yrs exp",
    rating: "4.9",
    reviews: 89,
    available: "Next slot: Monday",
    fee: "₹600",
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=300",
    hospital: "EHCC Hospital Jaipur",
    email: "dr.roy@ehcc.org",
    phone: "9829012349"
  },
  {
    name: "Dr. Vikram Malhotra",
    specialty: "Pulmonology",
    department: "Pulmonology",
    experience: "15 yrs exp",
    rating: "4.9",
    reviews: 164,
    available: "Available Today",
    fee: "₹850",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300",
    hospital: "SMS Hospital Jaipur",
    email: "dr.malhotra@sms.org",
    phone: "9829012350"
  },
  {
    name: "Dr. Sunita Meena",
    specialty: "Gastroenterology",
    department: "Gastroenterology",
    experience: "11 yrs exp",
    rating: "4.8",
    reviews: 112,
    available: "Available Today",
    fee: "₹950",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
    hospital: "Apex Hospital Mansarovar",
    email: "dr.meena@apex.org",
    phone: "9829012351"
  },
  {
    name: "Dr. Rohan Verma",
    specialty: "ENT Specialist",
    department: "ENT",
    experience: "10 yrs exp",
    rating: "4.7",
    reviews: 130,
    available: "Tomorrow, 10:00 AM",
    fee: "₹700",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300",
    hospital: "Fortis Escorts Hospital",
    email: "dr.verma@fortis.org",
    phone: "9829012352"
  }
];

class ClinicalRepository {
  async seedDefaults() {
    try {
      for (const doc of DEFAULT_DOCTORS) {
        const exists = await User.findOne({ email: doc.email.toLowerCase() });
        if (!exists) {
          await User.create({
            customId: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
            name: doc.name,
            email: doc.email.toLowerCase(),
            phone: doc.phone,
            passwordHash: '$2a$10$wTfZ7eZfZh5vM3kO6W.gYe8Y8w0d8Z9X2P1h1k0k4l1j4h8e2g3a', // doctor123
            pinHash: '$2a$10$wTfZ7eZfZh5vM3kO6W.gYe8Y8w0d8Z9X2P1h1k0k4l1j4h8e2g3a',
            role: 'doctor',
            status: 'ACTIVE',
            doctorDetails: {
              specialty: doc.specialty,
              department: doc.department,
              hospitalName: doc.hospital,
              experience: doc.experience,
              rating: doc.rating,
              fee: doc.fee,
              available: doc.available,
              image: doc.image
            }
          });
        } else if (!exists.doctorDetails?.hospitalName || exists.doctorDetails?.hospitalName === 'SMS Hospital Jaipur') {
          // Ensure hospital matches diversified hospital name
          exists.doctorDetails = {
            ...exists.doctorDetails,
            hospitalName: doc.hospital,
            specialty: doc.specialty,
            department: doc.department,
            fee: doc.fee,
            available: doc.available,
            experience: doc.experience,
            image: doc.image
          };
          await exists.save();
        }
      }
    } catch (e) {
      console.warn('[ClinicalRepo] seedDefaults warning:', e.message);
    }
  }

  // ── Appointments ──
  async getAppointments(filters = {}) {
    try {
      const query = {};
      if (filters.patientId) {
        query.$or = [{ patientId: filters.patientId }];
        if (/^[0-9a-fA-F]{24}$/.test(filters.patientId)) {
          query.$or.push({ _id: filters.patientId });
        }
      }
      if (filters.doctorId) {
        query.doctorId = filters.doctorId;
      }
      if (filters.doctorName) {
        query.doctorName = new RegExp(filters.doctorName, 'i');
      }
      if (filters.status) {
        const s = filters.status.toLowerCase();
        if (s === 'upcoming') query.status = { $in: ['Upcoming', 'upcoming'] };
        else if (s === 'completed' || s === 'past') query.status = { $in: ['Completed', 'completed', 'past'] };
        else if (s === 'cancelled') query.status = { $in: ['Cancelled', 'cancelled'] };
        else query.status = new RegExp(filters.status, 'i');
      }

      const apts = await Appointment.find(query).sort({ createdAt: -1 }).lean();
      return apts.map(a => ({
        ...a,
        id: a.customId || a.id || a._id.toString()
      }));
    } catch (e) {
      console.error('[ClinicalRepo] getAppointments error:', e.message);
      return [];
    }
  }

  async createAppointment(aptData) {
    const customId = aptData.id || aptData.customId || `APT-${Math.floor(100 + Math.random() * 900)}`;
    const newApt = {
      customId,
      id: customId,
      patientId: aptData.patientId || `WALKIN-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: aptData.patientName || 'Walk-in Patient',
      doctorId: aptData.doctorId,
      doctorName: aptData.doctorName || 'Attending Physician',
      specialty: aptData.specialty || 'General Consultation',
      hospital: aptData.hospital || 'Clinical Facility',
      date: aptData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: aptData.time || '11:00 AM',
      status: aptData.status || 'Upcoming',
      type: aptData.type || 'Hospital Consultation',
      clinicalReportId: aptData.clinicalReportId,
      chiefComplaint: aptData.chiefComplaint,
      notes: aptData.notes
    };

    try {
      const created = await Appointment.create(newApt);
      const obj = created.toObject();
      obj.id = obj.customId || obj._id.toString();
      return obj;
    } catch (e) {
      console.error('[ClinicalRepo] createAppointment error:', e.message);
      throw e;
    }
  }

  async updateAppointment(id, updateData) {
    if (!id) return null;
    try {
      const conditions = [{ customId: id }, { id }];
      if (/^[0-9a-fA-F]{24}$/.test(String(id))) {
        conditions.push({ _id: id });
      }

      const updated = await Appointment.findOneAndUpdate(
        { $or: conditions },
        { $set: updateData },
        { new: true }
      ).lean();

      if (updated) {
        return {
          ...updated,
          id: updated.customId || updated.id || updated._id.toString()
        };
      }
      return null;
    } catch (e) {
      console.error('[ClinicalRepo] updateAppointment error:', e.message);
      return null;
    }
  }

  async deleteAppointment(id) {
    if (!id) return false;
    try {
      const conditions = [{ customId: id }, { id }];
      if (/^[0-9a-fA-F]{24}$/.test(String(id))) {
        conditions.push({ _id: id });
      }

      const res = await Appointment.findOneAndDelete({ $or: conditions });
      return !!res;
    } catch (e) {
      console.error('[ClinicalRepo] deleteAppointment error:', e.message);
      return false;
    }
  }

  async getAppointmentById(id) {
    if (!id) return null;
    try {
      const conditions = [{ customId: id }, { id }];
      if (/^[0-9a-fA-F]{24}$/.test(String(id))) {
        conditions.push({ _id: id });
      }
      return await Appointment.findOne({ $or: conditions }).lean();
    } catch (e) {
      console.error('[ClinicalRepo] getAppointmentById error:', e.message);
      return null;
    }
  }

  // ── Doctors ──
  async getDoctors(filters = {}) {
    try {
      const query = { role: 'doctor' };
      const dept = typeof filters === 'string' ? filters : filters?.dept;
      const hospital = filters?.hospital;
      const hospitalId = filters?.hospitalId;

      if (dept) {
        query['doctorDetails.department'] = new RegExp(dept, 'i');
      }
      if (hospital || hospitalId) {
        const hospConditions = [];
        if (hospital) {
          hospConditions.push({ 'doctorDetails.hospitalName': new RegExp(hospital, 'i') });
        }
        if (hospitalId) {
          hospConditions.push({ 'doctorDetails.hospitalId': hospitalId });
        }
        query.$or = hospConditions;
      }

      const dbDocs = await User.find(query).lean();
      
      return dbDocs.map((d, i) => ({
        id: d.customId || d._id.toString(),
        name: d.name,
        specialty: d.doctorDetails?.specialty || 'General Physician',
        department: d.doctorDetails?.department || 'General Medicine',
        experience: d.doctorDetails?.experience || '10+ yrs exp',
        rating: d.doctorDetails?.rating || '4.9',
        reviews: 120 + i * 15,
        available: d.doctorDetails?.available || 'Available Today',
        fee: d.doctorDetails?.fee || '₹600',
        image: d.doctorDetails?.image || DEFAULT_DOCTORS[i % DEFAULT_DOCTORS.length]?.image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
        hospital: d.doctorDetails?.hospitalName || 'SMS Hospital Jaipur',
        hospitalId: d.doctorDetails?.hospitalId || null,
        email: d.email,
        phone: d.phone,
        nmcId: d.doctorDetails?.nmcId || null
      }));
    } catch (e) {
      console.error('[ClinicalRepo] getDoctors error:', e.message);
      return [];
    }
  }

  async createDoctor(docData) {
    const bcrypt = require('bcryptjs');
    const { name, email, phone, specialty, department, hospital, hospitalName, hospitalId, password, pin, fee, experience } = docData;
    const nmcId = docData.nmcId || docData.nmcNumber;

    if (!name || String(name).trim().length < 2) {
      throw new Error('Doctor name is required (at least 2 characters)');
    }

    const secret = password || pin || 'doctor123';
    const passwordHash = await bcrypt.hash(secret, 10);
    const pinHash = pin ? await bcrypt.hash(pin, 10) : passwordHash;
    const customId = `DOC-${Math.floor(1000 + Math.random() * 9000)}`;

    const conflictConditions = [];
    if (email) conflictConditions.push({ email: email.toLowerCase().trim() });
    if (phone) conflictConditions.push({ phone: phone.trim() });
    if (nmcId) conflictConditions.push({ 'doctorDetails.nmcId': nmcId.trim() });

    if (conflictConditions.length > 0) {
      const conflict = await User.findOne({
        role: 'doctor',
        $or: conflictConditions
      });

      if (conflict) {
        throw new Error('A doctor with this email, phone, or NMC registration already exists.');
      }
    }

    const generatedNmcId = nmcId ? String(nmcId).trim() : `NMC-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newDoc = await User.create({
      customId,
      name: name.trim(),
      email: email ? email.toLowerCase().trim() : null,
      phone: phone ? phone.trim() : null,
      passwordHash,
      pinHash,
      role: 'doctor',
      status: 'ACTIVE',
      doctorDetails: {
        nmcId: generatedNmcId,
        specialty: specialty || 'General Medicine',
        department: department || 'General Medicine',
        hospitalName: hospitalName || hospital || 'SMS Hospital Jaipur',
        hospitalId: hospitalId || null,
        fee: fee || '₹600',
        experience: experience || '5+ yrs exp',
        available: 'Available Today'
      }
    });

    return {
      id: newDoc.customId,
      name: newDoc.name,
      email: newDoc.email,
      phone: newDoc.phone,
      role: 'doctor',
      doctorDetails: newDoc.doctorDetails,
      credentials: {
        identifier: newDoc.email || newDoc.doctorDetails.nmcId || newDoc.customId,
        nmcId: newDoc.doctorDetails.nmcId,
        email: newDoc.email,
        temporaryPassword: secret,
        pin: pin || secret
      }
    };
  }

  async getDoctorById(id) {
    if (!id) return null;
    try {
      const conditions = [{ customId: id }, { 'doctorDetails.nmcId': id }];
      if (/^[0-9a-fA-F]{24}$/.test(String(id))) {
        conditions.push({ _id: id });
      }

      const d = await User.findOne({ role: 'doctor', $or: conditions }).lean();
      if (!d) return null;
      return {
        id: d.customId || d._id.toString(),
        name: d.name,
        specialty: d.doctorDetails?.specialty || 'General Physician',
        department: d.doctorDetails?.department || 'General Medicine',
        available: d.doctorDetails?.available || 'Available Today',
        fee: d.doctorDetails?.fee || '₹600',
        hospital: d.doctorDetails?.hospitalName || 'SMS Hospital Jaipur',
        hospitalId: d.doctorDetails?.hospitalId || null,
        email: d.email,
        phone: d.phone
      };
    } catch (e) {
      console.error('[ClinicalRepo] getDoctorById error:', e.message);
      return null;
    }
  }

  async updateDoctor(id, updates) {
    if (!id) return null;
    try {
      const conditions = [{ customId: id }, { 'doctorDetails.nmcId': id }];
      if (/^[0-9a-fA-F]{24}$/.test(String(id))) {
        conditions.push({ _id: id });
      }

      const updateFields = {};
      if (updates.name) updateFields.name = updates.name.trim();
      if (updates.email) updateFields.email = updates.email.trim().toLowerCase();
      if (updates.phone) updateFields.phone = updates.phone.trim();

      if (updates.available) updateFields['doctorDetails.available'] = updates.available;
      if (updates.fee) updateFields['doctorDetails.fee'] = updates.fee;
      if (updates.specialty) updateFields['doctorDetails.specialty'] = updates.specialty;
      if (updates.department) updateFields['doctorDetails.department'] = updates.department;

      if (updates.password || updates.pin) {
        const bcrypt = require('bcryptjs');
        const secret = updates.password || updates.pin;
        updateFields.passwordHash = await bcrypt.hash(secret, 10);
        if (updates.pin) updateFields.pinHash = await bcrypt.hash(updates.pin, 10);
      }

      const updated = await User.findOneAndUpdate(
        { role: 'doctor', $or: conditions },
        { $set: updateFields },
        { new: true }
      ).lean();

      if (!updated) return null;
      return {
        id: updated.customId || updated._id.toString(),
        name: updated.name,
        specialty: updated.doctorDetails?.specialty || 'General Physician',
        department: updated.doctorDetails?.department || 'General Medicine',
        available: updated.doctorDetails?.available || 'Available Today',
        fee: updated.doctorDetails?.fee || '₹600',
        hospital: updated.doctorDetails?.hospitalName || 'SMS Hospital Jaipur',
        email: updated.email,
        phone: updated.phone
      };
    } catch (e) {
      console.error('[ClinicalRepo] updateDoctor error:', e.message);
      throw e;
    }
  }

  async deleteDoctor(id) {
    if (!id) return false;
    try {
      const conditions = [{ customId: id }, { 'doctorDetails.nmcId': id }];
      if (/^[0-9a-fA-F]{24}$/.test(String(id))) {
        conditions.push({ _id: id });
      }
      const res = await User.findOneAndDelete({ role: 'doctor', $or: conditions });
      return !!res;
    } catch (e) {
      console.error('[ClinicalRepo] deleteDoctor error:', e.message);
      return false;
    }
  }

  // ── Medical Records ──
  async getRecords(patientId) {
    try {
      const query = {};
      if (patientId) {
        query.$or = [{ patientId }];
        if (/^[0-9a-fA-F]{24}$/.test(patientId)) {
          query.$or.push({ _id: patientId });
        }
      }
      const records = await MedicalRecord.find(query).sort({ createdAt: -1 }).lean();
      return records.map(r => ({
        ...r,
        id: r.customId || r.id || r._id.toString()
      }));
    } catch (e) {
      console.error('[ClinicalRepo] getRecords error:', e.message);
      return [];
    }
  }

  async createRecord(recordData) {
    const customId = recordData.id || recordData.customId || `REC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRec = {
      customId,
      id: customId,
      patientId: recordData.patientId || `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
      title: recordData.title || 'Clinical Diagnostic Report',
      doctor: recordData.doctor || 'Attending Physician',
      hospital: recordData.hospital || 'Hospital Clinical Diagnostics',
      date: recordData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: recordData.type || 'Lab Report',
      file: recordData.file || 'report.pdf',
      fileUrl: recordData.fileUrl || (recordData.file ? `/uploads/documents/${recordData.file}` : ''),
      previewUrl: recordData.previewUrl || recordData.fileUrl || '',
      mimeType: recordData.mimeType || 'application/pdf',
      imageData: recordData.imageData || '',
      aiSummary: recordData.aiSummary || '',
      size: recordData.size || '1.2 MB',
      ocrData: recordData.ocrData || {}
    };

    try {
      const created = await MedicalRecord.create(newRec);
      const obj = created.toObject();
      obj.id = obj.customId || obj._id.toString();
      return obj;
    } catch (e) {
      console.error('[ClinicalRepo] createRecord error:', e.message);
      throw e;
    }
  }

  async updateRecord(id, updateData) {
    if (!id) return null;
    try {
      const conditions = [{ customId: id }, { id }];
      if (/^[0-9a-fA-F]{24}$/.test(String(id))) {
        conditions.push({ _id: id });
      }

      const updated = await MedicalRecord.findOneAndUpdate(
        { $or: conditions },
        { $set: updateData },
        { new: true }
      ).lean();

      if (updated) {
        return {
          ...updated,
          id: updated.customId || updated.id || updated._id.toString()
        };
      }
      return null;
    } catch (e) {
      console.error('[ClinicalRepo] updateRecord error:', e.message);
      return null;
    }
  }

  async deleteRecord(id) {
    if (!id) return false;
    try {
      const conditions = [{ customId: id }, { id }];
      if (/^[0-9a-fA-F]{24}$/.test(String(id))) {
        conditions.push({ _id: id });
      }
      const res = await MedicalRecord.findOneAndDelete({ $or: conditions });
      return !!res;
    } catch (e) {
      console.error('[ClinicalRepo] deleteRecord error:', e.message);
      return false;
    }
  }

  // ── Prescriptions ──
  async getPrescriptions(filters = {}) {
    try {
      const query = {};
      if (filters.patientId) {
        query.$or = [{ patientId: filters.patientId }];
        if (/^[0-9a-fA-F]{24}$/.test(filters.patientId)) {
          query.$or.push({ _id: filters.patientId });
        }
      }
      const rxs = await Prescription.find(query).sort({ createdAt: -1 }).lean();
      return rxs.map(r => ({
        ...r,
        id: r.customId || r.id || r._id.toString()
      }));
    } catch (e) {
      console.error('[ClinicalRepo] getPrescriptions error:', e.message);
      return [];
    }
  }

  async createPrescription(rxData) {
    const customId = rxData.id || rxData.customId || `RX-${Math.floor(100 + Math.random() * 900)}`;
    const newRx = {
      customId,
      id: customId,
      patient: rxData.patient || 'Patient',
      patientId: rxData.patientId || `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
      doctorName: rxData.doctorName || 'Attending Physician',
      doctorId: rxData.doctorId,
      date: rxData.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      diagnosis: rxData.diagnosis || 'Clinical Follow-up',
      medicines: rxData.medicines || rxData.medicine || 'Generic medication',
      status: rxData.status || 'Active',
      instructions: rxData.instructions || ''
    };

    try {
      const created = await Prescription.create(newRx);
      const obj = created.toObject();
      obj.id = obj.customId || obj._id.toString();
      return obj;
    } catch (e) {
      console.error('[ClinicalRepo] createPrescription error:', e.message);
      throw e;
    }
  }

  // ── Clinical Reports (AI Intake & Medical History) ──
  async getClinicalReports(patientId) {
    try {
      const query = {};
      if (patientId) {
        query.$or = [{ patientId }];
        if (/^[0-9a-fA-F]{24}$/.test(patientId)) {
          query.$or.push({ _id: patientId });
        }
      }
      const reports = await ClinicalReport.find(query).sort({ createdAt: -1 }).lean();
      return reports.map(r => ({
        ...r,
        id: r.customId || r.id || r._id.toString()
      }));
    } catch (e) {
      console.error('[ClinicalRepo] getClinicalReports error:', e.message);
      return [];
    }
  }

  async getClinicalReportById(id) {
    if (!id) return null;
    try {
      const conditions = [{ customId: id }, { id }];
      if (/^[0-9a-fA-F]{24}$/.test(String(id))) {
        conditions.push({ _id: id });
      }

      const report = await ClinicalReport.findOne({ $or: conditions }).lean();
      if (report) {
        return {
          ...report,
          id: report.customId || report.id || report._id.toString()
        };
      }
      return null;
    } catch (e) {
      console.error('[ClinicalRepo] getClinicalReportById error:', e.message);
      return null;
    }
  }

  async createClinicalReport(reportData) {
    const customId = reportData.id || reportData.customId || `REP-${Math.floor(100 + Math.random() * 900)}`;
    const newReport = {
      customId,
      id: customId,
      patientId: reportData.patientId || `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: reportData.patientName || 'Patient',
      doctorId: reportData.doctorId,
      doctorName: reportData.doctorName || 'Attending Physician',
      hospitalId: reportData.hospitalId,
      hospitalName: reportData.hospitalName || 'Clinical Facility',
      appointmentId: reportData.appointmentId,
      source: reportData.source || 'webapp',
      language: reportData.language || 'en',
      chiefComplaint: reportData.chiefComplaint || 'Consultation intake',
      summaryForDoctor: reportData.summaryForDoctor || reportData.chiefComplaint || 'Patient completed intake.',
      historyOfPresentIllness: reportData.historyOfPresentIllness || '',
      reportedSymptoms: reportData.reportedSymptoms || [],
      medicationsMentioned: reportData.medicationsMentioned || [],
      allergiesMentioned: reportData.allergiesMentioned || [],
      pastHistoryMentioned: reportData.pastHistoryMentioned || [],
      pastMedicalHistorySummary: reportData.pastMedicalHistorySummary || {},
      urgentReview: Boolean(reportData.urgentReview),
      triageLevel: reportData.triageLevel || 'STANDARD_CONSULTATION',
      recommendedSpecialty: reportData.recommendedSpecialty || 'General Physician',
      importantUnknowns: reportData.importantUnknowns || [],
      conversation: reportData.conversation || [],
      doctorNotes: reportData.doctorNotes || '',
      diagnosticImpression: reportData.diagnosticImpression || '',
      suggestedScans: reportData.suggestedScans || [],
      prescribedMedicines: reportData.prescribedMedicines || [],
      ocrExtractedData: reportData.ocrExtractedData || {},
      status: reportData.status || 'COMPLETED'
    };

    try {
      const created = await ClinicalReport.create(newReport);
      const obj = created.toObject();
      obj.id = obj.customId || obj._id.toString();
      return obj;
    } catch (e) {
      console.error('[ClinicalRepo] createClinicalReport error:', e.message);
      throw e;
    }
  }

  async updateClinicalReport(id, updateData) {
    if (!id) return null;
    try {
      const conditions = [{ customId: id }, { id }];
      if (/^[0-9a-fA-F]{24}$/.test(String(id))) {
        conditions.push({ _id: id });
      }

      const updated = await ClinicalReport.findOneAndUpdate(
        { $or: conditions },
        { $set: updateData },
        { new: true }
      ).lean();

      if (updated) {
        return {
          ...updated,
          id: updated.customId || updated.id || updated._id.toString()
        };
      }
      return null;
    } catch (e) {
      console.error('[ClinicalRepo] updateClinicalReport error:', e.message);
      return null;
    }
  }

  // ── Patient Comprehensive Medical History Timeline ──
  async getMedicalHistory(patientId) {
    const [reports, records, prescriptions, appointments] = await Promise.all([
      this.getClinicalReports(patientId),
      this.getRecords(patientId),
      this.getPrescriptions({ patientId }),
      this.getAppointments({ patientId })
    ]);

    const timeline = [];

    reports.forEach(rep => {
      timeline.push({
        id: rep.id || rep.customId,
        type: 'CLINICAL_REPORT',
        date: rep.createdAt ? new Date(rep.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
        timestamp: rep.createdAt ? new Date(rep.createdAt).getTime() : Date.now(),
        title: `AI Clinical Consultation: ${rep.chiefComplaint}`,
        doctor: rep.doctorName || 'Attending Physician',
        hospital: rep.hospitalName || 'SMS Hospital Jaipur',
        summary: rep.summaryForDoctor,
        symptoms: rep.reportedSymptoms,
        urgentReview: rep.urgentReview,
        doctorNotes: rep.doctorNotes,
        diagnosticImpression: rep.diagnosticImpression,
        raw: rep
      });
    });

    records.forEach(rec => {
      timeline.push({
        id: rec.id || rec.customId,
        type: 'DIAGNOSTIC_RECORD',
        date: rec.date,
        timestamp: rec.createdAt ? new Date(rec.createdAt).getTime() : Date.now() - 86400000,
        title: rec.title || 'Diagnostic Document / Report',
        description: `${rec.type || 'Medical Record'} uploaded for ${rec.hospital || 'Hospital'} · ${rec.doctor || 'Lab'} (${rec.size || 'Attached'})`,
        doctor: rec.doctor,
        hospital: rec.hospital,
        file: rec.file,
        fileUrl: rec.fileUrl,
        previewUrl: rec.previewUrl,
        imageData: rec.imageData || '',
        mimeType: rec.mimeType,
        size: rec.size,
        raw: rec
      });
    });

    prescriptions.forEach(rx => {
      timeline.push({
        id: rx.id || rx.customId,
        type: 'PRESCRIPTION',
        date: rx.date,
        timestamp: rx.createdAt ? new Date(rx.createdAt).getTime() : Date.now() - 172800000,
        title: `Prescription: ${rx.diagnosis}`,
        doctor: rx.doctorName,
        medicines: rx.medicines,
        status: rx.status,
        raw: rx
      });
    });

    timeline.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    return {
      patientId,
      totalVisits: reports.length + appointments.filter(a => a.status === 'Completed').length,
      timeline,
      clinicalReports: reports,
      diagnosticRecords: records,
      prescriptions
    };
  }

  // ── Kiosk Queue & Tokens ──
  async createKioskToken(tokenData) {
    try {
      const queueCount = (await KioskToken.countDocuments()) + 1;
      const padNum = String(queueCount).padStart(3, '0');
      const tokenNumber = `TK-${padNum}`;
      const hospitalName = tokenData.hospitalName || tokenData.hospital || 'SMS Hospital Jaipur';
      const hospitalId = tokenData.hospitalId || null;
      const doctorId = tokenData.doctorId || null;

      const newToken = {
        tokenNumber,
        patientName: tokenData.patientName || 'Walk-in Patient',
        aadhaar: tokenData.aadhaar ? `XXXX XXXX ${String(tokenData.aadhaar).replace(/\D/g, '').slice(-4) || '1234'}` : 'XXXX XXXX 1234',
        department: tokenData.department || 'General OPD',
        doctor: tokenData.doctor || 'Duty Doctor',
        doctorId,
        hospitalName,
        hospitalId,
        concern: tokenData.concern || 'General Consultation',
        status: 'WAITING',
        clinicalReportId: tokenData.clinicalReportId,
        sessionId: tokenData.sessionId
      };

      const createdToken = await KioskToken.create(newToken);

      // Auto-create appointment in MongoDB for doctor visibility
      await Appointment.create({
        customId: `APT-K${padNum}`,
        id: `APT-K${padNum}`,
        patientId: tokenData.patientId || (tokenData.aadhaar ? `P-${String(tokenData.aadhaar).replace(/\D/g, '').slice(-5)}` : 'P-KIOSK'),
        patientName: newToken.patientName,
        doctorId,
        doctorName: newToken.doctor,
        specialty: newToken.department,
        hospital: hospitalName,
        hospitalId,
        date: 'Today',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Upcoming',
        type: `Kiosk Check-In (${newToken.tokenNumber})`,
        tokenNumber: newToken.tokenNumber,
        clinicalReportId: tokenData.clinicalReportId,
        chiefComplaint: newToken.concern
      });

      const obj = createdToken.toObject();
      obj.id = obj._id.toString();
      return obj;
    } catch (e) {
      console.error('[ClinicalRepo] createKioskToken error:', e.message);
      throw e;
    }
  }

  async getKioskQueue(filters = {}) {
    try {
      const query = {};
      if (filters?.hospitalId) query.hospitalId = filters.hospitalId;
      if (filters?.hospital || filters?.hospitalName) {
        query.hospitalName = new RegExp(filters.hospital || filters.hospitalName, 'i');
      }
      const tokens = await KioskToken.find(query).sort({ createdAt: -1 }).lean();
      return tokens;
    } catch (e) {
      console.error('[ClinicalRepo] getKioskQueue error:', e.message);
      return [];
    }
  }

  // ── Hospital Overview Stats ──
  async getHospitalStats() {
    try {
      const [patientCount, appointmentCount, upcomingCount, tokenCount] = await Promise.all([
        User.countDocuments({ role: 'patient' }),
        Appointment.countDocuments(),
        Appointment.countDocuments({ status: { $in: ['Upcoming', 'upcoming'] } }),
        KioskToken.countDocuments()
      ]);

      return {
        activePatients: patientCount,
        totalAppointments: appointmentCount,
        upcomingAppointments: upcomingCount,
        kioskTokensToday: tokenCount,
        emergencyCapacity: '85%',
        departments: [
          { name: 'General Medicine', activeDoctors: 4, waiting: tokenCount },
          { name: 'Cardiology', activeDoctors: 2, waiting: 0 },
          { name: 'Orthopedics', activeDoctors: 3, waiting: 0 },
          { name: 'Pediatrics', activeDoctors: 2, waiting: 0 },
          { name: 'Neurology', activeDoctors: 1, waiting: 0 }
        ]
      };
    } catch (e) {
      console.error('[ClinicalRepo] getHospitalStats error:', e.message);
      return {
        activePatients: 0,
        totalAppointments: 0,
        upcomingAppointments: 0,
        kioskTokensToday: 0,
        emergencyCapacity: '85%',
        departments: []
      };
    }
  }
}

module.exports = new ClinicalRepository();
