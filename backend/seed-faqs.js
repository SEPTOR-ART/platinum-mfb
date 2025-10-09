const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Faq = require('./models/Faq');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const seedFAQs = async () => {
  try {
    await Faq.deleteMany();
    await Faq.insertMany([
      {
        question: 'How do I open an account with Platinum MFB?',
        answer: 'You can open an account by filling out our online application form or visiting any of our branches. You\'ll need to provide valid identification and proof of address.'
      },
      {
        question: 'What is the minimum balance for a savings account?',
        answer: 'Our basic savings account has no minimum balance requirement. You can start saving with any amount that suits your budget.'
      },
      {
        question: 'How long does it take to get a loan approved?',
        answer: 'Loan approval typically takes 24-48 hours for personal loans and 3-5 business days for business loans, depending on the completeness of your application.'
      },
      {
        question: 'Do you offer mobile banking?',
        answer: 'Yes, we have a secure mobile banking app available for both iOS and Android devices. You can download it from the App Store or Google Play Store.'
      },
      {
        question: 'What are your business hours?',
        answer: 'Our branches are open Monday to Friday from 8:00 AM to 5:00 PM, and Saturday from 9:00 AM to 2:00 PM. Our online banking is available 24/7.'
      },
      {
        question: 'How can I contact customer service?',
        answer: 'You can reach our customer service team by phone at +1 (555) 123-4567, email at support@platinummfb.com, or through our online contact form.'
      },
      {
        question: 'What investment options do you offer?',
        answer: 'We offer various investment products including fixed deposits, mutual funds, and retirement savings plans. Contact our investment advisors for personalized recommendations.'
      },
      {
        question: 'Is my money safe with Platinum MFB?',
        answer: 'Yes, your deposits are insured and we use advanced security measures to protect your information and transactions.'
      }
    ]);
    console.log('FAQs seeded successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding FAQs:', error);
  }
};

seedFAQs();
