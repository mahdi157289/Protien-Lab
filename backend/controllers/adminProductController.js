const Product = require('../models/Product');
const {
    buildFileUrl,
    cleanupUploadedFiles,
    deleteStoredPath,
} = require('../utils/uploadHelpers');

const adminProductController = {
    createProduct: async (req, res) => {
        try {
            console.log('📦 Creating product with body:', req.body);
            console.log('📁 Files:', req.files ? req.files.length : 'No files');
            
            if (!req.files || req.files.length < 2 || req.files.length > 6) {
                return res.status(400).json({ message: 'Between 2 and 6 product images are required' });
            }

            const imagePaths = req.files.map(file => buildFileUrl('products', file));

            const categories = req.body.categories
                ? (Array.isArray(req.body.categories) ? req.body.categories : JSON.parse(req.body.categories))
                : [];
            
            console.log('📋 Parsed categories:', categories);
            
            // Validate categories against enum
            const validCategories = ['Whey', 'Mass Gainer', 'Isolate Whey', 'Vitamines & Minerals', 'Creatine', 'Acide Amine', 'Pre-Workout', 'Fat Burner', 'Testobooster', 'Join-Flex', 'Fish oil', 'Carbs', 'Snacks', 'Shakers', 'Accesoires'];
            const invalidCategories = categories.filter(cat => !validCategories.includes(cat));
            if (invalidCategories.length > 0) {
                console.error('❌ Invalid categories:', invalidCategories);
                return res.status(400).json({ 
                    message: `Invalid categories: ${invalidCategories.join(', ')}. Valid categories are: ${validCategories.join(', ')}` 
                });
            }

            const product = new Product({
                name: req.body.name,
                descriptionShort: req.body.descriptionShort,
                descriptionFull: req.body.descriptionFull,
                price: Number(req.body.price),
                stock: Number(req.body.stock),
                images: imagePaths,
                categories,
                isBestSeller: req.body.isBestSeller === 'true' || req.body.isBestSeller === true,
                flavors: req.body.flavors
                    ? (Array.isArray(req.body.flavors) ? req.body.flavors : JSON.parse(req.body.flavors))
                    : [],
                weights: req.body.weights
                    ? (Array.isArray(req.body.weights) ? req.body.weights : JSON.parse(req.body.weights))
                    : [],
                benefits: req.body.benefits
                    ? (Array.isArray(req.body.benefits) ? req.body.benefits : JSON.parse(req.body.benefits))
                    : [],
                isNew: req.body.isNew === 'true' || req.body.isNew === true,
                fastDelivery: req.body.fastDelivery === 'true' || req.body.fastDelivery === true,
                limitedStockNotice: req.body.limitedStockNotice || '',
                brand: req.body.brand || ''
            });

            console.log('💾 Saving product...');
            await product.save();
            console.log('✅ Product saved successfully');
            res.status(201).json(product);
        } catch (error) {
            console.error('❌ Error creating product:', error);
            console.error('❌ Error message:', error.message);
            console.error('❌ Error name:', error.name);
            if (error.errors) {
                console.error('❌ Validation errors:', error.errors);
            }
            await cleanupUploadedFiles(req.files, 'products');
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
                // Delete old images by filename if they exist
                const oldProduct = await Product.findById(req.params.id);
                if (oldProduct?.images && Array.isArray(oldProduct.images)) {
                    await Promise.all(oldProduct.images.map((imgUrl) => deleteStoredPath(imgUrl, 'products')));
                }
                updateData.images = req.files.map(file => buildFileUrl('products', file));
            }

            if (updateData.price !== undefined) updateData.price = Number(updateData.price);
            if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);
            if (updateData.categories) updateData.categories = Array.isArray(updateData.categories) ? updateData.categories : JSON.parse(updateData.categories);
            if (updateData.isBestSeller !== undefined) updateData.isBestSeller = updateData.isBestSeller === 'true' || updateData.isBestSeller === true;
            if (updateData.flavors) updateData.flavors = Array.isArray(updateData.flavors) ? updateData.flavors : JSON.parse(updateData.flavors);
            if (updateData.weights) updateData.weights = Array.isArray(updateData.weights) ? updateData.weights : JSON.parse(updateData.weights);
            if (updateData.benefits) updateData.benefits = Array.isArray(updateData.benefits) ? updateData.benefits : JSON.parse(updateData.benefits);
            if (updateData.isNew !== undefined) updateData.isNew = updateData.isNew === 'true' || updateData.isNew === true;
            if (updateData.fastDelivery !== undefined) updateData.fastDelivery = updateData.fastDelivery === 'true' || updateData.fastDelivery === true;
            if (updateData.limitedStockNotice === undefined) updateData.limitedStockNotice = '';
            if (updateData.brand !== undefined) updateData.brand = updateData.brand || '';

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
            await cleanupUploadedFiles(req.files, 'products');
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
                await Promise.all(product.images.map((imgPath) => deleteStoredPath(imgPath, 'products')));
            }

            await product.deleteOne();
            res.json({ message: 'Product deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = adminProductController;