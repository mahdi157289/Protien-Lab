const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI = 'mongodb+srv://baccarmahdi09:QGOXemXdJ5CigQ09@cluster0.ygb4b3i.mongodb.net/nutrition_store?retryWrites=true&w=majority&appName=Cluster0&tls=true&ssl=true';

const LOGOS_DIR = path.join(__dirname, '../temp_logos');
const UPLOADS_DIR = path.join(__dirname, '../uploads/photos');

// Ensure uploads dir exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const photoSchema = new mongoose.Schema({
    filename: String,
    url: String,
    category: String,
    brandName: String,
    isActive: Boolean,
    uploadDate: Date
}, { strict: false });

const Photo = mongoose.model('Photo', photoSchema);

async function restoreBrands() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('🔌 Connected to MongoDB.');

        // 1. Get files from temp_logos
        const files = fs.readdirSync(LOGOS_DIR).filter(f => /\.(jpg|jpeg|png|webp|svg)$/i.test(f));
        console.log(`📂 Found ${files.length} brand logos in temp_logos.`);

        // 2. Check existing brands to avoid duplicates (optional, but good practice)
        const existingBrands = await Photo.find({ category: 'Nos Marque' });
        const existingNames = new Set(existingBrands.map(b => b.brandName?.toLowerCase()));

        let restoredCount = 0;

        for (const file of files) {
            const brandNameRaw = path.parse(file).name;
            const brandName = brandNameRaw.replace(/_/g, ' ');

            if (existingNames.has(brandName.toLowerCase())) {
                console.log(`⏩ Skipping ${brandName} (already exists).`);
                continue;
            }

            // 3. Copy file to uploads/photos
            const ext = path.extname(file);
            const newFilename = `brand-${Date.now()}-${brandNameRaw}${ext}`;
            const destPath = path.join(UPLOADS_DIR, newFilename);

            fs.copyFileSync(path.join(LOGOS_DIR, file), destPath);

            // 4. Insert into DB
            const photo = new Photo({
                filename: newFilename,
                url: `/uploads/photos/${newFilename}`,
                category: 'Nos Marque',
                brandName: brandName,
                isActive: true,
                uploadDate: new Date()
            });

            await photo.save();
            console.log(`✅ Restored brand: ${brandName}`);
            restoredCount++;
        }

        console.log(`🎉 Restored ${restoredCount} brands.`);

    } catch (error) {
        console.error('❌ Error restoring brands:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected.');
    }
}

restoreBrands();
