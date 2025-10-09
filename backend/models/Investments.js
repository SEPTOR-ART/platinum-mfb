const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  minimum_investment: { type: Number, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Investment', investmentSchema);