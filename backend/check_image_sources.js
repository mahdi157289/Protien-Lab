require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        const products = await Product.find({});
        
        let cloudinaryCount = 0;
        let houseNutritionCount = 0;
        let localCount = 0;
        let noImagesCount = 0;

        const notCloudinary = [];

        for (const p of products) {
            if (!p.images || p.images.length === 0) {
                noImagesCount++;
                notCloudinary.push(`${p.name} (NO IMAGES)`);
                continue;
            }

            let hasCloudinary = false;
            let hasHouseNutrition = false;

            for (const img of p.images) {
                if (img.includes('cloudinary.com')) {
                    hasCloudinary = true;
                } else if (img.includes('housenutrition.tn')) {
                    hasHouseNutrition = true;
                } else {
                    localCount++;
                }
            }

            if (hasCloudinary) cloudinaryCount++;
            if (hasHouseNutrition) houseNutritionCount++;

            if (!hasCloudinary) {
                notCloudinary.push(`${p.name} -> ${p.images[0]}`);
            }
        }

        console.log(`\n--- Image Status ---`);
        console.log(`Total Products: ${products.length}`);
        console.log(`Products with Cloudinary images: ${cloudinaryCount}`);
        console.log(`Products with housenutrition.tn images: ${houseNutritionCount}`);
        console.log(`Products with 0 images: ${noImagesCount}`);
        
        console.log(`\nProducts not using Cloudinary (${notCloudinary.length}):`);
        notCloudinary.forEach(n => console.log(` - ${n}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
