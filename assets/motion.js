// Respect reduced motion and data saving; pause when the film is offscreen.
const film = document.querySelector('#studio-film');
const button = document.querySelector('.motion-toggle');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let enabled = !reduced.matches && !navigator.connection?.saveData;
let visible = false;
function sync() {
  if (enabled && visible && !document.hidden) {
    film.play().catch(() => { enabled = false; button.textContent = 'Play animation'; });
  } else film.pause();
  button.textContent = enabled ? 'Pause animation' : 'Play animation';
  button.setAttribute('aria-pressed', String(enabled));
}
button.addEventListener('click', () => { enabled = !enabled; sync(); });
new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .2 }).observe(film);
document.addEventListener('visibilitychange', sync);
reduced.addEventListener('change', () => { enabled = !reduced.matches && !navigator.connection?.saveData; sync(); });
