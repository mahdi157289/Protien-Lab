const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');

const BACKUP_PATH = path.join(__dirname, '..', 'uploads', 'repaired_products_complete.json');
const DRY_RUN = process.argv.includes('--dry-run');

// Helper to slugify (must match sync_by_name.js for consistency)
function slugify(text) {
    if (!text) return '';
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

async function uploadToCloudinary(url, productName, index) {
    try {
        console.log(`      🚀 Uploading secondary image ${index} for ${productName}...`);
        const res = await cloudinary.uploader.upload(url, {
            folder: 'protienlab/products/recovered',
            resource_type: 'image',
            transformation: [
                { quality: 'auto:best' }
            ]
        });
        return res.secure_url;
    } catch (err) {
        console.error(`      ❌ Recovery upload failed for ${url}:`, err.message);
        return url; // Fallback to original URL
    }
}

async function run() {
    try {
        console.log(`\n🩺 ${DRY_RUN ? 'DRY RUN' : 'LIVE RUN'}: Healing Product Image Arrays...\n`);
        
        if (!fs.existsSync(BACKUP_PATH)) {
            throw new Error(`Backup file not found at ${BACKUP_PATH}`);
        }

        const backupData = JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf8'));
        const backupProducts = backupData.products;

        await mongoose.connect(process.env.MONGO_URI);
        const dbProducts = await Product.find();

        console.log(`📦 Loaded ${dbProducts.length} products from DB.`);
        console.log(`📂 Loaded ${backupProducts.length} products from Backup.\n`);

        let healedCount = 0;
        let skippedCount = 0;

        for (const p of dbProducts) {
            const dbSlug = slugify(p.name);
            
            // Find matching product in backup
            const backupP = backupProducts.find(bp => slugify(bp.title) === dbSlug);

            if (!backupP) {
                console.log(`⚠️  No backup match for: "${p.name}" (Slug: ${dbSlug})`);
                skippedCount++;
                continue;
            }

            const currentImages = p.images || [];
            const backupImages = backupP.images || [];

            // If backup has more images, we need to heal
            if (backupImages.length > currentImages.length) {
                console.log(`🩹 Healing: "${p.name}"`);
                console.log(`   Current: ${currentImages.length} images`);
                console.log(`   Backup:  ${backupImages.length} images`);

                const newImages = [...currentImages];
                
                // We want to add missing secondary images
                // The backup images at index 1+ are the targets
                for (let i = 1; i < backupImages.length; i++) {
                    const backupUrl = backupImages[i];
                    
                    // Check if this URL is already in currentImages (to avoid duplicates)
                    // We check if any current image matches the filename/suffix if it's already on Cloudinary
                    const exists = currentImages.some(img => img.includes(backupUrl.split('/').pop().split('.')[0]));
                    
                    if (!exists) {
                        if (!DRY_RUN) {
                            const cloudUrl = await uploadToCloudinary(backupUrl, p.name, i);
                            newImages.push(cloudUrl);
                        } else {
                            console.log(`   [DRY] Would secondary image: ${backupUrl}`);
                            newImages.push(backupUrl); // Placeholder for dry run
                        }
                    }
                }

                if (newImages.length !== currentImages.length) {
                    if (!DRY_RUN) {
                        p.images = newImages;
                        await p.save();
                        console.log(`   ✅ DB Updated: ${currentImages.length} -> ${newImages.length} images.\n`);
                    } else {
                        console.log(`   [DRY] Would update ${p.name} from ${currentImages.length} to ${newImages.length} images.\n`);
                    }
                    healedCount++;
                } else {
                    console.log(`   🔸 No new unique images discovered for ${p.name}.\n`);
                }
            } else {
                skippedCount++;
            }
        }

        console.log(`\n📊 Health Check Summary:`);
        console.log(`   - Products Healed: ${healedCount}`);
        console.log(`   - Products Unchanged/Skipped: ${skippedCount}`);

        process.exit(0);
    } catch (error) {
        console.error("\n❌ Critical Error:", error);
        process.exit(1);
    }
}

run();
