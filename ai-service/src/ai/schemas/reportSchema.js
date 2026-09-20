export const reportSchema = {
    type: "object",
    additionalProperties: false,

    properties: {
        chiefComplaint: {
            type: "string"
        },

        summaryForDoctor: {
            type: "string"
        },

        historyOfPresentIllness: {
            type: "string"
        },

        reportedSymptoms: {
            type: "array",
            items: {
                type: "string"
            }
        },

        medicationsMentioned: {
            type: "array",
            items: {
                type: "string"
            }
        },

        allergiesMentioned: {
            type: "array",
            items: {
                type: "string"
            }
        },

        pastHistoryMentioned: {
            type: "array",
            items: {
                type: "string"
            }
        },

        urgentReview: {
            type: "boolean"
        },

        importantUnknowns: {
            type: "array",
            items: {
                type: "string"
            }
        }
    },

    required: [
        "chiefComplaint",
        "summaryForDoctor",
        "historyOfPresentIllness",
        "reportedSymptoms",
        "medicationsMentioned",
        "allergiesMentioned",
        "pastHistoryMentioned",
        "urgentReview",
        "importantUnknowns"
    ]
};