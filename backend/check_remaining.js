require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const Product = require('./models/Product');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find({});
        
        // Load Backup for comparison
        const backupPath = path.join(__dirname, 'uploads', 'repaired_products_complete.json');
        let backupTitles = [];
        if (require('fs').existsSync(backupPath)) {
            const data = JSON.parse(require('fs').readFileSync(backupPath, 'utf8'));
            backupTitles = data.products.map(p => p.title);
        }
        
        const stats = {
            total: products.length,
            withMultipleImages: 0,
            singleImage: 0,
            noImages: 0,
            cloudUrls: 0,
            localUrls: 0
        };

        const poorlyNamed = [];

        const unmatched = [];
        products.forEach(p => {
            if (p.images.length > 1) stats.withMultipleImages++;
            else if (p.images.length === 1) stats.singleImage++;
            else stats.noImages++;

            // Slugify helper
            const slugify = (t) => t ? t.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '') : '';
            const pSlug = slugify(p.name);
            const foundInBackup = backupTitles.some(bt => slugify(bt) === pSlug);
            
            if (!foundInBackup && p.images.length === 1) {
                unmatched.push(p.name);
            }

            p.images.forEach(img => {
                if (img.includes('cloudinary.com')) stats.cloudUrls++;
                else stats.localUrls++;
            });
        });

        console.log('📊 CURRENT DATABASE STATS:');
        console.log(JSON.stringify(stats, null, 2));
        
        if (unmatched.length > 0) {
            console.log('\n❌ PRODUCTS NOT IN BACKUP (Need Manual Match):');
            console.log(unmatched.slice(0, 10).join(', ') + (unmatched.length > 10 ? ` ...and ${unmatched.length - 10} more` : ''));
            console.log('\n💡 Tip: These might just have slightly different names in the backup.');
        }

        const lonely = products.filter(p => p.images.length === 1).map(p => p.name);
        console.log(`\n🔎 Total products with only 1 image: ${lonely.length}`);
        if (lonely.length > 0) {
            console.log('\n📋 LIST OF REMAINING PRODUCTS:');
            lonely.forEach(name => console.log(` - ${name}`));
        }
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
}

check();
