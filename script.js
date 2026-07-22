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

// Hero-Video: bei reduzierter Bewegung oder Datensparmodus nicht abspielen
const hero = document.querySelector('.hero__video');
if (hero) {
  const sparsam = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
                  (navigator.connection && navigator.connection.saveData);
  if (sparsam) { hero.pause(); hero.removeAttribute('autoplay'); }
}

// Sicherheitsnetz: falls der Observer nicht greift, nach kurzer Zeit alles zeigen
setTimeout(() => document.querySelectorAll('.reveal:not(.in)').forEach(el => el.classList.add('in')), 2500);


/* ---------------------------------------------------------------- Lesefortschritt */
const sparsameBewegung = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const balken = document.createElement('div');
balken.className = 'fortschritt';
document.body.appendChild(balken);
const fortschritt = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  balken.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
};
fortschritt();
addEventListener('scroll', fortschritt, { passive: true });

/* ---------------------------------------------------------------- Aktiver Menüpunkt */
const abschnitte = [...document.querySelectorAll('section[id], footer[id]')];
const menue = new Map([...document.querySelectorAll('.nav__links a')]
  .map(a => [a.getAttribute('href').slice(1), a]));
const navBeobachter = new IntersectionObserver(eintraege => {
  eintraege.forEach(e => {
    const a = menue.get(e.target.id);
    if (!a) return;
    if (e.isIntersecting) {
      menue.forEach(x => x.classList.remove('aktiv'));
      a.classList.add('aktiv');
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
abschnitte.forEach(s => navBeobachter.observe(s));

/* ---------------------------------------------------------------- Kennzahlen hochzählen */
const zahlBeobachter = new IntersectionObserver(eintraege => {
  eintraege.forEach(e => {
    if (!e.isIntersecting) return;
    zahlBeobachter.unobserve(e.target);
    const ziel = e.target.textContent.trim();
    const zahl = parseInt(ziel.replace(/\D/g, ''), 10);
    // Jahreszahlen nicht hochzählen – das liest sich wie ein Countdown
    if (!zahl || sparsameBewegung || /täglich/i.test(ziel) || /^(19|20)\d\d$/.test(ziel)) return;
    const dauer = 900, start = performance.now();
    const schritt = jetzt => {
      const t = Math.min(1, (jetzt - start) / dauer);
      const weich = 1 - Math.pow(1 - t, 3);
      e.target.textContent = String(Math.round(zahl * weich));
      if (t < 1) requestAnimationFrame(schritt); else e.target.textContent = ziel;
    };
    requestAnimationFrame(schritt);
  });
}, { threshold: 0.6 });
document.querySelectorAll('.fact strong').forEach(el => zahlBeobachter.observe(el));

/* ---------------------------------------------------------------- Hero mit leichtem Tiefeneffekt */
const heroVideo = document.querySelector('.hero__video');
const heroInhalt = document.querySelector('.hero__inner');
if (heroVideo && !sparsameBewegung && innerWidth > 900) {
  let laeuft = false;
  addEventListener('scroll', () => {
    if (laeuft) return;
    laeuft = true;
    requestAnimationFrame(() => {
      const y = Math.min(scrollY, innerHeight);
      heroVideo.style.transform = `translate3d(0, ${y * 0.18}px, 0) scale(1.06)`;
      if (heroInhalt) {
        heroInhalt.style.transform = `translate3d(0, ${y * 0.06}px, 0)`;
        heroInhalt.style.opacity = String(Math.max(0, 1 - y / (innerHeight * 0.85)));
      }
      laeuft = false;
    });
  }, { passive: true });
}

/* ---------------------------------------------------------------- Videos in der Lightbox */
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.setAttribute('role', 'dialog');
lightbox.setAttribute('aria-modal', 'true');
lightbox.innerHTML = '<button class="lightbox__zu" aria-label="Video schliessen">&times;</button>' +
                     '<div class="lightbox__inhalt"><video controls playsinline preload="auto"></video>' +
                     '<p class="lightbox__text"></p></div>';
document.body.appendChild(lightbox);
const lbVideo = lightbox.querySelector('video');
const lbText  = lightbox.querySelector('.lightbox__text');
const lbZu    = lightbox.querySelector('.lightbox__zu');
let vorherFokus = null;

function lightboxOeffnen(quelle, beschriftung) {
  vorherFokus = document.activeElement;
  lbVideo.src = quelle;
  lbText.textContent = beschriftung || '';
  lightbox.classList.add('offen');
  document.body.classList.add('fixiert');
  lbVideo.play().catch(() => {});
  lbZu.focus();
}
function lightboxSchliessen() {
  lightbox.classList.remove('offen');
  document.body.classList.remove('fixiert');
  lbVideo.pause();
  lbVideo.removeAttribute('src');
  lbVideo.load();
  if (vorherFokus) vorherFokus.focus();
}
lbZu.addEventListener('click', lightboxSchliessen);
lightbox.addEventListener('click', e => { if (e.target === lightbox) lightboxSchliessen(); });
addEventListener('keydown', e => {
  if (!lightbox.classList.contains('offen')) return;
  if (e.key === 'Escape') lightboxSchliessen();
  if (e.key === 'Tab') { e.preventDefault(); lbZu.focus(); }   // Fokus bleibt im Dialog
});
document.querySelectorAll('.vid').forEach(figur => {
  const rahmen = figur.querySelector('.vid__frame');
  const knopf = figur.querySelector('.play');
  const text = figur.querySelector('figcaption')?.textContent || '';
  const oeffnen = e => { e.preventDefault(); e.stopPropagation();
                         lightboxOeffnen(rahmen.dataset.src, text); };
  rahmen.addEventListener('click', oeffnen);
  if (knopf) knopf.addEventListener('click', oeffnen);
});
