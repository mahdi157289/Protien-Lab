const mongoose = require('mongoose');

const mongoUri = 'mongodb+srv://baccarmahdi09:QGOXemXdJ5CigQ09@cluster0.ygb4b3i.mongodb.net/nutrition_store?retryWrites=true&w=majority&appName=Cluster0&tls=true&ssl=true';

async function findAdmin() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Attempt to find users with role 'admin'
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      role: String
    }));
    
    const admins = await User.find({ role: 'admin' });
    console.log('Admins found:', admins.map(a => a.email));
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

findAdmin();
