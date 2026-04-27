const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'https://protienlab-backend.onrender.com/api';
const ADMIN_EMAIL = 'admin11@gmail.com';
const ADMIN_PASSWORD = 'admin123';
const TEST_IMAGE_PATH = path.join(__dirname, '../temp_logos/BioTechUSA.jpg');

async function testApiCreation() {
  try {
    // 1. Login
    console.log('Logging in...');
    const loginRes = await axios.post(`${API_URL}/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    const token = loginRes.data.token;
    console.log('Logged in.');

    // 2. Create Product
    const form = new FormData();
    form.append('name', 'TEST_PRODUCT_TIMESTAMP_CHECK');
    form.append('descriptionShort', 'Test description');
    form.append('descriptionFull', 'Test full description');
    form.append('price', '99');
    form.append('stock', '10');
    form.append('categories', JSON.stringify(['Creatine']));
    form.append('brand', 'BioTechUSA');
    
    // Add 2 images (required min 2)
    form.append('images', fs.createReadStream(TEST_IMAGE_PATH));
    form.append('images', fs.createReadStream(TEST_IMAGE_PATH));

    console.log('Creating test product...');
    const createRes = await axios.post(`${API_URL}/admin/products`, form, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      }
    });

    console.log('Response status:', createRes.status);
    console.log('Response data:', createRes.data);

    const newProduct = createRes.data.product || createRes.data.data || createRes.data;
    if (!newProduct || !newProduct._id) {
        throw new Error('Product creation failed or response format unexpected');
    }

    console.log('Product created:', newProduct._id);
    console.log('createdAt from response:', newProduct.createdAt);

    // 3. Verify via GET
    console.log('Verifying via GET...');
    const getRes = await axios.get(`${API_URL}/admin/products/${newProduct._id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('createdAt from GET:', getRes.data.createdAt);

    // 4. Cleanup
    console.log('Deleting test product...');
    await axios.delete(`${API_URL}/admin/products/${newProduct._id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Test product deleted.');

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testApiCreation();
