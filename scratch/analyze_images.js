const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

const Product = require('./backend/models/Product');

async function analyze() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find({});
    console.log(`Found ${products.length} products.\n`);

    products.forEach(p => {
      if (p.images && p.images.length > 1) {
        console.log(`Product: "${p.name}"`);
        p.images.forEach((img, i) => {
          console.log(`  [${i}] ${img}`);
        });
        console.log('');
      }
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

analyze();
