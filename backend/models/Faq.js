const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  answer: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['account', 'savings', 'loans', 'investments', 'mobile', 'general'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['pending', 'answered', 'archived'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Faq', faqSchema);