/**
 * Resume Page JavaScript
 * - Handles interactive elements for the resume page
 * - Implements modular component pattern for better code organization
 * - Enhances performance and accessibility
 * - Adds smooth animations and transitions
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
    sections: document.querySelectorAll('section[id]'),
    downloadBtn: document.getElementById('download-resume'),
    scrollNavItems: document.querySelectorAll('.scroll-nav-item'),
    forms: document.querySelectorAll('form'),
    currentYearElements: document.querySelectorAll('#current-year')
  };

  // ====== UTILITY FUNCTIONS ======
  const utils = {
    // Throttle function to limit execution rate (essential for scroll events)
    throttle: (func, wait = 100) => {
      let timer = null;
      let lastArgs = null;
      let lastThis = null;
      
      return function(...args) {
        lastArgs = args;
        lastThis = this;
        
        if (timer === null) {
          timer = setTimeout(() => {
            func.apply(lastThis, lastArgs);
            timer = null;
          }, wait);
        }
      };
    },
    
    // Debounce function for events that shouldn't fire too frequently
    debounce: (func, wait = 100) => {
      let timeout;
      
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
    
    // Check if an element is in viewport
    isInViewport: (el, offset = 100) => {
      if (!el) return false;
      
      const rect = el.getBoundingClientRect();
      return (
        rect.top <= window.innerHeight - offset &&
        rect.bottom >= offset
      );
    },
    
    // Prevent transition flicker when page loads or theme changes
    preventTransitionFlicker: () => {
      document.body.classList.add('no-transition');
      window.setTimeout(() => {
        document.body.classList.remove('no-transition');
      }, 10);
    },
    
    // Get current scroll position with cross-browser support
    getScrollPosition: () => {
      return window.pageYOffset || document.documentElement.scrollTop;
    },
    
    // Detect user's preferred color scheme
    prefersDarkMode: () => {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    },
    
    // Check if user prefers reduced motion
    prefersReducedMotion: () => {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
      elements.sidebar.setAttribute('aria-hidden', !isExpanded);
      
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
      
      // Close sidebar when a link is clicked
      if (elements.sidebar) {
        const sidebarLinks = elements.sidebar.querySelectorAll('a');
        sidebarLinks.forEach(link => {
          link.addEventListener('click', () => {
            if (elements.sidebar.classList.contains('active')) {
              sidebar.toggle();
            }
          });
        });
      }
    }
  };

  /**
   * Dark mode functionality
   */
  const darkMode = {
    toggle: () => {
      // Apply transition prevention
      utils.preventTransitionFlicker();
      
      // Toggle dark mode class
      document.body.classList.toggle('dark-mode');
      const isDarkMode = document.body.classList.contains('dark-mode');
      
      // Save preference to localStorage
      localStorage.setItem('dark-mode', isDarkMode);
      
      // Update ARIA attributes and icons
      elements.darkModeToggle.setAttribute('aria-pressed', isDarkMode);
      
      const icon = elements.darkModeToggle.querySelector('i');
      if (icon) {
        // Change icon based on mode
        icon.classList.toggle('fa-moon', !isDarkMode);
        icon.classList.toggle('fa-sun', isDarkMode);
      }
    },

    init: () => {
      // Check if user preference exists
      const savedPreference = localStorage.getItem('dark-mode');
      
      // First check saved preference, then check system preference
      if (savedPreference === 'true' || (savedPreference === null && utils.prefersDarkMode())) {
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
      
      // Listen for system preference changes
      const colorSchemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (colorSchemeMediaQuery.addEventListener) {
        colorSchemeMediaQuery.addEventListener('change', (e) => {
          // Only apply if user hasn't set a preference
          if (localStorage.getItem('dark-mode') === null) {
            if (e.matches) {
              document.body.classList.add('dark-mode');
              elements.darkModeToggle.setAttribute('aria-pressed', 'true');
              
              const icon = elements.darkModeToggle.querySelector('i');
              if (icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
              }
            } else {
              document.body.classList.remove('dark-mode');
              elements.darkModeToggle.setAttribute('aria-pressed', 'false');
              
              const icon = elements.darkModeToggle.querySelector('i');
              if (icon) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
              }
            }
          }
        });
      }
    }
  };

  /**
   * Smooth scrolling functionality
   */
  const scrolling = {
    // Smooth scroll to anchor function with customizable easing
    smoothScroll: (targetId, offset = 70) => {
      const targetSection = document.querySelector(targetId);
      if (!targetSection) return;
      
      // Get target position
      const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition - offset;
      
      // Don't animate very small scrolls
      if (Math.abs(distance) < 50) {
        window.scrollTo(0, targetPosition - offset);
        return;
      }
      
      // Check if user prefers reduced motion
      if (utils.prefersReducedMotion()) {
        window.scrollTo(0, targetPosition - offset);
        return;
      }
      
      let startTime = null;
      const duration = Math.min(Math.max(400, Math.abs(distance)), 1000); // Dynamic duration
      
      const animateScroll = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Easing function for smoother animation (easeInOutQuad)
        const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        
        window.scrollTo(0, startPosition + distance * ease(progress));
        
        if (timeElapsed < duration) {
          requestAnimationFrame(animateScroll);
        }
      };
      
      requestAnimationFrame(animateScroll);
    },

    updateActiveNavLink: () => {
      const scrollPosition = utils.getScrollPosition() + 100; // Add offset for better detection
      
      if (!elements.sections.length) return;
      
      // Find current section
      let currentSectionId = '';
      
      elements.sections.forEach(section => {
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
      
      const scrollTop = utils.getScrollPosition();
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      requestAnimationFrame(() => {
        elements.scrollIndicator.style.width = scrollPercent + '%';
      });
    },

    updateBackToTopButton: () => {
      if (!elements.scrollTopBtn) return;
      
      elements.scrollTopBtn.classList.toggle('active', utils.getScrollPosition() > 300);
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
        const link = event.target.closest('.nav-links a, .sidebar ul a, .scroll-nav-item, .back-to-top a');
        if (!link) return;
        
        const href = link.getAttribute('href') || link.getAttribute('data-target');
        
        if (href && href.startsWith('#')) {
          event.preventDefault();
          scrolling.smoothScroll(href);
        }
      });
      
      // Initialize scroll event handlers
      scrolling.handleScrollEvents();
      
      // Back to top button initialization
      if (elements.scrollTopBtn) {
        elements.scrollTopBtn.addEventListener('click', (e) => {
          e.preventDefault();
          
          if (utils.prefersReducedMotion()) {
            window.scrollTo(0, 0);
            return;
          }
          
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        });
      }
      
      // Activate card animations based on scroll
      const activateOnScroll = utils.throttle(() => {
        const animatedCards = document.querySelectorAll(
          '.education-card-animated, .skills-card-animated, .project-card-animated, .experience-card-animated'
        );
        
        animatedCards.forEach(card => {
          if (utils.isInViewport(card, 150) && !card.classList.contains('active')) {
            card.classList.add('active');
          }
        });
      }, 200);
      
      // Initial check for cards in viewport
      activateOnScroll();
      
      // Activate on scroll
      window.addEventListener('scroll', activateOnScroll);
    }
  };

  /**
   * Logo animation
   */
  const logo = {
    animate: () => {
      if (!elements.logo) return;
      
      // Skip animation if user prefers reduced motion
      if (utils.prefersReducedMotion()) {
        document.querySelectorAll('.stem, .crossbar, .top-loop, .bottom-curve, .diagonal').forEach(el => {
          el.style.strokeDashoffset = '0';
        });
        document.querySelector('.period').style.opacity = '1';
        return;
      }
      
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
            element.style.animation = `fadeScale ${duration} forwards`;
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
          navbarElement.classList.toggle('scrolled', utils.getScrollPosition() > 50);
        }, 100));
      }
    }
  };

  /**
   * Add CSS animations for logo and scroll effects
   */
  const addCustomStyles = () => {
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
        
        @keyframes fadeScale {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .education-card-animated.active svg rect,
        .skills-card-animated.active svg rect,
        .project-card-animated.active svg rect,
        .experience-card-animated.active svg rect {
          stroke-dashoffset: 0;
        }
      `;
      document.head.appendChild(style);
    }
  };

  /**
   * Download Button Functionality
   * - Enhances user experience with feedback
   * - Handles fallbacks for browsers that don't support download
   */
  const downloadButton = {
    init: () => {
      const downloadBtn = document.getElementById('download-resume');
      
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
          
          // Optional: Track download event (if analytics is available)
          if (typeof gtag === 'function') {
            gtag('event', 'download', {
              'event_category': 'Resume',
              'event_label': 'PDF Download'
            });
          }
          
          // Check if the download attribute is supported
          const isDownloadSupported = 'download' in document.createElement('a');
          
          if (!isDownloadSupported) {
            e.preventDefault();
            
            // Open the PDF in a new tab instead
            window.open(downloadBtn.href, '_blank');
            
            // Show a message to the user
            const message = document.createElement('div');
            message.textContent = 'Your browser doesn\'t support direct downloads. The PDF has opened in a new tab.';
            message.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: var(--primary-color); color: white; padding: 10px 20px; border-radius: 5px; z-index: 1000; box-shadow: 0 4px 10px rgba(0,0,0,0.3);';
            document.body.appendChild(message);
            
            // Remove the message after a few seconds
            setTimeout(() => {
              document.body.removeChild(message);
            }, 5000);
          }
        });
      }
    }
  };

  /**
   * Update current year in copyright notices
   */
  const updateYear = () => {
    const currentYear = new Date().getFullYear();
    
    elements.currentYearElements.forEach(element => {
      element.textContent = currentYear;
    });
  };

  /**
   * Handle form submissions
   */
  const formHandler = {
    init: () => {
      if (!elements.forms.length) return;
      
      elements.forms.forEach(form => {
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
          // Prevent default form submission
          e.preventDefault();
          
          // Validate form fields
          const isValid = formHandler.validateForm(form);
          
          if (isValid) {
            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitButton.disabled = true;
            
            // Handle form data
            const formData = new FormData(form);
            const formAction = form.getAttribute('action');
            
            // Submit form
            fetch(formAction, {
              method: 'POST',
              body: formData,
              headers: {
                'Accept': 'application/json'
              }
            })
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return response.json();
            })
            .then(data => {
              // Show success message
              const successMessage = document.createElement('div');
              successMessage.className = 'form-message success';
              successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Your message has been sent successfully!';
              form.appendChild(successMessage);
              
              // Reset form
              form.reset();
              
              // Remove success message after delay
              setTimeout(() => {
                if (successMessage.parentNode) {
                  successMessage.parentNode.removeChild(successMessage);
                }
              }, 5000);
            })
            .catch(error => {
              // Show error message
              const errorMessage = document.createElement('div');
              errorMessage.className = 'form-message error';
              errorMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> There was a problem sending your message. Please try again.';
              form.appendChild(errorMessage);
              
              // Remove error message after delay
              setTimeout(() => {
                if (errorMessage.parentNode) {
                  errorMessage.parentNode.removeChild(errorMessage);
                }
              }, 5000);
              
              console.error('Error submitting form:', error);
            })
            .finally(() => {
              // Restore button state
              submitButton.innerHTML = originalButtonText;
              submitButton.disabled = false;
            });
          }
        });
      });
    },
    
    validateForm: (form) => {
      let isValid = true;
      const inputs = form.querySelectorAll('input, textarea');
      
      inputs.forEach(input => {
        const validationMessage = input.nextElementSibling;
        
        // Check if field is required and empty
        if (input.hasAttribute('required') && !input.value.trim()) {
          isValid = false;
          input.classList.add('invalid');
          
          if (validationMessage && validationMessage.classList.contains('validation-message')) {
            validationMessage.textContent = 'This field is required';
            validationMessage.style.display = 'block';
          }
        } 
        // Check email format
        else if (input.type === 'email' && input.value.trim() && !formHandler.isValidEmail(input.value.trim())) {
          isValid = false;
          input.classList.add('invalid');
          
          if (validationMessage && validationMessage.classList.contains('validation-message')) {
            validationMessage.textContent = 'Please enter a valid email address';
            validationMessage.style.display = 'block';
          }
        } 
        // Valid input
        else {
          input.classList.remove('invalid');
          
          if (validationMessage && validationMessage.classList.contains('validation-message')) {
            validationMessage.style.display = 'none';
          }
        }
      });
      
      return isValid;
    },
    
    isValidEmail: (email) => {
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email.toLowerCase());
    },
    
    // Real-time validation
    initRealTimeValidation: () => {
      const inputs = document.querySelectorAll('input, textarea');
      
      inputs.forEach(input => {
        input.addEventListener('blur', () => {
          const validationMessage = input.nextElementSibling;
          
          // Required field validation
          if (input.hasAttribute('required') && !input.value.trim()) {
            input.classList.add('invalid');
            
            if (validationMessage && validationMessage.classList.contains('validation-message')) {
              validationMessage.textContent = 'This field is required';
              validationMessage.style.display = 'block';
            }
          } 
          // Email validation
          else if (input.type === 'email' && input.value.trim() && !formHandler.isValidEmail(input.value.trim())) {
            input.classList.add('invalid');
            
            if (validationMessage && validationMessage.classList.contains('validation-message')) {
              validationMessage.textContent = 'Please enter a valid email address';
              validationMessage.style.display = 'block';
            }
          } 
          // Valid input
          else {
            input.classList.remove('invalid');
            
            if (validationMessage && validationMessage.classList.contains('validation-message')) {
              validationMessage.style.display = 'none';
            }
          }
        });
        
        // Clear validation when user starts typing
        input.addEventListener('input', () => {
          input.classList.remove('invalid');
          
          const validationMessage = input.nextElementSibling;
          if (validationMessage && validationMessage.classList.contains('validation-message')) {
            validationMessage.style.display = 'none';
          }
        });
      });
    }
  };

  /**
   * Card Animation Manager
   * - Handles animation of cards on scroll
   * - Adds intersection observer for better performance
   */
  const cardAnimations = {
    init: () => {
      if (utils.prefersReducedMotion()) return;
      
      const cards = document.querySelectorAll('.education-card-animated, .skills-card-animated, .project-card-animated, .experience-card-animated');
      
      if (!cards.length) return;
      
      // Use Intersection Observer if available
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('active');
              // Unobserve once animated
              observer.unobserve(entry.target);
            }
          });
        }, {
          root: null,
          rootMargin: '0px',
          threshold: 0.2
        });
        
        cards.forEach(card => {
          observer.observe(card);
        });
      } else {
        // Fallback for browsers that don't support Intersection Observer
        cards.forEach(card => {
          card.classList.add('active');
        });
      }
    }
  };

  /**
   * Handle responsive behaviors
   */
  const responsiveHandler = {
    init: () => {
      // Handle window resize events
      const handleResize = utils.debounce(() => {
        // Adjust layout or UI elements based on screen size
        if (window.innerWidth > 992 && elements.sidebar.classList.contains('active')) {
          // Close sidebar on large screens
          sidebar.toggle();
        }
      }, 200);
      
      window.addEventListener('resize', handleResize);
      
      // Initial check
      handleResize();
    }
  };

  /**
   * Keyboard navigation enhancement
   */
  const keyboardNavigation = {
    init: () => {
      document.addEventListener('keydown', (e) => {
        // ESC key to close sidebar
        if (e.key === 'Escape' && elements.sidebar.classList.contains('active')) {
          sidebar.toggle();
        }
        
        // TAB key handling for focus management
        if (e.key === 'Tab') {
          document.body.classList.add('keyboard-navigation');
        }
      });
      
      // Remove keyboard navigation style when mouse is used
      document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
      });
    }
  };

  /**
   * Initialize page functionality
   * - Centralized initialization for better dependency management
   */
  const init = () => {
    // Add custom styles
    addCustomStyles();
    
    // Update copyright year
    updateYear();
    
    // Initialize core components
    sidebar.init();
    darkMode.init();
    scrolling.init();
    logo.init();
    navbar.init();
    
    // Initialize form handling if forms exist
    formHandler.init();
    formHandler.initRealTimeValidation();
    
    // Initialize card animations
    cardAnimations.init();
    
    // Download button functionality
    downloadButton.init();
    
    // Responsive handler
    responsiveHandler.init();
    
    // Keyboard navigation
    keyboardNavigation.init();
    
    // Prevent transitions on page load
    utils.preventTransitionFlicker();
    
    // Initial scroll position check (to highlight active section)
    setTimeout(() => {
      scrolling.updateActiveNavLink();
    }, 100);
  };

  // Call the init function
  init();
});
