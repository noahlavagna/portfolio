// ===== FAVICON ANIMÉ — VINYLE QUI TOURNE QUAND L'ONGLET EST INACTIF =====
(function () {
  var staticHref = 'favicon.ico';
  var linkEl = document.querySelector('link[rel="icon"][type="image/x-icon"]');
  if (!linkEl) return;

  var SIZE = 32;
  var canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  var ctx = canvas.getContext('2d');

  var angle = 0;
  var rafId = null;

  function drawVinyl(a) {
    var cx = SIZE / 2;
    var cy = SIZE / 2;
    var r = SIZE / 2 - 1;

    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(a);

    // Disque noir
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();

    // Sillons (3 cercles subtils)
    for (var i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, r * (0.45 + i * 0.14), 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Label central (orange accent)
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#c44d2b';
    ctx.fill();

    // Trou central
    ctx.beginPath();
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();

    // Petit reflet sur le label
    ctx.beginPath();
    ctx.arc(-r * 0.08, -r * 0.1, r * 0.06, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fill();

    ctx.restore();
  }

  function animate() {
    angle += 0.08;
    drawVinyl(angle);
    linkEl.href = canvas.toDataURL('image/png');
    rafId = requestAnimationFrame(animate);
  }

  function startSpin() {
    if (rafId) return;
    animate();
  }

  function stopSpin() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    // Remettre le favicon statique
    linkEl.href = staticHref;
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      startSpin();
    } else {
      stopSpin();
    }
  });
})();
