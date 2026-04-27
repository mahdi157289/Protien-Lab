const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const LOGOS_DIR = path.join(__dirname, '..', 'temp_logos');

// Specific targeted URLs or queries for problematic brands
const targets = [
    { name: 'Luxury', query: 'Luxury Nutrition supplements brand logo' },
    { name: 'Scenit', query: 'Scenit Nutrition official logo' },
    { name: 'Worth It Nutrition', query: 'Worth It Nutrition supplements logo' }
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

    for (const target of targets) {
        try {
            console.log(`Final Attempt for ${target.name}...`);
            
            // Try Bing with specific 'site' constraints if possible, or just broader
            const url = `https://www.bing.com/images/search?q=${encodeURIComponent(target.query)}&first=1`;
            
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            
            try {
                await page.waitForSelector('.mimg', { timeout: 5000 });
            } catch (e) {
                console.log(`Timeout for ${target.name}`);
                continue;
            }

            // Try to find a better one. We'll iterate through a few results.
            const imageUrl = await page.evaluate(() => {
                const elements = document.querySelectorAll('a.iusc');
                for (let i = 0; i < Math.min(elements.length, 5); i++) {
                     try {
                        const m = JSON.parse(elements[i].getAttribute('m'));
                        // Filter out generic stock photos if possible by checking URL
                        if (m.murl && !m.murl.includes('vectorstock') && !m.murl.includes('freepik') && !m.murl.includes('shutterstock')) {
                            return m.murl;
                        }
                    } catch (e) {}
                }
                // Fallback to first if all filtered
                if (elements.length > 0) {
                     try {
                        const m = JSON.parse(elements[0].getAttribute('m'));
                        return m.murl;
                    } catch (e) {}
                }
                return null;
            });

            if (imageUrl) {
                console.log(`Found URL for ${target.name}: ${imageUrl}`);
                
                let ext = path.extname(imageUrl).split('?')[0].toLowerCase();
                if (!ext || ext.length > 5) ext = '.jpg';
                
                // Cleanup
                const files = fs.readdirSync(LOGOS_DIR);
                files.forEach(f => {
                    if (f.startsWith(target.name.replace(/ /g, '_') + '.')) {
                        fs.unlinkSync(path.join(LOGOS_DIR, f));
                    }
                });

                const filepath = path.join(LOGOS_DIR, `${target.name.replace(/ /g, '_')}${ext}`);
                
                try {
                    await downloadImage(imageUrl, filepath);
                    console.log(`✅ Downloaded ${target.name}`);
                } catch (e) {
                    console.error(`❌ Failed to download ${target.name}: ${e.message}`);
                }
            }

        } catch (e) {
            console.error(`Error processing ${target.name}:`, e.message);
        }
    }

    await browser.close();
    console.log('Final fixes complete.');
})();
