const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const LOGOS_DIR = path.join(__dirname, '..', 'temp_logos');
const REJECTED_FILE = path.join(__dirname, '..', 'rejected_brands.json');

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
    if (!fs.existsSync(REJECTED_FILE)) {
        console.log('No rejected_brands.json found. Nothing to do.');
        return;
    }

    const rejectedBrands = JSON.parse(fs.readFileSync(REJECTED_FILE, 'utf8'));
    if (rejectedBrands.length === 0) {
        console.log('Rejected list is empty.');
        return;
    }

    console.log(`Retrying ${rejectedBrands.length} brands:`, rejectedBrands);

    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    for (const brand of rejectedBrands) {
        try {
            console.log(`Searching for ${brand} (Alternative Search)...`);
            
            // Try a different query structure
            const query = `${brand} brand logo vector`;
            // Try Google this time if Bing failed? Or just stick to Bing with different params.
            // Let's stick to Bing but maybe look for 'transparent' explicitly
            const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query + ' transparent')}&first=1`;
            
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            
            try {
                await page.waitForSelector('.mimg', { timeout: 5000 });
            } catch (e) {
                console.log(`Timeout waiting for selector for ${brand}`);
                continue;
            }

            // Get first 3 results and try them one by one until success?
            // For now, let's just get the first one that is NOT the same as before (hard to check).
            // Just get the first valid one.

            const imageUrl = await page.evaluate(() => {
                const elements = document.querySelectorAll('a.iusc');
                for (const el of elements) {
                    try {
                        const m = JSON.parse(el.getAttribute('m'));
                        if (m.murl) return m.murl;
                    } catch (e) {}
                }
                return null;
            });

            if (imageUrl) {
                console.log(`Found URL for ${brand}: ${imageUrl}`);
                
                let ext = path.extname(imageUrl).split('?')[0].toLowerCase();
                if (!ext || ext.length > 5) ext = '.jpg';
                
                // Remove old file
                const files = fs.readdirSync(LOGOS_DIR);
                files.forEach(f => {
                    if (f.startsWith(brand.replace(/ /g, '_') + '.')) {
                        fs.unlinkSync(path.join(LOGOS_DIR, f));
                    }
                });

                const filepath = path.join(LOGOS_DIR, `${brand.replace(/ /g, '_')}${ext}`);
                
                try {
                    await downloadImage(imageUrl, filepath);
                    console.log(`✅ Downloaded replacement for ${brand}`);
                } catch (e) {
                    console.error(`❌ Failed to download ${brand}: ${e.message}`);
                }
            } else {
                console.log(`❌ No replacement image found for ${brand}`);
            }

        } catch (e) {
            console.error(`Error processing ${brand}:`, e.message);
        }
        
        await new Promise(r => setTimeout(r, 1000));
    }

    await browser.close();
    console.log('Retry complete.');
})();
