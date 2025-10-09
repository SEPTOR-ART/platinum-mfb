# Platinum Microfinance Bank Limited - Full Stack Banking Website

A modern, responsive banking website for Platinum Microfinance Bank Limited, built with Node.js, Express, MongoDB, and Bootstrap. Features account opening, microloans, SME financing, and customer support. Licensed by the Central Bank of Nigeria (CBN) as a Tier One Unit Microfinance Bank.

## 🏦 About Platinum Microfinance Bank Limited

**Corporate Information:**
- **Name**: Platinum Microfinance Bank Limited
- **Registered Office**: 160 Ziks Avenue, Awka, Anambra State, Nigeria
- **Incorporated**: 26th September 2023
- **License**: Licensed by the Central Bank of Nigeria (CBN) as a Tier One Unit Microfinance Bank
- **RC Number**: 7155803
- **Slogan**: "Empowering Dreams and Fostering Growth"

**Vision**: To be the most trusted and sought-after Microfinance Bank, driving financial inclusion through innovation, sustainable wealth creation, and equitable economic empowerment.

**Mission**: We are a team of dedicated professionals committed to empowering and delivering excellent banking services to our customers through innovative and technology-driven financial solutions, fostering grassroots economic growth and creating wealth for all stakeholders.

**Core Values (PLATINUM):**
- **P** — Professionalism: We uphold the highest standard of expertise and ethics in delivering financial services to our clients.
- **L** — Leadership: We inspire leadership through visionary thinking and a commitment to uplifting others.
- **A** — Accountability: We take ownership of our actions, communicate openly, and operate with unwavering integrity.
- **T** — Technology-Driven: We leverage cutting-edge digital solutions to deliver efficient financial services to all.
- **I** — Integrity: We uphold the highest moral standards, ensuring fairness, confidentiality, and respect to all.
- **N** — Nurturing Growth: We empower our clients and community through education, mentorship, and financial solutions.
- **U** — Unity: We achieve more through teamwork, collaboration, and strategic partnerships.
- **M** — Mutual Respect: We value diversity, treat everyone with dignity, fairness, and empathy.

**Products & Services:**
- Savings Accounts (Regular, Kids, Education)
- Current Accounts
- Easy Save (Daily/Weekly/Monthly savings)
- Esusu (Rotating Savings Groups)
- Microloans
- Salary Advances
- SME Financing
- Target Savings
- Fixed Deposits
- Mobile & Internet Banking (coming soon)

**Contact Information:**
- **Head Office**: 160 Ziks Avenue, Awka, Anambra State, Nigeria
- **Phone**: 08154404040, 09017000710, 09022797884
- **Email**: info@platinummfb.com

## 🚀 Features

- **Modern UI/UX**: Responsive design with green theme inspired by Fidelity Bank
- **Account Management**: Savings accounts, current accounts, and target savings
- **Microloans & SME Financing**: Apply for microloans, salary advances, and SME financing
- **Mobile & Internet Banking**: Coming soon - information about upcoming digital services
- **Customer Support**: Contact forms and FAQ system
- **Career Portal**: Job listings and application system
- **Admin Features**: Add FAQs and manage content
- **CBN Licensed**: Licensed by Central Bank of Nigeria as Tier One Unit Microfinance Bank

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Frontend**: HTML5, CSS3, Bootstrap 5, JavaScript
- **Icons**: Font Awesome
- **Deployment**: Render, Vercel, or AWS compatible

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/platinum-mfb.git
cd platinum-mfb
```

### 2. Install Dependencies
```bash
npm run install-deps
```

### 3. Environment Configuration
```bash
# Copy the example environment file
cp env.example backend/.env

# Edit backend/.env with your configuration:
# - PORT=5000
# - MONGODB_URI=your_mongodb_connection_string
# - CORS_ORIGIN=your_allowed_origins
```

### 4. Database Setup
```bash
# Start MongoDB (if using local installation)
mongod

# Or configure MongoDB Atlas connection string in .env
```

### 5. Seed the Database (Optional)
```bash
npm run seed
```
This will populate the database with sample jobs, investments, and FAQs.

### 6. Start the Application
```bash
# Production
npm start

