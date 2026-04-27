const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();
const Product = require('../models/Product');

async function testSync() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Local MongoDB.');

        const testName = "SYNC_TEST_PRODUCT_" + Date.now();
        
        const product = new Product({
            name: testName,
            descriptionShort: "Test",
            descriptionFull: "Test",
            price: 10,
            images: ["test.jpg", "test2.jpg"],
            stock: 10,
            categories: ["Creatine"]
        });

        await product.save();
        console.log(`Created local product: ${testName} (ID: ${product._id})`);

        console.log('Waiting 5 seconds for sync/propagation...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log('Checking remote API...');
        const res = await axios.get('https://protienlab-backend.onrender.com/api/users/products?limit=500');
        const found = res.data.products.find(p => p.name === testName);

        if (found) {
            console.log('✅ SUCCESS: Local DB is connected to Remote API!');
            console.log(`   Remote ID: ${found._id}`);
        } else {
            console.log('❌ FAILURE: Local product NOT found on Remote API.');
        }

        // Cleanup
        await Product.deleteOne({ _id: product._id });
        console.log('Cleaned up test product.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testSync();
