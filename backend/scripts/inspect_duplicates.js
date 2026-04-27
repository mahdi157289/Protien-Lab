const fs = require('fs');
const path = require('path');

const productsFile = path.join(__dirname, '../uploads/db_import_products.json');
const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

const duplicates = [
    "CREATINE MONOHYDRATE BIOTECH USA - 300GR",
    "ISOLATE WHEY ANIMAL - 1.81KG",
    "CREATINE YAVA LABS - 300GR",
    "OMEGA 3 YAVA LABS - 90 CAPSULES",
    "HYPER MASS BIOTECH USA - 4KG",
    "HYPER MASS BIOTECH USA - 6.8KG"
];

duplicates.forEach(name => {
    const entries = products.filter(p => p.name === name);
    console.log(`\n--- ${name} ---`);
    entries.forEach((entry, i) => {
        console.log(`Entry ${i+1}:`);
        console.log(`  Flavors: ${JSON.stringify(entry.flavors)}`);
        console.log(`  Weights: ${JSON.stringify(entry.weights)}`);
        console.log(`  Price: ${entry.price}`);
        console.log(`  Images: ${entry.images.length}`);
    });
    
    // Check if deep equal (simple check)
    const str1 = JSON.stringify(entries[0]);
    const str2 = JSON.stringify(entries[1]);
    console.log(`  Identical? ${str1 === str2}`);
});
