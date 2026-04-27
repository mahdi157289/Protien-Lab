require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const Product = require('../models/Product');

// Paths relative to backend directory
const BACKUP_ENHANCE_DIR = path.join(__dirname, '..', '..', 'backup_before_enhance');
const PRODUCTS_DIR       = path.join(__dirname, '..', 'uploads', 'products');
const REPAIR_JSON_PATH   = path.join(__dirname, '..', 'uploads', 'repaired_products_complete.json');

const DRY_RUN = process.argv.includes('--dry-run');

// --- HELPERS ---
function slugify(text) {
    if (!text) return '';
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

async function uploadToCloudinary(filePathOrUrl, folder = 'protienlab/products') {
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

// --- STEP 1: REVERT QUALITY ---
function revertQuality() {
    console.log('\n🔄 STEP 1: Reverting to pre-enhanced originals for better quality...');
    if (!fs.existsSync(BACKUP_ENHANCE_DIR)) {
        console.log(`⚠️  Skipping: Backup directory not found at ${BACKUP_ENHANCE_DIR}`);
        return;
    }

    let count = 0;
    const walk = (dir) => {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const src = path.join(dir, item);
            const rel = path.relative(BACKUP_ENHANCE_DIR, src);
            const dest = path.join(PRODUCTS_DIR, rel);

            if (fs.lstatSync(src).isDirectory()) {
                if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
                walk(src);
            } else {
                if (fs.existsSync(dest)) {
                    if (!DRY_RUN) fs.copyFileSync(src, dest);
                    count++;
                }
            }
        }
    };
    walk(BACKUP_ENHANCE_DIR);
    console.log(`✅ ${DRY_RUN ? '[DRY]' : ''} Reverted ${count} files to original quality.`);
}

// --- STEP 2 & 3: HEAL & SYNC ---
async function healAndSync() {
    console.log('\n🩹 STEP 2 & 3: Restoring missing photos & syncing to Cloudinary...');
    
    if (!fs.existsSync(REPAIR_JSON_PATH)) {
        throw new Error(`Backup manifest not found at ${REPAIR_JSON_PATH}`);
    }

    const backupData = JSON.parse(fs.readFileSync(REPAIR_JSON_PATH, 'utf8'));
    const backupProducts = backupData.products;

    await mongoose.connect(process.env.MONGO_URI);
    const dbProducts = await Product.find();
    const localFiles = fs.readdirSync(PRODUCTS_DIR).filter(f => f !== '.gitkeep');

    let healedCount = 0;
    let syncedCount = 0;

    for (const p of dbProducts) {
        const slug = slugify(p.name);
        const matches = localFiles.filter(f => f.toLowerCase().startsWith(slug + '-'));
        
        console.log(`📦 Processing "${p.name}"...`);

        // 1. Sync local "enhanced/reverted" files to index 0 (Primary)
        if (matches.length > 0) {
            // Logic to find newest set (similar to sync_by_name.js)
            const groupings = {};
            matches.forEach(f => {
                const tsMatch = f.match(/-(\d{13})-\d+\./);
                if (tsMatch) {
                    const ts = tsMatch[1];
                    if (!groupings[ts]) groupings[ts] = [];
                    groupings[ts].push(f);
                }
            });
            const latestTs = Object.keys(groupings).sort((a,b) => b-a)[0];
            if (latestTs) {
                const setFiles = groupings[latestTs].sort((a,b) => {
                    const idxA = parseInt(a.match(/-(\d+)\./)[1]);
                    const idxB = parseInt(b.match(/-(\d+)\./)[1]);
                    return idxA - idxB;
                });

                if (!DRY_RUN) {
                    const newCloudUrls = [];
                    for (const f of setFiles) {
                        const url = await uploadToCloudinary(path.join(PRODUCTS_DIR, f));
                        if (url) newCloudUrls.push(url);
                    }
                    if (newCloudUrls.length > 0) {
                        // Preserve existing secondary images that are NOT from Cloudinary or from recovery
                        const secondaries = p.images.slice(newCloudUrls.length).filter(img => !img.includes('protienlab/products'));
                        p.images = [...newCloudUrls, ...secondaries];
                        syncedCount++;
                    }
                } else {
                    console.log(`   [DRY] Would sync ${setFiles.length} local files as primary/secondary.`);
                }
            }
        }

        // 2. Heal from backup manifest (Restores lost secondary images)
        const backupP = backupProducts.find(bp => slugify(bp.title) === slug);
        if (backupP) {
            const backupImages = backupP.images || [];
            if (backupImages.length > p.images.length) {
                console.log(`   🩹 Adding ${backupImages.length - p.images.length} missing photos from backup.`);
                for (let i = 1; i < backupImages.length; i++) {
                    const bUrl = backupImages[i];
                    const exists = p.images.some(img => img.includes(bUrl.split('/').pop().split('.')[0]));
                    if (!exists) {
                        if (!DRY_RUN) {
                            const cloud = await uploadToCloudinary(bUrl, 'protienlab/products/recovered');
                            if (cloud) p.images.push(cloud);
                        } else {
                            console.log(`   [DRY] Would recover missing image: ${bUrl}`);
                        }
                    }
                }
                healedCount++;
            }
        }

        if (!DRY_RUN) await p.save();
    }

    console.log(`\n📊 SUMMARY:`);
    console.log(`   - Quality Updated for: ${syncedCount} products`);
    console.log(`   - Missing Photos Restored for: ${healedCount} products`);
}

async function main() {
    try {
        console.log(`\n🚀 FULL RECOVERY SCRIPT ${DRY_RUN ? '(DRY RUN)' : ''} 🚀`);
        revertQuality();
        await healAndSync();
        console.log('\n✅ ALL STEPS COMPLETED!');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ FATAL ERROR:', err.message);
        process.exit(1);
    }
}

main();
