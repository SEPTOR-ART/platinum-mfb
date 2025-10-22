// Script to update all HTML pages with minimal 3D effects
const fs = require('fs');
const path = require('path');

// List of HTML files to update
const htmlFiles = [
  'about.html',
  'services.html',
  'open_account.html',
  'personal-accounts.html', 
  'business-accounts.html',
  'loan.html',
  'savings.html',
  'investments.html',
  'mobile-banking.html',
  'career.html',
  'faqs.html',
  'contact.html',
  'terms.html',
  'privacy.html',
  'cookie-consent.html',
  'security-policy.html',
  'admin.html',
  'login.html'
];

// Function to update HTML file
function updateHtmlFile(filename) {
  try {
    const filePath = path.join(__dirname, filename);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filename}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add perspective to body
    content = content.replace(
      /body \{[^}]*\}/,
      `body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: var(--text-dark);
      perspective: 1000px;
    }`
    );
    
    // Add 3D effects to service cards
    content = content.replace(
      /\.service-card \{[^}]*\}/,
      `.service-card {
      background: white;
      border-radius: 10px;
      padding: 30px 20px;
      text-align: center;
      transition: all 0.3s;
      height: 100%;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
      margin-bottom: 20px;
      transform-style: preserve-3d;
    }`
    );
    
    content = content.replace(
      /\.service-card:hover \{[^}]*\}/,
      `.service-card:hover {
      transform: translateY(-10px) rotateX(5deg);
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
    }`
    );
    
    // Add 3D effects to buttons
    content = content.replace(
      /\.btn-primary \{[^}]*\}/,
      `.btn-primary {
      background-color: var(--primary);
      border-color: var(--primary);
      transition: all 0.3s ease;
    }`
    );
    
    content = content.replace(
      /\.btn-primary:hover \{[^}]*\}/,
      `.btn-primary:hover {
      background-color: var(--primary-dark);
      border-color: var(--primary-dark);
      transform: translateY(-3px) rotateX(5deg);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }`
    );
    
    // Add 3D effects to sidebar
    content = content.replace(
      /\.sidebar \{[^}]*\}/,
      `.sidebar {
      height: 100%;
      width: 0;
      position: fixed;
      z-index: 1050;
      top: 0;
      left: 0;
      background-color: #fff;
      overflow-x: hidden;
      transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease, transform 0.3s ease;
      box-shadow: 3px 0 20px rgba(0, 0, 0, 0.15);
      padding-top: 60px;
      opacity: 0;
      transform: translateX(-10px);
      transform-style: preserve-3d;
    }`
    );
    
    content = content.replace(
      /\.sidebar a:hover \{[^}]*\}/,
      `.sidebar a:hover {
      background-color: rgba(13, 108, 51, 0.1);
      color: var(--primary);
      transform: translateX(5px);
    }`
    );
    
    // Remove top navigation links if they exist
    content = content.replace(
      /<div class="collapse navbar-collapse" id="navbarNav">[\s\S]*?<\/div>/,
      `<div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <!-- Navigation links moved to sidebar for better mobile experience -->
        </ul>
      </div>`
    );
    
    // Write updated content
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filename}`);
    
  } catch (error) {
    console.log(`❌ Error updating ${filename}:`, error.message);
  }
}

// Update all files
console.log('🚀 Updating all HTML pages with minimal 3D effects...\n');

htmlFiles.forEach(updateHtmlFile);

console.log('\n✨ All pages updated with minimal 3D effects!');
console.log('📝 Changes applied:');
console.log('   - Added perspective to body');
console.log('   - Added 3D hover effects to cards');
console.log('   - Added 3D button animations');
console.log('   - Enhanced sidebar with 3D effects');
console.log('   - Removed top navigation links');
