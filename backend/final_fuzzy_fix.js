require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('./config/cloudinary');
const Product = require('./models/Product');

const REPAIR_JSON_PATH = path.join(__dirname, 'uploads', 'repaired_products_complete.json');

async function uploadToCloudinary(filePathOrUrl, folder = 'protienlab/products') {
    try {
        const res = await cloudinary.uploader.upload(filePathOrUrl, {
            folder: folder,
            resource_type: 'image',
            transformation: [{ quality: 'auto:best' }]
        });
        return res.secure_url;
    } catch (err) {
        console.error(`      ❌ Upload failed:`, err.message || err);
        return null;
    }
}

function cleanName(name) {
    if (!name) return '';
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find({ $where: "this.images.length === 1" });
        console.log(`🚀 Found ${products.length} products to fix fuzzy matching.`);

        if (!fs.existsSync(REPAIR_JSON_PATH)) throw new Error('Backup not found');
        const backupData = JSON.parse(fs.readFileSync(REPAIR_JSON_PATH, 'utf8'));
        const backupProducts = backupData.products;

        let fixedCount = 0;

        for (const p of products) {
            console.log(`\n🔍 Searching for: "${p.name}"`);
            const pClean = cleanName(p.name);
            
            // Try to find best match in backup
            let match = backupProducts.find(bp => cleanName(bp.title) === pClean);
            
            if (!match) {
                // Secondary check: partial match (contains)
                match = backupProducts.find(bp => {
                    const bpClean = cleanName(bp.title);
                    return bpClean.includes(pClean) || pClean.includes(bpClean);
                });
            }

            if (match && match.images.length > 1) {
                console.log(`   ✅ Found fuzzy match: "${match.title}" (${match.images.length} images)`);
                
                // Add missing images (skipping the first one as it's the primary we already have)
                const added = [];
                for (let i = 1; i < match.images.length; i++) {
                    const url = match.images[i];
                    // Skip if already exists (paranoia check)
                    if (!p.images.includes(url)) {
                        const cloudUrl = await uploadToCloudinary(url, 'protienlab/recovered');
                        if (cloudUrl) {
                            p.images.push(cloudUrl);
                            added.push(path.basename(url));
                        }
                    }
                }
                
                if (added.length > 0) {
                    await p.save();
                    console.log(`   ✨ Saved ${added.length} new photos!`);
                    fixedCount++;
                } else {
                    console.log(`   🤷 All backup photos already present or failed upload.`);
                }
            } else {
                console.log(`   ❌ No good backup match found for "${p.name}"`);
            }
        }

        console.log(`\n🏁 FINISHED. Fixed ${fixedCount} more products.`);
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
