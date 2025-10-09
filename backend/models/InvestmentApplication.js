const mongoose = require('mongoose');

const investmentApplicationSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  investment_type: { type: String, required: true },
  amount: { type: Number, required: true },
  duration: { type: String, required: true },
  source_of_funds: { type: String },
  goals: { type: String },
  status: { type: String, default: 'pending', enum: ['pending', 'under-review', 'approved', 'rejected'] },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InvestmentApplication', investmentApplicationSchema);
