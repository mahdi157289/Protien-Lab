const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const LOGOS_DIR = path.join(__dirname, '..', 'temp_logos');
if (!fs.existsSync(LOGOS_DIR)) fs.mkdirSync(LOGOS_DIR);

const brands = [
    'Luxury', 'Muscletech', 'Olimp', 'Proactive', 'Rule1', 'Scenit', 
    'Worth It Nutrition', 'BioTechUSA', 'Animal', 'Xtend', 'Universal Nutrition', 
    'Yava Labs', 'Longevity Plus', 'Real Pharm', 'Optimum Nutrition', 
    'OstroVit', 'Kong Nutrition', 'Nutrex', 'Kevin Levrone', 'Insane Labz', 
    'BPI Sports'
];

const downloadImage = async (url, filepath) => {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            timeout: 15000
        });
        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (e) {
        throw new Error(`Failed download: ${e.message}`);
    }
};

(async () => {
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    for (const brand of brands) {
        try {
            console.log(`Searching for ${brand}...`);
            // Bing Search
            const query = `${brand} supplements logo official`;
            const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&first=1`;
            
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            
            // Wait for images
            try {
                // Bing image tiles usually have class 'mimg' or are inside 'iusc'
                await page.waitForSelector('.mimg', { timeout: 5000 });
            } catch (e) {
                console.log(`Timeout waiting for selector for ${brand}`);
                continue;
            }

            const imageUrl = await page.evaluate(() => {
                // Bing stores metadata in 'm' attribute of 'a.iusc'
                const elements = document.querySelectorAll('a.iusc');
                for (const el of elements) {
                    try {
                        const m = JSON.parse(el.getAttribute('m'));
                        if (m.murl) return m.murl; // murl is the direct image url
                    } catch (e) {}
                }
                return null;
            });

            if (imageUrl) {
                console.log(`Found URL for ${brand}: ${imageUrl}`);
                
                let ext = path.extname(imageUrl).split('?')[0].toLowerCase();
                if (!ext || ext.length > 5 || ext === '.php') ext = '.jpg';
                
                // Ensure extension matches content if possible, but for now trust URL
                if (imageUrl.includes('png')) ext = '.png';
                if (imageUrl.includes('svg')) ext = '.svg';
                
                const filepath = path.join(LOGOS_DIR, `${brand.replace(/ /g, '_')}${ext}`);
                
                try {
                    await downloadImage(imageUrl, filepath);
                    console.log(`✅ Downloaded ${brand}`);
                } catch (e) {
                    console.error(`❌ Failed to download ${brand}: ${e.message}`);
                }
            } else {
                console.log(`❌ No image found for ${brand}`);
            }

        } catch (e) {
            console.error(`Error processing ${brand}:`, e.message);
        }
        
        // Brief pause
        await new Promise(r => setTimeout(r, 1000));
    }

    await browser.close();
    console.log('Done.');
})();
