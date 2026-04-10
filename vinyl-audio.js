// ===== VINYL AUDIO PLAYER =====
// - Lecteur "now playing" en bas à droite (toutes les pages)
// - Si assets/audio/vinyl.mp3 existe, le joue en boucle
// - Sinon, génère un crackle de vinyle via la Web Audio API
// - Easter egg : taper "play" n'importe où lance / arrête la lecture
// - Curseur "diamant" au survol des éléments vinyle

(function () {
  const AUDIO_FILE = 'assets/audio/vinyl.mp3';

  let audioEl = null;
  let audioReady = false;
  let audioCtx = null;
  let crackleNodes = null;
  let isPlaying = false;
  let widget = null;
  let discEl = null;
  let toggleBtn = null;

  // ----- TENTATIVE DE CHARGEMENT D'UN VRAI FICHIER AUDIO -----
  function tryLoadFile() {
    audioEl = new Audio(AUDIO_FILE);
    audioEl.loop = true;
    audioEl.volume = 0.12;
    audioEl.preload = 'auto';
    audioEl.addEventListener('canplaythrough', () => { audioReady = true; }, { once: true });
    audioEl.addEventListener('error', () => { audioEl = null; audioReady = false; });
  }

  // ----- FALLBACK : CRACKLE DE VINYLE GÉNÉRÉ -----
  function ensureCrackle() {
    if (crackleNodes) return crackleNodes;
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();

    // Buffer de bruit avec quelques pops aléatoires (1.5s, en boucle)
    const len = Math.floor(audioCtx.sampleRate * 1.5);
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const isPop = Math.random() < 0.0008;
      data[i] = (Math.random() * 2 - 1) * (isPop ? 0.55 : 0.045);
    }

    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    // Filtre passe-bande pour la chaleur "vinyle"
    const filt = audioCtx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = 1800;
    filt.Q.value = 0.6;

    // Léger sub pour le rumble
    const rumble = audioCtx.createOscillator();
    rumble.type = 'sine';
    rumble.frequency.value = 55;
    const rumbleGain = audioCtx.createGain();
    rumbleGain.gain.value = 0.02;
    rumble.connect(rumbleGain);

    const master = audioCtx.createGain();
    master.gain.value = 0;

    src.connect(filt);
    filt.connect(master);
    rumbleGain.connect(master);
    master.connect(audioCtx.destination);

    src.start();
    rumble.start();

    crackleNodes = { master };
    return crackleNodes;
  }

  // ----- PLAY / PAUSE -----
  function play() {
    if (audioReady && audioEl) {
      audioEl.play().catch(() => useFallback());
    } else {
      useFallback();
    }
    isPlaying = true;
    updateUI();
    if (window.syncTonearm) window.syncTonearm(true);
  }

  function useFallback() {
    const { master } = ensureCrackle();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    master.gain.cancelScheduledValues(audioCtx.currentTime);
    master.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.4);
  }

  function pause() {
    if (audioEl && !audioEl.paused) audioEl.pause();
    if (crackleNodes) {
      const { master } = crackleNodes;
      master.gain.cancelScheduledValues(audioCtx.currentTime);
      master.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
    }
    isPlaying = false;
    updateUI();
    if (window.syncTonearm) window.syncTonearm(false);
  }

  function toggle() {
    if (isPlaying) pause(); else play();
  }

  // ----- WIDGET DOM -----
  function buildWidget() {
    if (widget) return;
    widget = document.createElement('div');
    widget.className = 'vinyl-widget';
    widget.setAttribute('aria-label', 'Lecteur audio');
    widget.innerHTML = `
      <button class="vinyl-widget-toggle" type="button" aria-label="Lecture / Pause">
        <span class="vinyl-widget-disc">
          <span class="vinyl-widget-label"></span>
          <span class="vinyl-widget-groove"></span>
          <span class="vinyl-widget-groove g2"></span>
        </span>
        <svg class="vinyl-widget-icon icon-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="7 4 20 12 7 20"/></svg>
        <svg class="vinyl-widget-icon icon-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>
      </button>
      <span class="vinyl-widget-text">Vinyle</span>
    `;
    document.body.appendChild(widget);
    discEl = widget.querySelector('.vinyl-widget-disc');
    toggleBtn = widget.querySelector('.vinyl-widget-toggle');
    toggleBtn.addEventListener('click', toggle);
  }

  function updateUI() {
    if (!widget) return;
    widget.classList.toggle('is-playing', isPlaying);
    widget.querySelector('.vinyl-widget-text').textContent = isPlaying ? 'En lecture' : 'Vinyle';
  }

  // ----- TOAST -----
  let toastTimer = null;
  function showToast(msg) {
    let toast = document.querySelector('.vinyl-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'vinyl-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 1800);
  }

  // ----- EASTER EGG : TAPE "play" -----
  let typed = '';
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, [contenteditable]')) return;
    if (e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-4);
    if (typed === 'play') {
      toggle();
      showToast(isPlaying ? '♪ Lecture' : '⏸ Pause');
      typed = '';
    }
  });

  // ----- CURSEUR DIAMANT SUR LES VINYLES -----
  function setupDiamondCursor() {
    const targets = document.querySelectorAll(
      '.vinyl-record, .vinyl-container, .intro-vinyl, .mini-vinyl, .vinyl-widget-disc, .intro-tonearm, #hero-tonearm'
    );
    targets.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-diamond'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-diamond'));
    });
  }

  // ----- API PUBLIQUE -----
  window.vinylAudio = {
    play, pause, toggle,
    get isPlaying() { return isPlaying; },
  };

  // ----- INIT -----
  function start() {
    tryLoadFile();
    buildWidget();
    setupDiamondCursor();

    // Si on est sur la home et que l'intro est encore visible, on cache le widget
    // jusqu'à la fin de l'intro pour ne pas casser la mise en scène.
    const intro = document.getElementById('intro');
    if (intro && !intro.classList.contains('gone') && !sessionStorage.getItem('intro_done')) {
      widget.classList.add('hidden-by-intro');
      const obs = new MutationObserver(() => {
        if (intro.classList.contains('leaving') || intro.classList.contains('gone')) {
          widget.classList.remove('hidden-by-intro');
          // On ne lance PAS l'audio automatiquement — l'utilisateur doit
          // cliquer sur le tonearm ou le widget pour déclencher la lecture.
          obs.disconnect();
        }
      });
      obs.observe(intro, { attributes: true, attributeFilter: ['class'] });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
