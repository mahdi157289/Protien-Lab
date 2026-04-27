const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const https = require('https');

const LOGOS_DIR = path.join(__dirname, '..', 'temp_logos');
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

const brands = [
    'Luxury', 'Muscletech', 'Olimp', 'Proactive', 'Rule1', 'Scenit', 
    'Worth It Nutrition', 'BioTechUSA', 'Animal', 'Xtend', 'Universal Nutrition', 
    'Yava Labs', 'Longevity Plus', 'Real Pharm', 'Optimum Nutrition', 
    'OstroVit', 'Kong Nutrition', 'Nutrex', 'Kevin Levrone', 'Insane Labz', 
    'BPI Sports'
];

const downloadImage = async (url, filepath) => {
    try {
        const writer = fs.createWriteStream(filepath);
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            timeout: 10000,
            headers: { 'User-Agent': USER_AGENT },
            httpsAgent: new https.Agent({ rejectUnauthorized: false }) // Ignore SSL errors
        });
        
        response.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (e) {
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath); // Cleanup partial file
        throw e;
    }
};

const searchAndDownload = async () => {
    for (const brand of brands) {
        console.log(`Searching for ${brand}...`);
        
        // Search query: BrandName supplements logo
        // We use DuckDuckGo HTML version which is easier to scrape
        const query = `${brand} supplements logo official`;
        const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}&iax=images&ia=images`;

        try {
            const res = await axios.get(searchUrl, {
                headers: { 'User-Agent': USER_AGENT }
            });
            
            const $ = cheerio.load(res.data);
            
            // Find image results. In DDG HTML, images are usually in 'a.z-is-link' or similar.
            // Actually DDG HTML image search results structure:
            // .tile--img__img  (class for the image tag)
            
            let imageUrl = null;
            
            // Try to find the first valid image url
            // The structure often contains the full image URL in the 'href' of the anchor wrapping the thumbnail,
            // or we can just take the thumbnail if it's high enough quality, but we want the real one.
            // In DDG HTML, the anchor href is usually `/l/?kh=-1&uddg=...` which redirects to the image.
            // We can decode the 'uddg' parameter to get the real URL.
            
            const anchors = $('.tile--img__media a.tile--img__sub');
            
            for (let i = 0; i < Math.min(anchors.length, 3); i++) {
                const href = $(anchors[i]).attr('href');
                if (href) {
                    // Extract 'uddg' param
                    const match = href.match(/uddg=([^&]+)/);
                    if (match && match[1]) {
                        const decodedUrl = decodeURIComponent(match[1]);
                        // Simple filter: prefer png/jpg/svg, ignore base64 or weird formats
                        if (decodedUrl.match(/\.(png|jpg|jpeg|svg|webp)$/i)) {
                            imageUrl = decodedUrl;
                            break;
                        }
                    }
                }
            }
            
            // Fallback: if no 'uddg' found, try to just find any image source
            if (!imageUrl) {
                 const img = $('.tile--img__img').first();
                 if (img.length) {
                     imageUrl = img.attr('src'); // This will be the thumbnail, better than nothing
                     // Ensure it's absolute
                     if (imageUrl && imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
                 }
            }

            if (imageUrl) {
                console.log(`Found URL for ${brand}: ${imageUrl}`);
                
                // Determine extension
                let ext = path.extname(imageUrl).split('?')[0].toLowerCase();
                if (!ext || ext.length > 5) ext = '.jpg'; // Default
                
                const filename = `${brand.replace(/ /g, '_')}${ext}`;
                const filepath = path.join(LOGOS_DIR, filename);
                
                await downloadImage(imageUrl, filepath);
                console.log(`✅ Downloaded ${brand}`);
            } else {
                console.log(`❌ No image found for ${brand}`);
            }

        } catch (err) {
            console.error(`Error processing ${brand}:`, err.message);
        }
        
        // Random delay to be polite
        await new Promise(r => setTimeout(r, 1000));
    }
};

searchAndDownload();
