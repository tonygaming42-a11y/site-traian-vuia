(function () {
  function initMenu() {
    const button = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    if (!button || !nav) return;

    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });
  }

  function initCursorTrail() {
    const cursor = document.getElementById('trail-cursor');
    if (!cursor) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    document.addEventListener('mousemove', (event) => {
      x = event.clientX;
      y = event.clientY;
      cursor.style.left = x + 'px';
      cursor.style.top = y + 'px';
    });
  }

  function initTestimonials() {
    const slides = document.querySelectorAll('.testimonial');
    if (!slides.length) return;
    let index = 0;
    window.setInterval(() => {
      slides[index].classList.remove('active');
      index = (index + 1) % slides.length;
      slides[index].classList.add('active');
    }, 3500);
  }

  function initGallery() {
    const buttons = document.querySelectorAll('.filter-btn');
    const images = document.querySelectorAll('#gallery-grid img');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox?.querySelector('img');

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        buttons.forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        const filter = button.getAttribute('data-filter');
        images.forEach((img) => {
          img.style.display = filter === 'all' || img.dataset.year === filter ? 'block' : 'none';
        });
      });
    });

    images.forEach((img) => {
      img.addEventListener('click', () => {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = img.src;
        lightbox.classList.add('show');
        lightbox.setAttribute('aria-hidden', 'false');
      });
    });

    if (lightbox) {
      lightbox.addEventListener('click', () => {
        lightbox.classList.remove('show');
        lightbox.setAttribute('aria-hidden', 'true');
      });
    }
  }

  function initForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      alert('Mesaj trimis (placeholder).');
      form.reset();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.initLanguageSwitcher?.();
    window.initCountdown?.();
    window.initThreeScene?.();
    window.initAnimations?.();

    initMenu();
    initCursorTrail();
    initTestimonials();
    initGallery();
    initForm();
  });
})();
