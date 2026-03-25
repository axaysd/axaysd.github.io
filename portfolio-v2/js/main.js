/* ============================================
   MAIN.JS - Navigation, Filters, Dark Mode,
   Counters, Hamburger, Project Rendering,
   Scroll Progress, Custom Cursor, Magnetic Btns,
   Hero Glow, Easter Egg
   ============================================ */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---- DOM CACHE ----
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const themeToggle = document.getElementById('themeToggle');
  const backToTop = document.getElementById('backToTop');
  const featuredGrid = document.getElementById('featuredGrid');
  const projectsGrid = document.getElementById('projectsGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const scrollProgress = document.getElementById('scrollProgress');

  // ---- SCROLL PROGRESS + NAVBAR ----
  let lastScroll = 0;
  window.addEventListener('scroll', function () {
    const scrollY = window.scrollY;
    if (scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = scrollY;

    // Scroll progress bar
    var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight > 0) {
      var scrollPercent = (scrollY / scrollHeight) * 100;
      scrollProgress.style.width = scrollPercent + '%';
    }
  });

  // ---- SCROLL SPY ----
  const sections = document.querySelectorAll('section[id]');
  const observerOptions = {
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('data-section') === id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  // ---- HAMBURGER MENU ----
  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  mobileNavLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // ---- DARK MODE ----
  function getTheme() {
    var saved = localStorage.getItem('theme');
    if (saved) return saved;
    // Detect browser/OS preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  // Init theme (respects browser preference on first visit)
  setTheme(getTheme());

  // Listen for OS-level theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  themeToggle.addEventListener('click', function () {
    const current = getTheme();
    setTheme(current === 'light' ? 'dark' : 'light');
  });

  // ---- DYNAMIC GREETING ----
  var greetingEl = document.getElementById('heroGreeting');
  if (greetingEl) {
    var hour = new Date().getHours();
    var greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    greetingEl.textContent = greeting + ", I'm";
  }

  // ---- BACK TO TOP ----
  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---- NUMBER COUNTER ----
  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  const statNumbers = document.querySelectorAll('.stat-number');
  const counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(function (el) {
    counterObserver.observe(el);
  });

  // ---- RENDER FEATURED PROJECTS ----
  function getCategoryLabel(cat) {
    switch (cat) {
      case 'ai': return 'AI';
      case 'data-analytics': return 'Data Analytics';
      case 'product-management': return 'Product Management';
      default: return cat;
    }
  }

  function getTypeLabel(type) {
    switch (type) {
      case 'project': return 'Project';
      case 'deep-dive': return 'Deep Dive';
      case 'case-study': return 'Case Study';
      case 'insight': return 'Insight';
      default: return type;
    }
  }

  function renderFeaturedProjects() {
    var featured = PROJECTS.filter(function (p) { return p.featured; });
    var html = '';
    featured.forEach(function (p, i) {
      html += '<a href="' + p.link + '" target="_blank" class="featured-card" data-aos="fade-up" data-aos-delay="' + (i * 100 + 100) + '">' +
        '<div class="featured-card-img"><img src="' + p.image + '" alt="' + p.title + '" loading="lazy" width="600" height="340"></div>' +
        '<div class="featured-card-body">' +
        '<span class="featured-card-badge badge-' + p.category + '">' + getCategoryLabel(p.category) + '</span>' +
        '<h3>' + p.title + '</h3>' +
        '<p>' + p.description + '</p>' +
        '<div class="featured-card-tags">' +
        p.tech.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('') +
        '</div></div></a>';
    });
    featuredGrid.innerHTML = html;
  }

  // ---- RENDER ALL PROJECTS (with staggered reveal) ----
  function renderProjects(filter) {
    var filtered = filter === 'all' ? PROJECTS : PROJECTS.filter(function (p) { return p.category === filter; });
    var html = '';
    filtered.forEach(function (p, i) {
      html += '<a href="' + p.link + '" target="_blank" class="project-card stagger-in" ' +
        'style="--stagger-delay: ' + (i * 60) + 'ms" ' +
        'data-category="' + p.category + '">' +
        '<div class="project-card-img">' +
        '<img src="' + p.image + '" alt="' + p.title + '" loading="lazy" width="400" height="225">' +
        '<span class="project-card-badge badge-' + p.category + '">' + getCategoryLabel(p.category) + '</span>' +
        '<span class="project-card-type">' + getTypeLabel(p.type) + '</span>' +
        '</div>' +
        '<div class="project-card-body">' +
        '<h3>' + p.title + '</h3>' +
        '<div class="project-card-tags">' +
        p.tech.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('') +
        '</div></div></a>';
    });
    projectsGrid.innerHTML = html;

    // Trigger staggered entrance after paint
    requestAnimationFrame(function () {
      var cards = projectsGrid.querySelectorAll('.project-card');
      cards.forEach(function (card) {
        card.classList.add('stagger-visible');
      });

      // Apply Vanilla Tilt to new cards on desktop
      if (window.innerWidth > 768 && typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(cards, {
          max: 5,
          speed: 400,
          glare: true,
          'max-glare': 0.1
        });
      }

      // Re-bind cursor hover on new cards
      if (isDesktop && !prefersReducedMotion) {
        bindCursorHover(cards);
      }
    });
  }

  // ---- FILTER BUTTONS ----
  function updateFilterCounts() {
    filterBtns.forEach(function (btn) {
      var filter = btn.getAttribute('data-filter');
      var count = filter === 'all' ? PROJECTS.length : PROJECTS.filter(function (p) { return p.category === filter; }).length;
      var countEl = btn.querySelector('.filter-count');
      if (countEl) countEl.textContent = '(' + count + ')';
    });
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.getAttribute('data-filter');
      renderProjects(filter);
    });
  });

  // ---- TIMELINE DOT PULSE ----
  var timelineDots = document.querySelectorAll('.timeline-dot');
  var dotObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('pulse');
        dotObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  timelineDots.forEach(function (dot) {
    dotObserver.observe(dot);
  });

  // ---- CUSTOM CURSOR (desktop only) ----
  var dot = document.getElementById('cursorDot');
  var ring = document.getElementById('cursorRing');

  function bindCursorHover(elements) {
    if (!dot || !ring) return;
    elements.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        dot.classList.add('active');
        ring.classList.add('active');
      });
      el.addEventListener('mouseleave', function () {
        dot.classList.remove('active');
        ring.classList.remove('active');
      });
    });
  }

  if (isDesktop && !prefersReducedMotion && dot && ring) {
    var mouseX = 0, mouseY = 0;
    var ringX = 0, ringY = 0;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    });

    // Smooth ring follow with lerp
    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Bind to existing interactive elements
    var interactives = document.querySelectorAll('a, button, .filter-btn, .nav-logo');
    bindCursorHover(interactives);
  }

  // ---- MAGNETIC BUTTONS (desktop only) ----
  if (isDesktop && !prefersReducedMotion) {
    var magneticBtns = document.querySelectorAll('.btn-primary, .btn-outline');
    magneticBtns.forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (x * 0.2) + 'px, ' + (y * 0.2) + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transition = 'transform 0.3s var(--ease)';
        btn.style.transform = 'translate(0, 0)';
      });
      btn.addEventListener('mouseenter', function () {
        btn.style.transition = 'none';
      });
    });
  }

  // ---- HERO GLOW (desktop only) ----
  var heroGlow = document.getElementById('heroGlow');
  var heroSection = document.getElementById('hero');
  if (heroGlow && isDesktop && !prefersReducedMotion) {
    heroSection.addEventListener('mouseenter', function () {
      heroGlow.classList.add('visible');
    });
    heroSection.addEventListener('mouseleave', function () {
      heroGlow.classList.remove('visible');
    });
    heroSection.addEventListener('mousemove', function (e) {
      var rect = heroSection.getBoundingClientRect();
      heroGlow.style.left = (e.clientX - rect.left) + 'px';
      heroGlow.style.top = (e.clientY - rect.top) + 'px';
    });
  }

  // ---- KONAMI CODE EASTER EGG ----
  var konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  var konamiIndex = 0;
  document.addEventListener('keydown', function (e) {
    if (e.keyCode === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        konamiIndex = 0;
        triggerEasterEgg();
      }
    } else {
      konamiIndex = 0;
    }
  });

  function triggerEasterEgg() {
    var overlay = document.createElement('div');
    overlay.className = 'easter-egg-overlay';
    overlay.innerHTML = '<div class="easter-egg-content">' +
      '<p>You found the secret!</p>' +
      '<p>Have some confetti.</p>' +
      '</div>';
    document.body.appendChild(overlay);

    var colors = ['#2563EB', '#7C3AED', '#F59E0B', '#10B981', '#EF4444'];
    for (var i = 0; i < 60; i++) {
      var particle = document.createElement('div');
      particle.className = 'confetti-particle';
      particle.style.left = Math.random() * 100 + 'vw';
      particle.style.animationDelay = Math.random() * 2 + 's';
      particle.style.animationDuration = (2 + Math.random() * 2) + 's';
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particle.style.width = (6 + Math.random() * 8) + 'px';
      particle.style.height = (6 + Math.random() * 8) + 'px';
      overlay.appendChild(particle);
    }

    overlay.addEventListener('click', function () { overlay.remove(); });
    setTimeout(function () { overlay.remove(); }, 5000);
  }

  // ---- INIT ----
  renderFeaturedProjects();
  updateFilterCounts();
  renderProjects('all');

})();
