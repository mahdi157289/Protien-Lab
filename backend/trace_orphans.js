const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env
dotenv.config();

const Product = require('./models/Product');
const UPLOADS_DIR = path.join(__dirname, 'uploads', 'products');

async function trace() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const products = await Product.find({});
        const lonely = products.filter(p => p.images.length === 1);

        console.log(`🔍 Tracing ${lonely.length} products with only 1 image...`);

        const results = [];

        const allFiles = fs.readdirSync(UPLOADS_DIR);

        for (const p of lonely) {
            // Create a base slug pattern
            const baseSlug = p.name
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');

            // Find all files starting with this slug
            const matches = allFiles.filter(f => f.startsWith(baseSlug));
            
            // Filter out exact duplicates based on timestamp (keep unique indices if possible)
            // But for now, just list all found files
            const uniqueMatches = [...new Set(matches)];

            results.push({
                product: p.name,
                currentImages: p.images.length,
                foundInFolder: uniqueMatches.length,
                files: uniqueMatches.sort()
            });
        }

        // Print a nice table
        console.table(results.map(r => ({
            "Product": r.product,
            "DB": r.currentImages,
            "Folder Match": r.foundInFolder,
            "Example File": r.files[0] || 'NONE'
        })));

        // Output detailed JSON for the AI to read
        fs.writeFileSync('trace_results.json', JSON.stringify(results, null, 2));
        console.log('\n💾 Detailed results saved to trace_results.json');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

trace();
