const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

const adminProductController = {
    createProduct: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'Product image is required' });
            }

            const imagePath = req.file.path.replace(/\\/g, '/');
            const product = new Product({
                ...req.body,
                image: imagePath,
                price: Number(req.body.price),
                stock: Number(req.body.stock)
            });

            await product.save();
            res.status(201).json(product);
        } catch (error) {
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            }
            res.status(400).json({ message: error.message });
        }
    },

    getAllProducts: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
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
            if (req.file) {
                updateData.image = req.file.path.replace(/\\/g, '/');
                
                const oldProduct = await Product.findById(req.params.id);
                if (oldProduct?.image) {
                    fs.unlink(oldProduct.image, (err) => {
                        if (err) console.error('Error deleting old image:', err);
                    });
                }
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
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting file:', err);
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

            if (product.image) {
                fs.unlink(product.image, (err) => {
                    if (err) console.error('Error deleting image:', err);
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