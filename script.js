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

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
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

function enterSite() {
  if (introTriggered) return;
  introTriggered = true;

  intro.classList.add('playing');

  setTimeout(() => {
    intro.classList.add('leaving');
    nav.classList.remove('hidden');
    nav.classList.add('visible');
    document.body.style.overflow = '';
  }, 1200);

  setTimeout(() => {
    intro.classList.add('gone');
  }, 2200);
}

// Any click anywhere on the intro triggers it
intro.addEventListener('click', enterSite);

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
  if (!introTriggered) enterSite();
});

// Prevent scroll while intro is visible
document.body.style.overflow = 'hidden';

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
      if (lenis) {
        lenis.scrollTo(target, { offset: 0, duration: 1.6 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

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
