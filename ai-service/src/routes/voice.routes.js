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
            "audio/x-m4a"
        ];

        if (!allowed.includes(file.mimetype)) {
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