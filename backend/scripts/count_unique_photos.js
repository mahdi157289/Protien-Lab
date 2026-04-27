const fs = require('fs');
const path = require('path');

const dir = 'backend/uploads/products';
const files = fs.readdirSync(dir);

const uniqueProducts = new Set();
files.forEach(file => {
    // Basic heuristic: take the name part before the timestamp
    // e.g. 100-beef-aminos-universal-200capsules-1769484844419-0.jpg -> 100-beef-aminos-universal-200capsules
    const match = file.match(/(.+)-\d+-\d+\.\w+$/);
    if (match) {
        uniqueProducts.add(match[1]);
    } else {
        uniqueProducts.add(file);
    }
});

console.log('Total files:', files.length);
console.log('Estimated unique products:', uniqueProducts.size);
console.log('Sample unique names:', Array.from(uniqueProducts).slice(0, 10));
