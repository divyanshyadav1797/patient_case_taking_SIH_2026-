import ai from "./geminiClient.js";
import { REPORT_SYSTEM_PROMPT } from "./prompts/reportPrompt.js";
import { reportSchema } from "./schemas/reportSchema.js";

const rawModel = (process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite').trim().toLowerCase().replace(/\s+/g, '-');
const MODEL = rawModel.includes('gemini') ? rawModel : 'gemini-3.5-flash-lite';

export async function generateClinicalReport(session) {
    const conversationSummary = (session.conversation || []).map((item, index) => {
        return `  Turn ${index + 1}:\n    AI Asked: "${item.question}"\n    Patient Answered: "${item.answer}"${item.answerMethod === 'voice' ? ' (via voice input)' : ''}`;
    }).join('\n');

    const prompt = `
${REPORT_SYSTEM_PROMPT}

PATIENT PROFILE:
${JSON.stringify(session.patientProfile || {}, null, 2)}

CHIEF COMPLAINT:
"${session.chiefComplaint}"

COMPLETE INTAKE CONVERSATION:
${conversationSummary}

Generate a comprehensive clinical report from this intake conversation.
Include pertinent negatives (symptoms the patient denied or were not reported).
Assess triage level based on the symptom severity and urgency.
Suggest the most appropriate medical specialty for referral.
List 2-3 differential diagnoses as working hypotheses for the physician.
Suggest relevant diagnostic investigations based on the clinical picture.
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