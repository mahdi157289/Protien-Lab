const cloudinary = require('./config/cloudinary');

async function test() {
    try {
        const res = await cloudinary.api.resource('protienlab/products/nwzcotqyzo7ccr9nplv4z', { colors: true });
        console.log("Success:", res);
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
