/* ============================================
   ANIMATIONS.JS - AOS, Typed.js, Vanilla Tilt
   ============================================ */

(function () {
  'use strict';

  // ---- AOS INIT ----
  AOS.init({
    duration: 700,
    easing: 'ease-out-cubic',
    once: true,
    offset: 80,
    disable: function () {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  });

  // ---- TYPED.JS ----
  if (document.getElementById('typed-output')) {
    new Typed('#typed-output', {
      strings: [
        'AI Product Builder',
        'GenAI Consultant',
        'Builder of Agentic Systems',
        'RAG & Evaluation Specialist'
      ],
      typeSpeed: 50,
      backSpeed: 30,
      backDelay: 2000,
      startDelay: 800,
      loop: true,
      showCursor: true,
      cursorChar: '|'
    });
  }

  // ---- VANILLA TILT ON FEATURED CARDS ----
  if (window.innerWidth > 768 && typeof VanillaTilt !== 'undefined') {
    var featuredCards = document.querySelectorAll('.featured-card');
    VanillaTilt.init(featuredCards, {
      max: 8,
      speed: 400,
      glare: true,
      'max-glare': 0.15
    });
  }

})();
