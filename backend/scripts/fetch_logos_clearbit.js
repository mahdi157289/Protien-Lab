const axios = require('axios');
const fs = require('fs');
const path = require('path');

const LOGOS_DIR = path.join(__dirname, '..', 'temp_logos');

if (!fs.existsSync(LOGOS_DIR)) {
    fs.mkdirSync(LOGOS_DIR);
}

const brands = [
    { name: 'Luxury', domain: 'luxury-nutrition.com' },
    { name: 'Muscletech', domain: 'muscletech.com' },
    { name: 'Olimp', domain: 'olimpsport.com' },
    { name: 'Proactive', domain: 'proactive.eu' }, // Guess
    { name: 'Rule1', domain: 'ruleoneproteins.com' },
    { name: 'Scenit', domain: 'scenitnutrition.com' },
    { name: 'Worth It Nutrition', domain: 'worthitnutrition.com' }, // Guess
    { name: 'BioTechUSA', domain: 'biotechusa.com' },
    { name: 'Animal', domain: 'animalpak.com' },
    { name: 'Xtend', domain: 'officialxtend.com' },
    { name: 'Universal Nutrition', domain: 'universalnutrition.com' },
    { name: 'Yava Labs', domain: 'yavalabs.com' },
    { name: 'Longevity Plus', domain: 'longevityplus.com' },
    { name: 'Real Pharm', domain: 'realpharm.eu' },
    { name: 'Optimum Nutrition', domain: 'optimumnutrition.com' },
    { name: 'OstroVit', domain: 'ostrovit.com' },
    { name: 'Kong Nutrition', domain: 'kongnutrition.com' }, // Guess
    { name: 'Nutrex', domain: 'nutrex.com' },
    { name: 'Kevin Levrone', domain: 'levrosupplements.com' },
    { name: 'Insane Labz', domain: 'insanelabz.com' },
    { name: 'BPI Sports', domain: 'bpisports.com' }
];

async function downloadLogo(brand) {
    const filepath = path.join(LOGOS_DIR, `${brand.name}.png`);
    if (fs.existsSync(filepath)) {
        console.log(`✅ ${brand.name} already exists`);
        return;
    }

    const url = `https://logo.clearbit.com/${brand.domain}`;
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`✅ Downloaded ${brand.name} from ${brand.domain}`);
                resolve();
            });
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`❌ Failed to download ${brand.name} from ${brand.domain}: ${error.response ? error.response.status : error.message}`);
    }
}

async function main() {
    console.log('Starting logo downloads...');
    for (const brand of brands) {
        await downloadLogo(brand);
    }
    console.log('Done.');
}

main();
