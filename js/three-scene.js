(function () {
  window.initThreeScene = function initThreeScene() {
    if (window.__threeSceneInitialized) return true;

    const canvas = document.getElementById('three-canvas');
    const hero = document.getElementById('home');
    if (!canvas || !hero) return false;

    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    window.__threeSceneInitialized = true;

    const isMobile = window.innerWidth < 768;
    const stars = [];
    const trail = [];
    let startTime = null;
    let lastCanvasOpacity = 1;
    let lastTrailEmission = 0;
    const TRAIL_CONFIG = {
      emissionChance: 0.4,
      engineOffset: 50,
      jitter: 8,
      intervalMs: 48
    };

    function resize() {
      canvas.width = hero.clientWidth || window.innerWidth;
      canvas.height = hero.clientHeight || window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < (isMobile ? 300 : 600); i += 1) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.8 + 0.2
      });
    }

    function drawSky() {
      const W = canvas.width;
      const H = canvas.height;
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, '#05080F');
      skyGrad.addColorStop(0.5, '#080C18');
      skyGrad.addColorStop(1, '#0D1428');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);
    }

    function drawStars(t) {
      const W = canvas.width;
      const H = canvas.height;

      stars.forEach((star) => {
        const twinkle = 0.5 + 0.5 * Math.sin(t * 2 + star.x * 100);
        ctx.beginPath();
        ctx.arc(star.x * W, star.y * H * 0.75, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 245, 220, ${star.opacity * twinkle})`;
        ctx.fill();
      });
    }

    function drawBiplane(x, y, scale, angle, bankAngle, propellerAngle) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.scale(scale, scale);
      ctx.scale(1, 1 - Math.abs(bankAngle) * 0.3);

      const WOOD = '#C8B89A';
      const WOOD_ACCENT = '#8B6914';
      const CANVAS_COLOR = '#D4C9A8';
      const METAL = '#3A3A3A';
      const WIRE = 'rgba(138, 122, 106, 0.7)';

      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(40, 0);
      ctx.lineTo(32, -7);
      ctx.lineTo(-50, -4);
      ctx.lineTo(-55, 0);
      ctx.lineTo(-50, 4);
      ctx.lineTo(32, 7);
      ctx.closePath();
      const fuselageGrad = ctx.createLinearGradient(40, -7, 40, 7);
      fuselageGrad.addColorStop(0, '#E0D4B8');
      fuselageGrad.addColorStop(0.5, WOOD);
      fuselageGrad.addColorStop(1, '#B0A08A');
      ctx.fillStyle = fuselageGrad;
      ctx.strokeStyle = '#8A7A6A';
      ctx.lineWidth = 0.8;
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.rect(-15, -22, 80, 10);
      ctx.fillStyle = CANVAS_COLOR;
      ctx.strokeStyle = '#A09080';
      ctx.lineWidth = 0.8;
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-15, -22);
      ctx.lineTo(-45, -18);
      ctx.lineTo(-45, -12);
      ctx.lineTo(-15, -12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(65, -22);
      ctx.lineTo(90, -18);
      ctx.lineTo(90, -12);
      ctx.lineTo(65, -12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.rect(-10, 8, 70, 9);
      ctx.fillStyle = CANVAS_COLOR;
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-10, 8);
      ctx.lineTo(-36, 11);
      ctx.lineTo(-36, 17);
      ctx.lineTo(-10, 17);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(60, 8);
      ctx.lineTo(80, 11);
      ctx.lineTo(80, 17);
      ctx.lineTo(60, 17);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = WOOD_ACCENT;
      ctx.lineWidth = 1.5;
      [[-5, 20], [10, 35], [25, 50], [40, 65]].forEach(([topX, bottomX]) => {
        ctx.beginPath();
        ctx.moveTo(topX, -12);
        ctx.lineTo(bottomX - 10, 8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(topX + 6, -12);
        ctx.lineTo(bottomX - 4, 8);
        ctx.stroke();
      });

      ctx.strokeStyle = WIRE;
      ctx.lineWidth = 0.6;
      [[-5, 10], [10, 25], [25, 40]].forEach(([x1, x2]) => {
        ctx.beginPath();
        ctx.moveTo(x1, -12);
        ctx.lineTo(x2 - 4, 8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x1 + 6, -12);
        ctx.lineTo(x2 - 14, 8);
        ctx.stroke();
      });

      ctx.beginPath();
      ctx.ellipse(38, 0, 12, 9, 0, 0, Math.PI * 2);
      ctx.fillStyle = METAL;
      ctx.fill();
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1;
      ctx.stroke();

      for (let i = -3; i <= 3; i += 1) {
        ctx.beginPath();
        ctx.arc(38, 0, 10, -Math.PI / 2, Math.PI / 2);
        ctx.strokeStyle = 'rgba(80,80,80,0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(50, 0);
      ctx.rotate(propellerAngle);
      ctx.beginPath();
      ctx.ellipse(0, -14, 4, 14, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = WOOD_ACCENT;
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 14, 4, 14, -0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#9B7A24';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#5A4020';
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.rect(-60, -2, 18, 5);
      ctx.fillStyle = CANVAS_COLOR;
      ctx.strokeStyle = '#A09080';
      ctx.lineWidth = 0.8;
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-60, -2);
      ctx.lineTo(-72, -8);
      ctx.lineTo(-72, 3);
      ctx.lineTo(-60, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-55, -2);
      ctx.lineTo(-72, -18);
      ctx.lineTo(-75, -18);
      ctx.lineTo(-58, -2);
      ctx.closePath();
      ctx.fillStyle = CANVAS_COLOR;
      ctx.fill();
      ctx.stroke();

      [-20, 5].forEach((wheelX) => {
        ctx.beginPath();
        ctx.moveTo(wheelX, 7);
        ctx.lineTo(wheelX - 3, 22);
        ctx.strokeStyle = WOOD_ACCENT;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(wheelX - 3, 24, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#1A1A1A';
        ctx.fill();
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(wheelX - 3, 24, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#666';
        ctx.fill();
      });

      ctx.beginPath();
      ctx.moveTo(-23, 24);
      ctx.lineTo(2, 24);
      ctx.strokeStyle = WOOD_ACCENT;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    }

    function emitTrail(x, y, dirX, dirY, now) {
      if (now - lastTrailEmission < TRAIL_CONFIG.intervalMs) return;
      if (Math.random() < TRAIL_CONFIG.emissionChance) {
        lastTrailEmission = now;
        trail.push({
          x: x + dirX * TRAIL_CONFIG.engineOffset + (Math.random() - 0.5) * TRAIL_CONFIG.jitter,
          y: y + dirY * TRAIL_CONFIG.engineOffset + (Math.random() - 0.5) * TRAIL_CONFIG.jitter,
          life: 1,
          r: Math.random() * 3 + 1
        });
      }
    }

    function drawTrail() {
      for (let i = trail.length - 1; i >= 0; i -= 1) {
        const particle = trail[i];
        particle.life -= 0.02;
        particle.x += (Math.random() - 0.5) * 0.3;
        particle.y -= 0.2;

        if (particle.life <= 0) {
          trail.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.r * particle.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${particle.life * 0.4})`;
        ctx.fill();
      }
    }

    function animate(now) {
      if (!startTime) startTime = now;
      const t = (now - startTime) / 1000;
      const W = canvas.width;
      const H = canvas.height;

      drawSky();
      drawStars(t);
      drawTrail();

      const cx = W * 0.5;
      const cy = H * 0.42;
      const rx = W * 0.32;
      const ry = H * 0.18;
      const speed = 0.35;
      const planeX = cx + rx * Math.sin(t * speed);
      const planeY = cy + ry * Math.sin(t * speed * 2) * 0.5;
      const dx = rx * speed * Math.cos(t * speed);
      const dy = ry * speed * Math.cos(t * speed * 2);
      const angle = Math.atan2(dy, dx);
      const bankAngle = -Math.cos(t * speed) * 0.25;
      const scale = isMobile ? 0.55 : 0.85;

      emitTrail(planeX, planeY, Math.cos(angle), Math.sin(angle), now);
      drawBiplane(planeX, planeY, scale, angle, bankAngle, now * 0.03);

      const heroHeight = hero.offsetHeight || window.innerHeight;
      const fadeProgress = Math.min(Math.max((window.scrollY - heroHeight * 0.5) / (heroHeight * 0.5), 0), 1);
      const nextCanvasOpacity = 1 - fadeProgress;
      if (Math.abs(nextCanvasOpacity - lastCanvasOpacity) > 0.01) {
        lastCanvasOpacity = nextCanvasOpacity;
        canvas.style.opacity = nextCanvasOpacity;
      }

      window.requestAnimationFrame(animate);
    }

    window.requestAnimationFrame(animate);
    return true;
  };
}());
