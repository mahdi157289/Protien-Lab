const multer = require('multer');
const path = require('path');
// Always use local storage - we'll upload to Cloudinary directly in the controller
// This bypasses signature issues with multer-storage-cloudinary
const { ensureUploadDir } = require('./storageUtils');

const localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, ensureUploadDir('../uploads/products'));
    },
    filename: function (req, file, cb) {
        cb(null, `product-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const storage = localStorage;

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB limit
    }
});

module.exports = upload;