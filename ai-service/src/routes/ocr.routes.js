import { Router } from 'express';

import multer from 'multer';

import {
    internalAuth
} from '../middleware/internalAuth.js';

import {
    analyzeOCR
} from '../controllers/ocrController.js';

const router =
    Router();

const upload =
    multer({
        storage:
            multer.memoryStorage(),

        limits: {
            fileSize:
                20 * 1024 * 1024
        },

        fileFilter(
            req,
            file,
            cb
        ) {
            const allowed = [
                'application/pdf',
                'image/jpeg',
                'image/png',
                'image/webp'
            ];

            if (
                !allowed.includes(
                    file.mimetype
                )
            ) {
                return cb(
                    new Error(
                        'Unsupported document type.'
                    )
                );
            }

            cb(null, true);
        }
    });

router.post(
    '/analyze',
    internalAuth,
    upload.single('document'),
    analyzeOCR
);

export default router;