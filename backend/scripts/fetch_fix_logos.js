const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const LOGOS_DIR = path.join(__dirname, '..', 'temp_logos');

const targets = [
    { name: 'Luxury', query: 'Luxury Nutrition official logo' },
    { name: 'Worth It Nutrition', query: 'Worth It Nutrition logo' },
    { name: 'Animal', query: 'Animal Pak Universal Nutrition logo' },
    { name: 'Kong Nutrition', query: 'Kong Nutrition supplements logo' }
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
            console.log(`Searching for ${target.name} (${target.query})...`);
            
            const url = `https://www.bing.com/images/search?q=${encodeURIComponent(target.query)}&first=1`;
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            
            try {
                await page.waitForSelector('.mimg', { timeout: 5000 });
            } catch (e) {
                console.log(`Timeout waiting for selector for ${target.name}`);
                continue;
            }

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
                console.log(`Found URL for ${target.name}: ${imageUrl}`);
                
                let ext = path.extname(imageUrl).split('?')[0].toLowerCase();
                if (!ext || ext.length > 5) ext = '.jpg';
                
                // Overwrite existing
                // We need to delete potential previous wrong files first (e.g. Luxury.png vs Luxury.jpg)
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
            } else {
                console.log(`❌ No image found for ${target.name}`);
            }

        } catch (e) {
            console.error(`Error processing ${target.name}:`, e.message);
        }
        
        await new Promise(r => setTimeout(r, 1000));
    }

    await browser.close();
    console.log('Done.');
})();
