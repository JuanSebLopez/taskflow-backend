const fs = require('fs');
const path = require('path');
const multer = require('multer');
const AppError = require('../utils/app-error');

const uploadRoot = path.join(__dirname, '..', 'uploads', 'tasks');
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadRoot);
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, '-');
        cb(null, `${Date.now()}-${safeName}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 5
    }
});

function handleUploadErrors(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        return next(
            new AppError(
                err.code === 'LIMIT_FILE_SIZE' ? 'Each attachment must be 10 MB or smaller' : err.message,
                400,
                { multerCode: err.code },
                err.code === 'LIMIT_FILE_SIZE' ? 'FILE_TOO_LARGE' : 'UPLOAD_ERROR'
            )
        );
    }

    return next(err);
}

module.exports = {
    upload,
    handleUploadErrors
};
