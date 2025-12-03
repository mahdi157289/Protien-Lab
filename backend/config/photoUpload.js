const multer = require('multer');
const path = require('path');
const { ensureUploadDir } = require('./storageUtils');

// Always use local storage - we'll upload to Cloudinary directly in the controller
// This bypasses signature issues with multer-storage-cloudinary
const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, ensureUploadDir('../uploads/photos'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `photo-${uniqueSuffix}${extension}`);
    }
});

const storage = localStorage;

// File filter for image validation
const fileFilter = (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 10 // Maximum 10 files per request
    }
});

module.exports = upload;

