const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const UPLOADS_DIR = path.join(__dirname, '../uploads/photos');
const MONGO_URI = process.env.MONGO_URI;

// Brands to restore (11 missing brands)
// Using array of candidate URLs for robustness
const brandsToRestore = [
    {
        name: 'BioTechUSA',
        urls: [
            'https://upload.wikimedia.org/wikipedia/commons/7/77/BioTechUSA_logo.svg',
            'https://biotechusa.hu/sites/all/themes/biotech/logo.png'
        ]
    },
    {
        name: 'Kong Nutrition',
        urls: [
            'https://kongnutrition.in/wp-content/uploads/2020/09/logo.png',
            'https://kongnutrition.in/wp-content/themes/kong/images/logo.png'
        ]
    },
    {
        name: 'Longevity Plus',
        urls: [
            'https://www.longevityplus.com/wp-content/uploads/2019/10/Longevity-Plus-Logo.png'
        ]
    },
    {
        name: 'Luxury',
        urls: [
            'https://luxury-nutrition.com/wp-content/uploads/2020/06/logo-1.png',
            'https://luxury-nutrition.com/wp-content/themes/luxury/images/logo.png'
        ]
    },
    {
        name: 'Muscletech',
        urls: [
            'https://logos-world.net/wp-content/uploads/2023/05/MuscleTech-Logo.png',
            'https://www.muscletech.com/wp-content/themes/muscletech/assets/images/logo.png'
        ]
    },
    {
        name: 'Nutrex',
        urls: [
            'https://www.stack3d.com/wp-content/uploads/2017/01/nutrexlogo.jpg',
            'https://www.nutrex.com/wp-content/uploads/2020/01/logo.png'
        ]
    },
    {
        name: 'Olimp',
        urls: [
            'https://olimpsport.com/media/logo/default/logo_olimp_sport_nutrition.png'
        ]
    },
    {
        name: 'OstroVit',
        urls: [
            'https://sklep.ostrovit.com/data/gfx/mask_01.png',
            'https://ostrovit.com/skins/user/rwd_shoper_26/images/logo.png'
        ]
    },
    {
        name: 'Proactive',
        urls: [
            'https://proactivenutra.com/wp-content/uploads/2018/01/ProActive-Nutra-Logo-1.png',
            'https://proactivenutra.com/wp-content/uploads/2020/01/logo.png'
        ]
    },
    {
        name: 'Scenit',
        urls: [
            'https://www.scenitnutrition.com/img/scenit-nutrition-logo-1563810058.jpg',
            'https://www.scenitnutrition.com/themes/scenit/img/logo.png'
        ]
    },
    {
        name: 'Worth It Nutrition',
        urls: [
            'https://winlaboratories.com/wp-content/uploads/2021/06/WIN-Logo.png',
            'https://winlaboratories.com/assets/img/logo.png'
        ]
    }
];

const PhotoSchema = new mongoose.Schema({
    filename: String,
    url: String,
    category: String,
    brandName: String,
    isActive: Boolean,
    uploadDate: Date
});

const Photo = mongoose.model('Photo', PhotoSchema);

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function downloadImage(urls, filename) {
    for (const url of urls) {
        try {
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'stream',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Referer': new URL(url).origin
                },
                timeout: 10000
            });

            const filePath = path.join(UPLOADS_DIR, filename);
            const writer = fs.createWriteStream(filePath);

            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
        } catch (error) {
            console.log(`Failed to download from ${url}: ${error.message}. Trying next...`);
        }
    }
    throw new Error('All URLs failed');
}

const TEMP_LOGOS_DIR = path.join(__dirname, '../temp_logos');

async function restoreBrands() {
    console.log('Starting restoreBrands...');
    try {
        console.log('Connecting to MongoDB...', MONGO_URI ? MONGO_URI.substring(0, 20) : 'No URI');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        for (const brand of brandsToRestore) {
            console.log(`Processing ${brand.name}...`);
            
            // Check if brand already exists (double check)
            const exists = await Photo.findOne({ category: 'Nos Marque', brandName: brand.name });
            if (exists) {
                console.log(`Brand ${brand.name} already exists. Skipping.`);
                continue;
            }

            let filename = `brand-${Date.now()}-${brand.name.replace(/\s+/g, '_')}.png`;
            let success = false;

            // 1. Try Downloading
            try {
                await downloadImage(brand.urls, filename);
                console.log(`Downloaded image for ${brand.name}`);
                success = true;
            } catch (err) {
                console.error(`Failed to download new image for ${brand.name}:`, err.message);
            }

            // 2. Fallback to temp_logos if download failed
            if (!success) {
                console.log(`Attempting fallback to temp_logos for ${brand.name}...`);
                // Map brand name to likely temp filename
                // temp_logos uses underscores for spaces, and exact name match usually
                const tempNameBase = brand.name.replace(/\s+/g, '_');
                // Check extensions
                const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
                let tempFile = null;
                
                for (const ext of extensions) {
                    const testPath = path.join(TEMP_LOGOS_DIR, tempNameBase + ext);
                    if (fs.existsSync(testPath)) {
                        tempFile = testPath;
                        filename = `brand-${Date.now()}-${brand.name.replace(/\s+/g, '_')}${ext}`; // Keep extension
                        break;
                    }
                }

                if (tempFile) {
                    try {
                        fs.copyFileSync(tempFile, path.join(UPLOADS_DIR, filename));
                        console.log(`Restored original logo from temp_logos for ${brand.name}`);
                        success = true;
                    } catch (e) {
                        console.error(`Failed to copy temp logo: ${e.message}`);
                    }
                } else {
                    console.error(`No temp logo found for ${brand.name}`);
                }
            }

            if (success) {
                const photo = new Photo({
                    filename: filename,
                    url: `/uploads/photos/${filename}`,
                    category: 'Nos Marque',
                    brandName: brand.name,
                    isActive: true,
                    uploadDate: new Date()
                });

                await photo.save();
                console.log(`Saved ${brand.name} to database.`);
            } else {
                console.error(`Could not restore ${brand.name} (neither download nor fallback worked).`);
            }
        }

    } catch (error) {
        console.error('Script error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

restoreBrands();
