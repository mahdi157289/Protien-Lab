const axios = require('axios');

async function testOrder() {
  try {
    console.log('Placing a test order on the live website...');
    const response = await axios.post('https://proteinlab.tn/api/orders/guest', {
      orderItems: [
        { product: 'offer-pack-ultimate', quantity: 1, price: 199 }
      ],
      shippingAddress: {
        fullName: 'Agent Antigravity',
        email: 'testagent2@antigravity.local',
        phoneNumber: '12345678',
        address: 'Test Avenue, Tunis'
      }
    });

    console.log('Order placed successfully. Response:');
    console.log(response.data);

    // Now let's connect to the DB directly to check if the order popped up
    const mongoose = require('mongoose');
    const mongoUri = 'mongodb+srv://baccarmahdi09:QGOXemXdJ5CigQ09@cluster0.ygb4b3i.mongodb.net/nutrition_store?retryWrites=true&w=majority&appName=Cluster0&tls=true&ssl=true';
    
    console.log('Connecting to database to verify...');
    await mongoose.connect(mongoUri);

    const orderSchema = new mongoose.Schema({}, { strict: false });
    const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

    const latestOrder = await Order.findOne().sort({ createdAt: -1 });
    console.log('Most recent order in the Admin Panel / Database:');
    console.log(latestOrder);

    await mongoose.disconnect();
  } catch (err) {
    if (err.response) {
      console.error('API Error:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
    process.exit(1);
  }
}

testOrder();
