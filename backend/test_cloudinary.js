require('dotenv').config();
const cloudinary = require('./config/cloudinary');

console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);

async function test() {
    try {
        console.log('Testing Cloudinary upload...');
        // Test with a sample small image URL
        const res = await cloudinary.uploader.upload('https://cloudinary-devs.github.io/res/600.png', {
            folder: 'test_recovery'
        });
        console.log('✅ Success:', res.secure_url);
    } catch (err) {
        console.error('❌ Failed:', err);
    }
}

test();
