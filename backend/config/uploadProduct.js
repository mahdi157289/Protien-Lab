const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');
const { shouldUseCloudinary, ensureUploadDir } = require('./storageUtils');

const useCloudinary = shouldUseCloudinary();

const localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, ensureUploadDir('../uploads/products'));
    },
    filename: function (req, file, cb) {
        cb(null, `product-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const cloudinaryStorage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
        folder: 'protienlab/products',
        resource_type: 'image',
        transformation: [
            { width: 1600, height: 1600, crop: 'limit' },
            { quality: 'auto' }
        ],
    }),
});

const storage = useCloudinary ? cloudinaryStorage : localStorage;

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