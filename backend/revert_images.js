require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('./config/cloudinary');
const Product = require('./models/Product');

const REPAIR_JSON_PATH = path.join(__dirname, 'uploads', 'repaired_products_complete copy.json');

async function uploadToCloudinary(filePathOrUrl, folder = 'protienlab/recovered_originals') {
    try {
        const res = await cloudinary.uploader.upload(filePathOrUrl, {
            folder: folder,
            resource_type: 'image',
            transformation: [{ quality: 'auto:best' }]
        });
        return res.secure_url;
    } catch (err) {
        console.error(`      ❌ Upload failed for ${filePathOrUrl}:`, err.message || err);
        return null;
    }
}

function cleanName(name) {
    if (!name) return '';
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        const products = await Product.find({});
        console.log(`🚀 Found ${products.length} products to revert images.`);

        if (!fs.existsSync(REPAIR_JSON_PATH)) {
            console.error('Backup not found at:', REPAIR_JSON_PATH);
            process.exit(1);
        }

        const backupData = JSON.parse(fs.readFileSync(REPAIR_JSON_PATH, 'utf8'));
        const backupProducts = backupData.products;

        let revertedCount = 0;

        for (const p of products) {
            console.log(`\n🔍 Searching backup for: "${p.name}"`);
            const pClean = cleanName(p.name);
            
            // Try to find exact match in backup
            let match = backupProducts.find(bp => cleanName(bp.title) === pClean);
            
            if (!match) {
                // Secondary check: partial match (contains)
                match = backupProducts.find(bp => {
                    const bpClean = cleanName(bp.title);
                    return bpClean.includes(pClean) || pClean.includes(bpClean);
                });
            }

            if (match && match.images && match.images.length > 0) {
                console.log(`   ✅ Found match: "${match.title}" with ${match.images.length} original images.`);
                
                const newImages = [];
                for (const url of match.images) {
                    console.log(`      Uploading original image: ${url}`);
                    const cloudUrl = await uploadToCloudinary(url, 'protienlab/recovered_originals');
                    if (cloudUrl) {
                        newImages.push(cloudUrl);
                    }
                }
                
                if (newImages.length > 0) {
                    p.images = newImages; // Replace entirely to remove any modified images
                    await p.save();
                    console.log(`   ✨ Reverted product to ${newImages.length} original photos!`);
                    revertedCount++;
                } else {
                    console.log(`   🤷 Failed to upload any original photos for this product.`);
                }
            } else {
                console.log(`   ❌ No backup match found or backup has no images for "${p.name}"`);
            }
        }

        console.log(`\n🏁 FINISHED. Reverted images for ${revertedCount} products.`);
        process.exit(0);

    } catch (err) {
        console.error('Fatal Error:', err);
        process.exit(1);
    }
}

run();
