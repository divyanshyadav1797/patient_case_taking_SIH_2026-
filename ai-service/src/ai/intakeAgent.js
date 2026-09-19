import ai from "./geminiClient.js";
import { INTAKE_SYSTEM_PROMPT } from "./prompts/intakePrompt.js";
import { intakeResponseSchema } from "./schemas/intakeSchema.js";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

function normalizeQuestionResponse(result) {
    const options = Array.isArray(result.options)
        ? result.options.filter(Boolean)
        : [];

    const hasOther = options.some(
        option => option.trim().toLowerCase() === "other"
    );

    if (!hasOther) {
        options.push("Other");
    }

    return {
        question: result.question.trim(),
        options,
        allowCustomText: true,
        allowVoice: true,
        complete: Boolean(result.complete),
        reason: result.reason || ""
    };
}

export async function generateNextQuestion({
    patientProfile,
    chiefComplaint,
    conversation,
    questionCount,
    maxQuestions
}) {
    const prompt = `
${INTAKE_SYSTEM_PROMPT}

PATIENT PROFILE:
${JSON.stringify(patientProfile || {}, null, 2)}

MAIN COMPLAINT:
${chiefComplaint}

QUESTION COUNT:
${questionCount}

MAXIMUM QUESTIONS:
${maxQuestions}

PREVIOUS CONVERSATION:
${JSON.stringify(conversation, null, 2)}

Generate the next most useful question.

Remember:
- Keep the interaction short.
- Do not repeat information.
- Generate options relevant to the current question.
- Always include "Other".
- Always allow custom text.
- Always allow voice.
- If enough information has been collected, return complete=true.
`;

    const response = await ai.models.generateContent({
        model: MODEL,

        contents: prompt,

        config: {
            responseMimeType: "application/json",
            responseSchema: intakeResponseSchema,
            temperature: 0.2
        }
    });

    if (!response.text) {
        throw new Error("Gemini returned an empty response.");
    }

    const parsed = JSON.parse(response.text);

    return normalizeQuestionResponse(parsed);
}