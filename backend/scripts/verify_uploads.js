const axios = require('axios');

const API_URL = 'https://protienlab-backend.onrender.com/api';

async function verifyUploads() {
    console.log('Starting verification...');
    try {
        console.log('Fetching Nos Marque photos...');
        const res = await axios.get(`${API_URL}/photos/category/Nos%20Marque`);
        console.log('Response received.');
        
        if (res.data.success) {
            const photos = res.data.data;
            console.log(`Found ${photos.length} photos.`);
            
            photos.forEach(p => {
                console.log(`Brand: ${p.brandName}`);
                console.log(`URL: ${p.url}`);
                console.log('---');
            });
        } else {
            console.error('Failed to fetch photos:', res.data.message);
        }
    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) {
            console.error('Status:', e.response.status);
            console.error('Data:', e.response.data);
        }
    }
}

verifyUploads();
