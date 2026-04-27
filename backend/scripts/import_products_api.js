const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { promisify } = require('util');
const stream = require('stream');

const finished = promisify(stream.finished);

const API_URL = 'https://protienlab-backend.onrender.com/api';
const ADMIN_EMAIL = 'admin11@gmail.com';
const ADMIN_PASSWORD = 'admin123';
const IMPORT_FILE = path.join(__dirname, '../uploads/db_import_products.json');
const TEMP_DIR = path.join(__dirname, '../temp_import_images');

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

async function downloadFile(fileUrl, outputPath) {
    const writer = fs.createWriteStream(outputPath);
    try {
        const response = await axios({
            method: 'get',
            url: fileUrl,
            responseType: 'stream',
        });
        response.data.pipe(writer);
        await finished(writer);
        return true;
    } catch (error) {
        console.error(`Error downloading ${fileUrl}:`, error.message);
        writer.close();
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        return false;
    }
}

async function importProductsApi() {
    try {
        // 1. Login
        console.log('Logging in as admin...');
        const loginRes = await axios.post(`${API_URL}/admin/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        const token = loginRes.data.token;
        console.log('Logged in successfully.');

        // 2. Fetch existing products to avoid duplicates
        console.log('Fetching existing products...');
        const productsRes = await axios.get(`${API_URL}/admin/products?limit=1000`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const existingProducts = productsRes.data.products || productsRes.data.data || [];
        const existingMap = new Map(existingProducts.map(p => [p.name, p._id]));
        console.log(`Found ${existingProducts.length} existing products.`);

        // 3. Read import file
        const rawData = fs.readFileSync(IMPORT_FILE, 'utf8');
        const productsToImport = JSON.parse(rawData);
        console.log(`Found ${productsToImport.length} products to import.`);

        let successCount = 0;
        let replacedCount = 0;
        let errorCount = 0;

        for (const productData of productsToImport) {
            if (existingMap.has(productData.name)) {
                console.log(`Found duplicate: ${productData.name}. Deleting...`);
                const idToDelete = existingMap.get(productData.name);
                try {
                    await axios.delete(`${API_URL}/admin/products/${idToDelete}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    console.log(`Deleted old product: ${productData.name}`);
                    replacedCount++;
                } catch (err) {
                    console.error(`Failed to delete ${productData.name}:`, err.message);
                }
            }

            console.log(`Importing: ${productData.name}`);
            
            const form = new FormData();
            
            // Append simple fields
            form.append('name', productData.name);
            form.append('descriptionShort', productData.descriptionShort);
            form.append('descriptionFull', productData.descriptionFull);
            form.append('price', String(productData.price));
            form.append('stock', String(productData.stock));
            form.append('isBestSeller', String(productData.isBestSeller));
            form.append('isActive', String(productData.isActive));
            form.append('isNewProduct', String(productData.isNewProduct || productData.isNew || false));
            form.append('fastDelivery', String(productData.fastDelivery || false));
            if (productData.limitedStockNotice) form.append('limitedStockNotice', productData.limitedStockNotice);
            if (productData.brand) form.append('brand', productData.brand);

            // Append JSON fields
            if (productData.categories) form.append('categories', JSON.stringify(productData.categories));
            if (productData.flavors) form.append('flavors', JSON.stringify(productData.flavors));
            if (productData.weights) form.append('weights', JSON.stringify(productData.weights));
            if (productData.benefits) form.append('benefits', JSON.stringify(productData.benefits));

            // Download and append images
            const imageFiles = [];
            let imageIdx = 0;
            for (const imgUrl of productData.images) {
                // Determine extension
                let ext = path.extname(imgUrl).split('?')[0];
                if (!ext) ext = '.jpg';
                // Sanitize filename
                const filename = `img_${Date.now()}_${imageIdx}${ext}`;
                const localPath = path.join(TEMP_DIR, filename);
                
                // If it is a PDF or other non-image, skip or handle? The controller checks for images.
                // Assuming URLs are images.
                if (imgUrl.toLowerCase().endsWith('.pdf')) {
                     console.log(`Skipping PDF file: ${imgUrl}`);
                     continue;
                }

                const downloaded = await downloadFile(imgUrl, localPath);
                if (downloaded) {
                    form.append('images', fs.createReadStream(localPath));
                    imageFiles.push(localPath);
                    imageIdx++;
                }
            }

            if (imageFiles.length < 2) {
                console.error(`Skipping ${productData.name}: Not enough images downloaded (min 2 required).`);
                errorCount++;
                // Cleanup
                imageFiles.forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p); });
                continue;
            }

            try {
                const createRes = await axios.post(`${API_URL}/admin/products`, form, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        ...form.getHeaders()
                    },
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity
                });
                console.log(`✅ Success: ${productData.name} (ID: ${createRes.data._id})`);
                successCount++;
            } catch (err) {
                console.error(`❌ Failed to create ${productData.name}:`, err.message);
                if (err.response) {
                    console.error('Data:', err.response.data);
                }
                errorCount++;
            } finally {
                // Cleanup temp files
                imageFiles.forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p); });
            }
        }

        console.log('\nImport Summary:');
        console.log(`Success: ${successCount}`);
        console.log(`Replaced: ${replacedCount}`);
        console.log(`Errors: ${errorCount}`);

    } catch (error) {
        console.error('Fatal Error:', error.message);
    } finally {
        // Remove temp dir
        if (fs.existsSync(TEMP_DIR)) {
            // fs.rmdirSync(TEMP_DIR, { recursive: true }); // requires node 12+
            // Simple check to remove if empty or just leave it
        }
    }
}

importProductsApi();
