const Post = require('../models/Post');
const User = require('../models/User');

// Create a new post
const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        const image = req.file ? req.file.path : '';

        const post = await Post.create({
            user: req.user._id,
            text,
            image
        });

        const populatedPost = await Post.findById(post._id)
            .populate('user', 'firstName lastName profileImage')
            .populate('likes', 'firstName lastName');

        res.status(201).json(populatedPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all posts
const getPosts = async (req, res) => {
    try {
        const posts = await Post.find({})
            .populate('user', 'firstName lastName profileImage')
            .populate('likes', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a post
const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user owns the post
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const { text } = req.body;
        const image = req.file ? req.file.path : post.image;

        post.text = text;
        post.image = image;

        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate('user', 'firstName lastName profileImage')
            .populate('likes', 'firstName lastName');

        res.json(updatedPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a post
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user owns the post
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await post.deleteOne();

        res.json({ message: 'Post removed' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Like/Unlike a post
const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(req.user._id);

        if (likeIndex === -1) {
            // Like the post
            post.likes.push(req.user._id);
        } else {
            // Unlike the post
            post.likes.splice(likeIndex, 1);
        }

        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate('user', 'firstName lastName profileImage')
            .populate('likes', 'firstName lastName');

        res.json(updatedPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createPost,
    getPosts,
    updatePost,
    deletePost,
    toggleLike
};