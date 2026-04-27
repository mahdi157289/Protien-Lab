const mongoose = require('mongoose');
require('dotenv').config();
const cloudinary = require('./config/cloudinary');
const Product = require('./models/Product');
const fs = require('fs');
const path = require('path');

const PRODUCTS_DIR = path.join(__dirname, 'uploads', 'products');
// Get all local files we have available
const localFiles = fs.readdirSync(PRODUCTS_DIR).filter(f => f !== '.gitkeep');

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find();

        console.log(`\n📦 Checking ${products.length} products to sync enhanced images...`);
        let syncedCount = 0;

        for (const p of products) {
            let changed = false;
            const newImages = [];

            for (const imgUrl of p.images) {
                if (imgUrl.includes('cloudinary.com')) {
                    const match = imgUrl.match(/\/v\d+\/(.*)\.[^.]+$/);
                    if (!match) {
                        newImages.push(imgUrl);
                        continue;
                    }
                    
                    const publicId = decodeURIComponent(match[1]);
                    
                    try {
                        // 1. Fetch metadata from Cloudinary to find the original local filename
                        const res = await cloudinary.api.resource(publicId);
                        const origName = res.original_filename;
                        
                        // 2. Find the local file in our uploads folder that matches this name
                        const localFile = localFiles.find(f => {
                            const parsed = path.parse(f);
                            return parsed.name === origName || f === origName || parsed.name === origName.replace(/\..+$/, '');
                        });

                        if (localFile) {
                            const localPath = path.join(PRODUCTS_DIR, localFile);
                            console.log(`  🚀 Uploading newly enhanced file: ${localFile}`);
                            
                            // 3. Upload the new local file (which has background removed & enhanced)
                            const uploadRes = await cloudinary.uploader.upload(localPath, {
                                folder: 'protienlab/products',
                                resource_type: 'image',
                                transformation: [
                                    { width: 1600, height: 1600, crop: 'limit' },
                                    { quality: 'auto' }
                                ]
                            });

                            newImages.push(uploadRes.secure_url);
                            changed = true;
                        } else {
                            // No exact local match found, keeping old Cloudinary image
                            newImages.push(imgUrl);
                        }
                    } catch (e) {
                        console.log(`   ⚠️ Could not fetch metadata for ${publicId}. Keeping old URL.`);
                        newImages.push(imgUrl);
                    }
                    
                    // Respect Cloudinary API rate limits
                    await sleep(300);
                } else {
                    newImages.push(imgUrl);
                }
            }

            if (changed) {
                p.images = newImages;
                await p.save();
                syncedCount++;
                console.log(`✅ Synced Product: ${p.name}\n`);
            }
        }
        
        console.log(`\n🎉 All done! Successfully synced and updated ${syncedCount} products on the site.`);
        process.exit(0);
    } catch (error) {
        console.error("Critical Error:", error);
        process.exit(1);
    }
}

run();
