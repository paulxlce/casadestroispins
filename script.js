const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileClose = document.querySelector('.mobile-close');
const mobileLinks = document.querySelectorAll('.mobile-nav a, .mobile-nav button');

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
