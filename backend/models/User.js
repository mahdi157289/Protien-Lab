const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
    goal: { type: String, required: true },
    medicalConditions: { type: String, required: false },
});

module.exports = mongoose.model('User', UserSchema);