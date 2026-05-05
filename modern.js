/* ========================================================
   Modern layer — additive JS enhancements
   Injecte : scroll progress, availability pill, ticker, nom géant footer.
   Aucune modification du HTML existant requise.
   ======================================================== */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Scroll progress bar ---------- */
  const bar = document.createElement('div');
  bar.className = 'm-progress';
  bar.setAttribute('aria-hidden', 'true');
  const barFill = document.createElement('span');
  bar.appendChild(barFill);
  document.body.appendChild(bar);

  const updateProgress = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    barFill.style.width = pct + '%';
  };
  document.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------- 2. Availability pill dans le hero ---------- */
  const heroSubtitle = document.querySelector('.hero-subtitle');
  if (heroSubtitle && !document.querySelector('.m-availability')) {
    const pill = document.createElement('span');
    pill.className = 'm-availability';
    pill.textContent = 'Disponible · Alternance 2026';
    pill.style.marginLeft = '12px';
    pill.style.verticalAlign = 'middle';
    heroSubtitle.appendChild(pill);
  }

  /* ---------- 3. Ticker de compétences ---------- */
  const tickerItemsByPage = {
    default: ['Création visuelle', 'Montage vidéo', 'Communication', 'Direction artistique', 'Motion design', 'Identité visuelle'],
    projets: ['Projets universitaires', 'BUT TC', 'Communication', 'Études de cas', 'Affinity Designer', 'Travail d\'équipe'],
    experiences: ['Expériences pro', 'Stages', 'Agences com', 'Shootings', 'Séminaires', 'Polyvalence'],
    creations: ['Créations perso', 'YouTube', 'Miniatures', 'Montage vidéo', 'Motion design', 'Identité visuelle'],
    contact: ['Parlons-en', 'Disponible 2026', 'Alternance', 'Collaborations', 'Communication', 'Création visuelle']
  };
  const buildTicker = (items) => {
    const ticker = document.createElement('div');
    ticker.className = 'm-ticker';
    ticker.setAttribute('aria-hidden', 'true');
    const track = document.createElement('div');
    track.className = 'm-ticker-track';
    const row = items.map(it => `<span>${it}</span><span class="m-sep">◉</span>`).join('');
    track.innerHTML = row + row;
    ticker.appendChild(track);
    return ticker;
  };

  // Ticker sur la home (sous le .hero)
  const heroSection = document.querySelector('.hero');
  if (heroSection && !document.querySelector('.m-ticker')) {
    heroSection.appendChild(buildTicker(tickerItemsByPage.default));
  }

  // Ticker sur les sous-pages (après .page-hero)
  const pageHero = document.querySelector('.page-hero');
  if (pageHero && !document.querySelector('.m-ticker')) {
    const path = window.location.pathname.toLowerCase();
    let key = 'default';
    if (path.includes('/projets')) key = 'projets';
    else if (path.includes('/experiences')) key = 'experiences';
    else if (path.includes('/creations')) key = 'creations';
    else if (path.includes('/contact')) key = 'contact';
    pageHero.insertAdjacentElement('afterend', buildTicker(tickerItemsByPage[key]));
  }

  /* ---------- 3b. Page hero — bloc meta éditorial en haut ---------- */
  // Petit bandeau meta (catégorie / année) au-dessus du titre, façon magazine
  if (pageHero && !pageHero.querySelector('.m-page-hero-meta')) {
    const path = window.location.pathname.toLowerCase();
    let kicker = 'Portfolio';
    if (path.includes('/projets/cannes-cinema')) kicker = 'Projet · SAE Communication';
    else if (path.includes('/projets')) kicker = 'Projets universitaires';
    else if (path.includes('/experiences/gazelle')) kicker = 'Stage · Agence Gazelle';
    else if (path.includes('/experiences')) kicker = 'Expériences professionnelles';
    else if (path.includes('/creations')) kicker = 'Créations personnelles';
    else if (path.includes('/contact')) kicker = 'Contact';

    const container = pageHero.querySelector('.container');
    if (container) {
      const meta = document.createElement('div');
      meta.className = 'm-page-hero-meta';
      meta.innerHTML = `
        <span class="m-meta-kicker">${kicker}</span>
        <span class="m-meta-year">Noah Lavagna · 2026</span>
      `;
      // Insérer en tout premier dans le container
      container.insertBefore(meta, container.firstChild);
    }
  }

  /* ---------- 4. Nom géant dans le footer ---------- */
  const footer = document.querySelector('.footer');
  if (footer && !document.querySelector('.m-footer-giant')) {
    const giant = document.createElement('div');
    giant.className = 'm-footer-giant';
    giant.setAttribute('aria-hidden', 'true');
    giant.textContent = 'Lavagna';
    footer.appendChild(giant);
  }

  /* ---------- 5. Parallaxe légère sur le vinyle du hero ---------- */
  if (!reduceMotion) {
    const vinyl = document.querySelector('.hero-vinyl .vinyl-container');
    if (vinyl) {
      let raf = null;
      const onScroll = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const y = window.scrollY;
          vinyl.style.transform = `translateY(${y * -0.06}px)`;
          raf = null;
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  }
})();
// === merged from modern-plus.js ===
/* =========================================================
   MODERN PLUS — JS pour les 14 features de polish premium.
   Additive : ne touche pas au HTML existant, tout est injecté.
   ========================================================= */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const path = window.location.pathname.toLowerCase();
  const isDetailPage = path.includes('/projets/cannes-cinema') || path.includes('/experiences/gazelle');
  const depth = (path.match(/\//g) || []).length - 1; // approx
  // Resolve relative paths (depth 1 vs 2)
  const isDeep = path.split('/').filter(Boolean).length >= 2;
  const rel = isDeep ? '../../' : (path.split('/').filter(Boolean).length === 1 ? '../' : '');

  /* ---------- 1. VIEW TRANSITIONS — wipe sur les liens internes ---------- */
  // L'API @view-transition gère les transitions, on ajoute juste un wipe sur les liens internes
  if ('startViewTransition' in document && !reduceMotion) {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || link.target === '_blank') return;
      // Already handled by @view-transition navigation
    });
  }

  /* ---------- 2. MAGNETIC CTA — uniquement sur hero-cta (les autres CTA ont déjà l'effet wipe) ---------- */
  if (!reduceMotion) {
    const magneticSelectors = '.hero-cta, [data-magnetic]';
    document.querySelectorAll(magneticSelectors).forEach(el => {
      el.setAttribute('data-magnetic', '');
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.18}px, ${y * 0.25}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ---------- 3. TITLE REVEAL ligne par ligne ---------- */
  // On wrap les titres dans .mp-mask + .mp-line (s'ils n'ont pas déjà des .line)
  // On ne touche PAS .hero-title (animée par script.js + sélecteurs nth-child de modern.css)
  const revealTitles = document.querySelectorAll('.page-hero-title, .section-title');
  revealTitles.forEach(title => {
    if (title.dataset.mpReveal) return;
    title.dataset.mpReveal = '1';
    // Ne pas re-wrapper les .line existantes
    const existingLines = title.querySelectorAll('.line, .light');
    if (existingLines.length > 0) {
      existingLines.forEach(line => {
        const wrap = document.createElement('span');
        wrap.className = 'mp-mask';
        const inner = document.createElement('span');
        inner.className = 'mp-line';
        line.parentNode.insertBefore(wrap, line);
        inner.appendChild(line);
        wrap.appendChild(inner);
      });
      // Marquer le wrapper parent
      title.classList.add('mp-mask-host');
    }
  });

  // IntersectionObserver pour révéler
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.mp-mask').forEach(m => io.observe(m));
  } else {
    document.querySelectorAll('.mp-mask').forEach(m => m.classList.add('is-in'));
  }

  /* ---------- 4. LIGHTBOX ---------- */
  const lightboxImages = Array.from(document.querySelectorAll(
    '.gallery-main img, .thumb-item img, .project-gallery img, .video-gallery img, [data-lightbox]'
  )).filter(img => img.tagName === 'IMG');

  if (lightboxImages.length > 0) {
    // Build lightbox DOM
    const lb = document.createElement('div');
    lb.className = 'mp-lightbox';
    lb.setAttribute('aria-hidden', 'true');
    lb.innerHTML = `
      <div class="mp-lightbox-inner">
        <button class="mp-lightbox-close" aria-label="Fermer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <button class="mp-lightbox-prev" aria-label="Précédent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button class="mp-lightbox-next" aria-label="Suivant">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
        <img alt="">
        <span class="mp-lightbox-caption"></span>
        <a class="mp-lightbox-watch" target="_blank" rel="noopener noreferrer" href="" hidden>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Voir la vidéo
        </a>
      </div>`;
    document.body.appendChild(lb);
    const lbImg = lb.querySelector('img');
    const lbCap = lb.querySelector('.mp-lightbox-caption');
    const lbWatch = lb.querySelector('.mp-lightbox-watch');
    let currentIdx = 0;
    const open = (i) => {
      currentIdx = i;
      const src = lightboxImages[i];
      lbImg.src = src.src;
      lbImg.alt = src.alt || '';
      lbCap.textContent = src.alt || '';
      const parentLink = src.closest('a[href]');
      if (parentLink && parentLink.href && !parentLink.href.startsWith('javascript:')) {
        lbWatch.href = parentLink.href;
        lbWatch.hidden = false;
      } else {
        lbWatch.removeAttribute('href');
        lbWatch.hidden = true;
      }
      lb.classList.add('is-open');
      document.body.classList.add('mp-lightbox-open');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      lb.classList.remove('is-open');
      document.body.classList.remove('mp-lightbox-open');
      document.body.style.overflow = '';
    };
    const next = () => open((currentIdx + 1) % lightboxImages.length);
    const prev = () => open((currentIdx - 1 + lightboxImages.length) % lightboxImages.length);

    lightboxImages.forEach((img, i) => {
      img.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        open(i);
      });
    });
    lb.querySelector('.mp-lightbox-close').addEventListener('click', close);
    lb.querySelector('.mp-lightbox-next').addEventListener('click', next);
    lb.querySelector('.mp-lightbox-prev').addEventListener('click', prev);
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    });
  }

  /* ---------- 5. DARK MODE espresso ---------- */
  const savedTheme = localStorage.getItem('mp-theme');
  if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

  const toggle = document.createElement('button');
  toggle.className = 'mp-theme-toggle';
  toggle.setAttribute('aria-label', 'Basculer thème sombre');
  toggle.innerHTML = `
    <svg class="mp-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
    <svg class="mp-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>`;
  document.body.appendChild(toggle);
  const applyTheme = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('mp-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('mp-theme', 'dark');
    }
  };

  toggle.addEventListener('click', (e) => {
    // Position du clic pour le wipe circulaire
    const rect = toggle.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = Math.hypot(
      Math.max(cx, window.innerWidth - cx),
      Math.max(cy, window.innerHeight - cy)
    );
    document.documentElement.style.setProperty('--mp-cx', cx + 'px');
    document.documentElement.style.setProperty('--mp-cy', cy + 'px');
    document.documentElement.style.setProperty('--mp-r', maxR + 'px');

    // View Transitions API si dispo (Chrome/Edge/Safari récents)
    if ('startViewTransition' in document && !reduceMotion) {
      const willBeDark = document.documentElement.getAttribute('data-theme') !== 'dark';
      document.documentElement.classList.add(willBeDark ? 'mp-vt-to-dark' : 'mp-vt-to-light');
      const transition = document.startViewTransition(() => applyTheme());
      transition.finished.finally(() => {
        document.documentElement.classList.remove('mp-vt-to-dark', 'mp-vt-to-light');
      });
    } else {
      applyTheme();
    }
  });

  /* ---------- 6. RELATED PROJECTS sur pages détail ---------- */
  if (isDetailPage) {
    const isCannes = path.includes('cannes-cinema');
    const sections = document.querySelectorAll('.section');
    const lastSection = sections[sections.length - 1];
    if (lastSection && !document.querySelector('.mp-related')) {
      const related = document.createElement('section');
      related.className = 'mp-related';
      const baseRel = isCannes ? '../../experiences/gazelle/' : '../../projets/cannes-cinema/';
      const otherRel = isCannes ? '../../experiences/' : '../../projets/';
      related.innerHTML = `
        <div class="container">
          <div class="mp-related-label">À découvrir aussi</div>
          <div class="mp-related-grid">
            <a href="${baseRel}" class="mp-related-card">
              <span class="mp-related-kicker">${isCannes ? 'Stage · Agence' : 'Projet · SAE'}</span>
              <h3 class="mp-related-title">${isCannes ? 'Agence <em>Gazelle</em>' : 'Cannes <em>Cinéma</em>'}</h3>
              <span class="mp-related-arrow">Voir le projet →</span>
            </a>
            <a href="${otherRel}" class="mp-related-card">
              <span class="mp-related-kicker">${isCannes ? 'Toutes les expériences' : 'Tous les projets'}</span>
              <h3 class="mp-related-title">Retour <em>${isCannes ? 'Expériences' : 'Projets'}</em></h3>
              <span class="mp-related-arrow">Voir tout →</span>
            </a>
          </div>
        </div>`;
      lastSection.parentNode.insertBefore(related, lastSection.nextSibling);
    }

    /* ---------- 7. READ PROGRESS verticale (pages détail uniquement) ---------- */
    if (!document.querySelector('.mp-read-progress')) {
      const rp = document.createElement('div');
      rp.className = 'mp-read-progress';
      rp.setAttribute('aria-hidden', 'true');
      const fill = document.createElement('span');
      rp.appendChild(fill);
      document.body.appendChild(rp);
      const updateRP = () => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
        fill.style.height = pct + '%';
      };
      document.addEventListener('scroll', updateRP, { passive: true });
      updateRP();
    }
  }

  /* ---------- 9. EASTER EGG : taper "vinyle" ---------- */
  let typedKeys = '';
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    typedKeys += e.key.toLowerCase();
    if (typedKeys.length > 10) typedKeys = typedKeys.slice(-10);
    if (typedKeys.includes('vinyle')) {
      typedKeys = '';
      const vinyl = document.querySelector('.hero-vinyl, .vinyl-container');
      if (vinyl) {
        vinyl.click();
        // Petite anim de feedback
        document.body.animate(
          [{ filter: 'hue-rotate(0deg)' }, { filter: 'hue-rotate(20deg)' }, { filter: 'hue-rotate(0deg)' }],
          { duration: 800, easing: 'ease-in-out' }
        );
      }
    }
  });

  /* ---------- 10. SKIP TO CONTENT ---------- */
  if (!document.querySelector('.mp-skip')) {
    const skip = document.createElement('a');
    skip.className = 'mp-skip';
    skip.href = '#main-content';
    skip.textContent = 'Aller au contenu';
    document.body.appendChild(skip); // append, pas insertBefore (évite de perturber le layout initial)
    // Tag main content
    const main = document.querySelector('.hero, .page-hero');
    if (main && !main.id) main.id = 'main-content';
  }

  /* ---------- 11. "Mis à jour" footer ---------- */
  const footer = document.querySelector('.footer .container');
  if (footer && !footer.querySelector('.mp-updated')) {
    const updated = document.createElement('span');
    updated.className = 'mp-updated';
    updated.textContent = 'Mis à jour · Mai 2026';
    footer.appendChild(updated);
  }

  /* ---------- 12. CV PREVIEW MODAL — lazy : on ne construit RIEN tant que pas cliqué
       (un iframe dormant dans le body cassait Lenis sur la home) ---------- */
  const cvLinks = document.querySelectorAll('a[href$=".pdf"]');
  if (cvLinks.length > 0) {
    let modal = null, iframe = null, dlBtn = null, titleEl = null;
    const buildModal = () => {
      modal = document.createElement('div');
      modal.className = 'mp-pdf-modal';
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML = `
        <div class="mp-pdf-inner">
          <div class="mp-pdf-header">
            <span class="mp-pdf-title">CV — Noah Lavagna</span>
            <button class="mp-pdf-close" aria-label="Fermer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <iframe class="mp-pdf-iframe" title="Aperçu PDF"></iframe>
          <div class="mp-pdf-footer">
            <a class="mp-pdf-dl" download href="">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              Télécharger le PDF
            </a>
          </div>
        </div>`;
      document.body.appendChild(modal);
      iframe = modal.querySelector('.mp-pdf-iframe');
      dlBtn  = modal.querySelector('.mp-pdf-dl');
      titleEl = modal.querySelector('.mp-pdf-title');
      const closeModal = () => {
        modal.classList.remove('is-open');
        document.body.classList.remove('mp-pdf-open');
        // On laisse l'anim de sortie finir avant de vider l'iframe
        setTimeout(() => { if (!modal.classList.contains('is-open')) iframe.src = ''; }, 450);
        document.body.style.overflow = '';
      };
      modal.querySelector('.mp-pdf-close').addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) closeModal();
      });
    };
    cvLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        if (!modal) buildModal();
        const href = link.getAttribute('href');
        const isPortfolio = /portfolio/i.test(href);
        titleEl.textContent = (isPortfolio ? 'Portfolio' : 'CV') + ' — Noah Lavagna';
        iframe.src = href;
        dlBtn.href = href;
        document.body.style.overflow = 'hidden';
        // Force reflow pour que l'état initial (scale .85, opacity 0) soit
        // capturé AVANT d'ajouter is-open → l'anim part bien du centre.
        void modal.offsetWidth;
        requestAnimationFrame(() => {
          modal.classList.add('is-open');
          document.body.classList.add('mp-pdf-open');
        });
      });
    });
  }

  /* ---------- 13. IMAGE BLUR-UP ---------- */
  // Wrap images des galleries dans .mp-img-load et marque is-loaded au load
  const wrapImgs = document.querySelectorAll('.thumb-item img, .project-gallery img, .video-gallery img, .gallery-main img');
  wrapImgs.forEach(img => {
    if (img.closest('.mp-img-load')) return;
    if (img.complete && img.naturalWidth > 0) return; // déjà loadée, skip
    const wrap = document.createElement('div');
    wrap.className = 'mp-img-load';
    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);
    if (img.complete) {
      wrap.classList.add('is-loaded');
    } else {
      img.addEventListener('load', () => wrap.classList.add('is-loaded'), { once: true });
      img.addEventListener('error', () => wrap.classList.add('is-loaded'), { once: true });
    }
  });

  /* ---------- INTRO modernisée — halo, RPM, bandeau bas, wipe sortie ---------- */
  const intro = document.getElementById('intro');
  if (intro && !intro.classList.contains('gone') && !intro.querySelector('.mp-intro-wipe')) {
    // Halo terracotta autour du vinyle
    const turntable = intro.querySelector('.intro-turntable');
    if (turntable && !turntable.querySelector('.mp-intro-halo')) {
      const halo = document.createElement('div');
      halo.className = 'mp-intro-halo';
      halo.setAttribute('aria-hidden', 'true');
      turntable.appendChild(halo);
    }
    // Badge RPM
    if (turntable && !turntable.querySelector('.mp-intro-rpm')) {
      const rpm = document.createElement('div');
      rpm.className = 'mp-intro-rpm';
      rpm.textContent = '33⅓ RPM';
      turntable.appendChild(rpm);
    }
    // Bandeau bas
    if (!intro.querySelector('.mp-intro-bottom')) {
      const bottom = document.createElement('div');
      bottom.className = 'mp-intro-bottom';
      bottom.innerHTML = 'Création visuelle <span>·</span> Montage <span>·</span> Communication';
      intro.appendChild(bottom);
    }
    // Voile terracotta pour la sortie
    const wipe = document.createElement('div');
    wipe.className = 'mp-intro-wipe';
    wipe.setAttribute('aria-hidden', 'true');
    intro.appendChild(wipe);
  }

  /* ---------- 14. VINYL TOOLTIP "Now spinning" ---------- */
  const heroVinyl = document.querySelector('.hero-vinyl');
  if (heroVinyl && !document.querySelector('.mp-vinyl-tooltip')) {
    const tip = document.createElement('div');
    tip.className = 'mp-vinyl-tooltip';
    tip.innerHTML = '<span class="mp-needle-dot">◆</span>Poser le diamant';
    heroVinyl.appendChild(tip);
  }

  /* ---------- Nudge Lenis : après injections, on force un resize pour qu'il
       recalcule le scrollHeight (sinon scroll fluide cassé sur la home) ---------- */
  const nudgeLenis = () => {
    window.dispatchEvent(new Event('resize'));
    if (window.lenis && typeof window.lenis.resize === 'function') window.lenis.resize();
  };
  // Une première fois après injection
  setTimeout(nudgeLenis, 50);
  // Une seconde fois après que tout soit chargé (images + intro)
  window.addEventListener('load', () => setTimeout(nudgeLenis, 300));
})();
