const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  account_type: { type: String, required: true },
  initial_deposit: { type: Number, required: true },
  occupation: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Account', accountSchema);