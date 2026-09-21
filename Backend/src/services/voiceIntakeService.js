class VoiceIntakeService {
    async transcribeAudio({
        buffer,
        mimeType,
        originalName,
        languageHint
    }) {
        const aiServiceUrl =
            process.env.AI_SERVICE_URL ||
            'http://127.0.0.1:4100';

        const formData = new FormData();

        const cleanMimeType = (mimeType || 'audio/webm').split(';')[0].trim().toLowerCase();

        formData.append(
            'audio',
            new Blob([buffer], {
                type: cleanMimeType
            }),
            originalName || 'answer.webm'
        );

        if (languageHint) {
            formData.append('language', languageHint);
        }

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 30000);

        try {
            const response = await fetch(
                `${aiServiceUrl}/api/v1/voice/transcribe`,
                {
                    method: 'POST',

                    headers: {
                        Authorization:
                            `Bearer ${process.env.AI_SERVICE_KEY}`
                    },

                    body: formData,

                    signal: controller.signal
                }
            );

            if (!response.ok) {
                const errorText = await response.text();

                throw new Error(
                    `Voice AI service failed: ${errorText}`
                );
            }

            return await response.json();
        } finally {
            clearTimeout(timeout);
        }
    }
}

module.exports = new VoiceIntakeService();