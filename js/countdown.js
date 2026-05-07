(function () {
  function updateCountdown() {
    const target = new Date('2026-10-09T00:00:00+03:00').getTime();
    const now = Date.now();
    const diff = Math.max(target - now, 0);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const set = (id, value, pad = 2) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(value).padStart(pad, '0');
    };

    set('days', days, 3);
    set('hours', hours);
    set('minutes', minutes);
    set('seconds', seconds);
  }

  window.initCountdown = function initCountdown() {
    updateCountdown();
    window.setInterval(updateCountdown, 1000);
  };
})();
