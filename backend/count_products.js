require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        const count = await Product.countDocuments({});
        console.log(`\n=============================`);
        console.log(`Total Products in Database: ${count}`);
        console.log(`=============================\n`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
