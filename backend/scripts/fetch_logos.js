const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const axios = require('axios');

const brands = [
    'Luxury',
    'Muscletech',
    'Olimp',
    'Proactive',
    'Rule1',
    'Scenit',
    'Worth It Nutrition',
    'BioTechUSA',
    'Animal',
    'Xtend',
    'Universal Nutrition',
    'Yava Labs',
    'Longevity Plus',
    'Real Pharm',
    'Optimum Nutrition',
    'OstroVit',
    'Kong Nutrition',
    'Nutrex',
    'Kevin Levrone',
    'Insane Labz',
    'BPI Sports'
];

const downloadImage = async (url, filepath) => {
    const writer = fs.createWriteStream(filepath);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
};

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Set user agent to avoid being blocked
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    for (const brand of brands) {
        try {
            console.log(`Searching for ${brand}...`);
            const query = `${brand} nutrition logo filetype:png transparent`;
            await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`, { waitUntil: 'networkidle2' });

            // Wait for images to load
            await page.waitForSelector('div[data-id] img');

            // Click the first image to expand it (to get high res)
            // Google images structure is complex. We'll try to find the first image result container.
            // Often it's an 'h3' inside a div, or we just click the first img in the main grid.
            const firstImage = await page.$('div[data-id] img');
            if (firstImage) {
                await firstImage.click();
                
                // Wait for the high-res image to appear in the side panel
                // This selector is tricky and changes. 
                // We'll try to find an img with 'src' starting with http (not data:) and large width
                // OR we just grab the thumbnail if that fails.
                
                // Let's just grab the src of the first result for simplicity and speed, 
                // even if it's base64 or thumbnail, it's often enough for a logo.
                // BETTER: DuckDuckGo is easier.
            }
        } catch (e) {
            console.error(`Error searching google for ${brand}:`, e.message);
        }
    }
    await browser.close();
})();

// Re-writing with DuckDuckGo for easier scraping
const fetchWithDuckDuckGo = async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    for (const brand of brands) {
        const filepath = path.join(__dirname, '..', 'temp_logos', `${brand.replace(/ /g, '_')}.png`);
        if (fs.existsSync(filepath)) {
            console.log(`${brand} already exists.`);
            continue;
        }

        try {
            console.log(`Searching for ${brand}...`);
            const query = `${brand} nutrition logo png`;
            await page.goto(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&tbm=isch&iax=images&ia=images`, { waitUntil: 'networkidle2' });

            // Wait for image tiles
            await page.waitForSelector('.tile--img__img');

            // Get the first image URL (DuckDuckGo puts the real URL in data-src usually? or just src)
            const src = await page.evaluate(() => {
                const img = document.querySelector('.tile--img__img');
                return img ? img.getAttribute('data-src') || img.src : null;
            });

            if (src) {
                console.log(`Found URL for ${brand}: ${src.substring(0, 50)}...`);
                // Use the URL to download
                // Note: DuckDuckGo image URLs are often proxied or direct.
                // We need to decode it if it's a DDG proxy, but usually data-src is the external URL?
                // Actually, let's just try to download it.
                
                // Decode if it is a DDG url
                let downloadUrl = src;
                if (src.includes('u=')) {
                   // extracting real url from DDG proxy if needed, but usually we can just download from the src provided
                }

                await downloadImage(downloadUrl, filepath);
                console.log(`Downloaded ${brand}`);
            } else {
                console.log(`No image found for ${brand}`);
            }

        } catch (e) {
            console.error(`Failed to fetch ${brand}:`, e.message);
        }
        // Small delay
        await new Promise(r => setTimeout(r, 1000));
    }
    await browser.close();
};

fetchWithDuckDuckGo();
