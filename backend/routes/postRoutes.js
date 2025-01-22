const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const uploadPost = require('../config/postUploadConfig');
const {
    createPost,
    getPosts,
    updatePost,
    deletePost,
    toggleLike
} = require('../controllers/postController');

// Routes
router.post('/', protect, uploadPost.single('image'), createPost);
router.get('/', getPosts);
router.put('/:id', protect, uploadPost.single('image'), updatePost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, toggleLike);

module.exports = router;