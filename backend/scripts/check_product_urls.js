require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');

const checkProducts = async () => {
    await connectDB();
    const products = await Product.find({}).limit(5);
    products.forEach(p => {
        console.log(`Product: ${p.title}`);
        console.log(`Images: ${JSON.stringify(p.images)}`);
        console.log('---');
    });
    await mongoose.disconnect();
};

checkProducts().catch(err => {
    console.error(err);
    process.exit(1);
});
