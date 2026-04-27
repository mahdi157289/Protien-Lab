const axios = require('axios');

const API_URL = 'https://protienlab-backend.onrender.com/api/users';

async function checkProducts() {
  try {
    console.log(`Fetching products from ${API_URL}/products...`);
    // Use a high limit to bypass pagination/sorting issues
    const res = await axios.get(`${API_URL}/products?limit=500`);
    
    const products = res.data.products || res.data.data || res.data;
        
        console.log(`Total products found: ${products.length}`);
        
        console.log('\n--- Last 10 Products ---');
        // Assuming products might be sorted by creation, but let's just show the last 10 in the array
        // or sort by createdAt if available
        const sorted = products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        sorted.slice(0, 10).forEach((p, i) => {
            console.log(`${i+1}. ${p.name} (ID: ${p._id}) - Created: ${p.createdAt}`);
        });

        // Search for a specific imported product
        const targetName = "CREATINE MONOHYDRATE BIOTECH USA - 300GR";
        const found = products.find(p => p.name === targetName);

            if (found) {
              console.log(`\n✅ FOUND: "${targetName}"`);
              console.log(`   ID: ${found._id}`);
              console.log(`   Price: ${found.price}`);
              console.log(`   In Stock: ${found.stock}`);
              console.log(`   Active: ${found.isActive}`);
              console.log(`   Created At: ${found.createdAt}`);
            } else {
              console.log(`\n❌ NOT FOUND: "${targetName}" in public API.`);
              console.log('Sample of products found:');
              products.slice(0, 5).forEach(p => console.log(` - ${p.name}`));
            }

    } catch (e) {
        console.error('Error fetching products:', e.message);
    }
}

checkProducts();
