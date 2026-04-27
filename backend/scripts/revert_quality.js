const fs = require('fs');
const path = require('path');
const shutil = require('fs-extra'); // Using fs-extra for easy copy if available, or fallback

const BASE_DIR = path.join(__dirname, '..');
const PRODUCTS_DIR = path.join(BASE_DIR, 'uploads', 'products');
const BACKUP_DIR = path.join(BASE_DIR, '..', 'backup_before_enhance');

async function revert() {
    console.log('🔄 Reverting background-removed photos to pre-enhanced state for better quality...');
    
    if (!fs.existsSync(BACKUP_DIR)) {
        console.error(`❌ Backup directory not found at: ${BACKUP_DIR}`);
        console.log('💡 Note: It seems the backup lived one level up from "backend" or in the root.');
        return;
    }

    const files = fs.readdirSync(BACKUP_DIR);
    let count = 0;

    const scanAndRevert = (dir) => {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const relPath = path.relative(BACKUP_DIR, fullPath);
            const destPath = path.join(PRODUCTS_DIR, relPath);

            if (fs.lstatSync(fullPath).isDirectory()) {
                scanAndRevert(fullPath);
            } else {
                if (fs.existsSync(destPath)) {
                    fs.copyFileSync(fullPath, destPath);
                    console.log(`✅ Reverted: ${relPath}`);
                    count++;
                }
            }
        }
    };

    try {
        scanAndRevert(BACKUP_DIR);
        console.log(`\n✨ Successfully reverted ${count} images to original quality.`);
        console.log('🚀 Next: Run `node scripts/sync_by_name.js` to re-upload these high-quality versions to Cloudinary.');
    } catch (err) {
        console.error('❌ Revert failed:', err.message);
    }
}

revert();
