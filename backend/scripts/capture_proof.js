const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: true, // Use headless for server environments, or false if you want to see it locally
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Set viewport to a reasonable size
  await page.setViewport({ width: 1280, height: 800 });

  try {
    console.log('Navigating to proteinlab.tn...');
    await page.goto('https://proteinlab.tn/shop', { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Wait for the loading screen to disappear
    // The loading screen has classes: fixed inset-0 z-[9999]
    try {
        console.log('Waiting for loading screen to disappear...');
        await page.waitForSelector('#root > .fixed.inset-0.z-\\[9999\\]', { hidden: true, timeout: 15000 });
        console.log('Loading screen disappeared.');
    } catch (e) {
        console.log('Timeout waiting for loading screen to disappear (or it was already gone).');
    }

    // Wait for any product card or grid to appear
    try {
        // Try waiting for an image or a link inside the root
        await page.waitForFunction(() => {
            return document.querySelectorAll('img').length > 5; // Assume shop has images
        }, { timeout: 10000 });
        console.log('Images loaded.');
    } catch (e) {
        console.log('Timeout waiting for images.');
    }

    console.log('Page loaded (post-wait).');
    
    // Check if product text exists in the page
    const pageContent = await page.content();
    const isProductPresent = pageContent.includes('CREATINE MONOHYDRATE BIOTECH USA') || pageContent.includes('BioTechUSA');
    console.log(`Product/Brand text present in HTML: ${isProductPresent}`);

    // Save HTML to inspect selectors
    fs.writeFileSync('page_source.html', pageContent);

    // Take a screenshot of the initial shop page
    await page.screenshot({ path: 'shop_page.png', fullPage: true });
    console.log('Screenshot saved: shop_page.png');

    // Try to find a search input by inspecting common classes or IDs if generic failed
    // We can also try to evaluate JS to find it
    const searchSelector = await page.evaluate(() => {
        const input = document.querySelector('input[placeholder*="Search" i], input[placeholder*="Recherche" i], .search-input, #search');
        return input ? (input.id ? '#' + input.id : input.className ? '.' + input.className.split(' ').join('.') : 'input') : null;
    });

    if (searchSelector) {
        console.log(`Found search selector: ${searchSelector}`);
        await page.type(searchSelector, 'CREATINE MONOHYDRATE BIOTECH USA');
        await page.keyboard.press('Enter');
        
        console.log('Waiting for results...');
        await new Promise(r => setTimeout(r, 5000)); // Wait for 5 seconds for results
        
        await page.screenshot({ path: 'search_results.png', fullPage: true });
        console.log('Screenshot saved: search_results.png');
    } else {
        console.log('Search input still not found via heuristics.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
