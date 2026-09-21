import ai from "./geminiClient.js";
import { voiceResponseSchema }
    from "./schemas/voiceSchema.js";

const MODEL =
    process.env.VOICE_MODEL ||
    "Gemini 3.5 Flash Lite";

export async function transcribeVoice({
    buffer,
    mimeType,
    languageHint
}) {
    if (!buffer || !buffer.length) {
        throw new Error("Audio buffer is empty.");
    }

    const base64Audio =
        buffer.toString("base64");

    const languageInstruction =
        languageHint
            ? `The user selected language: ${languageHint}.`
            : "Automatically detect the spoken language.";

    const prompt = `
You are the speech transcription component
of a healthcare patient intake system.

${languageInstruction}

Process ONLY the patient's spoken answer.

Return:

1. transcript
   - Exact or near-exact transcription
   - Preserve medical terms
   - Preserve the patient's meaning

2. englishTranslation
   - Translate the answer into English
   - Do not add medical information
   - Do not diagnose
   - Do not interpret beyond what was spoken

3. detectedLanguage
   - Return the detected language using BCP-47
     where possible.

Important rules:

- Do not invent missing words.
- Do not guess unreadable or unclear speech.
- If a medical word is uncertain, preserve the
  uncertainty rather than inventing a diagnosis.
- Do not answer the medical question yourself.
- Do not provide treatment advice.
`;

    const response =
        await ai.models.generateContent({
            model: MODEL,

            contents: [
                {
                    text: prompt
                },

                {
                    inlineData: {
                        mimeType,
                        data: base64Audio
                    }
                }
            ],

            config: {
                responseMimeType:
                    "application/json",

                responseSchema:
                    voiceResponseSchema,

                temperature: 0
            }
        });

    if (!response.text) {
        throw new Error(
            "Gemini returned an empty transcription response."
        );
    }

    return JSON.parse(response.text);
}