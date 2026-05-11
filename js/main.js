(function () {
  function initThreeSceneOnLoad() {
    if (window.__threeSceneInitialized || typeof window.initThreeScene !== 'function') return;
    window.initThreeScene();
  }

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

  function initSectionVisibilityFallback() {
    const sections = document.querySelectorAll('.section');
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

    sections.forEach((section) => observer.observe(section));
  }

  function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    const firstLoadKey = 'tve-2026-loader-shown';
    if (sessionStorage.getItem(firstLoadKey) === 'true') {
      loader.classList.add('hidden');
      loader.setAttribute('aria-hidden', 'true');
      loader.setAttribute('aria-busy', 'false');
      return;
    }

    sessionStorage.setItem(firstLoadKey, 'true');
    window.setTimeout(() => {
      loader.classList.add('hidden');
      loader.setAttribute('aria-hidden', 'true');
      loader.setAttribute('aria-busy', 'false');
    }, 2400);
  }

  function initCursorTrail() {
    const cursor = document.getElementById('trail-cursor');
    if (!cursor || window.matchMedia('(pointer: coarse)').matches) return;

    const trailCount = 4;
    const points = [];
    for (let i = 0; i < trailCount; i += 1) {
      const dot = document.createElement('span');
      dot.className = 'cursor-trail-dot';
      document.body.appendChild(dot);
      points.push({ el: dot, x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    document.addEventListener('mousemove', (event) => {
      x = event.clientX;
      y = event.clientY;
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
    });

    function animateDots() {
      points.forEach((point, index) => {
        const target = index === 0 ? { x, y } : points[index - 1];
        point.x += (target.x - point.x) * (0.18 - index * 0.015);
        point.y += (target.y - point.y) * (0.18 - index * 0.015);
        point.el.style.left = `${point.x}px`;
        point.el.style.top = `${point.y}px`;
      });
      requestAnimationFrame(animateDots);
    }

    animateDots();
  }

  function initNavbarEffects() {
    const navbar = document.querySelector('.navbar');
    const links = Array.from(document.querySelectorAll('#main-nav a'));
    const sections = links
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    if (!navbar || !links.length || !sections.length) return;

    function updateNavbarState() {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('active', active);
        });
      });
    }, { threshold: 0.5 });

    sections.forEach((section) => sectionObserver.observe(section));
    updateNavbarState();
    window.addEventListener('scroll', updateNavbarState, { passive: true });
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

  function initCommitteesTabs() {
    const tabs = document.querySelectorAll('.committees-tab');
    const panels = document.querySelectorAll('.committees-panel');
    if (!tabs.length) return;
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        panels.forEach((p) => { p.style.display = 'none'; });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        const target = document.getElementById('panel-' + tab.dataset.tab);
        if (target) target.style.display = 'block';
      });
    });
  }

  function initExpandToggle(btnId, listId, sectionId, labelExpand, labelCollapse) {
    const btn = document.getElementById(btnId);
    const list = document.getElementById(listId);
    if (!btn || !list) return;
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const label = btn.querySelector('.toggle-label');
      if (expanded) {
        list.style.display = 'none';
        btn.setAttribute('aria-expanded', 'false');
        if (label) label.textContent = labelExpand;
        if (sectionId) document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        list.style.display = 'grid';
        btn.setAttribute('aria-expanded', 'true');
        if (label) label.textContent = labelCollapse;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    window.initLanguageSwitcher?.();
    window.initCountdown?.();
    initThreeSceneOnLoad();
    window.initAnimations?.();

    initMenu();
    initSectionVisibilityFallback();
    initCursorTrail();
    initNavbarEffects();
    initTestimonials();
    initGallery();
    initForm();
    initCommitteesTabs();
    initExpandToggle('jury-toggle', 'jury-full', 'committees', 'Vezi tot juriul (22 membri) ↓', 'Restrânge juriul ↑');
    initExpandToggle('org-toggle', 'org-full', 'committees', 'Vezi tot comitetul ↓', 'Restrânge comitetul ↑');
    initExpandToggle('testimonials-toggle', 'testimonials-full', 'testimonials', 'Vezi toate testimonialele ↓', 'Restrânge ↑');
  });

  window.addEventListener('load', initThreeSceneOnLoad);
})();
