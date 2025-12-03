const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');
const { shouldUseCloudinary, ensureUploadDir } = require('./storageUtils');

const useCloudinary = shouldUseCloudinary();

const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, ensureUploadDir('../uploads/posts'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const cloudinaryStorage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
        folder: 'protienlab/posts',
        resource_type: 'image',
        transformation: [
            { width: 1280, height: 720, crop: 'limit' },
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

const uploadPost = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = uploadPost;