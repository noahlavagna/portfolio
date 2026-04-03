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
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  nav.classList.toggle('scrolled', currentScroll > 50);
  lastScroll = currentScroll;
});

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
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== PARALLAX VINYL ON SCROLL =====
const heroVinyl = document.querySelector('.hero-vinyl');
if (heroVinyl) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroVinyl.style.transform = `translateY(${scrolled * 0.15}px)`;
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
