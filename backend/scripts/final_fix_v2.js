const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const LOGOS_DIR = path.join(__dirname, '..', 'temp_logos');
if (!fs.existsSync(LOGOS_DIR)) fs.mkdirSync(LOGOS_DIR);

const targets = [
    { name: 'Scenit', query: 'Scenit Nutrition logo' },
    { name: 'Worth It Nutrition', query: 'Worth It Nutrition logo' }
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set a common user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    for (const target of targets) {
        console.log(`Processing ${target.name}...`);
        
        try {
            // Search on Bing Images
            const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(target.query)}&qft=+filterui:imagesize-large`;
            await page.goto(searchUrl, { waitUntil: 'networkidle2' });
            await sleep(2000);

            // Find an image URL
            const imageUrl = await page.evaluate(() => {
                const elements = document.querySelectorAll('a.iusc');
                for (let i = 0; i < Math.min(elements.length, 10); i++) {
                     try {
                        const m = JSON.parse(elements[i].getAttribute('m'));
                        // Avoid known stock photo sites if possible
                        if (m.murl && !m.murl.includes('vectorstock') && !m.murl.includes('freepik')) {
                            return m.murl;
                        }
                    } catch (e) {}
                }
                return elements.length > 0 ? JSON.parse(elements[0].getAttribute('m')).murl : null;
            });

            if (!imageUrl) {
                console.error(`❌ No image found for ${target.name}`);
                continue;
            }

            console.log(`Found URL: ${imageUrl}`);

            // Navigate to the image URL directly to download it using the browser context (avoids 403 often)
            const viewSource = await page.goto(imageUrl, { waitUntil: 'networkidle2', timeout: 30000 }).catch(e => null);
            
            if (!viewSource) {
                 console.error(`❌ Failed to load image URL for ${target.name}`);
                 continue;
            }

            // Get the buffer
            const buffer = await viewSource.buffer();
            
            // Determine extension from content-type or url
            const headers = viewSource.headers();
            const contentType = headers['content-type'];
            let ext = 'jpg';
            if (contentType) {
                if (contentType.includes('png')) ext = 'png';
                else if (contentType.includes('webp')) ext = 'webp';
                else if (contentType.includes('svg')) ext = 'svg';
            } else if (imageUrl.match(/\.(png|jpg|jpeg|webp|svg)$/i)) {
                 ext = imageUrl.match(/\.(png|jpg|jpeg|webp|svg)$/i)[1];
            }

            // Save file
            // Note: We save as the original format, convert_to_jpg.js will handle the rest
            const filename = `${target.name.replace(/\s+/g, '_')}.${ext}`;
            const filepath = path.join(LOGOS_DIR, filename);
            
            fs.writeFileSync(filepath, buffer);
            console.log(`✅ Saved ${target.name} to ${filename}`);

        } catch (e) {
            console.error(`❌ Error processing ${target.name}: ${e.message}`);
        }
    }

    await browser.close();
})();
