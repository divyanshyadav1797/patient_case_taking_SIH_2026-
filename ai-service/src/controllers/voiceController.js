import {
    transcribeVoice
} from "../ai/voiceTranscriptionAgent.js";

export async function transcribeVoiceController(
    req,
    res
) {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "Audio file is required."
            });
        }

        const result =
            await transcribeVoice({
                buffer: req.file.buffer,
                mimeType: req.file.mimetype,
                languageHint: req.body.language
            });

        return res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error(
            "VOICE TRANSCRIPTION ERROR:",
            error
        );

        return res.status(500).json({
            error:
                "Unable to process voice input.",
            details:
                error?.message || "Unknown error"
        });
    }
}
