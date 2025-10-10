const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
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
  phone: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: String,
    required: true,
    trim: true
  },
  qualifications: {
    type: String,
    trim: true
  },
  coverLetter: {
    type: String,
    trim: true
  },
  resume: {
    filename: String,
    path: String
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'interviewed', 'accepted', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Career', careerSchema);
