// Si le navigateur supporte la View Transitions API, on l'active via une classe
// sur <html> (le CSS désactive alors le fondu manuel pour ne pas doubler l'effet).
// Le crossfade cross-document est déclenché automatiquement par
// `@view-transition { navigation: auto }` dans style.css.
const SUPPORTS_VT =
  typeof document !== 'undefined' && 'startViewTransition' in document;

if (SUPPORTS_VT) {
  document.documentElement.classList.add('has-vt');
}

// Fondu manuel — utilisé uniquement si la VT API n'est pas dispo (Firefox).
if (!SUPPORTS_VT) document.addEventListener('click', function (e) {
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

// Au retour via le bouton « précédent » du navigateur, certains browsers restaurent
// la page depuis le bfcache avec body.is-leaving encore appliqué (donc opacity 0,
// pointer-events none). On nettoie cet état pour éviter une page « gelée ».
window.addEventListener('pageshow', function () {
  document.body.classList.remove('is-leaving');
});
