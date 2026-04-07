// ===== SHARED JS FOR INNER PAGES =====
// (no intro screen, no hero tonearm, no hero parallax)

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
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }
} catch (e) { console.warn('Lenis init failed:', e); }

// ===== CUSTOM CURSOR =====
const cursorDot  = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const isTouch    = window.matchMedia('(hover: none)').matches;

if (!isTouch && cursorDot && cursorRing) {
  document.body.classList.add('has-custom-cursor');
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let ringX = mouseX, ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursorDot.style.transform = `translate(${mouseX}px,${mouseY}px) translate(-50%,-50%)`;
  });

  (function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.transform = `translate(${ringX}px,${ringY}px) translate(-50%,-50%)`;
    requestAnimationFrame(animateRing);
  })();

  document.querySelectorAll('a,button,.thumb-item,.project-card,.contact-link').forEach(el => {
    el.addEventListener('mouseenter', () => { cursorRing.classList.add('hover'); cursorDot.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cursorRing.classList.remove('hover'); cursorDot.classList.remove('hover'); });
  });

  document.addEventListener('mouseleave', () => { cursorDot.style.opacity='0'; cursorRing.style.opacity='0'; });
  document.addEventListener('mouseenter', () => { cursorDot.style.opacity='1'; cursorRing.style.opacity='1'; });
}

// ===== MUSIC NOTES BURST (nav links) =====
(() => {
  const NOTES = ['♪','♫','♬','♩','♭'];

  function spawnNotes(x, y, count = 7, sizeMin = 1, sizeRange = 0.6) {
    for (let i = 0; i < count; i++) {
      const note = document.createElement('span');
      note.className = 'music-note';
      note.textContent = NOTES[Math.floor(Math.random() * NOTES.length)];
      const spread = (i - (count - 1) / 2) * 18 + (Math.random() * 14 - 7);
      const r1 = Math.random() * 30 - 15;
      const r2 = r1 + (Math.random() * 60 - 30);
      const size = sizeMin + Math.random() * sizeRange;
      note.style.cssText = `left:${x}px;top:${y}px;font-size:${size}rem`;
      note.style.setProperty('--mx', spread + 'px');
      note.style.setProperty('--r1', r1 + 'deg');
      note.style.setProperty('--r2', r2 + 'deg');
      note.style.animationDelay = (i * 0.04) + 's';
      document.body.appendChild(note);
      setTimeout(() => note.remove(), 2000);
    }
  }

  // Nav links — small burst (visual only; transitions.js handles navigation)
  document.querySelectorAll('.nav-links a, .mobile-menu a, .nav-logo').forEach(link => {
    link.addEventListener('click', (e) => {
      const rect = link.getBoundingClientRect();
      spawnNotes(rect.left + rect.width / 2, rect.top + rect.height / 2, 5, 0.8, 0.5);
    });
  });
})();

// ===== NAV SCROLL EFFECT =====
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = (y) => nav.classList.toggle('scrolled', y > 50);
  if (lenis) {
    lenis.on('scroll', ({ scroll }) => onScroll(scroll));
  } else {
    window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
  }
}

// ===== MOBILE MENU =====
const toggle     = document.querySelector('.nav-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

if (toggle && mobileMenu) {
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
}

// ===== REVEAL ON SCROLL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

// ===== COUNTER ANIMATION =====
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      const duration = 2000;
      const start = performance.now();
      (function update(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.floor(eased * target);
        el.textContent = target >= 1000 ? val.toLocaleString('fr-FR') : val;
        if (p < 1) requestAnimationFrame(update);
      })(performance.now());
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-count]').forEach(el => counterObserver.observe(el));
