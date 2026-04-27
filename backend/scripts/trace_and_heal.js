const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env from backend/.env BEFORE requiring other modules
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const Product = require('../models/Product');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'products');

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Helper to slugify names in the same way as the filesystem
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

async function heal() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is missing in .env');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Find the "Lonely" products 
        const products = await Product.find({});
        const lonely = products.filter(p => !p.images || p.images.length === 1);

        console.log(`🔍 Found ${lonely.length} products to trace and heal.`);

        const allFiles = fs.readdirSync(UPLOADS_DIR);
        let healedCount = 0;

        for (const p of lonely) {
            console.log(`\n📦 Tracing: "${p.name}"`);
            
            const slug = slugify(p.name);
            // Find all files starting with "slug-"
            const matches = allFiles.filter(f => f.startsWith(`${slug}-`));
            
            if (matches.length === 0) {
                console.log(`  ⚠️ No physical files found for slug: ${slug}`);
                continue;
            }

            console.log(`  ✨ Found ${matches.length} physical files.`);
            
            const newImages = [...(p.images || [])];
            let changed = false;

            for (const file of matches.sort()) {
                // If this file's name (without ext) is already in one of the existing URLs, skip
                const fileBase = path.parse(file).name;
                const alreadyExists = newImages.some(img => img.includes(fileBase));
                
                if (alreadyExists) continue;

                const localPath = path.join(UPLOADS_DIR, file);
                const ext = path.extname(file).toLowerCase();

                try {
                    console.log(`  🚀 Uploading: ${file}`);
                    
                    // Upload to Cloudinary
                    const res = await cloudinary.uploader.upload(localPath, {
                        folder: 'protienlab/products',
                        resource_type: 'image',
                        // Note: f_auto/q_auto handled via frontend helper
                    });

                    let finalUrl = res.secure_url;
                    
                    // If it's a JPG, add the keep-bg flag to ensure frontend respects it
                    if (ext === '.jpg' || ext === '.jpeg') {
                        finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'keep-bg=1';
                        console.log(`    💡 JPG detected. Flagged for background preservation.`);
                    }

                    newImages.push(finalUrl);
                    changed = true;
                } catch (err) {
                    const errMsg = err.message || (typeof err === 'string' ? err : JSON.stringify(err));
                    console.error(`  ❌ Failed to upload ${file}:`, errMsg);
                }
                
                // Rate limit respect
                await sleep(200);
            }

            if (changed) {
                p.images = newImages;
                await p.save();
                console.log(`  ✅ Product Healed! Total images: ${p.images.length}`);
                healedCount++;
            } else {
                console.log(`  ℹ️ No new images to add.`);
            }
        }

        console.log(`\n🎉 Heal process complete! Updated ${healedCount} products.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Critical Error:', err);
        process.exit(1);
    }
}

heal();
