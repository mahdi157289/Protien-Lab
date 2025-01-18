const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getProfile, updateProfile, uploadImage } = require('../controllers/profileController');
const upload = require('../config/uploadConfig');

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.post('/upload-image', protect, upload.single('profileImage'), uploadImage);

module.exports = router;