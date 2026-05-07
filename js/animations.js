(function () {
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

  function animateCounters() {
    const stats = document.querySelectorAll('[data-counter]');
    if (!stats.length) return;

    const playCounter = (node) => {
      const target = Number(node.getAttribute('data-counter') || '0');
      const duration = 1.7;
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
    if (!title || title.dataset.splitDone === 'true') return null;
    const words = title.textContent.trim().split(/\s+/).filter(Boolean);
    title.textContent = '';
    const spans = words.map((word) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = `${word} `;
      title.appendChild(span);
      return span;
    });
    title.dataset.splitDone = 'true';
    return spans;
  }

  window.initAnimations = function initAnimations() {
    const skyOverlay = document.querySelector('.sky-overlay');
    const heroWords = splitHeroTitle() || Array.from(document.querySelectorAll('.hero-title .word'));

    animateCounters();

    if (!(window.gsap && window.ScrollTrigger)) {
      if (skyOverlay) {
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        window.addEventListener('scroll', () => {
          const progress = Math.min(window.scrollY / maxScroll, 1);
          let topColor;
          let bottomColor;
          if (progress <= 0.3) {
            const p = progress / 0.3;
            topColor = lerpColor('#080b1c', '#1a1a3e', p);
            bottomColor = lerpColor('#101a3f', '#23275e', p);
          } else if (progress <= 0.6) {
            const p = (progress - 0.3) / 0.3;
            topColor = lerpColor('#1a1a3e', '#e8572a', p);
            bottomColor = lerpColor('#23275e', '#f4a300', p);
          } else {
            const p = (progress - 0.6) / 0.4;
            topColor = lerpColor('#87ceeb', '#4da3ff', p);
            bottomColor = lerpColor('#b7e2ff', '#9bd5ff', p);
          }
          skyOverlay.style.background = `linear-gradient(180deg, ${topColor} 0%, ${bottomColor} 100%)`;
        }, { passive: true });
      }
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const progress = self.progress;
        let topColor;
        let bottomColor;

        if (progress <= 0.3) {
          const p = progress / 0.3;
          topColor = lerpColor('#080b1c', '#1a1a3e', p);
          bottomColor = lerpColor('#101a3f', '#23275e', p);
        } else if (progress <= 0.6) {
          const p = (progress - 0.3) / 0.3;
          topColor = lerpColor('#1a1a3e', '#e8572a', p);
          bottomColor = lerpColor('#23275e', '#f4a300', p);
        } else {
          const p = (progress - 0.6) / 0.4;
          topColor = lerpColor('#87ceeb', '#4da3ff', p);
          bottomColor = lerpColor('#b7e2ff', '#9bd5ff', p);
        }

        if (skyOverlay) {
          skyOverlay.style.background = `linear-gradient(180deg, ${topColor} 0%, ${bottomColor} 100%)`;
        }
      }
    });

    if (heroWords.length) {
      gsap.from(heroWords, {
        y: 80,
        opacity: 0,
        rotateX: -50,
        duration: 1,
        ease: 'power4.out',
        stagger: 0.08,
        delay: 0.15
      });
    }

    const overline = document.querySelector('.hero-overline');
    if (overline && !overline.dataset.typewriterDone) {
      const text = overline.textContent;
      overline.textContent = '';
      let index = 0;
      const writer = window.setInterval(() => {
        overline.textContent += text[index] || '';
        index += 1;
        if (index >= text.length) {
          window.clearInterval(writer);
        }
      }, 40);
      overline.dataset.typewriterDone = 'true';
    }

    gsap.from('.hero .btn', {
      opacity: 0,
      y: 26,
      stagger: 0.15,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.75
    });

    gsap.utils.toArray('.section').forEach((section) => {
      gsap.fromTo(section,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 82%',
            toggleClass: { targets: section, className: 'visible' }
          }
        }
      );
    });

    gsap.from('.card, .timeline-item, .hologram, .guide li', {
      opacity: 0,
      y: 50,
      stagger: 0.06,
      duration: 0.85,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: 'main',
        start: 'top 78%'
      }
    });

    gsap.to('.cloud', {
      xPercent: 28,
      yPercent: -8,
      ease: 'none',
      stagger: 0.12,
      scrollTrigger: {
        trigger: '#home',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    gsap.to('.hologram', {
      boxShadow: '0 0 40px rgba(244,163,0,0.55), 0 0 90px rgba(244,163,0,0.22), inset 0 0 36px rgba(244,163,0,0.12)',
      repeat: -1,
      yoyo: true,
      duration: 1.8,
      stagger: 0.1,
      ease: 'sine.inOut'
    });
  };
})();
