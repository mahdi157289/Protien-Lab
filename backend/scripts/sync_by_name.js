const mongoose = require('mongoose');
require('dotenv').config();
const cloudinary = require('../config/cloudinary');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

const PRODUCTS_DIR = path.join(__dirname, '..', 'uploads', 'products');
const DRY_RUN = process.argv.includes('--dry-run');

// Helper to slugify a string according to our naming convention
function slugify(text) {
    if (!text) return '';
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

async function run() {
    try {
        console.log(`\n🚀 ${DRY_RUN ? 'DRY RUN' : 'LIVE RUN'}: Syncing local enhanced images to Cloudinary...\n`);
        
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find();
        const localFiles = fs.readdirSync(PRODUCTS_DIR).filter(f => f !== '.gitkeep');

        console.log(`📦 Found ${products.length} products in DB.`);
        console.log(`📂 Found ${localFiles.length} files in local uploads/products.\n`);

        let matchedCount = 0;
        let updatedCount = 0;

        for (const p of products) {
            const slug = slugify(p.name);
            if (!slug) continue;

            // Find all files that start with this slug
            const matches = localFiles.filter(f => f.toLowerCase().startsWith(slug + '-'));
            
            if (matches.length > 0) {
                // Group by timestamp (the numeric part between the slug and index)
                // Format: slug-timestamp-index.ext
                const groupings = {};
                matches.forEach(f => {
                    const parts = f.split('-');
                    // The thumb/index is usually the last part before extension
                    // The timestamp is usually the part before the last part
                    // Example: creatine-monohydrate-biotech-usa-300gr-1769484740854-0.png
                    // We look for the 13-digit timestamp
                    const tsMatch = f.match(/-(\d{13})-\d+\./);
                    if (tsMatch) {
                        const ts = tsMatch[1];
                        if (!groupings[ts]) groupings[ts] = [];
                        groupings[ts].push(f);
                    }
                });

                const timestamps = Object.keys(groupings).sort((a, b) => b - a); // Newest first
                if (timestamps.length === 0) {
                    // Fallback for different naming if any
                    continue;
                }

                const newestTs = timestamps[0];
                const setFiles = groupings[newestTs].sort((a, b) => {
                    const idxA = parseInt(a.match(/-(\d+)\./)[1]);
                    const idxB = parseInt(b.match(/-(\d+)\./)[1]);
                    return idxA - idxB;
                });

                matchedCount++;
                console.log(`🔍 Match Found: "${p.name}"`);
                console.log(`   Slug: ${slug}`);
                console.log(`   Latest Set (${newestTs}): ${setFiles.join(', ')}`);

                if (!DRY_RUN) {
                    const newImages = [];
                    for (const localFile of setFiles) {
                        const localPath = path.join(PRODUCTS_DIR, localFile);
                        console.log(`   🚀 Uploading ${localFile}...`);
                        
                        try {
                            const uploadRes = await cloudinary.uploader.upload(localPath, {
                                folder: 'protienlab/products',
                                resource_type: 'image',
                                transformation: [
                                    { width: 1600, height: 1600, crop: 'limit' },
                                    { quality: 'auto:best' }
                                ]
                            });
                            newImages.push(uploadRes.secure_url);
                        } catch (err) {
                            console.error(`      ❌ Upload failed for ${localFile}:`, err.message);
                        }
                    }

                    if (newImages.length > 0) {
                        // Non-destructive update: Merge new images with existing secondary images
                        // that are not from Cloudinary (e.g., recovered/certification URLs)
                        const existingSecondaries = p.images.slice(newImages.length).filter(img => 
                            !img.includes('protienlab/products') // Keep if not already an 'optimized' product photo
                        );
                        
                        p.images = [...newImages, ...existingSecondaries];
                        await p.save();
                        updatedCount++;
                        console.log(`   ✅ DB Updated with ${newImages.length} new images (Total: ${p.images.length}).\n`);
                    }
                    // Small delay to respect upload API (though it's much more generous)
                    await new Promise(r => setTimeout(r, 500));
                }
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   - Products Matched Locally: ${matchedCount}`);
        console.log(`   - Products Updated in DB: ${updatedCount}`);
        
        if (DRY_RUN) {
            console.log(`\n💡 This was a DRY RUN. No files were uploaded or database records changed.`);
            console.log(`   Run with 'node scripts/sync_by_name.js' (without --dry-run) to perform live sync.`);
        }

        process.exit(0);
    } catch (error) {
        console.error("\n❌ Critical Error:", error);
        process.exit(1);
    }
}

run();
