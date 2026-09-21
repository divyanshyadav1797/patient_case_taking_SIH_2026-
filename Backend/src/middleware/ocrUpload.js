const multer = require('multer');

const MAX_FILE_SIZE =
    Number(process.env.OCR_MAX_FILE_SIZE_BYTES) ||
    20 * 1024 * 1024;

const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
];

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1
    },

    fileFilter: (req, file, cb) => {
        if (!ALLOWED_TYPES.includes(file.mimetype)) {
            return cb(
                new Error(
                    'Only PDF, JPG, PNG and WebP files are supported.'
                )
            );
        }

        cb(null, true);
    }
});

module.exports = upload;