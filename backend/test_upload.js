require('dotenv').config();
const cloudinary = require('./config/cloudinary');
const path = require('path');

async function testUpload() {
    try {
        console.log("Testing Upload API...");
        const res = await cloudinary.uploader.upload(path.join(__dirname, 'uploads/products/100CreatineMonohydrate.jpg'), {
            folder: 'protienlab/test',
            resource_type: 'image'
        });
        console.log("Upload Success! Cloudinary URL:", res.secure_url);
    } catch (e) {
        console.error("Upload Error:", e);
    }
}
testUpload();
