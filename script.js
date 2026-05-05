// ===== SMOOTH SCROLL (LENIS) =====
let lenis = null;
try {
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.8,
      syncTouch: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    window.lenis = lenis; // exposé pour modern-plus (nudge resize)
    // Stop Lenis pendant l'intro pour empêcher tout scroll (le body overflow:hidden
    // ne suffit pas, Lenis intercepte les events wheel/touch indépendamment).
    if (!sessionStorage.getItem('intro_done')) {
      lenis.stop();
    }
  }
} catch (e) {
  console.warn('Lenis init failed:', e);
}

// ===== CUSTOM CURSOR =====
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const isTouch = window.matchMedia('(hover: none)').matches;

if (!isTouch && cursorDot && cursorRing) {
  document.body.classList.add('has-custom-cursor');

  // Cacher le curseur tant que la souris n'a pas bougé
  cursorDot.style.opacity = '0';
  cursorRing.style.opacity = '0';

  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;
  let hasMoved = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!hasMoved) {
      hasMoved = true;
      ringX = mouseX;
      ringY = mouseY;
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
    }
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effect on interactive elements
  const hoverables = document.querySelectorAll('a, button, .thumb-item, .project-card, .hero-cta, .contact-link');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorRing.classList.add('hover');
      cursorDot.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      cursorRing.classList.remove('hover');
      cursorDot.classList.remove('hover');
    });
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    cursorDot.style.opacity = '0';
    cursorRing.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursorDot.style.opacity = '1';
    cursorRing.style.opacity = '1';
  });
}

// ===== INTRO: NEEDLE DROP =====
const intro = document.getElementById('intro');
const nav = document.querySelector('.nav');
let introTriggered = false;

function enterSite(instant) {
  if (introTriggered) return;
  introTriggered = true;
  sessionStorage.setItem('intro_done', '1');

  if (instant) {
    intro.classList.add('gone');
    nav.classList.remove('hidden');
    nav.classList.add('visible');
    document.body.style.overflow = '';
    if (window.lenis) window.lenis.start();
    return;
  }

  intro.classList.add('playing');
  setTimeout(function () {
    if (window.introSpin) window.introSpin.play();
  }, 1100);

  setTimeout(() => {
    intro.classList.add('leaving');
    nav.classList.remove('hidden');
    nav.classList.add('visible');
    document.body.style.overflow = '';
    if (window.lenis) window.lenis.start();
  }, 1200);

  setTimeout(() => {
    intro.classList.add('gone');
    // Le vinyle héro démarre dès que l'intro disparaît : le bras s'y pose
    // automatiquement (ARM_DURATION = 1000ms) puis le son + spin s'enclenche.
    setTimeout(() => {
      if (window.syncTonearm) window.syncTonearm(true);
    }, 300);
  }, 2200);
}

// Si l'intro a déjà été vue dans cette session, on la saute
if (sessionStorage.getItem('intro_done')) {
  enterSite(true);
}

// Any click anywhere on the intro triggers it
intro.addEventListener('click', () => enterSite(false));

