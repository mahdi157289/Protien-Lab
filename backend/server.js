require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes'); // Add this line
const adminRoutes = require('./routes/adminRoutes');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
connectDB();

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes); // Add this line
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));