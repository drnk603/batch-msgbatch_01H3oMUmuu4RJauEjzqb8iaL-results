(function() {
  'use strict';

  if (!window.__app) {
    window.__app = {};
  }

  var app = window.__app;

  if (app.__initialized) {
    return;
  }

  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  function throttle(func, limit) {
    var inThrottle;
    return function() {
      var args = arguments;
      var context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function() {
          inThrottle = false;
        }, limit);
      }
    };
  }

  function initBurgerMenu() {
    if (app.__burgerInit) return;
    app.__burgerInit = true;

    var toggle = document.querySelector('.c-nav__toggle, .navbar-toggler');
    var collapse = document.querySelector('.c-nav__collapse, .navbar-collapse');
    var body = document.body;

    if (!toggle || !collapse) return;

    function isOpen() {
      return collapse.classList.contains('show');
    }

    function open() {
      collapse.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
    }

    function close() {
      collapse.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      if (isOpen()) {
        close();
      } else {
        open();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen()) {
        close();
      }
    });

    var navLinks = collapse.querySelectorAll('.c-nav__link, .nav-link');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        if (isOpen()) {
          close();
        }
      });
    }

    var resizeHandler = debounce(function() {
      if (window.innerWidth >= 1024 && isOpen()) {
        close();
      }
    }, 150);

    window.addEventListener('resize', resizeHandler, { passive: true });
  }

  function initSmoothScroll() {
    if (app.__smoothScrollInit) return;
    app.__smoothScrollInit = true;

    var isHomepage = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');

    if (!isHomepage) {
      var links = document.querySelectorAll('a[href^="#"]');
      for (var i = 0; i < links.length; i++) {
        var link = links[i];
        var href = link.getAttribute('href');
        if (href === '#' || href === '#!') continue;
        if (href.indexOf('#') === 0) {
          link.setAttribute('href', '/' + href);
        }
      }
    }

    document.addEventListener('click', function(e) {
      var target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target) return;

      var href = target.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      var hashIndex = href.indexOf('#');
      if (hashIndex === -1) return;

      var path = href.substring(0, hashIndex);
      var hash = href.substring(hashIndex);

      var currentPath = window.location.pathname;
      var isCurrentPage = !path || path === currentPath || (currentPath === '/' && path === '/index.html') || (currentPath.endsWith('/index.html') && path === '/');

      if (!isCurrentPage) return;

      e.preventDefault();

      var elementId = hash.substring(1);
      var element = document.getElementById(elementId);

      if (!element) return;

      var header = document.querySelector('.l-header');
      var headerHeight = header ? header.offsetHeight : 80;

      var elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      var offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      if (window.history && window.history.pushState) {
        window.history.pushState(null, null, hash);
      }
    });
  }

  function initScrollSpy() {
    if (app.__scrollSpyInit) return;
    app.__scrollSpyInit = true;

    var sections = document.querySelectorAll('section[id], div[id]');
    var navLinks = document.querySelectorAll('.c-nav__link[href*="#"], .nav-link[href*="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    var updateActiveLink = throttle(function() {
      var fromTop = window.pageYOffset + 100;

      var currentSection = null;
      for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        var sectionTop = section.offsetTop;
        var sectionBottom = sectionTop + section.offsetHeight;

        if (fromTop >= sectionTop && fromTop < sectionBottom) {
          currentSection = section.getAttribute('id');
          break;
        }
      }

      for (var j = 0; j < navLinks.length; j++) {
        var link = navLinks[j];
        var href = link.getAttribute('href');
        if (!href || href.indexOf('#') === -1) continue;

        var linkHash = href.substring(href.indexOf('#') + 1);

        if (linkHash === currentSection) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        }
      }
    }, 100);

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();
  }

  function initActiveMenuState() {
    if (app.__activeMenuInit) return;
    app.__activeMenuInit = true;

    var currentPath = window.location.pathname;
    var links = document.querySelectorAll('.c-nav__link, .nav-link');

    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var href = link.getAttribute('href');

      if (!href) continue;

      var linkPath = href.split('#')[0];

      var isMatch = false;

      if (currentPath === '/' || currentPath.endsWith('/index.html')) {
        if (linkPath === '/' || linkPath === '/index.html' || linkPath === 'index.html') {
          isMatch = true;
        }
      } else {
        if (linkPath && (currentPath === linkPath || currentPath.endsWith('/' + linkPath))) {
          isMatch = true;
        }
      }

      if (isMatch) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('active');
      }
    }
  }

  function initImages() {
    if (app.__imagesInit) return;
    app.__imagesInit = true;

    var images = document.querySelectorAll('img');

    for (var i = 0; i < images.length; i++) {
      var img = images[i];

      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      var isLogo = img.classList.contains('c-logo__img');
      var isCritical = img.hasAttribute('data-critical');

      if (!img.hasAttribute('loading') && !isLogo && !isCritical) {
        img.setAttribute('loading', 'lazy');
      }

      img.addEventListener('error', function(e) {
        var failedImg = e.target;
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e9ecef"/><text x="50" y="50" font-size="14" text-anchor="middle" dominant-baseline="middle" fill="%236c757d">Image</text></svg>';
        var svgDataUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
        failedImg.src = svgDataUrl;
      });
    }
  }

  function initForms() {
    if (app.__formsInit) return;
    app.__formsInit = true;

    app.notify = function(message, type) {
      var container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
      }

      var toast = document.createElement('div');
      toast.className = 'alert alert-' + (type || 'info') + ' alert-dismissible fade show';
      toast.setAttribute('role', 'alert');

      var messageText = document.createTextNode(message);
      toast.appendChild(messageText);

      var closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.className = 'btn-close';
      closeButton.setAttribute('data-bs-dismiss', 'alert');
      closeButton.setAttribute('aria-label', 'Close');
      toast.appendChild(closeButton);

      container.appendChild(toast);

      setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 150);
      }, 5000);

      closeButton.addEventListener('click', function() {
        toast.classList.remove('show');
        setTimeout(function() {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 150);
      });
    };

    var forms = document.querySelectorAll('.c-form, form');

    for (var i = 0; i < forms.length; i++) {
      var form = forms[i];

      form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var currentForm = e.target;
        currentForm.classList.add('was-validated');

        var isValid = true;
        var errors = [];

        var firstName = currentForm.querySelector('#firstName');
        if (firstName && firstName.hasAttribute('required')) {
          var namePattern = /^[a-zA-ZÀ-ÿs-']{2,50}$/;
          if (!firstName.value.trim()) {
            isValid = false;
            errors.push('Voornaam is verplicht');
            firstName.classList.add('is-invalid');
          } else if (!namePattern.test(firstName.value)) {
            isValid = false;
            errors.push('Voornaam bevat ongeldige tekens');
            firstName.classList.add('is-invalid');
          } else {
            firstName.classList.remove('is-invalid');
          }
        }

        var lastName = currentForm.querySelector('#lastName');
        if (lastName && lastName.hasAttribute('required')) {
          var namePattern = /^[a-zA-ZÀ-ÿs-']{2,50}$/;
          if (!lastName.value.trim()) {
            isValid = false;
            errors.push('Achternaam is verplicht');
            lastName.classList.add('is-invalid');
          } else if (!namePattern.test(lastName.value)) {
            isValid = false;
            errors.push('Achternaam bevat ongeldige tekens');
            lastName.classList.add('is-invalid');
          } else {
            lastName.classList.remove('is-invalid');
          }
        }

        var email = currentForm.querySelector('#email');
        if (email && email.hasAttribute('required')) {
          var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!email.value.trim()) {
            isValid = false;
            errors.push('E-mail is verplicht');
            email.classList.add('is-invalid');
          } else if (!emailPattern.test(email.value)) {
            isValid = false;
            errors.push('E-mail is ongeldig');
            email.classList.add('is-invalid');
          } else {
            email.classList.remove('is-invalid');
          }
        }

        var phone = currentForm.querySelector('#phone');
        if (phone && phone.hasAttribute('required')) {
          var phonePattern = /^[+\-\d\s()]{10,20}$/;
          if (!phone.value.trim()) {
            isValid = false;
            errors.push('Telefoonnummer is verplicht');
            phone.classList.add('is-invalid');
          } else if (!phonePattern.test(phone.value)) {
            isValid = false;
            errors.push('Telefoonnummer is ongeldig');
            phone.classList.add('is-invalid');
          } else {
            phone.classList.remove('is-invalid');
          }
        }

        var message = currentForm.querySelector('#message');
        if (message && message.hasAttribute('required')) {
          if (!message.value.trim()) {
            isValid = false;
            errors.push('Bericht is verplicht');
            message.classList.add('is-invalid');
          } else if (message.value.trim().length < 10) {
            isValid = false;
            errors.push('Bericht moet minimaal 10 tekens bevatten');
            message.classList.add('is-invalid');
          } else {
            message.classList.remove('is-invalid');
          }
        }

        var service = currentForm.querySelector('#service');
        if (service && service.hasAttribute('required')) {
          if (!service.value) {
            isValid = false;
            errors.push('Selecteer een dienst');
            service.classList.add('is-invalid');
          } else {
            service.classList.remove('is-invalid');
          }
        }

        var privacy = currentForm.querySelector('#privacy');
        if (privacy && privacy.hasAttribute('required')) {
          if (!privacy.checked) {
            isValid = false;
            errors.push('Accepteer het privacybeleid');
            privacy.classList.add('is-invalid');
          } else {
            privacy.classList.remove('is-invalid');
          }
        }

        if (!isValid) {
          app.notify(errors.join('. '), 'danger');
          return;
        }

        var submitButton = currentForm.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = true;
          var originalText = submitButton.innerHTML;
          submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Verzenden...';
        }

        setTimeout(function() {
          app.notify('Uw bericht is succesvol verzonden!', 'success');
          currentForm.reset();
          currentForm.classList.remove('was-validated');

          if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
          }

          setTimeout(function() {
            window.location.href = 'thank_you.html';
          }, 1500);
        }, 1500);
      });
    }
  }

  function initModals() {
    if (app.__modalsInit) return;
    app.__modalsInit = true;

    var modal = document.querySelector('.c-modal');
    if (!modal) return;

    var openButtons = document.querySelectorAll('[data-project]');
    var closeButton = modal.querySelector('.c-modal__close');
    var overlay = modal.querySelector('.c-modal__overlay');

    function openModal() {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('u-no-scroll');
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('u-no-scroll');
    }

    for (var i = 0; i < openButtons.length; i++) {
      openButtons[i].addEventListener('click', function() {
        openModal();
      });
    }

    if (closeButton) {
      closeButton.addEventListener('click', closeModal);
    }

    if (overlay) {
      overlay.addEventListener('click', closeModal);
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });
  }

  function initPortfolioFilter() {
    if (app.__portfolioFilterInit) return;
    app.__portfolioFilterInit = true;

    var filterButtons = document.querySelectorAll('[data-filter]');
    if (filterButtons.length === 0) return;

    for (var i = 0; i < filterButtons.length; i++) {
      filterButtons[i].addEventListener('click', function() {
        var filter = this.getAttribute('data-filter');

        for (var j = 0; j < filterButtons.length; j++) {
          filterButtons[j].classList.remove('is-active');
        }
        this.classList.add('is-active');

        var items = document.querySelectorAll('[data-category]');
        for (var k = 0; k < items.length; k++) {
          var item = items[k];
          var category = item.getAttribute('data-category');

          if (filter === 'all' || category === filter) {
            item.classList.remove('d-none');
          } else {
            item.classList.add('d-none');
          }
        }
      });
    }
  }

  function initScrollToTop() {
    if (app.__scrollToTopInit) return;
    app.__scrollToTopInit = true;

    var button = document.createElement('button');
    button.className = 'c-button c-button--primary';
    button.innerHTML = '↑';
    button.setAttribute('aria-label', 'Scroll naar boven');
    button.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1000; display: none; width: 48px; height: 48px; padding: 0;';

    document.body.appendChild(button);

    var toggleButton = throttle(function() {
      if (window.pageYOffset > 300) {
        button.style.display = 'flex';
      } else {
        button.style.display = 'none';
      }
    }, 100);

    window.addEventListener('scroll', toggleButton, { passive: true });

    button.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  function initPrivacyPolicyModal() {
    if (app.__privacyModalInit) return;
    app.__privacyModalInit = true;

    var privacyLinks = document.querySelectorAll('a[href*="privacy"]');
    
    for (var i = 0; i < privacyLinks.length; i++) {
      privacyLinks[i].addEventListener('click', function(e) {
        var href = this.getAttribute('href');
        if (href && href.indexOf('privacy') !== -1 && !href.startsWith('http')) {
          e.preventDefault();
          window.location.href = href;
        }
      });
    }
  }

  function init() {
    if (app.__initialized) return;

    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initActiveMenuState();
    initImages();
    initForms();
    initModals();
    initPortfolioFilter();
    initScrollToTop();
    initPrivacyPolicyModal();

    app.__initialized = true;
  }

  app.init = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();