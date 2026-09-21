import { Router } from "express";
import multer from "multer";

import {
    transcribeVoiceController
} from "../controllers/voiceController.js";

import {
    internalAuth
} from "../middleware/internalAuth.js";

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        const allowed = [
            "audio/webm",
            "audio/ogg",
            "audio/mp4",
            "audio/mpeg",
            "audio/wav",
            "audio/x-m4a",
            "audio/x-wav",
            "audio/aac"
        ];

        const baseMime = (file.mimetype || "").split(";")[0].trim().toLowerCase();
        if (!allowed.includes(baseMime)) {
            return cb(
                new Error(
                    `Unsupported audio format: ${file.mimetype}`
                )
            );
        }

        cb(null, true);
    }
});

router.post(
    "/transcribe",
    internalAuth,
    upload.single("audio"),
    transcribeVoiceController
);

export default router;