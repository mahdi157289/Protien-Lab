const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'https://protienlab-backend.onrender.com/api';
const ADMIN_EMAIL = 'admin11@gmail.com';
const ADMIN_PASSWORD = 'admin123';
const LOGOS_DIR = path.join(__dirname, '..', 'temp_logos');

async function uploadBrands() {
    try {
        console.log(`Connecting to ${API_URL}...`);
        
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/admin/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });

        const token = loginRes.data.token;
        if (!token) {
            throw new Error('No token received from login');
        }
        console.log('Logged in successfully.');

        // 2. Read files
        if (!fs.existsSync(LOGOS_DIR)) {
            throw new Error(`Directory ${LOGOS_DIR} does not exist`);
        }

        const files = fs.readdirSync(LOGOS_DIR).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.webp') || f.endsWith('.svg'));
        console.log(`Found ${files.length} logo files.`);

        // 2.5 Check existing brands to avoid duplicates
        console.log('Checking existing brands...');
        let existingBrands = [];
        try {
            const existingRes = await axios.get(`${API_URL}/photos/category/Nos%20Marque`);
            if (existingRes.data.success) {
                existingBrands = existingRes.data.data.map(p => p.brandName.toLowerCase());
                console.log(`Found ${existingBrands.length} existing brands.`);
            }
        } catch (e) {
            console.warn('Could not fetch existing brands, proceeding anyway...');
        }

        // 3. Upload each
        for (const file of files) {
            const brandName = path.parse(file).name.replace(/_/g, ' '); // Replace underscores with spaces
            
            if (existingBrands.includes(brandName.toLowerCase())) {
                console.log(`⚠️ Skipping ${brandName} - already exists.`);
                continue;
            }

            const filePath = path.join(LOGOS_DIR, file);

            console.log(`Uploading ${brandName} from ${file}...`);

            const form = new FormData();
            form.append('photos', fs.createReadStream(filePath));
            form.append('category', 'Nos Marque');
            form.append('brandName', brandName);

            try {
                const uploadRes = await axios.post(`${API_URL}/admin/photos`, form, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        ...form.getHeaders()
                    }
                });
                
                if (uploadRes.data.success) {
                    console.log(`✅ Successfully uploaded ${brandName}`);
                } else {
                    console.error(`❌ Failed to upload ${brandName}:`, uploadRes.data.message);
                }
            } catch (err) {
                console.error(`❌ Error uploading ${brandName}:`, err.response?.data?.message || err.message);
            }
        }

        console.log('All uploads completed.');

    } catch (error) {
        console.error('Fatal Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

uploadBrands();
