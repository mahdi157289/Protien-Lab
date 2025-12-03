const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');
const { shouldUseCloudinary, ensureUploadDir } = require('./storageUtils');

const useCloudinary = shouldUseCloudinary();

const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, ensureUploadDir('../uploads/profiles'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const cloudinaryStorage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
        folder: 'protienlab/profiles',
        resource_type: 'image',
        transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' }
        ],
    }),
});

const storage = useCloudinary ? cloudinaryStorage : localStorage;

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = upload;