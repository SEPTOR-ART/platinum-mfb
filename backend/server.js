const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Set default environment variables for Render deployment
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb+srv://sirprist1:Proprist1@cluster0.19difby.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
}

if (!process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN = '*';
}

if (!process.env.PORT) {
  process.env.PORT = process.env.RENDER ? 10000 : 5000;
}

// Fallback file storage for when database is not available
function saveToFile(filename, data) {
  try {
    const filePath = path.join(__dirname, 'data', filename);
    const dir = path.dirname(filePath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Read existing data
    let existingData = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      existingData = JSON.parse(fileContent);
    }
    
    // Add new data
    existingData.push({
      ...data,
      id: Date.now(),
      timestamp: new Date().toISOString()
    });
    
    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving to file:', error);
    return false;
  }
}

const app = express();

// Middleware
const corsEnv = process.env.CORS_ORIGIN || '*';
const allowedOrigins = corsEnv.split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all origins if '*' is specified
    if (allowedOrigins.includes('*')) return callback(null, true);
    
    // Allow specific origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    
    // Allow Netlify domains
    if (origin.includes('.netlify.app')) return callback(null, true);
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(helmet());
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use('/api', apiLimiter);
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
const InvestmentApplication = require('./models/InvestmentApplication');

// Routes

// Health route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root route for health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Platinum MFB Backend is running', 
    version: '2.3.0',
    status: 'Admin endpoints fixed - moved before 404 handler',
    endpoints: [
      '/api/open-account',
      '/api/contact', 
      '/api/loan',
      '/api/jobs',
      '/api/faqs',
      '/api/investments',
      '/api/investment-application',
      '/api/admin/accounts',
      '/api/admin/contacts', 
      '/api/admin/loans',
      '/api/admin/investment-applications',
      '/api/admin/file-data'
    ]
  });
});

// Open Account API
app.post('/api/open-account', async (req, res) => {
  try {
    const { full_name, email, phone, account_type, initial_deposit, occupation, address } = req.body;
    if (!full_name || !email || !phone || !account_type || !initial_deposit || !occupation || !address) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Try database first
    try {
      const account = new Account({ full_name, email, phone, account_type, initial_deposit, occupation, address });
      await account.save();
      res.status(201).json({ message: 'Account application submitted successfully' });
      return;
    } catch (dbError) {
      console.error('Database error, trying file fallback:', dbError.message);
      
      // Fallback to file storage
      const fileData = { full_name, email, phone, account_type, initial_deposit, occupation, address };
      if (saveToFile('accounts.json', fileData)) {
        res.status(201).json({ message: 'Account application submitted successfully (stored locally)' });
        return;
      } else {
        throw new Error('Both database and file storage failed');
      }
    }
  } catch (error) {
    console.error('Error in /api/open-account:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: `Validation error: ${error.message}` });
    }
    res.status(500).json({ error: `Error submitting application: ${error.message}` });
  }
});

// Contact Form API
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Try database first
    try {
      const contact = new Contact({ name, email, subject, message });
      await contact.save();
      res.status(201).json({ message: 'Message sent successfully' });
      return;
    } catch (dbError) {
      console.error('Database error, trying file fallback:', dbError.message);
      
      // Fallback to file storage
      const fileData = { name, email, subject, message };
      if (saveToFile('contacts.json', fileData)) {
        res.status(201).json({ message: 'Message sent successfully (stored locally)' });
        return;
      } else {
        throw new Error('Both database and file storage failed');
      }
    }
  } catch (error) {
    console.error('Error in /api/contact:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: `Validation error: ${error.message}` });
    }
    res.status(500).json({ error: `Error sending message: ${error.message}` });
  }
});

