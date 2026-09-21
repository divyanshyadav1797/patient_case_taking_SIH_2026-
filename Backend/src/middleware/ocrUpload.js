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
        const cleanName = (file.originalname || '').trim();
        // Prevent path traversal
        if (cleanName.includes('..') || cleanName.includes('/') || cleanName.includes('\\')) {
            return cb(new Error('Invalid filename detected.'));
        }

        // Disallow dangerous executable/script extensions anywhere in the filename
        if (/\.(exe|sh|bat|cmd|js|vbs|php|phtml|py|pl|cgi|jar)$/i.test(cleanName)) {
            return cb(new Error('Executable and script file uploads are strictly forbidden.'));
        }

        const extMatch = /\.(pdf|jpg|jpeg|png|webp)$/i.test(cleanName);
        const baseMime = (file.mimetype || '').split(';')[0].trim().toLowerCase();
        const mimeMatch = ALLOWED_TYPES.includes(baseMime);

        if (extMatch && mimeMatch) {
            return cb(null, true);
        }

        cb(
            new Error(
                'Only valid PDF, JPG, PNG and WebP files are supported for clinical document analysis.'
            )
        );
    }
});

module.exports = upload;