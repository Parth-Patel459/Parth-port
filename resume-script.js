/**
 * Resume Page Interactive Script
 * Version: 2.0
 * Author: Parth Patel
 * Description: Advanced interactive script with performance optimizations
 * and enhanced user experience features
 */

document.addEventListener('DOMContentLoaded', () => {
  // Performance and Utility Helpers
  const Performance = {
    // Advanced throttle function with requestAnimationFrame
    throttle(func, delay = 100) {
      let timeoutId = null;
      let lastExec = 0;

      return function(...args) {
        const context = this;
        const currentTime = Date.now();

        const execute = () => {
          lastExec = currentTime;
          func.apply(context, args);
        };

        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (currentTime - lastExec > delay) {
          execute();
        } else {
          timeoutId = setTimeout(execute, delay);
        }
      };
    },

    // Smooth scroll with advanced easing
    smoothScroll(target, duration = 800, offset = 70) {
      const targetElement = document.querySelector(target);
      if (!targetElement) return;

      const startPosition = window.pageYOffset;
      const targetPosition = targetElement.getBoundingClientRect().top + 
                              window.pageYOffset - offset;
      const distance = targetPosition - startPosition;

      let startTime = null;

      // Sophisticated easing function
      const easeInOutQuad = t => 
        t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const easedProgress = easeInOutQuad(progress);

        window.scrollTo(0, startPosition + distance * easedProgress);

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      }

      requestAnimationFrame(animation);
    }
  };

  // Advanced Navigation Management
  class NavigationManager {
    constructor() {
      this.navLinks = document.querySelectorAll(
        '.nav-links a, .sidebar ul a, .scroll-nav-item'
      );
      this.sections = document.querySelectorAll('section[id]');
      this.sidebar = document.getElementById('sidebar');
      this.overlay = document.querySelector('.overlay');
      
      this.init();
    }

    init() {
      // Smooth scrolling for navigation links
      this.navLinks.forEach(link => {
        link.addEventListener('click', this.handleNavigation.bind(this));
      });

      // Dynamic section tracking
      window.addEventListener(
        'scroll', 
        Performance.throttle(this.updateActiveSection.bind(this), 200)
      );

      // Keyboard accessibility for navigation
      this.addKeyboardNavigation();
    }

    // Enhanced keyboard navigation
    addKeyboardNavigation() {
      document.addEventListener('keydown', (e) => {
        // Ctrl + Arrow navigation between sections
        if (e.ctrlKey) {
          switch(e.key) {
            case 'ArrowDown':
              this.navigateToNextSection();
              break;
            case 'ArrowUp':
              this.navigateToPreviousSection();
              break;
          }
        }
      });
    }

    navigateToNextSection() {
      const currentScrollPosition = window.pageYOffset;
      const nextSection = Array.from(this.sections).find(
        section => section.offsetTop > currentScrollPosition
      );

      if (nextSection) {
        Performance.smoothScroll(`#${nextSection.id}`);
      }
    }

    navigateToPreviousSection() {
      const currentScrollPosition = window.pageYOffset;
      const previousSections = Array.from(this.sections)
        .filter(section => section.offsetTop < currentScrollPosition)
        .reverse();

      if (previousSections.length > 0) {
        Performance.smoothScroll(`#${previousSections[0].id}`);
      }
    }

    handleNavigation(event) {
      const link = event.currentTarget;
      const targetId = link.getAttribute('href') || 
                       link.getAttribute('data-target');

      if (targetId && (targetId.startsWith('#') || targetId.endsWith('.html'))) {
        event.preventDefault();

        // Internal section scrolling
        if (targetId.startsWith('#')) {
          Performance.smoothScroll(targetId);
          
          // Close mobile sidebar if open
          if (this.sidebar.classList.contains('active')) {
            this.toggleSidebar();
          }
        } else {
          // External page navigation
          window.location.href = targetId;
        }

        this.updateActiveLinks(targetId);
      }
    }

    updateActiveLinks(targetId) {
      this.navLinks.forEach(link => {
        link.classList.remove('active');
        
        const href = link.getAttribute('href') || 
                     link.getAttribute('data-target');
        
        if (href === targetId) {
          link.classList.add('active');
        }
      });
    }

    updateActiveSection() {
      const scrollPosition = window.scrollY + 100;

      this.sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollPosition >= sectionTop && 
            scrollPosition < sectionTop + sectionHeight) {
          const sectionId = `#${section.id}`;
          this.updateActiveLinks(sectionId);
        }
      });
    }

    toggleSidebar() {
      this.sidebar.classList.toggle('active');
      this.overlay.classList.toggle('active');
      
      document.body.style.overflow = this.sidebar.classList.contains('active') 
        ? 'hidden' 
        : '';
    }
  }

  // Advanced Theme Management
  class ThemeManager {
    constructor() {
      this.themeToggle = document.getElementById('theme-toggle');
      this.body = document.body;
      
      this.init();
    }

    init() {
      this.applyStoredTheme();
      this.themeToggle.addEventListener('click', this.toggleTheme.bind(this));
      
      // Add media query listener for system preference
      const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
      prefersDarkScheme.addListener(this.handleSystemThemeChange.bind(this));
    }

    handleSystemThemeChange(e) {
      if (e.matches) {
        this.enableDarkMode();
      } else {
        this.enableLightMode();
      }
    }

    applyStoredTheme() {
      const savedTheme = localStorage.getItem('theme-preference');
      const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

      if (savedTheme === 'dark' || 
          (savedTheme === null && prefersDarkScheme.matches)) {
        this.enableDarkMode();
      } else {
        this.enableLightMode();
      }
    }

    toggleTheme() {
      this.body.classList.contains('dark-mode') 
        ? this.enableLightMode() 
        : this.enableDarkMode();
    }

    enableDarkMode() {
      this.body.classList.add('dark-mode');
      this.updateThemeToggleIcon('dark');
      localStorage.setItem('theme-preference', 'dark');
    }

    enableLightMode() {
      this.body.classList.remove('dark-mode');
      this.updateThemeToggleIcon('light');
      localStorage.setItem('theme-preference', 'light');
    }

    updateThemeToggleIcon(mode) {
      const icon = this.themeToggle.querySelector('i');
      
      icon.classList.toggle('fa-moon', mode === 'light');
      icon.classList.toggle('fa-sun', mode === 'dark');
    }
  }

  // Scroll Management with Enhanced Features
  class ScrollManager {
    constructor() {
      this.scrollIndicator = document.getElementById('scroll-indicator');
      this.backToTopButton = document.getElementById('back-to-top');
      
      this.init();
    }

    init() {
      window.addEventListener('scroll', Performance.throttle(
        this.handleScrollEvents.bind(this), 50
      ));

      this.backToTopButton.addEventListener('click', () => {
        Performance.smoothScroll('#profile');
      });
    }

    handleScrollEvents() {
      this.updateScrollIndicator();
      this.toggleBackToTopButton();
      this.animateOnScroll();
    }

    updateScrollIndicator() {
      if (!this.scrollIndicator) return;

      const scrollTop = window.pageYOffset || 
                        document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - 
                        document.documentElement.clientHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;

      this.scrollIndicator.style.width = `${scrollPercent}%`;
    }

    toggleBackToTopButton() {
      if (!this.backToTopButton) return;

      const shouldShow = window.pageYOffset > 300;
      this.backToTopButton.classList.toggle('active', shouldShow);
    }

    // Add scroll-based animations
    animateOnScroll() {
      const animatedElements = document.querySelectorAll(
        '.education-card-animated, .skills-card-animated, ' +
        '.project-card-animated, .experience-card-animated'
      );

      animatedElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (elementTop < windowHeight * 0.75) {
          element.classList.add('active');
        }
      });
    }
  }

  // Logo Animation with Advanced Rendering
  class LogoAnimationManager {
    constructor() {
      this.logo = document.getElementById('logoSVG');
      this.logoElements = {
        stem: this.logo?.querySelector('.stem'),
        crossbar: this.logo?.querySelector('.crossbar'),
        topLoop: this.logo?.querySelector('.top-loop'),
        bottomCurve: this.logo?.querySelector('.bottom-curve'),
        diagonal: this.logo?.querySelector('.diagonal'),
        period: this.logo?.querySelector('.period')
      };

      this.init();
    }

    init() {
      if (!this.logo) return;

      // Initial animation after page load
      setTimeout(() => this.animateLogo(), 1500);

      // Add interaction for logo
      this.logo.addEventListener('click', () => this.animateLogo());
      this.logo.addEventListener('mouseenter', () => this.hoverEffect());
    }

    hoverEffect() {
      const { stem, crossbar, topLoop, bottomCurve, diagonal } = this.logoElements;
      
      [stem, crossbar, topLoop, bottomCurve, diagonal].forEach(el => {
        el.style.transition = 'stroke-width 0.3s ease';
        el.style.strokeWidth = '15';
      });

      setTimeout(() => {
        [stem, crossbar, topLoop, bottomCurve, diagonal].forEach(el => {
          el.style.strokeWidth = '12';
        });
      }, 300);
    }

    animateLogo() {
      const { stem, crossbar, topLoop, bottomCurve, diagonal, period } = this.logoElements;

      if (!stem || !crossbar || !topLoop || !bottomCurve || !diagonal || !period) return;

      // Reset animations
      [stem, crossbar, topLoop, bottomCurve, diagonal].forEach(el => {
        el.style.strokeDasharray = '1000';
        el.style.strokeDashoffset = '1000';
      });
      period.style.opacity = '0';

      // Force reflow
      void stem.offsetWidth;

      // Advanced animation sequence
      const animations = [
        { element: stem, delay: 0, duration: '1s' },
        { element: crossbar, delay: 600, duration: '0.8s' },
        { element: topLoop, delay: 1200, duration: '0.8s' },
        { element: bottomCurve, delay: 1800, duration: '0.8s' },
        { element: diagonal, delay: 2400, duration: '0.8s' },
        { element: period, delay: 3000, duration: '0.5s', type: 'fadeIn' }
      ];

      animations.forEach(({ element, delay, duration, type }) => {
        setTimeout(() => {
          if (type === 'fadeIn') {
            element.style.opacity = '1';
            element.style.animation = `fadeIn ${duration} forwards`;
          } else {
            element.style.animation = `draw ${duration} forwards`;
          }
        }, delay);
      });
    }
  }

  // Download Button Enhanced Tracking
  function setupDownloadButton() {
    const downloadBtn = document.querySelector('.download-btn');
    
    if (downloadBtn) {
      downloadBtn.addEventListener('click', function(e) {
        const originalContent = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
        
        setTimeout(() => {
          this.innerHTML = originalContent;
        }, 2000);
        
        // Optional advanced tracking
        try {
          if (typeof gtag === 'function') {
            gtag('event', 'download', {
              'event_category': 'Resume',
              'event_label': 'PDF Download',
              'transport_type': 'beacon',
              'event_callback': () => {
                console.log('Download tracked successfully');
              }
            });
          }
        } catch (error) {
          console.error('Tracking error:', error);
        }
        
        // Fallback download handling
        const isDownloadSupported = 'download' in document.createElement('a');
        
        if (!isDownloadSupported) {
          e.preventDefault();
          window.open(this.href, '_blank');
          
          const notification = document.createElement('div');
          notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--primary-color);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          `;
          notification.textContent = 'Browser download unsupported. PDF opened in new tab.';
          
          document.body.appendChild(notification);
          
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 5000);
        }
      });
    }
  }

  // Global Page Initialization
  function initializePage() {
    // Add custom animation styles
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes draw { to { stroke-dashoffset: 0; } }
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.5); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(styleElement);

    // Performance optimization: Lazy load images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
      let imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            let image = entry.target;
            image.src = image.dataset.src;
            image.classList.add('loaded');
            imageObserver.unobserve(image);
          }
        });
      }, {
        rootMargin: "0px 0px 50px 0px"
      });

      lazyImages.forEach(image => imageObserver.observe(image));
    }

    // Initialize all managers
    new NavigationManager();
    new ThemeManager();
    new ScrollManager();
    new LogoAnimationManager();
    setupDownloadButton();

    // Performance metrics and error tracking
    window.addEventListener('error', (event) => {
      console.error('Unhandled error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Add performance mark
    performance.mark('page-interactive');
  }

  // Initialize page after DOM is fully loaded
  initializePage();
});

// Additional Performance and Accessibility Enhancements
document.addEventListener('DOMContentLoaded', () => {
  // Preload critical resources
  const preloadLinks = [
    { href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css', as: 'style' },
    { href: './resume-styles.css', as: 'style' }
  ];

  preloadLinks.forEach(link => {
    const preloadLink = document.createElement('link');
    preloadLink.href = link.href;
    preloadLink.rel = 'preload';
    preloadLink.as = link.as;
    document.head.appendChild(preloadLink);
  });

  // Accessibility enhancements
  const addAccessibilityAttributes = () => {
    // Add aria-labels to unlabeled elements
    document.querySelectorAll('a:not([aria-label])').forEach(link => {
      const text = link.textContent.trim() || link.getAttribute('href');
      link.setAttribute('aria-label', `Link to ${text}`);
    });

    // Ensure proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach(heading => {
      const currentLevel = parseInt(heading.tagName[1]);
      if (currentLevel > lastLevel + 1) {
        console.warn(`Potential accessibility issue: Skipped heading level from h${lastLevel} to h${currentLevel}`);
      }
      lastLevel = currentLevel;
    });
  };

  // Run accessibility checks
  addAccessibilityAttributes();

  // Add keyboard navigation support
  const addKeyboardNavigation = () => {
    const focusableElements = document.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach(element => {
      element.addEventListener('keydown', (e) => {
        // Enter key acts like a click
        if (e.key === 'Enter') {
          e.preventDefault();
          element.click();
        }

        // Spacebar for buttons and links
        if (e.key === ' ' && 
            (element.tagName === 'BUTTON' || element.tagName === 'A')) {
          e.preventDefault();
          element.click();
        }
      });
    });
  };

  // Initialize keyboard navigation
  addKeyboardNavigation();
});
