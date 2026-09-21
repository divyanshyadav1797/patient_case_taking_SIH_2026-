const mongoose = require('mongoose');

const ConversationItemSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String }],
  answer: { type: String, required: true },
  answerMethod: { type: String, default: 'text' },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const OcrDataSchema = new mongoose.Schema({
  rawText: { type: String, default: '' },
  documentType: { type: String, default: 'General' },
  detectedFields: { type: mongoose.Schema.Types.Mixed, default: {} },
  scannedAt: { type: Date, default: Date.now }
}, { _id: false });

const ClinicalReportSchema = new mongoose.Schema({
  customId: { type: String, unique: true, sparse: true, index: true },
  patientId: { type: String, required: true, index: true },
  patientName: { type: String, required: true },
  doctorId: { type: String, index: true },
  doctorName: { type: String },
  hospitalId: { type: String },
  hospitalName: { type: String, default: 'SMS Hospital Jaipur' },
  appointmentId: { type: String, index: true },
  source: { type: String, enum: ['webapp', 'kiosk'], default: 'webapp' },
  language: { type: String, default: 'en' },
  
  // AI Clinical Synthesis
  chiefComplaint: { type: String, required: true },
  summaryForDoctor: { type: String, required: true },
  historyOfPresentIllness: { type: String, default: '' },
  reportedSymptoms: [{ type: String }],
  medicationsMentioned: [{ type: String }],
  allergiesMentioned: [{ type: String }],
  pastHistoryMentioned: [{ type: String }],
  urgentReview: { type: Boolean, default: false, index: true },
  triageLevel: { type: String, default: 'STANDARD_CONSULTATION' },
  recommendedSpecialty: { type: String, default: 'General Physician' },
  importantUnknowns: [{ type: String }],
  
  // Longitudinal AI Medical History Summary (Synthesized from previous reports)
  pastMedicalHistorySummary: {
    executiveSummary: { type: String, default: '' },
    previousReportsCount: { type: Number, default: 0 },
    keyPastDiagnoses: [{ type: String }],
    chronicConditions: [{ type: String }],
    allergiesAndRisks: [{ type: String }],
    recentPrescriptions: [{ type: String }],
    previousReportsTimeline: [{
      date: { type: String },
      reportId: { type: String },
      chiefComplaint: { type: String },
      summary: { type: String },
      diagnosticImpression: { type: String }
    }]
  },
  
  // Intake interaction history
  conversation: [ConversationItemSchema],
  
  // Doctor review and consultation notes
  doctorNotes: { type: String, default: '' },
  diagnosticImpression: { type: String, default: '' },
  suggestedScans: [{ type: String }],
  prescribedMedicines: [{ type: String }],
  
  // OCR Data placeholder (ready for future OCR integration)
  ocrExtractedData: { type: OcrDataSchema, default: () => ({}) },
  
  status: {
    type: String,
    enum: ['ACTIVE_INTAKE', 'COMPLETED', 'REVIEWED_BY_DOCTOR'],
    default: 'COMPLETED',
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.ClinicalReport || mongoose.model('ClinicalReport', ClinicalReportSchema);
