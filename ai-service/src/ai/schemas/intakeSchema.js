export const intakeResponseSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
        question: {
            type: "string"
        },

        options: {
            type: "array",
            items: {
                type: "string"
            }
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
        "allowCustomText",
        "allowVoice",
        "complete",
        "reason"
    ]
};