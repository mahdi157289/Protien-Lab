const axios = require('axios');

const API_URL = 'https://protienlab-backend.onrender.com/api';
const ADMIN_EMAIL = 'admin11@gmail.com';
const ADMIN_PASSWORD = 'admin123';

async function checkProductsAdmin() {
    try {
        console.log('Logging in as admin...');
        const loginRes = await axios.post(`${API_URL}/admin/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        const token = loginRes.data.token;
        console.log('Logged in.');

        console.log(`Fetching products from ${API_URL}/admin/products...`);
        // Use a high limit to get all products
        const res = await axios.get(`${API_URL}/admin/products?limit=500`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const products = res.data.products || res.data.data || res.data;
        
        console.log(`Total products found: ${res.data.totalProducts || products.length}`);
        
        console.log('\n--- Last 10 Products Added ---');
        // Sort by createdAt descending
        const sorted = products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        sorted.slice(0, 10).forEach((p, i) => {
            console.log(`${i+1}. ${p.name} (Price: ${p.price}) - Created: ${p.createdAt}`);
        });

        // Verification check
    const sampleName = "CREATINE MONOHYDRATE BIOTECH USA - 300GR";
    const found = products.find(p => p.name === sampleName);
    if (found) {
      console.log(`\n✅ Verification: Found imported product "${sampleName}"`);
      console.log('--- Full Product Object ---');
      console.log(JSON.stringify(found, null, 2)); // Log full object to inspect fields
      console.log('---------------------------');
      console.log(`   ID: ${found._id}`);
      console.log(`   Created At: ${found.createdAt}`);
      console.log(`   Is Active: ${found.isActive}`);
      console.log(`   Image count: ${found.images.length}`);
      console.log(`   Images: ${found.images.join(', ')}`);
    } else {
            console.log(`\n❌ Verification: Could NOT find imported product "${sampleName}"`);
        }

    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) {
            console.error('Status:', e.response.status);
            console.error('Data:', e.response.data);
        }
    }
}

checkProductsAdmin();
