// The desktop QR popover, and a download bar with both store badges on phones.
// The <head> of every page sets <html data-os="ios|android|desktop"> before the first paint; every visitor sees both
// store badges, and CSS puts Google Play first on Android.
(function () {
  var html = document.documentElement;
  var os = html.getAttribute('data-os');
  var APPLE = 'https://apps.apple.com/app/apple-store/id6808903369?pt=127826363&mt=8&ct=';
  var PLAY = 'https://play.google.com/store/apps/details?id=com.atabany.photoprint&utm_source=usephotoprint&utm_campaign=';

  // The desktop "Get the app" popover in the header closes on Escape and on a click outside it.
  var pop = document.querySelector('.qr-pop');
  if (pop) {
    document.addEventListener('click', function (e) { if (pop.open && !pop.contains(e.target)) pop.open = false; });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && pop.open) { pop.open = false; pop.querySelector('summary').focus(); }
    });
  }

  if (os !== 'ios' && os !== 'android') return;

  // The page's own campaign name (its first in-page badge), so the bar is counted per page.
  var first = document.querySelector('a.store:not(.store-play)');
  var ct = 'website';
  if (first) { var m = /[?&]ct=([a-z0-9-]+)/.exec(first.getAttribute('href')); if (m) ct = m[1]; }
  ct = (ct + '-bar').slice(0, 30);

  var closed = false;
  try { closed = sessionStorage.getItem('pp-bar-closed') === '1'; } catch (e) {}
  if (closed || !('IntersectionObserver' in window)) return;

  var bar = document.createElement('div');
  bar.className = 'app-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Download Photo Print');
  // Both stores, always (owner rule): the visitor's own store comes first through CSS.
  var icon = document.querySelector('.brand img');
  var base = icon ? icon.getAttribute('src').replace(/app-icon\.png$/, '') : 'assets/';
  bar.innerHTML =
    (icon ? '<img src="' + icon.getAttribute('src') + '" width="44" height="44" alt="">' : '') +
    '<span class="app-bar-stores">' +
    '<a href="' + APPLE + ct + '" aria-label="Download Photo Print on the App Store"><img src="' + base + 'app-store-badge.svg" width="120" height="40" alt="Download on the App Store"></a>' +
    '<a class="store-play" href="' + PLAY + ct + '" aria-label="Get Photo Print on Google Play"><img src="' + base + 'google-play-badge.svg" width="135" height="40" alt="Get it on Google Play"></a>' +
    '</span>' +
    '<button type="button" class="app-bar-close" aria-label="Hide">×</button>';
  document.body.appendChild(bar);

  // Shown once the reader is past the first screen, and hidden while a store badge or the footer is on
  // screen, so it never sits on top of another way to download.
  var visible = new Set();
  var past = false;
  function update() {
    var show = past && visible.size === 0 && !closed;
    bar.classList.toggle('is-shown', show);
    html.classList.toggle('has-app-bar', show);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) visible.add(en.target); else visible.delete(en.target); });
    update();
  });
  document.querySelectorAll('a.store, .site-header, .site-footer').forEach(function (el) { io.observe(el); });
  function onScroll() { var p = window.scrollY > window.innerHeight * 0.5; if (p !== past) { past = p; update(); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  bar.querySelector('.app-bar-close').addEventListener('click', function () {
    closed = true;
    try { sessionStorage.setItem('pp-bar-closed', '1'); } catch (e) {}
    update();
  });
})();
