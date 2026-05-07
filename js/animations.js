(function () {
  const skyStops = [
    { progress: 0.0, color: '#05080F' },
    { progress: 0.15, color: '#080C18' },
    { progress: 0.30, color: '#0D1428' },
    { progress: 0.45, color: '#1A1A3A' },
    { progress: 0.60, color: '#2A1A35' },
    { progress: 0.75, color: '#1A2A4A' },
    { progress: 0.90, color: '#1A3060' },
    { progress: 1.0, color: '#0A1E3D' }
  ];

  function lerpColor(hexA, hexB, t) {
    const from = hexA.replace('#', '');
    const to = hexB.replace('#', '');
    const ar = parseInt(from.slice(0, 2), 16);
    const ag = parseInt(from.slice(2, 4), 16);
    const ab = parseInt(from.slice(4, 6), 16);
    const br = parseInt(to.slice(0, 2), 16);
    const bg = parseInt(to.slice(2, 4), 16);
    const bb = parseInt(to.slice(4, 6), 16);
    const rr = Math.round(ar + (br - ar) * t);
    const rg = Math.round(ag + (bg - ag) * t);
    const rb = Math.round(ab + (bb - ab) * t);
    return `rgb(${rr}, ${rg}, ${rb})`;
  }

  function getSkyColor(progress) {
    if (progress <= 0) return skyStops[0].color;
    if (progress >= 1) return skyStops[skyStops.length - 1].color;

    for (let i = 0; i < skyStops.length - 1; i += 1) {
      const current = skyStops[i];
      const next = skyStops[i + 1];
      if (progress >= current.progress && progress <= next.progress) {
        const range = next.progress - current.progress || 1;
        const local = (progress - current.progress) / range;
        return lerpColor(current.color, next.color, local);
      }
    }

    return skyStops[skyStops.length - 1].color;
  }

  function animateCounters() {
    const stats = document.querySelectorAll('[data-counter]');
    if (!stats.length) return;

    const playCounter = (node) => {
      const target = Number(node.getAttribute('data-counter') || '0');
      const duration = 2.4;
      let start;
      const tick = (time) => {
        if (!start) start = time;
        const elapsed = (time - start) / 1000;
        const progress = Math.min(elapsed / duration, 1);
        node.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (window.gsap && window.ScrollTrigger) {
      stats.forEach((stat) => {
        ScrollTrigger.create({
          trigger: stat,
          start: 'top 85%',
          once: true,
          onEnter: () => playCounter(stat)
        });
      });
      return;
    }

    const observer = new IntersectionObserver((entries, localObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        playCounter(entry.target);
        localObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    stats.forEach((stat) => observer.observe(stat));
  }

  function splitHeroTitle() {
    const title = document.querySelector('.hero-title');
    if (!title || title.dataset.splitDone === 'true') return [];
    if (title.querySelector('.hero-title-line1, .hero-title-line2')) {
      title.dataset.splitDone = 'true';
      return [];
    }
    const words = title.textContent.trim().split(/\s+/).filter(Boolean);
    title.textContent = '';

    const spans = words.map((word) => {
      const span = document.createElement('span');
      span.className = 'hero-word';
      span.textContent = `${word} `;
      title.appendChild(span);
      return span;
    });

    title.dataset.splitDone = 'true';
    return spans;
  }

  function initSkyFallback(skyOverlay) {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    window.addEventListener('scroll', () => {
      const progress = Math.min(window.scrollY / maxScroll, 1);
      const sky = getSkyColor(progress);
      skyOverlay.style.background = `linear-gradient(180deg, ${sky} 0%, ${sky} 100%)`;
    }, { passive: true });
  }

  window.initAnimations = function initAnimations() {
    const skyOverlay = document.querySelector('.sky-overlay');
    const heroWords = splitHeroTitle();
    animateCounters();

    if (!skyOverlay) return;

    if (!(window.gsap && window.ScrollTrigger)) {
      initSkyFallback(skyOverlay);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const sky = getSkyColor(self.progress);
        skyOverlay.style.background = `linear-gradient(180deg, ${sky} 0%, ${sky} 100%)`;
      }
    });

    if (heroWords.length) {
      gsap.from('.hero-word', {
        opacity: 0,
        y: 30,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power2.out',
        delay: 0.5
      });
    }

    gsap.from('.hero .btn', {
      opacity: 0,
      y: 20,
      stagger: 0.14,
      duration: 1,
      ease: 'power1.out',
      delay: 1
    });

    gsap.utils.toArray('.section').forEach((section) => {
      gsap.fromTo(section,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 82%',
            toggleClass: { targets: section, className: 'visible' }
          }
        }
      );
    });

    gsap.from('.card', {
      scrollTrigger: { trigger: '.cards-3, .cards-4', start: 'top 80%' },
      opacity: 0,
      y: 20,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power1.out'
    });

    gsap.from('.section h2', {
      opacity: 0,
      x: -20,
      duration: 0.9,
      ease: 'power1.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: 'main',
        start: 'top 84%'
      }
    });
  };
})();