// ===== MUSIC NOTES BURST (CTA + nav links) =====
(() => {
  const NOTES = ['♪', '♫', '♬', '♩', '♭'];

  function spawnNotes(originX, originY, count = 9, sizeMin = 1.2, sizeRange = 0.8) {
    for (let i = 0; i < count; i++) {
      const note = document.createElement('span');
      note.className = 'music-note';
      note.textContent = NOTES[Math.floor(Math.random() * NOTES.length)];
      const spread = (i - (count - 1) / 2) * 18 + (Math.random() * 16 - 8);
      const r1 = (Math.random() * 30 - 15);
      const r2 = r1 + (Math.random() * 60 - 30);
      const size = sizeMin + Math.random() * sizeRange;
      note.style.left = originX + 'px';
      note.style.top = originY + 'px';
      note.style.fontSize = size + 'rem';
      note.style.setProperty('--mx', spread + 'px');
      note.style.setProperty('--r1', r1 + 'deg');
      note.style.setProperty('--r2', r2 + 'deg');
      note.style.animationDelay = (i * 0.04) + 's';
      document.body.appendChild(note);
      setTimeout(() => note.remove(), 2000);
    }
  }

  function attachBurst(el, opts = {}) {
    if (!el) return;
    el.addEventListener('click', (e) => {
      const href = el.getAttribute('href');
      const isAnchor = href && href.startsWith('#');

      // Ne bloquer la navigation QUE pour les ancres (scroll interne)
      if (isAnchor) e.preventDefault();

      const rect = el.getBoundingClientRect();
      spawnNotes(rect.left + rect.width / 2, rect.top + rect.height / 2, opts.count || 9, opts.sizeMin || 1.2, opts.sizeRange || 0.8);

      if (isAnchor) {
        const target = document.querySelector(href);
        setTimeout(() => {
          if (!target) return;
          if (lenis) {
            lenis.scrollTo(target, { duration: 1.6 });
          } else {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }, opts.delay || 900);
      }
      // Pour les liens de page (.html), laisser le navigateur gérer
    });
  }

  // Hero CTA — full size burst
  attachBurst(document.querySelector('.hero-cta'));

  // Nav links — smaller, lighter burst
  document.querySelectorAll('.nav-links a, .nav-logo').forEach((link) => {
    attachBurst(link, { count: 6, sizeMin: 0.9, sizeRange: 0.5, delay: 700 });
  });
})();

// ===== VINYL SPIN CONTROLLER (acceleration / deceleration) =====
function createVinylSpin(discEl, logoEl, targetSpeed) {
  // targetSpeed = degrés par seconde à pleine vitesse
  var ACCEL = targetSpeed * 0.8;   // accélération (deg/s²)
  var DECEL = targetSpeed * 1.2;   // décélération plus vive
  var speed = 0;
  var angle = 0;
  var playing = false;
  var timer = null;
  var lastTime = 0;
  var INTERVAL = 16; // ~60fps

  function tick() {
    var now = performance.now();
    var dt = (now - lastTime) / 1000;
    if (dt > 0.1) dt = 0.016; // clamp si tab était inactive
    lastTime = now;

    if (playing) {
      speed = Math.min(speed + ACCEL * dt, targetSpeed);
    } else {
      speed = Math.max(speed - DECEL * dt, 0);
    }

    if (speed > 0.05) {
      angle = (angle + speed * dt) % 360;
      discEl.style.transform = 'rotate(' + angle + 'deg)';
    } else {
      speed = 0;
      clearInterval(timer);
      timer = null;
    }
  }

  function startLoop() {
    if (timer) return;
    lastTime = performance.now();
    timer = setInterval(tick, INTERVAL);
  }

  return {
    play: function ()  { playing = true;  startLoop(); },
    pause: function () { playing = false; },
    get isPlaying() { return playing; }
  };
}

// ----- Hero vinyl spin -----
window.heroSpin = (function () {
  var disc = document.querySelector('.vinyl-container .vinyl-record');
  var logo = document.querySelector('.vinyl-container .vinyl-logo');
  if (!disc) return null;
  return createVinylSpin(disc, logo, 45); // 45 deg/s = 1 tour en 8s
})();

// ----- Intro vinyl spin -----
window.introSpin = (function () {
  var disc = document.querySelector('.intro-vinyl');
  var logo = document.querySelector('.intro-vinyl .vinyl-logo');
  if (!disc) return null;
  return createVinylSpin(disc, logo, 45);
})();

// ===== HERO TONEARM CLICK TO PLAY =====
(() => {
  const tonearm = document.getElementById('hero-tonearm');
  const vinylContainer = document.querySelector('.vinyl-container');
  const waves = document.querySelector('.hero-waves');
  if (!tonearm || !vinylContainer) return;

  let isPlaying = false;
  let delayTimer = null;
  const ARM_DURATION = 1000; // durée du bras pour se poser (ms)

  function setTonearm(playing) {
    isPlaying = playing;
    tonearm.classList.toggle('on-vinyl', isPlaying);
    vinylContainer.classList.toggle('playing', isPlaying);

    // Mettre à jour l'UI du widget immédiatement (feedback visuel)
    var w = document.querySelector('.vinyl-widget');
    if (w) {
      w.classList.toggle('is-playing', isPlaying);
      var txt = w.querySelector('.vinyl-widget-text');
      if (txt) txt.textContent = isPlaying ? 'En lecture' : 'Vinyle';
    }

    // Mettre à jour le tooltip "Now spinning" / "Poser le diamant"
    var tip = document.querySelector('.mp-vinyl-tooltip');
    if (tip) {
      tip.innerHTML = isPlaying
        ? '<span class="mp-music-dot"></span>Now spinning &middot; Side B'
        : '<span class="mp-needle-dot">◆</span>Poser le diamant';
    }

    clearTimeout(delayTimer);

    if (isPlaying) {
      // Le bras se pose → attendre qu'il arrive sur le vinyle
      delayTimer = setTimeout(function () {
        if (window.heroSpin) window.heroSpin.play();
        if (window.vinylAudio) window.vinylAudio.play();
        if (waves) {
          waves.classList.remove('burst');
          void waves.offsetWidth;
          waves.classList.add('burst');
          setTimeout(() => waves.classList.remove('burst'), 2000);
        }
      }, ARM_DURATION);
    } else {
      // Arrêt immédiat du son et de la rotation (le bras se lève)
      if (window.heroSpin) window.heroSpin.pause();
      if (window.vinylAudio) window.vinylAudio.pause();
    }
  }

  tonearm.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    setTonearm(!isPlaying);
  });

  // Allow the audio widget to sync the tonearm
  window.syncTonearm = setTonearm;
})();

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
  if (!introTriggered) enterSite(false);
});

