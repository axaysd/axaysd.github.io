/* Progressive enhancements. Content remains available without JavaScript. */
(function () {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');
  const themeToggle = document.getElementById('themeToggle');
  const darkPreference = window.matchMedia('(prefers-color-scheme: dark)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Enable the brief entrance once, then return to the fully static base styles.
  const hero = document.getElementById('hero');
  let introTimer = null;
  function finishHeroIntro() {
    if (hero) hero.classList.remove('hero-intro');
    if (introTimer !== null) { window.clearTimeout(introTimer); introTimer = null; }
  }
  if (hero && !reducedMotion.matches) {
    hero.classList.add('hero-intro');
    introTimer = window.setTimeout(finishHeroIntro, 700);
  }
  reducedMotion.addEventListener('change', function (event) {
    if (event.matches) finishHeroIntro();
  });
  let explicitTheme = null;
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') explicitTheme = saved;
  } catch (error) {
    // Storage may be unavailable under browser privacy settings.
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    if (themeToggle) themeToggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
  }
  applyTheme(explicitTheme || (darkPreference.matches ? 'dark' : 'light'));
  darkPreference.addEventListener('change', function (event) {
    if (!explicitTheme) applyTheme(event.matches ? 'dark' : 'light');
  });
  if (themeToggle) {
    themeToggle.hidden = false;
    themeToggle.addEventListener('click', function () {
      explicitTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(explicitTheme);
      try { localStorage.setItem('theme', explicitTheme); } catch (error) { /* Retain the choice for this visit. */ }
    });
  }

  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const desktopViewport = window.matchMedia('(min-width: 901px)');
  let menuPreviousFocus = null;
  let previousBodyOverflow = '';

  function focusableElements(container) {
    return Array.from(container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
      'textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'
    )).filter(function (element) {
      return !element.closest('[hidden], [inert]') && element.getClientRects().length > 0;
    });
  }
  function focusFirst(container) {
    const first = focusableElements(container)[0];
    if (first) first.focus();
    else {
      container.setAttribute('tabindex', '-1');
      container.focus();
    }
  }
  function closeMenu(restoreFocus) {
    if (!hamburger || !mobileMenu || mobileMenu.hidden) return;
    mobileMenu.hidden = true;
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open navigation');
    hamburger.classList.remove('active');
    document.body.style.overflow = previousBodyOverflow;
    if (restoreFocus && !desktopViewport.matches) {
      const target = menuPreviousFocus && menuPreviousFocus.isConnected ? menuPreviousFocus : hamburger;
      target.focus();
    }
  }
  if (hamburger && mobileMenu) {
    hamburger.hidden = false;
    hamburger.setAttribute('aria-controls', 'mobileMenu');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open navigation');
    mobileMenu.hidden = true;
    hamburger.addEventListener('click', function () {
      if (!mobileMenu.hidden) { closeMenu(true); return; }
      menuPreviousFocus = document.activeElement;
      previousBodyOverflow = document.body.style.overflow;
      mobileMenu.hidden = false;
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-label', 'Close navigation');
      hamburger.classList.add('active');
      document.body.style.overflow = 'hidden';
      focusFirst(mobileMenu);
    });
    mobileMenu.querySelectorAll('a[href]').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu(!link.hash);
        if (!link.hash) return;
        const section = document.getElementById(link.hash.slice(1));
        const heading = section && section.querySelector('h1, h2');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          requestAnimationFrame(function () { heading.focus({ preventScroll: true }); });
        }
      });
    });
    desktopViewport.addEventListener('change', function (event) {
      if (event.matches) closeMenu(false);
    });
  }

  document.addEventListener('keydown', function (event) {
    const openPanel = mobileMenu && !mobileMenu.hidden ? mobileMenu : null;
    if (!openPanel) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu(true);
      return;
    }
    if (event.key !== 'Tab') return;
    const elements = focusableElements(openPanel);
    if (!elements.length) { event.preventDefault(); focusFirst(openPanel); return; }
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (event.shiftKey && (document.activeElement === first || !openPanel.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !openPanel.contains(document.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  });

  const navbar = document.getElementById('navbar');
  const navigationLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"], .mobile-nav-links a[href^="#"]'));
  const navigationSections = Array.from(document.querySelectorAll('main section[id]')).filter(function (section) {
    return navigationLinks.some(function (link) { return link.hash === '#' + section.id; });
  });
  let currentSection = null;
  let scrollFramePending = false;
  function updateScroll() {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 24);
    const readingLine = (navbar ? navbar.getBoundingClientRect().height : 76) + 32;
    let nextSection = null;
    navigationSections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= readingLine) nextSection = section.id;
    });
    if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
      nextSection = navigationSections.length ? navigationSections[navigationSections.length - 1].id : null;
    }
    if (nextSection !== currentSection) {
      navigationLinks.forEach(function (link) {
        if (link.hash === '#' + nextSection) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      currentSection = nextSection;
    }
    scrollFramePending = false;
  }
  function scheduleScrollUpdate() {
    if (!scrollFramePending) { scrollFramePending = true; requestAnimationFrame(updateScroll); }
  }
  window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
  window.addEventListener('resize', scheduleScrollUpdate, { passive: true });
  window.addEventListener('load', scheduleScrollUpdate);
  window.addEventListener('hashchange', scheduleScrollUpdate);
  if ('ResizeObserver' in window) {
    const layoutObserver = new ResizeObserver(scheduleScrollUpdate);
    const main = document.querySelector('main');
    if (main) layoutObserver.observe(main);
    if (navbar) layoutObserver.observe(navbar);
  }
  updateScroll();
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      const title = document.querySelector('h1');
      if (title) { title.setAttribute('tabindex', '-1'); title.focus({ preventScroll: true }); }
    });
  }

  const archiveFilters = document.getElementById('archiveFilters');
  const projectsGrid = document.getElementById('projectsGrid');
  const projectCount = document.getElementById('projectCount');
  if (archiveFilters && projectsGrid) {
    const cards = Array.from(projectsGrid.children).filter(function (card) { return card.hasAttribute('data-category'); });
    const buttons = Array.from(archiveFilters.querySelectorAll('button[data-filter]'));
    function categories(card) { return (card.getAttribute('data-category') || '').split(/[\s,]+/).filter(Boolean); }
    function filterProjects(filter) {
      let visible = 0;
      cards.forEach(function (card) {
        const matches = filter === 'all' || categories(card).includes(filter);
        card.hidden = !matches;
        if (matches) visible++;
      });
      buttons.forEach(function (button) {
        const selected = button.dataset.filter === filter;
        button.setAttribute('aria-pressed', String(selected));
        button.classList.toggle('active', selected);
      });
      if (projectCount) projectCount.textContent = 'Showing ' + visible + ' of ' + cards.length + ' projects';
      scheduleScrollUpdate();
    }
    if (projectCount) {
      projectCount.setAttribute('aria-live', 'polite');
      projectCount.setAttribute('aria-atomic', 'true');
    }
    buttons.forEach(function (button) {
      const countElement = button.querySelector('.filter-count');
      if (countElement) {
        const count = cards.filter(function (card) { return button.dataset.filter === 'all' || categories(card).includes(button.dataset.filter); }).length;
        countElement.textContent = '(' + count + ')';
      }
      button.addEventListener('click', function () { filterProjects(button.dataset.filter); });
    });
    archiveFilters.hidden = false;
    filterProjects('all');
  }
  // Custom events use the existing tracker only on the public site.
  function trackEvent(name, data) {
    if (window.location.origin !== 'https://axaysd.github.io' || !window.umami || typeof window.umami.track !== 'function') return;
    try { window.umami.track(name, data); } catch (error) { /* Navigation still works if analytics is unavailable. */ }
  }
  function linkPlacement(link) {
    const section = link.closest('section[id]');
    if (section) return section.id;
    return link.closest('.mobile-menu') ? 'mobile-navigation' : 'navigation';
  }
  document.addEventListener('click', function (event) {
    const link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    const placement = linkPlacement(link);
    if (/\.pdf(?:[?#]|$)/i.test(href) && link.hasAttribute('download')) {
      trackEvent('resume_download', { section: placement, name: 'Resume' });
    } else if (/^mailto:/i.test(href)) {
      trackEvent('contact_click', { section: placement, name: 'Email' });
    } else if (/^https:\/\/calendly\.com\//i.test(href)) {
      trackEvent('contact_click', { section: placement, name: 'Book a call' });
    } else if (placement === 'speaking' && /^https:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//i.test(href)) {
      trackEvent('talk_click', { section: placement, name: 'Beyond RAG' });
    } else if (placement === 'projects' && /^https?:\/\//i.test(href)) {
      const card = link.closest('article');
      const title = card && card.querySelector('h3');
      trackEvent('project_click', { section: placement, name: title ? title.textContent.trim() : 'Project' });
    }
  });
  document.querySelectorAll('details').forEach(function (details) {
    details.addEventListener('toggle', function () {
      scheduleScrollUpdate();
      if (details.open && details.classList.contains('work-details')) {
        const article = details.closest('article');
        const heading = article && article.querySelector('h3');
        trackEvent('case_open', { section: 'work', name: heading ? heading.textContent.trim() : 'Work' });
      }
    });
  });

})();
