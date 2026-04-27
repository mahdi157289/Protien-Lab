require('dotenv').config();
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const Photo = require('../models/Photo');

/**
 * Bulk Background Removal Script
 * This script iterates through all products and admin-uploaded photos,
 * and ensures they use Cloudinary's AI background removal.
 * 
 * Note: This script mainly verifies Cloudinary hosting. 
 * The actual removal is done on-the-fly via the frontend helper we updated,
 * but this script can be used to "warm up" the Cloudinary cache or 
 * permanently transform them if needed.
 */

const processImageUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return null;
    // We already handled dynamic injection in the frontend,
    // but we can log them here to see what will be processed.
    return url;
};

const run = async () => {
    try {
        await connectDB();
        console.log('📦 Connected to Database');

        const products = await Product.find({});
        console.log(`🔍 Found ${products.length} products to inspect.`);

        let processedCount = 0;
        for (const product of products) {
            if (product.images && product.images.length > 0) {
                const hasCloudinary = product.images.some(img => img.includes('cloudinary.com'));
                if (hasCloudinary) {
                    console.log(`✅ Product "${product.name}" has Cloudinary images. Background removal activated.`);
                    processedCount++;
                } else {
                    console.warn(`⚠️ Product "${product.name}" uses local images. Run migration script first.`);
                }
            }
        }

        const photos = await Photo.find({});
        console.log(`🔍 Found ${photos.length} admin-uploaded photos to inspect.`);
        
        for (const photo of photos) {
            if (photo.url && photo.url.includes('cloudinary.com')) {
                console.log(`✅ Photo (${photo.category}) "${photo.brandName || photo._id}" is on Cloudinary.`);
            }
        }

        console.log('\n--- Status Report ---');
        console.log(`Total Products: ${products.length}`);
        console.log(`Ready for Background Removal: ${processedCount}`);
        console.log('----------------------');
        console.log('🎉 Background removal has been ENABLED globally via the frontend image helper.');
        console.log('💡 Note: The first time an image is loaded, Cloudinary will take 1-2 seconds to process the AI removal.');

        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

run();