// Loan Application API
app.post('/api/loan', async (req, res) => {
  try {
    const { full_name, email, amount, purpose } = req.body;
    if (!full_name || !email || !amount || !purpose) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Try database first
    try {
      const loan = new Loan({ full_name, email, amount, purpose });
      await loan.save();
      res.status(201).json({ message: 'Loan application submitted successfully' });
      return;
    } catch (dbError) {
      console.error('Database error, trying file fallback:', dbError.message);
      
      // Fallback to file storage
      const fileData = { full_name, email, amount, purpose };
      if (saveToFile('loans.json', fileData)) {
        res.status(201).json({ message: 'Loan application submitted successfully (stored locally)' });
        return;
      } else {
        throw new Error('Both database and file storage failed');
      }
    }
  } catch (error) {
    console.error('Error in /api/loan:', error);
    res.status(500).json({ error: `Error submitting application: ${error.message}` });
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

// Investment Application API
app.post('/api/investment-application', async (req, res) => {
  try {
    const { full_name, email, phone, investment_type, amount, duration, source_of_funds, goals } = req.body;
    
    if (!full_name || !email || !phone || !investment_type || !amount || !duration) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Try database first
    try {
      const application = new InvestmentApplication({ 
        full_name, 
        email, 
        phone, 
        investment_type, 
        amount, 
        duration, 
        source_of_funds, 
        goals 
      });
      await application.save();
      res.status(201).json({ message: 'Investment application submitted successfully' });
      return;
    } catch (dbError) {
      console.error('Database error, trying file fallback:', dbError.message);
      
      // Fallback to file storage
      const fileData = { full_name, email, phone, investment_type, amount, duration, source_of_funds, goals };
      if (saveToFile('investment-applications.json', fileData)) {
        res.status(201).json({ message: 'Investment application submitted successfully (stored locally)' });
        return;
      } else {
        throw new Error('Both database and file storage failed');
      }
    }
  } catch (error) {
    console.error('Error in /api/investment-application:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: `Validation error: ${error.message}` });
    }
    res.status(500).json({ error: `Error submitting application: ${error.message}` });
  }
});

// Serve static frontend
const publicDir = path.join(__dirname, '..');
app.use(express.static(publicDir));

// Admin endpoints to view submitted forms
app.get('/api/admin/accounts', async (req, res) => {
  try {
    // Try database first
    try {
      const accounts = await Account.find().sort({ created_at: -1 });
      res.json(accounts);
      return;
    } catch (dbError) {
      console.error('Database error, trying file fallback:', dbError.message);
      
      // Fallback to file data
      const accountsFile = path.join(__dirname, 'data', 'accounts.json');
      if (fs.existsSync(accountsFile)) {
        const fileData = JSON.parse(fs.readFileSync(accountsFile, 'utf8'));
        res.json(fileData);
        return;
      } else {
        res.json([]);
        return;
      }
    }
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Error fetching accounts' });
  }
});

app.get('/api/admin/contacts', async (req, res) => {
  try {
    // Try database first
    try {
      const contacts = await Contact.find().sort({ created_at: -1 });
      res.json(contacts);
      return;
    } catch (dbError) {
      console.error('Database error, trying file fallback:', dbError.message);
      
      // Fallback to file data
      const contactsFile = path.join(__dirname, 'data', 'contacts.json');
      if (fs.existsSync(contactsFile)) {
        const fileData = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
        res.json(fileData);
        return;
      } else {
        res.json([]);
        return;
      }
    }
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Error fetching contacts' });
  }
});

app.get('/api/admin/loans', async (req, res) => {
  try {
    // Try database first
    try {
      const loans = await Loan.find().sort({ created_at: -1 });
      res.json(loans);
      return;
    } catch (dbError) {
      console.error('Database error, trying file fallback:', dbError.message);
      
      // Fallback to file data
      const loansFile = path.join(__dirname, 'data', 'loans.json');
      if (fs.existsSync(loansFile)) {
        const fileData = JSON.parse(fs.readFileSync(loansFile, 'utf8'));
        res.json(fileData);
        return;
      } else {
        res.json([]);
        return;
      }
    }
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({ error: 'Error fetching loans' });
  }
});

app.get('/api/admin/investment-applications', async (req, res) => {
  try {
    // Try database first
    try {
      const applications = await InvestmentApplication.find().sort({ created_at: -1 });
      res.json(applications);
      return;
    } catch (dbError) {
      console.error('Database error, trying file fallback:', dbError.message);
      
      // Fallback to file data
      const investmentsFile = path.join(__dirname, 'data', 'investment-applications.json');
      if (fs.existsSync(investmentsFile)) {
        const fileData = JSON.parse(fs.readFileSync(investmentsFile, 'utf8'));
        res.json(fileData);
        return;
      } else {
        res.json([]);
        return;
      }
    }
  } catch (error) {
    console.error('Error fetching investment applications:', error);
    res.status(500).json({ error: 'Error fetching investment applications' });
  }
});

// File-based data endpoints (fallback data)
app.get('/api/admin/file-data', (req, res) => {
  try {
    const dataDir = path.join(__dirname, 'data');
    const fileData = {};
    
    // Read account data
    const accountsFile = path.join(dataDir, 'accounts.json');
    if (fs.existsSync(accountsFile)) {
      fileData.accounts = JSON.parse(fs.readFileSync(accountsFile, 'utf8'));
    } else {
      fileData.accounts = [];
    }
    
    // Read contact data
    const contactsFile = path.join(dataDir, 'contacts.json');
    if (fs.existsSync(contactsFile)) {
      fileData.contacts = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
    } else {
      fileData.contacts = [];
    }
    
    // Read loan data
    const loansFile = path.join(dataDir, 'loans.json');
    if (fs.existsSync(loansFile)) {
      fileData.loans = JSON.parse(fs.readFileSync(loansFile, 'utf8'));
    } else {
      fileData.loans = [];
    }
    
    // Read investment applications data
    const investmentAppsFile = path.join(dataDir, 'investment-applications.json');
    if (fs.existsSync(investmentAppsFile)) {
      fileData.investment_applications = JSON.parse(fs.readFileSync(investmentAppsFile, 'utf8'));
    } else {
      fileData.investment_applications = [];
    }
    
    res.json(fileData);
  } catch (error) {
    console.error('Error reading file data:', error);
    res.status(500).json({ error: 'Error reading file data' });
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
