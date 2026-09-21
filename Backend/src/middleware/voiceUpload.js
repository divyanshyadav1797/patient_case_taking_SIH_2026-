const multer = require('multer');

const storage = multer.memoryStorage();

const allowedMimeTypes = [
    'audio/webm',
    'audio/ogg',
    'audio/mp4',
    'audio/mpeg',
    'audio/wav',
    'audio/x-m4a',
    'audio/x-wav',
    'audio/aac'
];

const fileFilter = (req, file, cb) => {
    const baseMime = (file.mimetype || '').split(';')[0].trim().toLowerCase();
    if (!allowedMimeTypes.includes(baseMime)) {
        return cb(
            new Error(
                `Unsupported audio format: ${file.mimetype}`
            )
        );
    }

    cb(null, true);
};

const voiceUpload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter
});

module.exports = voiceUpload;