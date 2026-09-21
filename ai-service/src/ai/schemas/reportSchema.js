export const reportSchema = {
    type: "object",
    additionalProperties: false,

    properties: {
        chiefComplaint: {
            type: "string"
        },

        summaryForDoctor: {
            type: "string",
            description: "Structured clinical brief (3-5 paragraphs) with demographics, HPI, risk stratification"
        },

        historyOfPresentIllness: {
            type: "string",
            description: "Formal HPI narrative for medical chart"
        },

        reportedSymptoms: {
            type: "array",
            items: { type: "string" }
        },

        pertinentNegatives: {
            type: "array",
            items: { type: "string" },
            description: "Symptoms the patient explicitly denied"
        },

        medicationsMentioned: {
            type: "array",
            items: { type: "string" }
        },

        allergiesMentioned: {
            type: "array",
            items: { type: "string" }
        },

        pastHistoryMentioned: {
            type: "array",
            items: { type: "string" }
        },

        urgentReview: {
            type: "boolean"
        },

        recommendedSpecialty: {
            type: "string",
            description: "Most appropriate medical specialty for this presentation"
        },

        triageLevel: {
            type: "string",
            enum: ["HIGH_ACUITY", "PRIORITY_EVALUATION", "STANDARD_CONSULTATION"],
            description: "Clinical acuity classification"
        },

        diagnosticImpression: {
            type: "string",
            description: "2-3 differential diagnoses as working hypotheses"
        },

        suggestedInvestigations: {
            type: "array",
            items: { type: "string" },
            description: "Recommended diagnostic tests based on clinical picture"
        },

        importantUnknowns: {
            type: "array",
            items: { type: "string" }
        }
    },

    required: [
        "chiefComplaint",
        "summaryForDoctor",
        "historyOfPresentIllness",
        "reportedSymptoms",
        "pertinentNegatives",
        "medicationsMentioned",
        "allergiesMentioned",
        "pastHistoryMentioned",
        "urgentReview",
        "recommendedSpecialty",
        "triageLevel",
        "diagnosticImpression",
        "suggestedInvestigations",
        "importantUnknowns"
    ]
};