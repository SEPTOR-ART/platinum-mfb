// Cookie Consent Banner for Platinum Microfinance Bank
(function() {
    'use strict';

    // Check if user has already made a choice
    if (document.cookie.includes('cookieConsent=true')) {
        return; // User has already consented
    }

    // Create cookie banner HTML
    const bannerHTML = `
        <div id="cookie-banner" style="
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 20px;
            z-index: 9999;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        ">
            <div class="container">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <div style="display: flex; align-items: center; margin-bottom: 10px;">
                            <i class="fas fa-cookie-bite" style="font-size: 24px; margin-right: 15px;"></i>
                            <h5 style="margin: 0; font-weight: 600;">Cookie Notice</h5>
                        </div>
                        <p style="margin: 0; font-size: 14px; opacity: 0.9;">
                            We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                            By continuing to use our website, you consent to our use of cookies in accordance with our 
                            <a href="cookie-consent.html" style="color: white; text-decoration: underline;">Cookie Policy</a>.
                        </p>
                    </div>
                    <div class="col-md-4 text-end">
                        <div style="display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
                            <button id="cookie-settings" style="
                                background: rgba(255,255,255,0.2);
                                color: white;
                                border: 1px solid rgba(255,255,255,0.3);
                                padding: 8px 16px;
                                border-radius: 20px;
                                font-size: 12px;
                                cursor: pointer;
                                transition: all 0.3s ease;
                            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
                               onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                                <i class="fas fa-cog"></i> Settings
                            </button>
                            <button id="cookie-accept" style="
                                background: white;
                                color: #28a745;
                                border: none;
                                padding: 8px 20px;
                                border-radius: 20px;
                                font-size: 12px;
                                font-weight: 600;
                                cursor: pointer;
                                transition: all 0.3s ease;
                            " onmouseover="this.style.transform='translateY(-2px)'" 
                               onmouseout="this.style.transform='translateY(0)'">
                                <i class="fas fa-check"></i> Accept All
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Create backdrop
    const backdropHTML = `
        <div id="cookie-backdrop" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 9998;
            display: none;
        "></div>
    `;

    // Add banner to page
    document.body.insertAdjacentHTML('beforeend', bannerHTML);
    document.body.insertAdjacentHTML('beforeend', backdropHTML);

    // Cookie management functions
    function setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure`;
    }

    function acceptAllCookies() {
        setCookie('cookieConsent', 'true', 365);
        setCookie('essentialCookies', 'true', 365);
        setCookie('analyticsCookies', 'true', 365);
        setCookie('functionalCookies', 'true', 365);
        setCookie('marketingCookies', 'false', 365); // Not used currently
        
        // Store preferences in localStorage
        localStorage.setItem('cookiePreferences', JSON.stringify({
            essential: true,
            analytics: true,
            functional: true,
            marketing: false,
            timestamp: new Date().toISOString()
        }));

        hideBanner();
        
        // Initialize analytics if accepted
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
    }

    function hideBanner() {
        const banner = document.getElementById('cookie-banner');
        const backdrop = document.getElementById('cookie-backdrop');
        
        if (banner) {
            banner.style.transform = 'translateY(100%)';
            banner.style.transition = 'transform 0.3s ease';
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
        
        if (backdrop) {
            backdrop.style.display = 'none';
        }
    }

    function showCookieSettings() {
        // Redirect to cookie preferences page
        window.location.href = 'cookie-consent.html';
    }

    // Add event listeners
    document.addEventListener('DOMContentLoaded', function() {
        const acceptBtn = document.getElementById('cookie-accept');
        const settingsBtn = document.getElementById('cookie-settings');

        if (acceptBtn) {
            acceptBtn.addEventListener('click', acceptAllCookies);
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', showCookieSettings);
        }
    });

    // Auto-hide banner after 10 seconds with a reminder
    setTimeout(() => {
        const banner = document.getElementById('cookie-banner');
        if (banner && !document.cookie.includes('cookieConsent=true')) {
            const reminder = document.createElement('div');
            reminder.style.cssText = `
                position: absolute;
                top: -10px;
                right: 10px;
                background: #ffc107;
                color: #000;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 11px;
                font-weight: 600;
                animation: pulse 2s infinite;
            `;
            reminder.innerHTML = 'Click to continue browsing';
            banner.appendChild(reminder);
        }
    }, 10000);

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
        
        #cookie-banner a {
            color: white !important;
            text-decoration: underline !important;
        }
        
        #cookie-banner a:hover {
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);

})();
