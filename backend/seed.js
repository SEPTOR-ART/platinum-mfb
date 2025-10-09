const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Job = require('./models/Job');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const seedJobs = async () => {
  try {
    await Job.deleteMany();
    await Job.insertMany([
      {
        title: 'Customer Service Representative',
        description: 'Assist customers with banking inquiries and provide excellent service.',
        location: 'Financial District, City'
      },
      {
        title: 'Loan Officer',
        description: 'Evaluate and process loan applications for personal and business clients.',
        location: 'Financial District, City'
      }
    ]);
    console.log('Jobs seeded successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding jobs:', error);
  }
};

seedJobs();