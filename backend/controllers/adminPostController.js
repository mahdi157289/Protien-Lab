const Post = require('../models/Post');
const User = require('../models/User');

// Get all posts with search and filters
const getAllPosts = async (req, res) => {
    try {
        const { 
            search,
            startDate, 
            endDate,
            sortBy = 'createdAt',
            order = 'desc',
            page = 1,
            limit = 10
        } = req.query;

        // Build query
        let query = {};

        // Search in post text and user names
        if (search) {
            const users = await User.find({
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } }
                ]
            });
            
            const userIds = users.map(user => user._id);
            
            query = {
                $or: [
                    { text: { $regex: search, $options: 'i' } },
                    { user: { $in: userIds } }
                ]
            };
        }

        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const total = await Post.countDocuments(query);

        // Execute query with pagination and sorting
        const posts = await Post.find(query)
            .populate('user', 'firstName lastName profileImage email')
            .populate('likes', 'firstName lastName')
            .sort({ [sortBy]: order })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            posts,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalPosts: total
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get post analytics
const getPostAnalytics = async (req, res) => {
    try {
        const totalPosts = await Post.countDocuments();
        const totalLikes = await Post.aggregate([
            {
                $project: {
                    likesCount: { $size: "$likes" }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$likesCount" }
                }
            }
        ]);

        // Get posts per day for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const postsPerDay = await Post.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Get top users by post count
        const topPosters = await Post.aggregate([
            {
                $group: {
                    _id: "$user",
                    postCount: { $sum: 1 }
                }
            },
            {
                $sort: { postCount: -1 }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails"
            },
            {
                $project: {
                    firstName: "$userDetails.firstName",
                    lastName: "$userDetails.lastName",
                    email: "$userDetails.email",
                    postCount: 1
                }
            }
        ]);

        res.json({
            totalPosts,
            totalLikes: totalLikes[0]?.total || 0,
            postsPerDay,
            topPosters
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete post (Admin version - can delete any post)
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        await post.deleteOne();
        res.json({ message: 'Post removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get post details
const getPostDetails = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user', 'firstName lastName email profileImage')
            .populate('likes', 'firstName lastName email');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllPosts,
    getPostAnalytics,
    deletePost,
    getPostDetails
};