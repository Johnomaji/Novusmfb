/* ==========================================================================
   Novus MFB — splash
   The logo mark, spinning, on the first page you land on. Shown once per
   browsing session so it never interrupts navigation between pages.
   Loaded synchronously at the top of <body> so it paints before the page.
   ========================================================================== */
(function () {
  'use strict';

  var KEY = 'novus:splash';
  var MIN = 1500;      // keep it up at least this long, so it doesn't flicker
  var MAX = 3600;      // never hold the page hostage, whatever else is loading

  try { if (sessionStorage.getItem(KEY)) return; sessionStorage.setItem(KEY, '1'); }
  catch (e) { /* private mode — show it, just don't remember */ }

  if (!document.body) return;

  var el = document.createElement('div');
  el.className = 'splash';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-label', 'Loading Novus Microfinance Bank');
  el.innerHTML =
    '<div class="splash__mark"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Novus Microfinance Bank"><path fill="#1E2A78" d="M 33.5 17.5 L 35.3 16.4 L 37.3 15.3 L 39.3 14.4 L 41.3 13.5 L 43.4 12.8 L 45.5 12.1 L 47.6 11.5 L 49.8 11.1 L 51.9 10.7 L 54.1 10.4 L 56.3 10.2 L 58.5 10.1 L 60.7 10.1 L 62.9 10.3 L 65.1 10.5 L 67.2 10.8 L 69.4 11.2 L 71.5 11.7 L 73.6 12.3 L 75.7 13 L 77.7 13.8 L 79.7 14.7 L 81.7 15.6 L 83.6 16.7 L 85.4 17.8 L 87.2 19 L 89 20.3 L 90.6 21.7 L 92.3 23.1 L 93.8 24.7 L 95.3 26.2 L 96.6 27.9 L 98 29.6 L 99.2 31.3 L 100.3 33.1 L 101.4 35 L 102.4 36.9 L 103.3 38.8 L 104.1 40.8 L 104.8 42.8 L 105.4 44.8 L 105.9 46.8 L 106.3 48.9 L 106.7 51 L 106.9 53 L 107.1 55.1 L 107.1 57.2 L 107 59.3 L 106.9 61.4 L 106.7 63.4 L 106.3 65.5 L 105.9 67.5 L 105.4 69.4 L 104.7 71.4 L 103.9 73.3 L 102.9 75.1 L 101.9 76.8 L 100.7 78.5 L 99.5 80 L 98.2 81.5 L 96.8 82.9 L 95.3 84.2 L 93.7 85.4 L 92.1 86.5 L 90.4 87.4 L 88.7 88.3 L 86.9 89 L 85.2 89.6 L 83.4 90.1 L 81.6 90.4 L 79.8 90.6 L 78 90.7 L 76.2 90.7 L 74.4 90.6 L 72.7 90.3 L 71 89.9 L 69.3 89.3 L 67.8 88.7 L 66.3 87.9 L 64.8 87 L 63.5 86 L 62.2 84.9 L 61 83.6 L 60 82 L 60 82 L 61 82.1 L 62 82.4 L 63 82.8 L 64.1 83.1 L 65.2 83.3 L 66.4 83.5 L 67.5 83.6 L 68.7 83.7 L 69.9 83.7 L 71.1 83.6 L 72.4 83.5 L 73.6 83.3 L 74.8 83 L 76 82.6 L 77.2 82.1 L 78.4 81.6 L 79.5 81 L 80.7 80.3 L 81.7 79.6 L 82.8 78.8 L 83.8 77.9 L 84.7 77 L 85.6 76 L 86.4 74.9 L 87.1 73.8 L 87.8 72.6 L 88.4 71.4 L 88.9 70.2 L 89.4 68.9 L 89.7 67.6 L 90 66.2 L 90.1 64.9 L 90.1 63.5 L 90.1 62.2 L 90.1 60.9 L 89.9 59.6 L 89.8 58.2 L 89.5 56.9 L 89.3 55.7 L 88.9 54.4 L 88.5 53.2 L 88.1 51.9 L 87.6 50.7 L 87.1 49.6 L 86.5 48.4 L 85.9 47.3 L 85.2 46.2 L 84.5 45.2 L 83.7 44.2 L 83 43.2 L 82.1 42.3 L 81.3 41.4 L 80.4 40.5 L 79.4 39.7 L 78.5 38.9 L 77.5 38.2 L 76.4 37.5 L 75.4 36.8 L 74.3 36.2 L 73.2 35.7 L 72.1 35.2 L 71 34.7 L 69.9 34.3 L 68.7 34 L 67.5 33.7 L 66.4 33.4 L 65.2 33.2 L 64 33 L 62.8 32.9 L 61.6 32.9 L 60.4 32.9 L 59.2 32.9 L 58 33 L 56.8 33.1 L 55.6 33.3 L 54.5 33.6 L 53.3 33.9 L 52.2 34.2 L 51.1 34.6 L 50 35 L 48.9 35.5 L 47.8 36 L 46.8 36.6 L 45.7 37.2 Z"/><path fill="#EA3223" d="M 86.5 102.5 L 84.7 103.6 L 82.7 104.7 L 80.7 105.6 L 78.7 106.5 L 76.6 107.2 L 74.5 107.9 L 72.4 108.5 L 70.2 108.9 L 68.1 109.3 L 65.9 109.6 L 63.7 109.8 L 61.5 109.9 L 59.3 109.9 L 57.1 109.7 L 54.9 109.5 L 52.8 109.2 L 50.6 108.8 L 48.5 108.3 L 46.4 107.7 L 44.3 107 L 42.3 106.2 L 40.3 105.3 L 38.3 104.4 L 36.4 103.3 L 34.6 102.2 L 32.8 101 L 31 99.7 L 29.4 98.3 L 27.7 96.9 L 26.2 95.3 L 24.7 93.8 L 23.4 92.1 L 22 90.4 L 20.8 88.7 L 19.7 86.9 L 18.6 85 L 17.6 83.1 L 16.7 81.2 L 15.9 79.2 L 15.2 77.2 L 14.6 75.2 L 14.1 73.2 L 13.7 71.1 L 13.3 69 L 13.1 67 L 12.9 64.9 L 12.9 62.8 L 13 60.7 L 13.1 58.6 L 13.3 56.6 L 13.7 54.5 L 14.1 52.5 L 14.6 50.6 L 15.3 48.6 L 16.1 46.7 L 17.1 44.9 L 18.1 43.2 L 19.3 41.5 L 20.5 40 L 21.8 38.5 L 23.2 37.1 L 24.7 35.8 L 26.3 34.6 L 27.9 33.5 L 29.6 32.6 L 31.3 31.7 L 33.1 31 L 34.8 30.4 L 36.6 29.9 L 38.4 29.6 L 40.2 29.4 L 42 29.3 L 43.8 29.3 L 45.6 29.4 L 47.3 29.7 L 49 30.1 L 50.7 30.7 L 52.2 31.3 L 53.7 32.1 L 55.2 33 L 56.5 34 L 57.8 35.1 L 59 36.4 L 60 38 L 60 38 L 59 37.9 L 58 37.6 L 57 37.2 L 55.9 36.9 L 54.8 36.7 L 53.6 36.5 L 52.5 36.4 L 51.3 36.3 L 50.1 36.3 L 48.9 36.4 L 47.6 36.5 L 46.4 36.7 L 45.2 37 L 44 37.4 L 42.8 37.9 L 41.6 38.4 L 40.5 39 L 39.3 39.7 L 38.3 40.4 L 37.2 41.2 L 36.2 42.1 L 35.3 43 L 34.4 44 L 33.6 45.1 L 32.9 46.2 L 32.2 47.4 L 31.6 48.6 L 31.1 49.8 L 30.6 51.1 L 30.3 52.4 L 30 53.8 L 29.9 55.1 L 29.9 56.5 L 29.9 57.8 L 29.9 59.1 L 30.1 60.4 L 30.2 61.8 L 30.5 63.1 L 30.7 64.3 L 31.1 65.6 L 31.5 66.8 L 31.9 68.1 L 32.4 69.3 L 32.9 70.4 L 33.5 71.6 L 34.1 72.7 L 34.8 73.8 L 35.5 74.8 L 36.3 75.8 L 37 76.8 L 37.9 77.7 L 38.7 78.6 L 39.6 79.5 L 40.6 80.3 L 41.5 81.1 L 42.5 81.8 L 43.6 82.5 L 44.6 83.2 L 45.7 83.8 L 46.8 84.3 L 47.9 84.8 L 49 85.3 L 50.1 85.7 L 51.3 86 L 52.5 86.3 L 53.6 86.6 L 54.8 86.8 L 56 87 L 57.2 87.1 L 58.4 87.1 L 59.6 87.1 L 60.8 87.1 L 62 87 L 63.2 86.9 L 64.4 86.7 L 65.5 86.4 L 66.7 86.1 L 67.8 85.8 L 68.9 85.4 L 70 85 L 71.1 84.5 L 72.2 84 L 73.2 83.4 L 74.3 82.8 Z"/></svg></div>' +
    '<div class="splash__word">Novus</div>' +
    '<div class="splash__bar"><i></i></div>';
  document.body.appendChild(el);

  var prev = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  var t0 = Date.now(), done = false;

  function dismiss() {
    if (done) return;
    done = true;
    el.classList.add('is-out');
    document.body.style.overflow = prev;
    window.removeEventListener('load', ready);
    document.removeEventListener('keydown', skip, true);
    el.removeEventListener('click', skip);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 650);
  }

  function ready() {
    var left = MIN - (Date.now() - t0);
    setTimeout(dismiss, left > 0 ? left : 0);
  }

  function skip() { dismiss(); }

  if (document.readyState === 'complete') ready();
  else window.addEventListener('load', ready);

  setTimeout(dismiss, MAX);                       // hard ceiling
  document.addEventListener('keydown', skip, true); // any key skips
  el.addEventListener('click', skip);               // tap skips
}());
