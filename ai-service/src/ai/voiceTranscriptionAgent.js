import ai from "./geminiClient.js";
import { voiceResponseSchema }
    from "./schemas/voiceSchema.js";

const rawModel = (process.env.VOICE_MODEL || process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite').trim().toLowerCase().replace(/\s+/g, '-');
const MODEL = rawModel.includes('gemini') ? rawModel : 'gemini-3.1-flash-lite';

const CANDIDATE_MODELS = [
    MODEL,
    'gemini-3.1-flash-lite',
    'gemini-3.1-flash-lite-preview',
    'gemini-3-flash-preview',
    'gemini-3.6-flash'
].filter((v, i, a) => v && a.indexOf(v) === i);

function isAudioSilent(buf) {
    if (!buf || buf.length < 100) return true;
    let dataOffset = 0;
    if (buf.length > 44 && buf.toString('ascii', 0, 4) === 'RIFF') {
        dataOffset = 44;
    }
    let nonZeroCount = 0;
    const end = Math.min(buf.length, dataOffset + 20000);
    for (let i = dataOffset; i < end; i++) {
        if (buf[i] !== 0 && buf[i] !== 128) nonZeroCount++;
    }
    return nonZeroCount < 20;
}

export async function transcribeVoice({
    buffer,
    mimeType,
    languageHint
}) {
    if (!buffer || !buffer.length) {
        throw new Error("Audio buffer is empty.");
    }

    if (isAudioSilent(buffer)) {
        return {
            transcript: "",
            englishTranslation: "",
            detectedLanguage: languageHint || "hi"
        };
    }

    let cleanMimeType = (mimeType || "audio/webm").split(";")[0].trim().toLowerCase();
    if (cleanMimeType === 'audio/x-wav' || cleanMimeType === 'audio/vnd.wave') {
        cleanMimeType = 'audio/wav';
    }
    const base64Audio = buffer.toString("base64");

    const languageInstruction =
        languageHint
            ? `The user selected language: ${languageHint}.`
            : "Automatically detect the spoken language.";

    const prompt = `
You are the speech transcription component of a healthcare patient intake system.

${languageInstruction}

Process ONLY the patient's spoken answer.

Return:

1. transcript
   - Exact or near-exact transcription in original language script (e.g. Devanagari Hindi)
   - Preserve medical terms
   - Preserve the patient's meaning
   - If audio is silent or contains no speech, return empty string ""

2. englishTranslation
   - Translate the answer into English
   - Do not add medical information
   - Do not diagnose
   - Do not interpret beyond what was spoken
   - If audio is silent or contains no speech, return empty string ""

3. detectedLanguage
   - Return the detected language code (e.g. 'hi', 'en', 'mr').

Important rules:
- Do not invent missing words.
- Do not guess unreadable or unclear speech.
- If a medical word is uncertain, preserve the uncertainty rather than inventing a diagnosis.
- Do not answer the medical question yourself.
- Do not provide treatment advice.
`;

    let lastError = null;
    for (const modelName of CANDIDATE_MODELS) {
        try {
            const response = await ai.models.generateContent({
                model: modelName,
                contents: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: cleanMimeType,
                            data: base64Audio
                        }
                    }
                ],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: voiceResponseSchema,
                    temperature: 0
                }
            });

            if (response && response.text) {
                try {
                    return JSON.parse(response.text);
                } catch {
                    return {
                        transcript: response.text.trim(),
                        englishTranslation: response.text.trim(),
                        detectedLanguage: languageHint || "en"
                    };
                }
            }
        } catch (err) {
            lastError = err;
            console.warn(`[VoiceAI] Model ${modelName} notice: ${err.message}, attempting next candidate...`);
        }
    }

    console.warn("[VoiceAI] All Gemini candidate models failed:", lastError?.message);
    // Return graceful fallback with empty transcript if audio was silent or unreachable
    return {
        transcript: "",
        englishTranslation: "",
        detectedLanguage: languageHint || "en"
    };
}