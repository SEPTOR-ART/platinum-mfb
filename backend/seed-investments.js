const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Investment = require('./models/Investment');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const seedInvestments = async () => {
  try {
    await Investment.deleteMany();
    await Investment.insertMany([
      {
        title: 'Growth Fund',
        description: 'Invest in a diversified portfolio for long-term growth.',
        minimum_investment: 1000
      },
      {
        title: 'Fixed Income Plan',
        description: 'Earn steady returns with low risk.',
        minimum_investment: 500
      }
    ]);
    console.log('Investments seeded successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding investments:', error);
  }
};

seedInvestments();