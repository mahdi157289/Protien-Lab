const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // 1. Try to go to admin login
    console.log('Navigating to Admin Login...');
    // Common admin paths
    const adminPaths = ['/admin', '/dashboard', '/login', '/admin/login'];
    let loginUrl = '';
    
    for (const path of adminPaths) {
        const url = `https://proteinlab.tn${path}`;
        console.log(`Trying ${url}...`);
        const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
        if (response.ok() && !response.url().includes('404')) {
            // Check if we see a login form
            const content = await page.content();
            if (content.includes('password') || content.includes('login') || content.includes('Email')) {
                console.log(`Found login page at ${url}`);
                loginUrl = url;
                break;
            }
        }
    }

    if (!loginUrl) {
        console.log('Could not find admin login page. Taking screenshot of root...');
        await page.goto('https://proteinlab.tn', { waitUntil: 'networkidle2' });
        await page.screenshot({ path: 'site_root.png' });
        return;
    }

    // 2. Login
    console.log('Attempting to login...');
    // Guess selectors based on standard practices
    await page.type('input[type="email"], input[name="email"]', 'admin11@gmail.com');
    await page.type('input[type="password"], input[name="password"]', 'admin123');
    
    await page.screenshot({ path: 'before_login.png' });
    
    const submitSelector = 'button[type="submit"], button:has-text("Login"), button:has-text("Sign in")';
    await page.click('button[type="submit"]'); // Try generic submit first
    
    console.log('Clicked login. Waiting for navigation...');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(e => console.log('Navigation timeout (SPA transition?)'));
    
    console.log('Login attempt finished.');
    await page.screenshot({ path: 'after_login.png' });

    // 3. Find Products link
    // Look for "Products" or "Dashboard"
    // Just take a screenshot of the dashboard for now
    await page.screenshot({ path: 'admin_dashboard.png', fullPage: true });

    // 4. If we are in dashboard, try to find products
    // This is speculative.

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
