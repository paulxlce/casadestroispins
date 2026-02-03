const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileClose = document.querySelector('.mobile-close');
const mobileLinks = document.querySelectorAll('.mobile-nav a, .mobile-nav button');

const toggleMenu = (open) => {
  const isOpen = open ?? !mobileMenu.classList.contains('is-open');
  mobileMenu.classList.toggle('is-open', isOpen);
  mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  menuToggle.setAttribute('aria-expanded', String(isOpen));
};

menuToggle.addEventListener('click', () => toggleMenu());
mobileClose.addEventListener('click', () => toggleMenu(false));
mobileLinks.forEach((link) => link.addEventListener('click', () => toggleMenu(false)));

const slides = Array.from(document.querySelectorAll('[data-slide]'));
const dots = Array.from(document.querySelectorAll('[data-dot]'));
let activeIndex = 0;

const setActiveSlide = (index) => {
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

dots.forEach((dot, index) => dot.addEventListener('click', () => setActiveSlide(index)));
