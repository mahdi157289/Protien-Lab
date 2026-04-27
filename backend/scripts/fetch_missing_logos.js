const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const LOGOS_DIR = path.join(__dirname, '..', 'temp_logos');
if (!fs.existsSync(LOGOS_DIR)) fs.mkdirSync(LOGOS_DIR);

const brands = [
    { 
        name: 'BioTechUSA', 
        directUrls: [
            'https://shop.biotechusa.com/cdn/shop/files/BiotechUSA_logo_black_200x.png',
            'https://biotechusa.com/sites/all/themes/biotechusa/logo.png'
        ],
        pageUrl: 'https://shop.biotechusa.com/',
        selectors: ['.header__logo-image', 'img[alt*="BioTechUSA"]', 'img[src*="logo"]']
    },
    { 
        name: 'Yava Labs', 
        directUrls: [
            'https://yava-labs.com/wp-content/uploads/2021/06/Yava-Labs-Logo.png',
            'https://yava-labs.com/wp-content/uploads/2021/01/logo.png'
        ],
        pageUrl: 'https://yava-labs.com/',
        selectors: ['.custom-logo', 'img[alt*="Yava"]', 'img[src*="logo"]']
    },
    { 
        name: 'Kevin Levrone', 
        directUrls: [
            'https://levrosupplements.com/img/levrone-signature-series-logo-1563884803.jpg',
            'https://levrosupplements.com/img/logo.jpg'
        ],
        pageUrl: 'https://levrosupplements.com/gb/',
        selectors: ['#logo img', '.logo img', 'img[alt*="Levrone"]']
    }
];

const downloadImage = async (url, filepath) => {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (e) {
        throw new Error(`Failed to download from ${url}: ${e.message}`);
    }
};

const fetchMissingLogos = async () => {
    for (const brand of brands) {
        const filepath = path.join(LOGOS_DIR, `${brand.name}.png`);
        if (fs.existsSync(filepath)) {
            console.log(`${brand.name} already exists.`);
            continue;
        }

        let downloaded = false;

        // 1. Try direct URLs
        for (const url of brand.directUrls) {
            try {
                console.log(`Trying direct URL for ${brand.name}: ${url}`);
                await downloadImage(url, filepath);
                console.log(`✅ Downloaded ${brand.name} from direct URL`);
                downloaded = true;
                break;
            } catch (e) {
                console.log(`Failed direct URL: ${e.message}`);
            }
        }

        if (downloaded) continue;

        // 2. Scrape page
        console.log(`Scraping ${brand.pageUrl} for ${brand.name}...`);
        try {
            const res = await axios.get(brand.pageUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const $ = cheerio.load(res.data);
            
            let src = null;
            for (const selector of brand.selectors) {
                const el = $(selector);
                if (el.length > 0) {
                    src = el.attr('src') || el.attr('data-src');
                    if (src) {
                        console.log(`Found logo using selector: ${selector}`);
                        break;
                    }
                }
            }

            if (src) {
                 // Handle relative URLs
                 if (src.startsWith('//')) src = 'https:' + src;
                 if (src.startsWith('/')) {
                     const origin = new URL(brand.pageUrl).origin;
                     src = origin + src;
                 }
                 
                 console.log(`Downloading from scraped URL: ${src}`);
                 await downloadImage(src, filepath);
                 console.log(`✅ Downloaded ${brand.name}`);
            } else {
                console.log(`⚠️ No logo found for ${brand.name} via scraping`);
            }

        } catch (e) {
            console.error(`Failed to scrape ${brand.name}:`, e.message);
        }
    }
};

fetchMissingLogos();