# Development (if you add nodemon)
npm run dev
```

### 7. Access the Application
- Frontend: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

## 📁 Project Structure

```
platinum-mfb/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── seed.js          # Sample job data
│   ├── seed-investments.js
│   ├── seed-faqs.js
│   ├── server.js        # Express server
│   └── package.json
├── assets/
│   └── images/          # Static images and logos
├── *.html              # Frontend pages
├── styles.css          # Custom CSS
├── scripts.js          # Frontend JavaScript
├── package.json        # Root package.json
└── README.md
```

## 🔌 API Endpoints

### Core Endpoints
- `GET /api/health` - Health check
- `POST /api/open-account` - Account application
- `POST /api/contact` - Contact form submission
- `POST /api/loan` - Loan application

### Content Endpoints
- `GET /api/jobs` - Fetch job listings
- `GET /api/faqs` - Fetch FAQs
- `POST /api/faqs` - Add new FAQ (admin)
- `GET /api/investments` - Fetch investment options

## 🎨 Frontend Pages

- **Home** (`index.html`) - Landing page with services overview
- **Open Account** (`open_account.html`) - Account application form
- **Loans** (`loan.html`) - Loan application form
- **Savings** (`savings.html`) - Savings products information
- **Investments** (`investments.html`) - Investment options
- **Mobile Banking** (`mobile-banking.html`) - Mobile app information
- **About** (`about.html`) - Company information
- **Contact** (`contact.html`) - Contact form and information
- **Careers** (`career.html`) - Job listings
- **FAQs** (`faqs.html`) - Frequently asked questions
- **Terms & Privacy** (`terms.html`, `privacy.html`) - Legal pages

## 🚀 Deployment

### Render.com (Recommended & Pre-configured) ⭐

The project is already configured for deployment on Render with `render.yaml`. Follow these steps:

#### **Quick Deployment Steps:**
1. **Ensure your code is pushed to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin master
   ```

2. **Deploy to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `SEPTOR-ART/platinum-mfb`
   - Render will automatically detect the `render.yaml` configuration
   - Service name will be: `platinum-mfb`

3. **Environment Variables (Automatically configured):**
   - `MONGODB_URI`: Your MongoDB connection string (from backend/.env)
   - `CORS_ORIGIN`: Automatically set to your Render URL
   - `PORT`: Automatically set to 10000
   - `NODE_ENV`: Set to `production`

4. **Deployment Process:**
   - Build command: `npm run install-deps`
   - Start command: `npm start`
   - Your site will be available at: `https://platinum-mfb.onrender.com`

#### **Manual Configuration (if needed):**
- **Build Command:** `npm run install-deps`
- **Start Command:** `npm start`
- **Environment:** Node.js
- **Root Directory:** `.` (project root)

### Alternative Platforms

#### **Vercel (Frontend Only)**
1. Import project from GitHub
2. Set build command: `npm run build`
3. Set output directory: `.` (root)
4. Add environment variables

#### **AWS/Heroku/Other Platforms**
- Ensure Node.js environment (v14+)
- Set PORT environment variable
- Configure MongoDB connection
- Set CORS origins for your domain
- Build command: `npm run install-deps`
- Start command: `npm start`

## 🔒 Environment Variables

```bash
PORT=5000                           # Server port
MONGODB_URI=mongodb://...          # Database connection
CORS_ORIGIN=https://yourdomain.com # Allowed origins
JWT_SECRET=your-secret-key         # For future auth features
```

## 📱 Responsive Design

The website is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes

## 🎯 Features Overview

### Account Management
- Personal and business account applications
- Multiple account types (savings, checking, high-yield)
- Online application forms with validation

### Loan Services
- Personal loans
- Business loans
- Education loans
- Flexible repayment terms

### Investment Options
- Growth funds
- Fixed income plans
- High-yield savings
- Retirement planning

### Customer Support
- 24/7 contact forms
- Comprehensive FAQ system
- Career opportunities
- Mobile banking information

## 🛡️ Security Features

- CORS protection
- Rate limiting
- Helmet.js security headers
- Input validation
- Environment variable protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Email: support@platinummfb.com
- Phone: +1 (555) 123-4567
- Website: [Your deployed URL]

## 🔄 Updates & Maintenance

- Regular security updates
- Feature enhancements
- Performance optimizations
- Database maintenance

---

**Built with ❤️ for Platinum Microfinance Bank**


