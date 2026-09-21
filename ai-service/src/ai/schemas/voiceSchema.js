export const voiceResponseSchema = {
    type: "object",

    additionalProperties: false,

    properties: {
        transcript: {
            type: "string"
        },

        englishTranslation: {
            type: "string"
        },

        detectedLanguage: {
            type: "string"
        }
    },

    required: [
        "transcript",
        "englishTranslation",
        "detectedLanguage"
    ]
};