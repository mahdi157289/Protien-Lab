const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);

// Configuration
const MONGO_URI = 'mongodb+srv://baccarmahdi09:QGOXemXdJ5CigQ09@cluster0.ygb4b3i.mongodb.net/nutrition_store?retryWrites=true&w=majority&appName=Cluster0&tls=true&ssl=true';
const UPLOAD_DIR = path.join(__dirname, '../uploads/products');

// Ensure upload dir exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  images: [String],
  image: String // Some schemas use a single image field too
}, { strict: false });

const Product = mongoose.model('Product', productSchema);

async function downloadImage(url, filename) {
    const filepath = path.join(UPLOAD_DIR, filename);
    
    // If file already exists, skip download (or overwrite? Let's skip to be safe/fast)
    if (fs.existsSync(filepath)) {
        // console.log(`  ⏩ File exists: ${filename}`);
        // return `uploads/products/${filename}`;
    }

    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://www.housenutrition.tn/'
            },
            timeout: 10000
        });

        await pipeline(response.data, fs.createWriteStream(filepath));
        return `uploads/products/${filename}`;
    } catch (error) {
        console.error(`  ❌ Failed to download ${url}: ${error.message}`);
        return null;
    }
}

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('🔌 Connected to MongoDB.');

        const products = await Product.find({});
        console.log(`📋 Found ${products.length} products to process.`);

        for (const product of products) {
            console.log(`\n📦 Processing: ${product.name}`);
            let updated = false;
            const newImages = [];

            // Process 'images' array
            if (product.images && product.images.length > 0) {
                for (let i = 0; i < product.images.length; i++) {
                    const url = product.images[i];
                    
                    // Skip if already local
                    if (url.startsWith('uploads/') || url.startsWith('/uploads/')) {
                        newImages.push(url);
                        continue;
                    }

                    // Generate filename
                    // Use product ID + index + extension (guess extension or default to .webp/jpg)
                    // URL might have extension
                    const ext = path.extname(url.split('?')[0]) || '.jpg';
                    // Sanitize extension (remove .webp-xxxxx junk)
                    const cleanExt = ext.split('-')[0]; 
                    // actually the URLs look like ...image.webp-68726c5453da3.webp
                    // so valid extension is at the end
                    
                    const filename = `product-${product._id}-${i}-${Date.now()}.jpg`; // Defaulting to .jpg or we can try to keep original
                    
                    // Actually, let's try to detect extension from URL or content-type? 
                    // Simple approach: just use a unique name.
                    
                    const localPath = await downloadImage(url, filename);
                    
                    if (localPath) {
                        newImages.push(localPath);
                        updated = true;
                    } else {
                        // Keep original URL if download fails? Or remove?
                        // If we keep it, it stays broken. Let's keep it but log it.
                        console.log(`  ⚠️ Keeping original URL for index ${i}`);
                        newImages.push(url); 
                    }
                }
            }

            // Update product if changes made
            if (updated) {
                const updateDoc = { images: newImages };
                
                // Also update 'image' field if it exists or needs to be set
                if (newImages.length > 0) {
                    updateDoc.image = newImages[0];
                }

                await Product.updateOne({ _id: product._id }, { $set: updateDoc });
                console.log(`  ✅ Updated product images.`);
            } else {
                console.log(`  ⏩ No changes needed.`);
            }
        }

    } catch (error) {
        console.error('Fatal Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

run();
