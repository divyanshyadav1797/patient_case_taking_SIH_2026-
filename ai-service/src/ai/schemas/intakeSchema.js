export const intakeResponseSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
        question: {
            type: "string",
            description: "The next dynamically generated clinical question based on conversation context"
        },

        options: {
            type: "array",
            items: {
                type: "string"
            },
            description: "3-5 medically relevant answer options dynamically generated for this specific question, plus Other"
        },

        questionRationale: {
            type: "string",
            description: "Brief internal note explaining WHY this question is being asked based on the patient's previous answers"
        },

        urgentFlag: {
            type: "boolean",
            description: "Set to true if the patient's answers so far suggest a potentially urgent condition"
        },

        allowCustomText: {
            type: "boolean"
        },

        allowVoice: {
            type: "boolean"
        },

        complete: {
            type: "boolean"
        },

        reason: {
            type: "string"
        }
    },

    required: [
        "question",
        "options",
        "questionRationale",
        "urgentFlag",
        "allowCustomText",
        "allowVoice",
        "complete",
        "reason"
    ]
};