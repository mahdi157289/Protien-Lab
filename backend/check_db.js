const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const p = await Product.findOne();
        console.log("\n=============================");
        console.log("Product Name:", p.name);
        console.log("Images array in DB:");
        console.log(JSON.stringify(p.images, null, 2));
        console.log("=============================\n");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
