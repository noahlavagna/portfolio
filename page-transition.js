// Fondu de sortie avant navigation entre pages
document.addEventListener('click', function (e) {
  const link = e.target.closest('a[href]');
  if (!link) return;

  const href = link.getAttribute('href');
  if (
    !href ||
    href.startsWith('#') ||
    href.startsWith('mailto:') ||
    href.startsWith('http') ||
    href.startsWith('//') ||
    link.target === '_blank'
  ) return;

  if (document.body.classList.contains('is-leaving')) return;

  e.preventDefault();

  document.body.classList.add('is-leaving');

  setTimeout(function () {
    window.location.href = href;
  }, 260);
}, true); // capture phase — intercepte avant les autres listeners
