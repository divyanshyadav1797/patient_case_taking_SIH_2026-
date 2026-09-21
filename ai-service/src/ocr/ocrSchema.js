export const ocrResponseSchema = {
    type: "object",
    additionalProperties: false,

    properties: {
        documentType: {
            type: "string",
            enum: [
                "prescription",
                "lab_report",
                "discharge_summary",
                "radiology_report",
                "medical_certificate",
                "vaccination_record",
                "operative_report",
                "clinical_notes",
                "referral_letter",
                "insurance_form",
                "other",
                "unknown"
            ]
        },

        rawText: {
            type: "string",
            description: "Complete readable text extracted from the document, preserving structure"
        },

        summary: {
            type: "string",
            description: "Detailed clinical analysis of the document contents including significance, abnormalities, correlations, and physician-relevant insights"
        },

        clinicalSignificance: {
            type: "string",
            description: "Plain medical language explanation of what these findings mean for the patient"
        },

        redFlags: {
            type: "array",
            items: { type: "string" },
            description: "Critically abnormal values or findings requiring urgent physician attention"
        },

        followUpRecommendations: {
            type: "array",
            items: { type: "string" },
            description: "Clinical follow-up actions suggested by the document findings"
        },

        extracted: {
            type: "object",
            additionalProperties: false,

            properties: {
                documentDate: { type: "string", nullable: true },
                facilityName: { type: "string", nullable: true },
                patientName: { type: "string", nullable: true },
                patientAge: { type: "string", nullable: true },
                patientGender: { type: "string", nullable: true },
                patientId: { type: "string", nullable: true },

                doctorName: { type: "string", nullable: true },
                doctorSpecialization: { type: "string", nullable: true },
                doctorLicense: { type: "string", nullable: true },

                diagnoses: {
                    type: "array",
                    items: { type: "string" }
                },

                medications: {
                    type: "array",
                    items: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                            name: { type: "string" },
                            strength: { type: "string", nullable: true },
                            form: { type: "string", nullable: true },
                            dosage: { type: "string", nullable: true },
                            route: { type: "string", nullable: true },
                            frequency: { type: "string", nullable: true },
                            duration: { type: "string", nullable: true },
                            specialInstructions: { type: "string", nullable: true }
                        },
                        required: ["name"]
                    }
                },

                investigations: {
                    type: "array",
                    items: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                            name: { type: "string" },
                            value: { type: "string", nullable: true },
                            unit: { type: "string", nullable: true },
                            referenceRange: { type: "string", nullable: true },
                            abnormalAsReported: { type: "boolean", nullable: true },
                            clinicalNote: { type: "string", nullable: true }
                        },
                        required: ["name"]
                    }
                },

                vitals: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        bloodPressure: { type: "string", nullable: true },
                        pulse: { type: "string", nullable: true },
                        temperature: { type: "string", nullable: true },
                        spO2: { type: "string", nullable: true },
                        respiratoryRate: { type: "string", nullable: true },
                        weight: { type: "string", nullable: true },
                        height: { type: "string", nullable: true }
                    }
                },

                clinicalNotes: { type: "string", nullable: true },
                examinationFindings: { type: "string", nullable: true },
                procedureNotes: { type: "string", nullable: true },
                allergies: {
                    type: "array",
                    items: { type: "string" }
                },
                followUpDate: { type: "string", nullable: true },
                referrals: {
                    type: "array",
                    items: { type: "string" }
                }
            },

            required: [
                "documentDate",
                "patientName",
                "doctorName",
                "diagnoses",
                "medications",
                "investigations"
            ]
        },

        warnings: {
            type: "array",
            items: { type: "string" }
        }
    },

    required: [
        "documentType",
        "rawText",
        "summary",
        "clinicalSignificance",
        "redFlags",
        "followUpRecommendations",
        "extracted",
        "warnings"
    ]
};