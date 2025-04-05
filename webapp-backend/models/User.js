const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  country: { type: String, required: true },
  stateProvince: { type: String },
  createdAt: { type: Date, default: Date.now },
  passwordUpdatedAt: { type: Date, default: Date.now }  // Add this field
});

module.exports = mongoose.model('User', userSchema);