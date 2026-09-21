import {
    analyzeDocument
} from '../ocr/ocrAgent.js';

export async function analyzeOCR(
    req,
    res
) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'DOCUMENT_REQUIRED',
                    message: 'Document is required.'
                }
            });
        }

        const result =
            await analyzeDocument({
                buffer: req.file.buffer,
                mimeType: req.file.mimetype,
                originalName:
                    req.file.originalname
            });

        return res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error(
            '[OCR]',
            error
        );

        return res.status(500).json({
            success: false,
            error: {
                code: 'OCR_FAILED',
                message:
                    'Unable to process document.'
            }
        });
    }
}