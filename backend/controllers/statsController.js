const User = require('../models/User');
const Exercise = require('../models/Exercise');
const Post = require('../models/Post');
const Product = require('../models/Product');

exports.statsController = async (req, res) => {
    try {
        const [activeMembers, exercises, successStories, products] = await Promise.all([
            User.countDocuments(),
            Exercise.countDocuments(),
            Post.countDocuments(),
            Product.countDocuments({ isActive: true })
        ]);

        res.json({
            activeMembers,
            exercises,
            successStories,
            products
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};