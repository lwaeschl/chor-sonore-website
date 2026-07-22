// Navigation: fester Hintergrund ab dem ersten Scroll
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('nav--solid', window.scrollY > 60);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobiles Menü
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
toggle.addEventListener('click', () => {
  const offen = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(offen));
  nav.classList.add('nav--solid');
});
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  links.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

// Einblenden beim Scrollen
const io = new IntersectionObserver((eintraege) => {
  eintraege.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 3) * 90 + 'ms';
  io.observe(el);
});

// Videos: Vorschaubild gegen echtes Video tauschen, mit Ton abspielen
document.querySelectorAll('.vid__frame').forEach(frame => {
  frame.addEventListener('click', () => {
    if (frame.dataset.aktiv) return;
    frame.dataset.aktiv = '1';
    const video = document.createElement('video');
    video.src = frame.dataset.src;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'auto';
    frame.innerHTML = '';
    frame.style.cursor = 'default';
    frame.appendChild(video);
    // andere laufende Videos anhalten
    document.querySelectorAll('.vid__frame video').forEach(v => { if (v !== video) v.pause(); });
  });
});

// Hero-Video: bei reduzierter Bewegung oder Datensparmodus nicht abspielen
const hero = document.querySelector('.hero__video');
if (hero) {
  const sparsam = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
                  (navigator.connection && navigator.connection.saveData);
  if (sparsam) { hero.pause(); hero.removeAttribute('autoplay'); }
}

// Sicherheitsnetz: falls der Observer nicht greift, nach kurzer Zeit alles zeigen
setTimeout(() => document.querySelectorAll('.reveal:not(.in)').forEach(el => el.classList.add('in')), 2500);
