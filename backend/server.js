const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

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

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'platinum-mfb-admin-secret-key-2024';
}

if (!process.env.EMAIL_HOST) {
  process.env.EMAIL_HOST = 'smtp.gmail.com';
}

if (!process.env.EMAIL_PORT) {
  process.env.EMAIL_PORT = 587;
}

if (!process.env.EMAIL_USER) {
  process.env.EMAIL_USER = 'noreply@platinummfb.com';
}

if (!process.env.EMAIL_PASS) {
  process.env.EMAIL_PASS = 'your-email-password-here';
}

if (!process.env.BASE_URL) {
  process.env.BASE_URL = 'https://platinum-mfb.netlify.app';
}

// Email service configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email service configuration error:', error.message);
  } else {
    console.log('✅ Email service ready to send messages');
  }
});

// Email sending function
async function sendPasswordResetEmail(email, resetToken, adminName) {
  const resetUrl = `${process.env.BASE_URL}/reset-password.html?token=${resetToken}`;
  
  const mailOptions = {
    from: `"Platinum MFB Admin" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request - Platinum Microfinance Bank',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🔐 Password Reset</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Platinum Microfinance Bank Admin Portal</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${adminName},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            We received a request to reset your password for the Platinum MFB Admin Portal. 
            If you made this request, click the button below to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #28a745, #20c997); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold;
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);">
              🔑 Reset My Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Or copy and paste this link into your browser:
          </p>
          <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all; color: #495057;">
            ${resetUrl}
          </p>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons. 
              If you didn't request this password reset, please ignore this email.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            If you have any questions or need assistance, please contact our technical support team.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} Platinum Microfinance Bank Limited<br>
            160 Ziks Avenue, Awka, Anambra State, Nigeria<br>
            Licensed by the Central Bank of Nigeria (CBN)
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return false;
  }
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

// Security Headers Middleware
app.use((req, res, next) => {
  // Security headers to prevent browser warnings
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 
    'geolocation=(), microphone=(), camera=(), payment=(), usb=()'
  );
  
  // Relaxed Content Security Policy for compatibility
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; " +
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com https://fonts.googleapis.com; " +
    "connect-src 'self' https://platinum-mfb.onrender.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; " +
    "media-src 'self'; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self' https://platinum-mfb.onrender.com; " +
    "frame-ancestors 'self'; " +
    "upgrade-insecure-requests"
  );
  
  // Strict Transport Security (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.removeHeader('X-Powered-By');
  
  next();
});

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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
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
    .then(async () => {
      console.log('Connected to MongoDB');
      // Create default admin user after connection
      await createDefaultAdmin();
    })
    .catch(err => {
      console.error('MongoDB connection error:', err.message);
      console.log('Retrying connection in 5 seconds...');
      setTimeout(connectWithRetry, 5000); // Retry every 5 seconds
    });
};
connectWithRetry();

// Set strictQuery option to suppress Mongoose 7 deprecation warning
mongoose.set('strictQuery', false);

// Create default admin user if none exists
async function createDefaultAdmin() {
  try {
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    
    if (!existingAdmin) {
      const admin = new Admin({
        username: 'admin',
        password: 'admin123',
        email: 'admin@platinummfb.com',
        fullName: 'System Administrator',
        role: 'super_admin',
        isActive: true
      });

      await admin.save();
      console.log('✅ Default admin user created successfully!');
      console.log('🔐 Username: admin | Password: admin123');
      console.log('⚠️  Please change the password after first login!');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
}

// Models
const Account = require('./models/Account');
const Contact = require('./models/Contact');
const Loan = require('./models/Loan');
const Job = require('./models/Job');
const Faq = require('./models/Faq');
const Investment = require('./models/Investment');
const Admin = require('./models/Admin');
const InvestmentApplication = require('./models/InvestmentApplication');
const Career = require('./models/Career');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Admin Login Route with enhanced security
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password, remember } = req.body;

    // Input validation
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_.-]+$/.test(username) || username.length < 3 || username.length > 50) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid username format' 
      });
    }

    // Validate password length
    if (password.length < 6 || password.length > 100) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid password format' 
      });
    }

    // Find admin user (case-insensitive username)
    const admin = await Admin.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') }, 
      isActive: true 
    });

    if (!admin) {
      // Use same error message to prevent username enumeration
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials. Please check your username and password.' 
      });
    }

    // Check if account is locked
    if (admin.isLocked) {
      const lockTimeRemaining = Math.ceil((admin.lockUntil - Date.now()) / 60000);
      return res.status(423).json({ 
        success: false, 
        message: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${lockTimeRemaining} minute(s).` 
      });
    }

    // Compare password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      // Increment login attempts
      await admin.incLoginAttempts();
      
      // Use same error message to prevent username enumeration
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials. Please check your username and password.' 
      });
    }

    // Reset login attempts and update last login
    await admin.resetLoginAttempts();
    await admin.updateLastLogin();

    // Generate JWT token with enhanced payload
    const tokenExpiry = remember ? '30d' : '24h';
    const token = jwt.sign(
      { 
        id: admin._id, 
        username: admin.username, 
        role: admin.role,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    // Log successful login (for security audit)
    console.log(`✅ Successful login: ${admin.username} at ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred during login. Please try again later.' 
    });
  }
});

// Verify Token Route
app.get('/api/admin/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Create Admin User Route (for initial setup)
app.post('/api/admin/create-admin', async (req, res) => {
  console.log('Create admin endpoint hit');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  
  try {
    // Check if any admin exists
    const existingAdmin = await Admin.findOne();
    
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.username);
      return res.status(200).json({ 
        success: true,
        message: 'Admin user already exists. You can login with:',
        credentials: {
          username: existingAdmin.username,
          password: 'admin123'
        },
        alreadyExists: true
      });
    }

    console.log('Creating new admin user...');
    
    // Create new admin user
    const admin = new Admin({
      username: 'admin',
      password: 'admin123',
      email: 'admin@platinummfb.com',
      fullName: 'System Administrator',
      role: 'super_admin',
      isActive: true
    });

    await admin.save();
    console.log('Admin user created successfully');
    
    res.json({
      success: true,
      message: 'Admin user created successfully',
      credentials: {
        username: 'admin',
        password: 'admin123'
      },
      alreadyExists: false
    });

  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating admin user: ' + error.message 
    });
  }
});

// Test endpoint to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Platinum MFB API is working!', 
    timestamp: new Date().toISOString(),
    version: '2.2.0',
    cors: 'CORS should be working',
    endpoints: {
      career: '/api/career-application',
      faq: '/api/faq-submission',
      admin: {
        faqs: '/api/admin/faqs',
        careers: '/api/admin/careers'
      }
    }
  });
});

// Check if admin exists
app.get('/api/admin/check', async (req, res) => {
  try {
    const admin = await Admin.findOne();
    res.json({
      adminExists: !!admin,
      message: admin ? 'Admin user exists' : 'No admin user found'
    });
  } catch (error) {
    console.error('Error checking admin:', error);
    res.status(500).json({ 
      adminExists: false,
      message: 'Error checking admin status: ' + error.message 
    });
  }
});

// Request password reset
app.post('/api/admin/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email address is required' 
      });
    }

    // Check if email ends with @platinummfb.com
    if (!email.endsWith('@platinummfb.com')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password reset is only available for @platinummfb.com email addresses' 
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email, isActive: true });

    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'No admin account found with this email address' 
      });
    }

    // Generate reset token
    const resetToken = admin.generatePasswordResetToken();
    await admin.save();

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(email, resetToken, admin.fullName);

    if (emailSent) {
      res.json({
        success: true,
        message: 'Password reset instructions have been sent to your email address'
      });
    } else {
      // Clear the token if email failed
      admin.clearPasswordResetToken();
      await admin.save();
      
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send password reset email. Please try again later.' 
      });
    }

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Verify password reset token
app.get('/api/admin/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const admin = await Admin.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    res.json({
      success: true,
      message: 'Reset token is valid',
      email: admin.email
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Reset password
app.post('/api/admin/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    const admin = await Admin.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    // Update password
    admin.password = newPassword;
    admin.clearPasswordResetToken();
    await admin.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Health route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root route for health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Platinum MFB Backend is running', 
    version: '2.5.0',
    status: 'Security headers and trust signals added to prevent browser warnings',
    endpoints: [
      '/api/open-account',
      '/api/contact', 
      '/api/loan',
      '/api/jobs',
      '/api/faqs',
      '/api/investments',
      '/api/investment-application',
      '/api/track-visit',
      '/api/analytics',
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

// Career Application API endpoint
app.post('/api/career-application', async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      position, 
      experience, 
      qualifications, 
      coverLetter 
    } = req.body;
    
    if (!firstName || !lastName || !email || !phone || !position || !experience) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Try database first
    try {
      const application = new Career({
        firstName,
        lastName,
        email,
        phone,
        position,
        experience,
        qualifications,
        coverLetter
      });
      
      await application.save();
      console.log('✅ Career application saved to database:', application._id);
      
      res.status(201).json({ 
        success: true, 
        message: 'Career application submitted successfully!',
        applicationId: application._id
      });
      
    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      
      // Fallback to file storage
      const dataDir = path.join(__dirname, 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const careerFile = path.join(dataDir, 'careers.json');
      let careers = [];
      
      if (fs.existsSync(careerFile)) {
        careers = JSON.parse(fs.readFileSync(careerFile, 'utf8'));
      }
      
      const newCareer = {
        id: Date.now().toString(),
        firstName,
        lastName,
        email,
        phone,
        position,
        experience,
        qualifications,
        coverLetter,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      careers.push(newCareer);
      fs.writeFileSync(careerFile, JSON.stringify(careers, null, 2));
      
      console.log('✅ Career application saved to file:', newCareer.id);
      
      res.status(201).json({ 
        success: true, 
        message: 'Career application submitted successfully!',
        applicationId: newCareer.id
      });
    }
  } catch (error) {
    console.error('Error in /api/career-application:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: `Validation error: ${error.message}` });
    }
    res.status(500).json({ error: `Error submitting application: ${error.message}` });
  }
});

// FAQ Submission API endpoint
app.post('/api/faq-submission', async (req, res) => {
  try {
    const { question, email, answer, category } = req.body;
    
    if (!question || !email) {
      return res.status(400).json({ error: 'Question and email are required' });
    }

    // Try database first
    try {
      const faq = new Faq({
        question,
        email,
        answer,
        category: category || 'general'
      });
      
      await faq.save();
      console.log('✅ FAQ submission saved to database:', faq._id);
      
      res.status(201).json({ 
        success: true, 
        message: 'FAQ submission received successfully!',
        faqId: faq._id
      });
      
    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      
      // Fallback to file storage
      const dataDir = path.join(__dirname, 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const faqFile = path.join(dataDir, 'faqs.json');
      let faqs = [];
      
      if (fs.existsSync(faqFile)) {
        faqs = JSON.parse(fs.readFileSync(faqFile, 'utf8'));
      }
      
      const newFaq = {
        id: Date.now().toString(),
        question,
        email,
        answer,
        category: category || 'general',
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      faqs.push(newFaq);
      fs.writeFileSync(faqFile, JSON.stringify(faqs, null, 2));
      
      console.log('✅ FAQ submission saved to file:', newFaq.id);
      
      res.status(201).json({ 
        success: true, 
        message: 'FAQ submission received successfully!',
        faqId: newFaq.id
      });
    }
  } catch (error) {
    console.error('Error in /api/faq-submission:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: `Validation error: ${error.message}` });
    }
    res.status(500).json({ error: `Error submitting FAQ: ${error.message}` });
  }
});

// Serve static frontend
const publicDir = path.join(__dirname, '..');
app.use(express.static(publicDir));

// Website Analytics API
app.post('/api/track-visit', async (req, res) => {
  try {
    const { page, referrer, userAgent, timestamp } = req.body;
    
    // Simple visit tracking - in a real app, you'd store this in a database
    console.log(`Visit tracked: ${page} from ${referrer || 'direct'} at ${timestamp || new Date()}`);
    
    res.json({ 
      success: true, 
      message: 'Visit tracked successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error tracking visit:', error);
    res.status(500).json({ error: 'Error tracking visit' });
  }
});

// Get website analytics
app.get('/api/analytics', async (req, res) => {
  try {
    // In a real app, you'd calculate these from your database
    const analytics = {
      totalVisits: Math.floor(Math.random() * 1000) + 500,
      uniqueVisitors: Math.floor(Math.random() * 700) + 300,
      pageViews: Math.floor(Math.random() * 200) + 100,
      avgSessionTime: Math.floor(Math.random() * 300) + 120,
      conversionRate: (Math.random() * 5 + 2).toFixed(1),
      topPages: [
        { page: 'Home', views: Math.floor(Math.random() * 200) + 100 },
        { page: 'Services', views: Math.floor(Math.random() * 150) + 80 },
        { page: 'Contact', views: Math.floor(Math.random() * 100) + 50 },
        { page: 'About', views: Math.floor(Math.random() * 80) + 40 }
      ],
      trafficSources: {
        direct: 60,
        google: 25,
        social: 10,
        referral: 5
      }
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Error fetching analytics' });
  }
});

// Admin endpoints to view submitted forms
app.get('/api/admin/accounts', authenticateToken, async (req, res) => {
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

app.get('/api/admin/contacts', authenticateToken, async (req, res) => {
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

app.get('/api/admin/loans', authenticateToken, async (req, res) => {
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

app.get('/api/admin/investment-applications', authenticateToken, async (req, res) => {
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

// Admin endpoint for FAQ submissions
app.get('/api/admin/faqs', authenticateToken, async (req, res) => {
  try {
    // Try database first
    try {
      const faqs = await Faq.find().sort({ created_at: -1 });
      res.json(faqs);
      return;
    } catch (dbError) {
      console.error('Database error, trying file fallback:', dbError.message);
      
      // Fallback to file data
      const faqsFile = path.join(__dirname, 'data', 'faqs.json');
      if (fs.existsSync(faqsFile)) {
        const fileData = JSON.parse(fs.readFileSync(faqsFile, 'utf8'));
        res.json(fileData);
        return;
      } else {
        res.json([]);
        return;
      }
    }
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ error: 'Error fetching FAQs' });
  }
});

// Admin endpoint for Career applications
app.get('/api/admin/careers', authenticateToken, async (req, res) => {
  try {
    // Try database first
    try {
      const careers = await Career.find().sort({ created_at: -1 });
      res.json(careers);
      return;
    } catch (dbError) {
      console.error('Database error, trying file fallback:', dbError.message);
      
      // Fallback to file data
      const careersFile = path.join(__dirname, 'data', 'careers.json');
      if (fs.existsSync(careersFile)) {
        const fileData = JSON.parse(fs.readFileSync(careersFile, 'utf8'));
        res.json(fileData);
        return;
      } else {
        res.json([]);
        return;
      }
    }
  } catch (error) {
    console.error('Error fetching career applications:', error);
    res.status(500).json({ error: 'Error fetching career applications' });
  }
});

// File-based data endpoints (fallback data)
app.get('/api/admin/file-data', authenticateToken, (req, res) => {
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
    
    // Read FAQ data
    const faqsFile = path.join(dataDir, 'faqs.json');
    if (fs.existsSync(faqsFile)) {
      fileData.faqs = JSON.parse(fs.readFileSync(faqsFile, 'utf8'));
    } else {
      fileData.faqs = [];
    }
    
    // Read career applications data
    const careersFile = path.join(dataDir, 'careers.json');
    if (fs.existsSync(careersFile)) {
      fileData.careers = JSON.parse(fs.readFileSync(careersFile, 'utf8'));
    } else {
      fileData.careers = [];
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
  console.log(`🚀 Platinum MFB Server v2.2.0 running on port ${PORT}`);
  console.log('✅ Career Application API: /api/career-application');
  console.log('✅ FAQ Submission API: /api/faq-submission');
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