// Prevent scroll while intro is visible (only if intro hasn't been seen yet)
if (!sessionStorage.getItem('intro_done')) {
  document.body.style.overflow = 'hidden';
}

// ===== NAV SCROLL EFFECT =====
if (lenis) {
  lenis.on('scroll', ({ scroll }) => {
    nav.classList.toggle('scrolled', scroll > 50);
  });
} else {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

// ===== MOBILE MENU =====
const toggle = document.querySelector('.nav-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

toggle.addEventListener('click', () => {
  toggle.classList.toggle('active');
  mobileMenu.classList.toggle('active');
  document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    toggle.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  });
});

// ===== REVEAL ON SCROLL =====
const revealElements = document.querySelectorAll('[data-reveal]');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ===== COUNTER ANIMATION =====
const statNumbers = document.querySelectorAll('.stat-number[data-count]');

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      animateCounter(el, target);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

statNumbers.forEach(el => counterObserver.observe(el));

function animateCounter(el, target) {
  const duration = 2000;
  const start = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);

    if (target >= 1000) {
      el.textContent = current.toLocaleString('fr-FR');
    } else {
      el.textContent = current;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// ===== SMOOTH SCROLL FOR NAV LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const isDownloadScroll = this.id === 'scroll-to-downloads';
      if (lenis) {
        lenis.scrollTo(target, { offset: 0, duration: 1.6 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (isDownloadScroll) setTimeout(highlightDownloads, 800);
    }
  });
});

function highlightDownloads() {
  document.querySelectorAll('.contact-downloads .download-btn').forEach(btn => {
    btn.classList.add('highlight-pulse');
    btn.addEventListener('animationend', () => btn.classList.remove('highlight-pulse'), { once: true });
  });
}

// ===== PARALLAX VINYL ON SCROLL (via Lenis) =====
const heroVinyl = document.querySelector('.hero-vinyl');
if (heroVinyl && lenis) {
  lenis.on('scroll', ({ scroll }) => {
    if (scroll < window.innerHeight) {
      heroVinyl.style.transform = `translate3d(0, ${scroll * 0.15}px, 0)`;
    }
  });
}

// ===== ACTIVE NAV LINK HIGHLIGHT =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.3 });

sections.forEach(section => sectionObserver.observe(section));
