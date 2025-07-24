const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connection options for MongoDB
const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
  heartbeatFrequencyMS: 10000, // Check connection every 10 seconds
};

// Connect to MongoDB with retry logic
const connectWithRetry = () => {
  mongoose.connect(process.env.MONGODB_URI, dbOptions)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
      console.error('MongoDB connection error:', err.message);
      console.log('Retrying connection in 5 seconds...');
      setTimeout(connectWithRetry, 5000); // Retry every 5 seconds
    });
};
connectWithRetry();

// Set strictQuery option to suppress Mongoose 7 deprecation warning
mongoose.set('strictQuery', false);

// Models
const Account = require('./models/Account');
const Contact = require('./models/Contact');
const Loan = require('./models/Loan');
const Job = require('./models/Job');
const Faq = require('./models/Faq');
const Investment = require('./models/Investment');

// Routes

// Root route for health check
app.get('/', (req, res) => {
  res.json({
    message: 'Platinum MFB Backend is running',
    endpoints: ['/api/open-account', '/api/contact', '/api/loan', '/api/jobs', '/api/faqs', '/api/investments']
  });
});

// Open Account API
app.post('/api/open-account', async (req, res) => {
  try {
    const { full_name, email, phone, account_type, address } = req.body;
    if (!full_name || !email || !phone || !account_type || !address) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const account = new Account({ full_name, email, phone, account_type, address });
    await account.save();
    res.status(201).json({ message: 'Account application submitted successfully' });
  } catch (error) {
    console.error('Error in /api/open-account:', error);
    res.status(500).json({ error: 'Error submitting application' });
  }
});

// Contact Form API
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const contact = new Contact({ name, email, message });
    await contact.save();
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error in /api/contact:', error);
    res.status(500).json({ error: 'Error sending message' });
  }
});

// Loan Application API
app.post('/api/loan', async (req, res) => {
  try {
    const { full_name, email, amount, purpose } = req.body;
    if (!full_name || !email || !amount || !purpose) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const loan = new Loan({ full_name, email, amount, purpose });
    await loan.save();
    res.status(201).json({ message: 'Loan application submitted successfully' });
  } catch (error) {
    console.error('Error in /api/loan:', error);
    res.status(500).json({ error: 'Error submitting application' });
  }
});

// Jobs API
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error in /api/jobs:', error);
    res.status(500).json({ error: 'Error fetching jobs' });
  }
});

// FAQs API - Get all FAQs
app.get('/api/faqs', async (req, res) => {
  try {
    const faqs = await Faq.find();
    res.status(200).json(faqs);
  } catch (error) {
    console.error('Error in /api/faqs:', error);
    res.status(500).json({ error: 'Error fetching FAQs' });
  }
});

// FAQs API - Add new FAQ
app.post('/api/faqs', async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }
    const faq = new Faq({ question, answer });
    await faq.save();
    res.status(201).json({ message: 'FAQ added successfully' });
  } catch (error) {
    console.error('Error in /api/faqs (POST):', error);
    res.status(500).json({ error: 'Error adding FAQ' });
  }
});

// Investments API
app.get('/api/investments', async (req, res) => {
  try {
    const investments = await Investment.find();
    res.status(200).json(investments);
  } catch (error) {
    console.error('Error in /api/investments:', error);
    res.status(500).json({ error: 'Error fetching investments' });
  }
});

// Error handling for uncaught routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed due to application termination');
    process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
