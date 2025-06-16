const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

const adminProductController = {
    createProduct: async (req, res) => {
        try {
            if (!req.files || req.files.length < 2) {
                return res.status(400).json({ message: 'Two product images are required' });
            }

            const imagePaths = req.files.map(file => file.path.replace(/\\/g, '/'));
            const product = new Product({
                ...req.body,
                images: imagePaths,
                price: Number(req.body.price),
                stock: Number(req.body.stock)
            });

            await product.save();
            res.status(201).json(product);
        } catch (error) {
            if (req.files) {
                req.files.forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error('Error deleting file:', err);
                    });
                });
            }
            res.status(400).json({ message: error.message });
        }
    },

    getAllProducts: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;

            const products = await Product.find()
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await Product.countDocuments();

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

    updateProduct: async (req, res) => {
        try {
            const updateData = { ...req.body };
            if (req.files && req.files.length > 0) {
                // Delete old images
                const oldProduct = await Product.findById(req.params.id);
                if (oldProduct?.images && Array.isArray(oldProduct.images)) {
                    oldProduct.images.forEach(imgPath => {
                        fs.unlink(imgPath, (err) => {
                            if (err) console.error('Error deleting old image:', err);
                        });
                    });
                }
                updateData.images = req.files.map(file => file.path.replace(/\\/g, '/'));
            }

            if (updateData.price) updateData.price = Number(updateData.price);
            if (updateData.stock) updateData.stock = Number(updateData.stock);

            const product = await Product.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true }
            );

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(product);
        } catch (error) {
            if (req.files) {
                req.files.forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error('Error deleting file:', err);
                    });
                });
            }
            res.status(400).json({ message: error.message });
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            if (product.images && Array.isArray(product.images)) {
                product.images.forEach(imgPath => {
                    fs.unlink(imgPath, (err) => {
                        if (err) console.error('Error deleting image:', err);
                    });
                });
            }

            await product.deleteOne();
            res.json({ message: 'Product deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = adminProductController;