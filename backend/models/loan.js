const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  purpose: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Loan', loanSchema);