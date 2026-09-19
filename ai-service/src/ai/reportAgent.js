import ai from "./geminiClient.js";
import { REPORT_SYSTEM_PROMPT } from "./prompts/reportPrompt.js";
import { reportSchema } from "./schemas/reportSchema.js";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

export async function generateClinicalReport(session) {
    const prompt = `
${REPORT_SYSTEM_PROMPT}

PATIENT PROFILE:
${JSON.stringify(session.patientProfile || {}, null, 2)}

CHIEF COMPLAINT:
${session.chiefComplaint}

CONVERSATION:
${JSON.stringify(session.conversation, null, 2)}
`;

    const response = await ai.models.generateContent({
        model: MODEL,

        contents: prompt,

        config: {
            responseMimeType: "application/json",
            responseSchema: reportSchema,
            temperature: 0.1
        }
    });

    if (!response.text) {
        throw new Error("Gemini returned an empty report.");
    }

    return JSON.parse(response.text);
}