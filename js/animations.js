(function () {
  window.initAnimations = function initAnimations() {
    const sections = document.querySelectorAll('.section');

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.2 }
    );

    sections.forEach((section) => revealObserver.observe(section));

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);

      gsap.to('.sky-overlay', {
        background: 'linear-gradient(180deg,#1a1f3a 0%,#e0723f 45%,#75b8ff 100%)',
        scrollTrigger: {
          trigger: '#home',
          start: 'top top',
          end: 'bottom center',
          scrub: true
        }
      });

      gsap.to('.sky-overlay', {
        background: 'linear-gradient(180deg,#3d86d8 0%,#7fc8ff 55%,#cfe9ff 100%)',
        scrollTrigger: {
          trigger: '#program',
          start: 'top 80%',
          end: '#contact bottom',
          scrub: true
        }
      });

      gsap.to('.cloud', {
        x: 120,
        scrollTrigger: {
          trigger: '#home',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    const stats = document.querySelectorAll('[data-counter]');
    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = Number(entry.target.getAttribute('data-counter') || '0');
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 45));
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          entry.target.textContent = String(current);
        }, 22);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    stats.forEach((stat) => statsObserver.observe(stat));
  };
})();
