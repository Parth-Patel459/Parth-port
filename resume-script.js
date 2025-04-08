/**
 * Resume Page JavaScript
 * - Handles interactive elements for the resume page
 * - Implements modular component pattern for better code organization
 * - Improved performance and accessibility
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
    closeBtn: document.getElementById('close-btn'),
    downloadBtn: document.querySelector('.download-btn'),
    scrollNavItems: document.querySelectorAll('.scroll-nav-item'),
    animatedElements: document.querySelectorAll('.skills-card-animated, .project-card-animated, .experience-card-animated, .education-card-animated')
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
    },
    
    // Debounce function (for resize events, etc.)
    debounce: (func, wait = 100) => {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          func.apply(this, args);
        }, wait);
      };
    },
    
    // Local storage with error handling
    storage: {
      set: (key, value) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (e) {
          console.warn('localStorage is not available:', e);
          return false;
        }
      },
      get: (key, defaultValue = null) => {
        try {
          const value = localStorage.getItem(key);
          return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
          console.warn('localStorage is not available:', e);
          return defaultValue;
        }
      }
    },
    
    // Check if element is in viewport
    isInViewport: (el) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    },
    
    // Check for browser features
    supportsIntersectionObserver: 'IntersectionObserver' in window,
    supportsAnimations: 'animate' in document.createElement('div')
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
      if (elements.navToggle) {
        elements.navToggle.addEventListener('click', sidebar.toggle);
      }
      
      if (elements.closeBtn) {
        elements.closeBtn.addEventListener('click', sidebar.toggle);
      }
      
      if (elements.overlay) {
        elements.overlay.addEventListener('click', sidebar.toggle);
      }
      
      // Make global function available for onclick attributes
      window.toggleSidebar = sidebar.toggle;
    }
  };

  /**
   * Dark mode functionality
   */
  const darkMode = {
    toggle: () => {
      document.body.classList.toggle('dark-mode');
      const isDarkMode = document.body.classList.contains('dark-mode');
      
      // Save preference to localStorage with error handling
      utils.storage.set('dark-mode', isDarkMode);
      
      // Update ARIA attributes and icons
      if (elements.darkModeToggle) {
        elements.darkModeToggle.setAttribute('aria-pressed', String(isDarkMode));
        
        const icon = elements.darkModeToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-moon', 'fa-sun');
          icon.classList.add(isDarkMode ? 'fa-sun' : 'fa-moon');
        }
      }
      
      // Dispatch custom event for other components to react
      try {
        window.dispatchEvent(new CustomEvent('themeChanged', { 
          detail: { isDarkMode } 
        }));
      } catch (e) {
        // Fallback for older browsers
        const themeEvent = document.createEvent('CustomEvent');
        themeEvent.initCustomEvent('themeChanged', true, true, { isDarkMode });
        window.dispatchEvent(themeEvent);
      }
    },

    init: () => {
      // Apply saved dark mode preference
      const isDarkMode = utils.storage.get('dark-mode', null);
      
      // If no saved preference, check system preference
      if (isDarkMode === null && window.matchMedia) {
        const prefersColorScheme = window.matchMedia('(prefers-color-scheme: dark)');
        if (prefersColorScheme.matches) {
          document.body.classList.add('dark-mode');
          
          // Update toggle button state
          if (elements.darkModeToggle) {
            elements.darkModeToggle.setAttribute('aria-pressed', 'true');
            
            const icon = elements.darkModeToggle.querySelector('i');
            if (icon) {
              icon.classList.remove('fa-moon');
              icon.classList.add('fa-sun');
            }
          }
        }
      } else if (isDarkMode === true) {
        // Apply saved preference
        document.body.classList.add('dark-mode');
        
        // Update toggle button state
        if (elements.darkModeToggle) {
          elements.darkModeToggle.setAttribute('aria-pressed', 'true');
          
          const icon = elements.darkModeToggle.querySelector('i');
          if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
          }
        }
      }
      
      // Add event listener for dark mode toggle
      if (elements.darkModeToggle) {
        elements.darkModeToggle.addEventListener('click', darkMode.toggle);
      }
      
      // Listen for system preference changes if no manual preference is set
      if (window.matchMedia) {
        const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleColorSchemeChange = (e) => {
          // Only update if user hasn't manually set a preference
          if (utils.storage.get('dark-mode', null) === null) {
            if (e.matches !== document.body.classList.contains('dark-mode')) {
              darkMode.toggle();
            }
          }
        };
        
        // Use modern API if supported
        if (typeof colorSchemeQuery.addEventListener === 'function') {
          colorSchemeQuery.addEventListener('change', handleColorSchemeChange);
        } else if (typeof colorSchemeQuery.addListener === 'function') {
          // Legacy API for older browsers
          colorSchemeQuery.addListener(handleColorSchemeChange);
        }
      }
    }
  };

  /**
   * Smooth scrolling functionality
   */
  const scrolling = {
    smoothScroll: (targetId, offset = 70) => {
      // Handle both # prefix and bare ID
      const targetSelector = targetId.startsWith('#') ? targetId : `#${targetId}`;
      const targetElement = document.querySelector(targetSelector);
      
      if (!targetElement) return;
      
      // Get target position
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = targetPosition - offset;
      
      // Use native smooth scrolling if supported
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        return;
      }
      
      // Fallback smooth scrolling animation
      const startPosition = window.pageYOffset;
      const distance = offsetPosition - startPosition;
      const duration = 1000; // ms
      let startTime = null;
      
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
      const docHeight = Math.max(
        document.body.scrollHeight, 
        document.documentElement.scrollHeight,
        document.body.offsetHeight, 
        document.documentElement.offsetHeight,
        document.body.clientHeight, 
        document.documentElement.clientHeight
      ) - window.innerHeight;
      
      // Ensure we don't divide by zero
      const scrollPercent = docHeight ? (scrollTop / docHeight) * 100 : 0;
      
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        elements.scrollIndicator.style.width = Math.min(scrollPercent, 100) + '%';
      });
    },

    updateBackToTopButton: () => {
      if (!elements.scrollTopBtn) return;
      
      const threshold = 300; // Show after scrolling 300px
      elements.scrollTopBtn.classList.toggle('active', window.pageYOffset > threshold);
    },

    init: () => {
      // Use event delegation for nav links
      document.body.addEventListener('click', (event) => {
        const link = event.target.closest('.nav-links a, .sidebar ul a, .scroll-nav-item, .back-to-top a');
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
      
      // Scroll events with throttling for better performance
      const handleScroll = utils.throttle(() => {
        scrolling.updateScrollIndicator();
        scrolling.updateBackToTopButton();
        scrolling.updateActiveNavLink();
      }, 100);
      
      window.addEventListener('scroll', handleScroll);
      
      // Back to top button
      if (elements.scrollTopBtn) {
        elements.scrollTopBtn.addEventListener('click', () => {
          scrolling.smoothScroll('#profile');
        });
      }
      
      // Handle scroll nav items
      elements.scrollNavItems.forEach(item => {
        item.addEventListener('click', function() {
          const targetPath = this.getAttribute('data-target');
          if (targetPath) {
            if (targetPath.includes('.html')) {
              // Navigate to the page
              window.location.href = targetPath;
            } else {
              // Scroll to the section
              scrolling.smoothScroll(targetPath);
            }
          }
        });
      });
      
      // Initial scroll position update
      handleScroll();
    }
  };

  /**
   * Logo animation
   */
  const logo = {
    animate: () => {
      if (!elements.logo) return;
      
      // Get all logo elements
      const stem = document.querySelector('.stem');
      const crossbar = document.querySelector('.crossbar');
      const topLoop = document.querySelector('.top-loop');
      const bottomCurve = document.querySelector('.bottom-curve');
      const diagonal = document.querySelector('.diagonal');
      const period = document.querySelector('.period');
      
      // Check if all elements exist
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
        { element: stem, delay: 0, duration: '1s', type: 'draw' },
        { element: crossbar, delay: 800, duration: '0.8s', type: 'draw' },
        { element: topLoop, delay: 1600, duration: '0.8s', type: 'draw' },
        { element: bottomCurve, delay: 2400, duration: '0.8s', type: 'draw' },
        { element: diagonal, delay: 3200, duration: '0.8s', type: 'draw' },
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
      
      // Expose function globally for direct access
      window.animateLogo = logo.animate;
    }
  };

  /**
   * Navbar scroll behavior
   */
  const navbar = {
    init: () => {
      const navbarElement = document.querySelector('.navbar');
      if (navbarElement) {
        // Add scrolled class when page is scrolled
        window.addEventListener('scroll', utils.throttle(() => {
          navbarElement.classList.toggle('scrolled', window.scrollY > 100);
        }, 100));
      }
    }
  };

  /**
   * Animation for cards and elements
   */
  const animations = {
    initObserver: () => {
      if (!utils.supportsIntersectionObserver || !elements.animatedElements.length) return;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
      });
      
      elements.animatedElements.forEach(element => {
        observer.observe(element);
      });
    },
    
    fallbackAnimation: () => {
      // For browsers that don't support IntersectionObserver
      if (utils.supportsIntersectionObserver) return;
      
      const handleScroll = utils.throttle(() => {
        elements.animatedElements.forEach(element => {
          if (utils.isInViewport(element)) {
            element.classList.add('active');
          }
        });
      }, 200);
      
      window.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
    },
    
    init: () => {
      animations.initObserver();
      animations.fallbackAnimation();
    }
  };

  /**
   * Download button functionality
   */
  const downloadButton = {
    init: () => {
      if (!elements.downloadBtn) return;
      
      elements.downloadBtn.addEventListener('click', (e) => {
        // Visual feedback for download
        const originalText = elements.downloadBtn.innerHTML;
        elements.downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting download...';
        
        // Reset button text after delay
        setTimeout(() => {
          elements.downloadBtn.innerHTML = originalText;
        }, 2000);
        
        // Check if download attribute is supported
        const isDownloadSupported = 'download' in document.createElement('a');
        
        if (!isDownloadSupported) {
          e.preventDefault();
          // Open in new tab as fallback
          window.open(elements.downloadBtn.href, '_blank');
          
          // Show message to user
          const message = document.createElement('div');
          message.className = 'download-message';
          message.textContent = 'Your browser doesn\'t support direct downloads. The PDF has opened in a new tab.';
          message.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: var(--primary-color); color: white; padding: 10px 20px; border-radius: 5px; z-index: 1000;';
          document.body.appendChild(message);
          
          // Remove message after a few seconds
          setTimeout(() => {
            if (message.parentNode) {
              message.parentNode.removeChild(message);
            }
          }, 5000);
        }
      });
      
      // Add accessibility enhancements
      elements.downloadBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          elements.downloadBtn.click();
        }
      });
    }
  };

  /**
   * Add animations CSS to document if not already present
   */
  const addAnimationStyles = () => {
    if (!document.querySelector('#animation-styles')) {
      const style = document.createElement('style');
      style.id = 'animation-styles';
      style.textContent = `
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .fade-in {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .fade-in.active {
          opacity: 1;
          transform: translateY(0);
        }
        
        /* Additional animation for skills cards */
        .skills-card-animated,
        .project-card-animated,
        .experience-card-animated,
        .education-card-animated {
          opacity: 0;
          transform: translateY(30px);
          transition: 
            opacity 0.8s ease,
            transform 0.8s ease,
            box-shadow 0.3s ease;
        }
        
        .skills-card-animated.active,
        .project-card-animated.active,
        .experience-card-animated.active,
        .education-card-animated.active {
          opacity: 1;
          transform: translateY(0);
        }
      `;
      document.head.appendChild(style);
    }
  };

  // ====== INITIALIZATION ======
  const init = () => {
    // Add animation styles
    addAnimationStyles();
    
    // Initialize all components
    sidebar.init();
    darkMode.init();
    scrolling.init();
    logo.init();
    navbar.init();
    animations.init();
    downloadButton.init();
    
    // Update year in copyright notice
    const yearElements = document.querySelectorAll('#current-year');
    const currentYear = new Date().getFullYear();
    yearElements.forEach(element => {
      if (element) element.textContent = currentYear.toString();
    });
    
    // Handle initial theme state
    document.body.classList.remove('no-transition');
  };

  // Call the init function
  init();
});
