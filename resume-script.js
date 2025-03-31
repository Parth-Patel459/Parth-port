/**
 * Resume Page JavaScript
 * - Handles interactive elements for the resume page
 * - Implements modular component pattern for better code organization
 */

document.addEventListener('DOMContentLoaded', () => {
  // ====== CACHE DOM ELEMENTS ======
  const elements = {
    sidebar: document.getElementById('sidebar'),
    overlay: document.querySelector('.overlay'),
    darkModeToggle: document.getElementById('theme-toggle'),
    navLinks: document.querySelectorAll('.nav-links a'),
    scrollIndicator: document.querySelector('.scroll-indicator'),
    scrollTopBtn: document.getElementById('back-to-top'),
    logo: document.getElementById('logoSVG'),
    navToggle: document.getElementById('nav-toggle'),
    closeBtn: document.getElementById('close-btn')
  };

  // ====== UTILITY FUNCTIONS ======
  const utils = {
    // Throttle function to limit execution rate (essential for scroll events)
    throttle: (func, wait = 100) => {
      let timer = null;
      return function(...args) {
        if (timer === null) {
          timer = setTimeout(() => {
            func.apply(this, args);
            timer = null;
          }, wait);
        }
      };
    }
  };

  // ====== COMPONENT MODULES ======
  
  /**
   * Sidebar functionality - handles mobile navigation
   */
  const sidebar = {
    toggle: () => {
      if (!elements.sidebar) return;
      
      elements.sidebar.classList.toggle('active');
      if (elements.overlay) elements.overlay.classList.toggle('active');
      
      // Update ARIA attributes for accessibility
      const isExpanded = elements.sidebar.classList.contains('active');
      document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.setAttribute('aria-expanded', isExpanded);
      });
      
      // Toggle body scroll to prevent background scrolling when menu is open
      document.body.style.overflow = isExpanded ? 'hidden' : '';
      
      // Add/remove ESC key listener
      if (isExpanded) {
        document.addEventListener('keydown', sidebar.closeOnEsc);
      } else {
        document.removeEventListener('keydown', sidebar.closeOnEsc);
      }
    },

    closeOnEsc: (e) => {
      if (e.key === 'Escape' && elements.sidebar?.classList.contains('active')) {
        sidebar.toggle();
      }
    },

    init: () => {
      // Attach event listeners for sidebar toggle
      [elements.navToggle, elements.closeBtn, elements.overlay].forEach(element => {
        if (element) element.addEventListener('click', sidebar.toggle);
      });
    }
  };

  /**
   * Dark mode functionality
   */
  const darkMode = {
    toggle: () => {
      document.body.classList.toggle('dark-mode');
      const isDarkMode = document.body.classList.contains('dark-mode');
      localStorage.setItem('dark-mode', isDarkMode);
      
      // Update ARIA attributes and icons
      elements.darkModeToggle.setAttribute('aria-pressed', isDarkMode);
      
      const icon = elements.darkModeToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-moon', !isDarkMode);
        icon.classList.toggle('fa-sun', isDarkMode);
      }
    },

    init: () => {
      // Apply saved dark mode preference
      const isDarkMode = localStorage.getItem('dark-mode') === 'true';
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
        
        // Update icon
        const icon = elements.darkModeToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-moon');
          icon.classList.add('fa-sun');
        }
        
        elements.darkModeToggle.setAttribute('aria-pressed', 'true');
      }
      
      // Add event listener for dark mode toggle
      if (elements.darkModeToggle) {
        elements.darkModeToggle.addEventListener('click', darkMode.toggle);
      }
    }
  };

  /**
   * Smooth scrolling functionality
   */
  const scrolling = {
    smoothScroll: (targetId, offset = 70) => {
      const targetSection = document.querySelector(targetId);
      if (!targetSection) return;
      
      const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition - offset;
      
      let startTime = null;
      const duration = 1000; // ms
      
      const animateScroll = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Easing function for smoother animation
        const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        
        window.scrollTo(0, startPosition + distance * ease(progress));
        
        if (timeElapsed < duration) {
          requestAnimationFrame(animateScroll);
        }
      };
      
      requestAnimationFrame(animateScroll);
    },

    updateActiveNavLink: () => {
      const scrollPosition = window.scrollY + 100; // Add offset for better detection
      const sections = document.querySelectorAll('section[id]');
      
      // Find current section
      let currentSectionId = '';
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSectionId = '#' + section.id;
        }
      });
      
      // Update nav links
      if (currentSectionId) {
        // Remove active class from all links
        document.querySelectorAll('.nav-links a, .sidebar ul a, .scroll-nav-item').forEach(link => {
          link.classList.remove('active');
        });
        
        // Add active class to current links
        document.querySelectorAll(`.nav-links a[href="${currentSectionId}"], .sidebar ul a[href="${currentSectionId}"], .scroll-nav-item[data-target="${currentSectionId}"]`).forEach(link => {
          link.classList.add('active');
        });
      }
    },

    updateScrollIndicator: () => {
      if (!elements.scrollIndicator) return;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      requestAnimationFrame(() => {
        elements.scrollIndicator.style.width = scrollPercent + '%';
      });
    },

    updateBackToTopButton: () => {
      if (!elements.scrollTopBtn) return;
      
      elements.scrollTopBtn.classList.toggle('active', window.pageYOffset > 300);
    },

    handleScrollEvents: function() {
      // Bundle scroll-related updates for better performance
      const handleScroll = utils.throttle(() => {
        this.updateScrollIndicator();
        this.updateBackToTopButton();
        this.updateActiveNavLink();
      }, 100);
      
      window.addEventListener('scroll', handleScroll);
    },

    init: () => {
      // Use event delegation for nav links
      document.body.addEventListener('click', (event) => {
        const link = event.target.closest('.nav-links a, .sidebar ul a, .scroll-nav-item');
        if (!link) return;
        
        const href = link.getAttribute('href') || link.getAttribute('data-target');
        
        if (href && href.startsWith('#')) {
          event.preventDefault();
          scrolling.smoothScroll(href);
          
          // Close sidebar if open
          if (elements.sidebar && elements.sidebar.classList.contains('active')) {
            sidebar.toggle();
          }
        }
      });
      
      // Initialize scroll event handlers
      scrolling.handleScrollEvents();
      
      // Back to top button initialization
      if (elements.scrollTopBtn) {
        elements.scrollTopBtn.addEventListener('click', () => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        });
      }
    }
  };

  /**
   * Logo animation
   */
  const logo = {
    animate: () => {
      if (!elements.logo) return;
      
      // Get all logo elements
      const logoElements = {
        stem: document.querySelector('.stem'),
        crossbar: document.querySelector('.crossbar'),
        topLoop: document.querySelector('.top-loop'),
        bottomCurve: document.querySelector('.bottom-curve'),
        diagonal: document.querySelector('.diagonal'),
        period: document.querySelector('.period')
      };
      
      const { stem, crossbar, topLoop, bottomCurve, diagonal, period } = logoElements;
      
      // Check if all required elements exist
      if (!stem || !crossbar || !topLoop || !bottomCurve || !diagonal || !period) return;
      
      // Reset animations
      [stem, crossbar, topLoop, bottomCurve, diagonal].forEach(el => {
        el.style.strokeDasharray = '1000';
        el.style.strokeDashoffset = '1000';
        el.style.animation = 'none';
      });
      
      period.style.opacity = '0';
      
      // Force reflow
      void stem.offsetWidth;
      
      // Animation sequence with delays
      const animations = [
        { element: stem, delay: 0, duration: '1s' },
        { element: crossbar, delay: 800, duration: '0.8s' },
        { element: topLoop, delay: 1600, duration: '0.8s' },
        { element: bottomCurve, delay: 2400, duration: '0.8s' },
        { element: diagonal, delay: 3200, duration: '0.8s' },
        { element: period, delay: 4000, duration: '0.5s', type: 'fadeIn' }
      ];
      
      // Apply animations with appropriate delays
      animations.forEach(({ element, delay, duration, type }) => {
        setTimeout(() => {
          if (type === 'fadeIn') {
            element.style.opacity = '1';
            element.style.animation = `${type} ${duration} forwards`;
          } else {
            element.style.animation = `draw ${duration} forwards`;
          }
        }, delay);
      });
    },

    init: () => {
      // Initial animation with delay
      if (elements.logo) {
        setTimeout(() => {
          logo.animate();
        }, 1000);
        
        // Add click handler to replay animation
        const logoElement = document.querySelector('.logo');
        if (logoElement) {
          logoElement.addEventListener('click', (e) => {
            if (e.target.closest('.logo')) {
              e.preventDefault();
              logo.animate();
            }
          });
        }
      }
    }
  };

  /**
   * Navbar scroll behavior
   */
  const navbar = {
    init: () => {
      const navbarElement = document.querySelector('.navbar');
      if (navbarElement) {
        window.addEventListener('scroll', utils.throttle(() => {
          navbarElement.classList.toggle('scrolled', window.scrollY > 100);
        }, 100));
      }
    }
  };

  /**
   * Add CSS animations for logo
   */
  const addLogoAnimationStyles = () => {
    // Add CSS animations if they don't exist
    if (!document.querySelector('style#animation-styles')) {
      const style = document.createElement('style');
      style.id = 'animation-styles';
      style.textContent = `
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `;
      document.head.appendChild(style);
    }
  };

  /**
 * Download Button Functionality
 * - Enhances user experience with feedback
 * - Tracks download attempts
 */
