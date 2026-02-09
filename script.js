const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileClose = document.querySelector('.mobile-close');
const mobileLinks = document.querySelectorAll('.mobile-nav a, .mobile-nav button');
const langSwitches = document.querySelectorAll('[data-lang]');

const langStorageKey = 'preferredLang';
const getPageLang = () => document.documentElement.getAttribute('lang') || 'fr';
const isFrench = (lang) => (lang || '').toLowerCase().startsWith('fr');

if (langSwitches.length) {
  langSwitches.forEach((link) => {
    link.addEventListener('click', () => {
      const targetLang = link.getAttribute('data-lang');
      if (targetLang) {
        localStorage.setItem(langStorageKey, targetLang);
      }
    });
  });
}

const toggleMenu = (open) => {
  if (!mobileMenu || !menuToggle) return;
  const isOpen = open ?? !mobileMenu.classList.contains('is-open');
  mobileMenu.classList.toggle('is-open', isOpen);
  mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  menuToggle.setAttribute('aria-expanded', String(isOpen));
};

if (menuToggle) {
  menuToggle.addEventListener('click', () => toggleMenu());
}

if (mobileClose) {
  mobileClose.addEventListener('click', () => toggleMenu(false));
}

if (mobileLinks.length) {
  mobileLinks.forEach((link) => link.addEventListener('click', () => toggleMenu(false)));
}

const storedLang = localStorage.getItem(langStorageKey);
const browserLang = (navigator.languages && navigator.languages[0]) || navigator.language || '';
const desiredLang = storedLang || (isFrench(browserLang) ? 'fr' : 'en');
const pageLang = getPageLang();
const shouldSwitchToEnglish = desiredLang === 'en' && isFrench(pageLang);
const shouldSwitchToFrench = desiredLang === 'fr' && !isFrench(pageLang);

if (shouldSwitchToEnglish || shouldSwitchToFrench) {
  const targetLang = shouldSwitchToEnglish ? 'en' : 'fr';
  const alternate = document.querySelector(`link[rel="alternate"][hreflang="${targetLang}"]`);
  const targetHref = alternate ? alternate.getAttribute('href') : null;
  if (targetHref) {
    window.location.replace(targetHref);
  }
}

const slides = Array.from(document.querySelectorAll('[data-slide]'));
const dots = Array.from(document.querySelectorAll('[data-dot]'));
let activeIndex = 0;

const setActiveSlide = (index) => {
  if (!slides.length || !dots.length) return;
  slides[activeIndex].classList.remove('is-active');
  dots[activeIndex].classList.remove('is-active');
  activeIndex = (index + slides.length) % slides.length;
  slides[activeIndex].classList.add('is-active');
  dots[activeIndex].classList.add('is-active');
};

const prevBtn = document.querySelector('[data-prev]');
const nextBtn = document.querySelector('[data-next]');

if (prevBtn && nextBtn) {
  prevBtn.addEventListener('click', () => setActiveSlide(activeIndex - 1));
  nextBtn.addEventListener('click', () => setActiveSlide(activeIndex + 1));
}

if (dots.length) {
  dots.forEach((dot, index) => dot.addEventListener('click', () => setActiveSlide(index)));
}

const roomSections = document.querySelectorAll('.rooms');

roomSections.forEach((section) => {
  const track = section.querySelector('.rooms-track');
  const prev = section.querySelector('[data-rooms-prev]');
  const next = section.querySelector('[data-rooms-next]');

  if (!track || !prev || !next) return;

  const getScrollStep = () => {
    const tile = track.querySelector('.room-tile');
    if (!tile) return Math.max(240, track.clientWidth * 0.8);
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '0');
    return tile.getBoundingClientRect().width + gap;
  };

  prev.addEventListener('click', () => {
    track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
  });

  next.addEventListener('click', () => {
    track.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
  });
});
