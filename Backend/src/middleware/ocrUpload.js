const multer = require('multer');

const MAX_FILE_SIZE =
    Number(process.env.OCR_MAX_FILE_SIZE_BYTES) ||
    20 * 1024 * 1024;

const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
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
        const extMatch = /\.(pdf|jpg|jpeg|png|webp)$/i.test(file.originalname);
        if (ALLOWED_TYPES.includes(file.mimetype) || extMatch) {
            return cb(null, true);
        }

        cb(
            new Error(
                'Only PDF, JPG, PNG and WebP files are supported for clinical document analysis.'
            )
        );
    }
});

module.exports = upload;