document.addEventListener('DOMContentLoaded', () => {
  const downloadBtn = document.querySelector('.download-btn');
  
  if (downloadBtn) {
    // Add click event listener
    downloadBtn.addEventListener('click', (e) => {
      // Show visual feedback that download is starting
      const originalText = downloadBtn.innerHTML;
      downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting download...';
      
      // Reset the button text after a short delay
      setTimeout(() => {
        downloadBtn.innerHTML = originalText;
      }, 2000);
      
      // Optional: Track download event (if you have analytics)
      if (typeof gtag === 'function') {
        gtag('event', 'download', {
          'event_category': 'Resume',
          'event_label': 'PDF Download'
        });
      }
      
      // Check if the download attribute is supported
      // If not, provide a fallback method
      const isDownloadSupported = 'download' in document.createElement('a');
      
      if (!isDownloadSupported) {
        e.preventDefault();
        
        // Open the PDF in a new tab instead
        window.open(downloadBtn.href, '_blank');
        
        // Show a message to the user
        const message = document.createElement('div');
        message.textContent = 'Your browser doesn\'t support direct downloads. The PDF has opened in a new tab.';
        message.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: var(--primary-color); color: white; padding: 10px 20px; border-radius: 5px; z-index: 1000;';
        document.body.appendChild(message);
        
        // Remove the message after a few seconds
        setTimeout(() => {
          document.body.removeChild(message);
        }, 5000);
      }
    });
    
    // Add hover and focus effects for better accessibility
    downloadBtn.addEventListener('mouseenter', () => {
      downloadBtn.setAttribute('title', 'Download Resume PDF');
    });
    
    // Support keyboard navigation
    downloadBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        downloadBtn.click();
      }
    });
  }
});

  // ====== INITIALIZATION ======
  const init = () => {
    // Add animation styles
    addLogoAnimationStyles();
    
    // Initialize all components
    sidebar.init();
    darkMode.init();
    scrolling.init();
    logo.init();
    navbar.init();
  };

  // Call the init function
  init();
});