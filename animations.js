// Enhanced 3D Animations and Scroll Effects for Platinum MFB

// Scroll Reveal Observer
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('active');
      }, index * 100); // Stagger animation
    }
  });
}, observerOptions);

// Initialize scroll animations
function initScrollAnimations() {
  // Add reveal class to elements
  const serviceCards = document.querySelectorAll('.service-card');
  const productCards = document.querySelectorAll('.product-card');
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  const featureItems = document.querySelectorAll('.feature-item');
  
  serviceCards.forEach((card, index) => {
    card.classList.add('reveal');
    card.style.animationDelay = `${index * 0.1}s`;
    observer.observe(card);
  });
  
  productCards.forEach((card, index) => {
    card.classList.add('reveal');
    card.style.animationDelay = `${index * 0.1}s`;
    observer.observe(card);
  });
  
  testimonialCards.forEach((card, index) => {
    card.classList.add('reveal-left');
    card.style.animationDelay = `${index * 0.1}s`;
    observer.observe(card);
  });
  
  featureItems.forEach((item, index) => {
    item.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(item);
    item.classList.add('animate');
  });
}

// Parallax effect for hero section
function initParallax() {
  const heroSection = document.querySelector('.hero-section');
  if (!heroSection) return;
  
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * 0.5;
    
    if (heroSection) {
      heroSection.style.transform = `translate3d(0, ${rate}px, 0)`;
    }
  });
}

// Navbar scroll effect
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// 3D Tilt effect for cards
function init3DTilt() {
  const cards = document.querySelectorAll('.service-card, .product-card, .testimonial-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// Magnetic button effect
function initMagneticButtons() {
  const buttons = document.querySelectorAll('.btn-primary, .btn-success');
  
  buttons.forEach(button => {
    button.addEventListener('mousemove', (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = '';
    });
  });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
}

// Add floating animation to icons
function initFloatingIcons() {
  const icons = document.querySelectorAll('.service-icon, .feature-icon');
  
  icons.forEach((icon, index) => {
    icon.style.animation = `float 3s ease-in-out infinite`;
    icon.style.animationDelay = `${index * 0.2}s`;
  });
}

// Add pulse animation on scroll
function initPulseOnScroll() {
  const statsNumbers = document.querySelectorAll('.stats-number');
  
  const pulseObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'pulse 1s ease-in-out';
        setTimeout(() => {
          entry.target.style.animation = '';
        }, 1000);
      }
    });
  }, { threshold: 0.5 });
  
  statsNumbers.forEach(stat => pulseObserver.observe(stat));
}

// Cursor trail effect (optional - subtle)
function initCursorTrail() {
  const coords = { x: 0, y: 0 };
  const circles = document.querySelectorAll('.cursor-circle');
  
  if (circles.length === 0) {
    // Create cursor circles
    for (let i = 0; i < 5; i++) {
      const circle = document.createElement('div');
      circle.className = 'cursor-circle';
      circle.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(13, 108, 51, ${0.5 - i * 0.1});
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.1s ease;
      `;
      document.body.appendChild(circle);
    }
  }
  
  document.addEventListener('mousemove', (e) => {
    coords.x = e.clientX;
    coords.y = e.clientY;
  });
  
  function animateCircles() {
    let x = coords.x;
    let y = coords.y;
    
    document.querySelectorAll('.cursor-circle').forEach((circle, index) => {
      circle.style.left = x - 5 + 'px';
      circle.style.top = y - 5 + 'px';
      circle.style.transform = `scale(${(5 - index) / 5})`;
      
      const nextCircle = document.querySelectorAll('.cursor-circle')[index + 1];
      if (nextCircle) {
        x += (coords.x - x) * 0.3;
        y += (coords.y - y) * 0.3;
      }
    });
    
    requestAnimationFrame(animateCircles);
  }
  
  animateCircles();
}

// Initialize all animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Core animations
  initScrollAnimations();
  initNavbarScroll();
  initSmoothScroll();
  
  // Enhanced 3D effects
  setTimeout(() => {
    init3DTilt();
    initMagneticButtons();
    initFloatingIcons();
    initPulseOnScroll();
  }, 100);
  
  // Optional effects (can be disabled if too much)
  // initParallax();
  // initCursorTrail();
  
  // Add entrance animation to page
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  }, 100);
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Add loading animation
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});
