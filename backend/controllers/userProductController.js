const Product = require('../models/Product');

const userProductController = {
    getAllProducts: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;

            const products = await Product.find({ isActive: true })
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await Product.countDocuments({ isActive: true });

            res.json({
                products,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalProducts: total
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getProductById: async (req, res) => {
        try {
            const product = await Product.findOne({ 
                _id: req.params.id,
                isActive: true 
            });

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.json(product);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = userProductController;