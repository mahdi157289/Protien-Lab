const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find();
        
        console.log(`Total Products: ${products.length}`);
        
        const counts = {
            noImages: 0,
            oneImage: 0,
            multipleImages: 0,
            brokenUrls: 0
        };

        products.forEach(p => {
            if (!p.images || p.images.length === 0) {
                counts.noImages++;
                console.log(`❌ No images: ${p.name}`);
            } else if (p.images.length === 1) {
                counts.oneImage++;
                // Check if URL looks broken (e.g. localhost or missing cloudinary id)
            } else {
                counts.multipleImages++;
            }
        });

        console.log('\nStats:', counts);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
