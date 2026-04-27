const axios = require('axios');
const FormData = require('form-data');

const API_URL = 'https://protienlab-backend.onrender.com/api';
const ADMIN_EMAIL = 'admin11@gmail.com';
const ADMIN_PASSWORD = 'admin123';
const PRODUCT_ID = '6977857baf0637bed155cfd2';

async function testApiUpdate() {
  try {
    // 1. Login
    console.log('Logging in...');
    const loginRes = await axios.post(`${API_URL}/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    const token = loginRes.data.token;
    console.log('Logged in.');

    // 2. Update Product
    // We can use JSON for update if no files are involved, but the controller expects multipart/form-data for files?
    // The controller checks `if (req.files && req.files.length > 0)`.
    // It also reads `req.body`.
    // Express handles JSON body if `express.json()` middleware is used.
    // adminRoutes uses `upload.array(...)` which expects multipart.
    // If I send JSON to a multipart endpoint, multer might complain or just ignore files.
    // But `adminProductController` relies on `req.body` populated by multer (or express.json if no files).
    // Let's try sending standard JSON first. If it fails, use FormData.

    const updateData = {
      createdAt: new Date().toISOString()
    };
    
    console.log(`Updating product ${PRODUCT_ID} with createdAt: ${updateData.createdAt}...`);

    try {
        const updateRes = await axios.put(`${API_URL}/admin/products/${PRODUCT_ID}`, updateData, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Update successful (JSON).');
        console.log('createdAt from response:', updateRes.data.createdAt);
    } catch (e) {
        console.log('JSON update failed, trying FormData...', e.message);
        
        const form = new FormData();
        form.append('createdAt', updateData.createdAt);
        
        const updateRes = await axios.put(`${API_URL}/admin/products/${PRODUCT_ID}`, form, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                ...form.getHeaders()
            }
        });
        console.log('Update successful (FormData).');
        console.log('createdAt from response:', updateRes.data.createdAt);
    }

    // 3. Cleanup
    console.log('Deleting test product...');
    await axios.delete(`${API_URL}/admin/products/${PRODUCT_ID}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Test product deleted.');

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testApiUpdate();
