import ai from "./geminiClient.js";
import { INTAKE_SYSTEM_PROMPT } from "./prompts/intakePrompt.js";
import { intakeResponseSchema } from "./schemas/intakeSchema.js";

const rawModel = (process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite').trim().toLowerCase().replace(/\s+/g, '-');
const MODEL = rawModel.includes('gemini') ? rawModel : 'gemini-3.5-flash-lite';

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
        questionRationale: result.questionRationale || "",
        urgentFlag: Boolean(result.urgentFlag),
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
    // Build a rich conversation context for the AI
    const conversationSummary = conversation.map((item, index) => {
        return `  Turn ${index + 1}:\n    AI Asked: "${item.question}"\n    Options Given: [${(item.options || []).join(', ')}]\n    Patient Answered: "${item.answer}"`;
    }).join('\n');

    const prompt = `
${INTAKE_SYSTEM_PROMPT}

PATIENT PROFILE:
${JSON.stringify(patientProfile || {}, null, 2)}

CHIEF COMPLAINT (main reason for visit):
"${chiefComplaint}"

QUESTION NUMBER: ${questionCount + 1} of maximum ${maxQuestions}
${questionCount >= maxQuestions - 1 ? 'IMPORTANT: This is the last question. After this, set complete=true.' : ''}

CONVERSATION SO FAR:
${conversationSummary || '(First question — no conversation yet. Ask about the chief complaint details.)'}

INSTRUCTIONS FOR THIS TURN:
- Analyze the patient's last answer carefully.
- Generate the NEXT most clinically useful question that follows logically from what the patient said.
- Generate 3-5 answer options that are SPECIFIC to this exact question (not generic).
- If the patient went off-topic in their last answer, redirect them back to the chief complaint.
- If the patient's answers so far reveal enough clinical information, set complete=true.
- Each option must be a realistic patient response, not a medical textbook answer.
- Always include "Other" as the last option.
`;

    const response = await ai.models.generateContent({
        model: MODEL,

        contents: prompt,

        config: {
            responseMimeType: "application/json",
            responseSchema: intakeResponseSchema,
            temperature: 0.3
        }
    });

    if (!response.text) {
        throw new Error("Gemini returned an empty response.");
    }

    const parsed = JSON.parse(response.text);

    return normalizeQuestionResponse(parsed);
}