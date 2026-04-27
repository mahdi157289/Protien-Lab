const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'https://protienlab-backend.onrender.com/api';
const ADMIN_EMAIL = 'admin11@gmail.com';
const ADMIN_PASSWORD = 'admin123';
const LOGOS_DIR = path.join(__dirname, '..', 'temp_logos');
const REJECTED_FILE = path.join(__dirname, '..', 'rejected_brands.json');

async function uploadFixedBrands() {
    try {
        if (!fs.existsSync(REJECTED_FILE)) {
            console.log('No rejected brands file found.');
            return;
        }

        const rejectedBrands = JSON.parse(fs.readFileSync(REJECTED_FILE, 'utf8'));
        // Deduplicate
        const brandsToFix = [...new Set(rejectedBrands)];
        console.log(`Found ${brandsToFix.length} brands to fix:`, brandsToFix);

        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/admin/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        const token = loginRes.data.token;
        console.log('Logged in successfully.');

        // Fetch existing photos to find IDs to delete
        console.log('Fetching existing photos...');
        const photosRes = await axios.get(`${API_URL}/admin/photos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // The API might return { success: true, count: N, data: [...] } or just [...]
        // Based on upload_brands.js check: existingRes.data.data
        const existingPhotos = photosRes.data.data || [];
        console.log(`Found ${existingPhotos.length} total photos on server.`);

        for (const brandName of brandsToFix) {
            console.log(`\nProcessing ${brandName}...`);
            
            // 1. Find and delete existing
            const existing = existingPhotos.filter(p => p.brandName && p.brandName.toLowerCase() === brandName.toLowerCase());
            if (existing.length > 0) {
                console.log(`Found ${existing.length} existing photo(s) for ${brandName}. Deleting...`);
                for (const photo of existing) {
                    try {
                        await axios.delete(`${API_URL}/admin/photos/${photo._id}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        console.log(`Deleted photo ${photo._id}`);
                    } catch (e) {
                        console.error(`Failed to delete photo ${photo._id}: ${e.message}`);
                    }
                }
            } else {
                console.log(`No existing photos found for ${brandName}.`);
            }

            // 2. Upload new
            // Try to find the file
            const safeName = brandName.replace(/ /g, '_');
            let filename = `${safeName}.jpg`;
            let filePath = path.join(LOGOS_DIR, filename);

            if (!fs.existsSync(filePath)) {
                // Try other extensions or original name if underscores didn't match
                const possibleFiles = fs.readdirSync(LOGOS_DIR);
                const match = possibleFiles.find(f => {
                    const base = path.parse(f).name;
                    return base.toLowerCase() === safeName.toLowerCase() || base.toLowerCase() === brandName.toLowerCase().replace(/ /g, '_');
                });
                
                if (match) {
                    filename = match;
                    filePath = path.join(LOGOS_DIR, filename);
                } else {
                    console.error(`❌ Local file not found for ${brandName} (checked ${filename})`);
                    continue;
                }
            }
            
            // Ensure it's a JPG (we ran convert_to_jpg, but just in case we matched a non-jpg)
            if (!filename.toLowerCase().endsWith('.jpg') && !filename.toLowerCase().endsWith('.jpeg')) {
                console.warn(`⚠️ Warning: Uploading non-JPG file: ${filename}`);
            }

            console.log(`Uploading ${filename}...`);
            const form = new FormData();
            form.append('photos', fs.createReadStream(filePath));
            form.append('category', 'Nos Marque');
            form.append('brandName', brandName); // Use original name with spaces

            try {
                const uploadRes = await axios.post(`${API_URL}/admin/photos`, form, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        ...form.getHeaders()
                    }
                });
                if (uploadRes.data.success) {
                    console.log(`✅ Uploaded ${brandName}`);
                } else {
                    console.error(`❌ Failed to upload ${brandName}:`, uploadRes.data);
                }
            } catch (e) {
                console.error(`❌ Error uploading ${brandName}:`, e.message);
            }
        }

    } catch (e) {
        console.error('Fatal error:', e.message);
    }
}

uploadFixedBrands();
