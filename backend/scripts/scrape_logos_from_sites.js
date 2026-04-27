const axios = require('axios');
const fs = require('fs');
const path = require('path');
const url = require('url');

const LOGOS_DIR = path.join(__dirname, '..', 'temp_logos');
if (!fs.existsSync(LOGOS_DIR)) fs.mkdirSync(LOGOS_DIR);

const brands = [
    { name: 'Luxury', url: 'https://luxury-nutrition.com' },
    { name: 'Muscletech', url: 'https://www.muscletech.com' },
    { name: 'Olimp', url: 'https://olimpsport.com/eu' },
    { name: 'Proactive', url: 'https://www.proactivenutrition.net' }, 
    { name: 'Rule1', url: 'https://www.ruleoneproteins.com' },
    { name: 'Scenit', url: 'https://www.scenitnutrition.com' },
    { name: 'Worth It Nutrition', url: 'https://worthynutrition.com' }, // Maybe wrong but worth a try
    { name: 'BioTechUSA', url: 'https://biotechusa.com' },
    { name: 'Animal', url: 'https://www.animalpak.com' },
    { name: 'Xtend', url: 'https://cellucor.com/pages/xtend' },
    { name: 'Universal Nutrition', url: 'https://www.universalnutrition.com' },
    { name: 'Yava Labs', url: 'https://yavalabs.com' },
    { name: 'Longevity Plus', url: 'https://www.longevityplus.com' },
    { name: 'Real Pharm', url: 'https://realpharm.eu' },
    { name: 'Optimum Nutrition', url: 'https://www.optimumnutrition.com' },
    { name: 'OstroVit', url: 'https://ostrovit.com' },
    { name: 'Kong Nutrition', url: 'https://kingkongproductsstore.com' }, // Maybe?
    { name: 'Nutrex', url: 'https://www.nutrex.com' },
    { name: 'Kevin Levrone', url: 'https://levrosupplements.com' },
    { name: 'Insane Labz', url: 'https://insanelabz.com' },
    { name: 'BPI Sports', url: 'https://bpisports.com' }
];

async function findLogoUrl(html, baseUrl) {
    // Look for og:image
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (ogImageMatch) return new url.URL(ogImageMatch[1], baseUrl).href;

    // Look for img with 'logo' in src or class or id
    // <img src="..." ... class="...logo..." ...>
    const imgMatches = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
    if (imgMatches) {
        for (const imgTag of imgMatches) {
            if (imgTag.toLowerCase().includes('logo')) {
                const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
                if (srcMatch) {
                    return new url.URL(srcMatch[1], baseUrl).href;
                }
            }
        }
    }
    return null;
}

async function downloadLogo(brand) {
    const filepath = path.join(LOGOS_DIR, `${brand.name}.png`); // Always save as png, even if source is jpg/webp (we'll rename if needed or just let it be)
    // Actually, we should respect extension or convert.
    // For simplicity, we'll keep the extension from URL.
    
    if (fs.existsSync(filepath) || fs.existsSync(filepath.replace('.png', '.jpg')) || fs.existsSync(filepath.replace('.png', '.webp'))) {
        console.log(`✅ ${brand.name} already exists`);
        return;
    }

    try {
        console.log(`Fetching ${brand.url}...`);
        const res = await axios.get(brand.url, { 
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
            timeout: 10000
        });
        
        const logoUrl = await findLogoUrl(res.data, brand.url);
        if (logoUrl) {
            console.log(`Found logo for ${brand.name}: ${logoUrl}`);
            const ext = path.extname(new url.URL(logoUrl).pathname) || '.png';
            const finalPath = path.join(LOGOS_DIR, `${brand.name}${ext}`);
            
            const imgRes = await axios({
                url: logoUrl,
                method: 'GET',
                responseType: 'stream',
                timeout: 10000
            });
            
            const writer = fs.createWriteStream(finalPath);
            imgRes.data.pipe(writer);
            
            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    console.log(`✅ Downloaded ${brand.name}`);
                    resolve();
                });
                writer.on('error', reject);
            });
        } else {
            console.warn(`⚠️ No logo found for ${brand.name}`);
        }
    } catch (e) {
        console.error(`❌ Error fetching ${brand.name}: ${e.message}`);
    }
}

async function main() {
    for (const brand of brands) {
        await downloadLogo(brand);
    }
}

main();
