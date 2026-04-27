const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB URI
const MONGO_URI = 'mongodb+srv://baccarmahdi09:QGOXemXdJ5CigQ09@cluster0.ygb4b3i.mongodb.net/nutrition_store?retryWrites=true&w=majority&appName=Cluster0&tls=true&ssl=true';

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  images: [String]
}, { strict: false });

const Product = mongoose.model('Product', productSchema);

async function analyzeDiscrepancy() {
  try {
    const productsFile = path.join(__dirname, '../uploads/db_import_products.json');
    const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

    // 1. Check for duplicates in JSON
    console.log('--- JSON Duplicate Check ---');
    const nameCounts = {};
    products.forEach(p => {
      nameCounts[p.name] = (nameCounts[p.name] || 0) + 1;
    });

    let duplicates = 0;
    for (const [name, count] of Object.entries(nameCounts)) {
      if (count > 1) {
        console.log(`Duplicate in JSON: "${name}" (Count: ${count})`);
        duplicates++;
      }
    }
    if (duplicates === 0) console.log('No duplicates found in JSON.');

    // 2. Check DB Content completeness
    console.log('\n--- DB Content Completeness Check ---');
    await mongoose.connect(MONGO_URI);
    
    const dbProducts = await Product.find({ name: { $in: Object.keys(nameCounts) } });
    
    const dbMap = new Map();
    dbProducts.forEach(p => dbMap.set(p.name, p));

    let missingInDb = 0;
    let incompleteImages = 0;

    for (const p of products) {
        const dbP = dbMap.get(p.name);
        if (!dbP) {
            console.log(`❌ Missing in DB: "${p.name}"`);
            missingInDb++;
        } else {
            // Check images
            // Note: DB images are paths, JSON images are URLs. We check count.
            if (!dbP.images || dbP.images.length === 0) {
                 console.log(`⚠️ Product in DB has NO images: "${p.name}" (JSON has ${p.images.length})`);
                 incompleteImages++;
            } else if (dbP.images.length < p.images.length) {
                 console.log(`⚠️ Product in DB has fewer images: "${p.name}" (DB: ${dbP.images.length}, JSON: ${p.images.length})`);
                 incompleteImages++;
            }
        }
    }
    
    console.log(`\nSummary:`);
    console.log(`Total JSON Items: ${products.length}`);
    console.log(`Unique Names in JSON: ${Object.keys(nameCounts).length}`);
    console.log(`Found in DB: ${dbProducts.length}`);
    console.log(`Missing in DB: ${missingInDb}`);
    console.log(`Incomplete Images: ${incompleteImages}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

analyzeDiscrepancy();
