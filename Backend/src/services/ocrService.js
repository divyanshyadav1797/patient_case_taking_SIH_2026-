const AI_SERVICE_URL =
    process.env.AI_SERVICE_URL ||
    'http://127.0.0.1:4100';

const AI_SERVICE_KEY =
    process.env.AI_SERVICE_KEY;

async function processDocument(file) {
    if (!file) {
        throw new Error('No document uploaded.');
    }

    if (!AI_SERVICE_KEY) {
        throw new Error(
            'AI_SERVICE_KEY is not configured.'
        );
    }

    const form = new FormData();

    const blob = new Blob(
        [file.buffer],
        {
            type: file.mimetype
        }
    );

    form.append(
        'document',
        blob,
        file.originalname
    );

    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, 60000);

    try {
        const response = await fetch(
            `${AI_SERVICE_URL}/internal/ai/v1/ocr/analyze`,
            {
                method: 'POST',

                headers: {
                    Authorization:
                        `Bearer ${AI_SERVICE_KEY}`
                },

                body: form,

                signal: controller.signal
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data?.error?.message ||
                data?.error ||
                'OCR service failed.'
            );
        }

        return data.data || data;

    } finally {
        clearTimeout(timeout);
    }
}

module.exports = {
    processDocument
};