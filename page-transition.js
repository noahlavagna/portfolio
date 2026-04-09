// Transition entre pages :
// - Si le navigateur supporte la View Transitions API (Chrome/Edge/Safari récents),
//   on laisse le navigateur gérer le crossfade natif (déclenché par @view-transition
//   dans le CSS). Aucun fondu manuel : pas de flash blanc, pas de délai.
// - Sinon (Firefox), on garde le fondu manuel (is-leaving) avant navigation.
const SUPPORTS_VIEW_TRANSITIONS =
  typeof document !== 'undefined' && 'startViewTransition' in document;

if (!SUPPORTS_VIEW_TRANSITIONS) {
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
}

// Au retour via le bouton « précédent » du navigateur, certains browsers restaurent
// la page depuis le bfcache avec body.is-leaving encore appliqué (donc opacity 0,
// pointer-events none). On nettoie cet état pour éviter une page « gelée ».
window.addEventListener('pageshow', function () {
  document.body.classList.remove('is-leaving');
});
