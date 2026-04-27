require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('./models/Product');

const REPAIR_JSON_PATH = path.join(__dirname, 'uploads', 'repaired_products_complete copy.json');

function cleanName(name) {
    if (!name) return '';
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        const products = await Product.find({});
        
        const backupData = JSON.parse(fs.readFileSync(REPAIR_JSON_PATH, 'utf8'));
        const backupProducts = backupData.products;

        console.log(`Checking which products were NOT matched...`);
        let missingProducts = [];

        for (const p of products) {
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

            if (!match || !match.images || match.images.length === 0) {
                missingProducts.push(p.name);
            }
        }

        console.log(`\nFound ${missingProducts.length} products that were skipped (not found in backup or had no images in backup):`);
        missingProducts.forEach((name, i) => console.log(`${i + 1}. ${name}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
