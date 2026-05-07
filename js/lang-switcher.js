(function () {
  function getTranslation(pack, key) {
    if (pack && Object.prototype.hasOwnProperty.call(pack, key)) return pack[key];
    return key.split('.').reduce((acc, chunk) => (acc && chunk in acc ? acc[chunk] : undefined), pack);
  }

  window.applyLanguage = function applyLanguage(lang) {
    const pack = window.translations?.[lang] || window.translations?.ro;
    if (!pack) return;

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      const value = getTranslation(pack, key);
      if (typeof value === 'string') node.textContent = value;
    });

    const select = document.getElementById('language-select');
    if (select && select.value !== lang) select.value = lang;

    try {
      localStorage.setItem('tve-lang', lang);
    } catch (error) {
      console.warn('Unable to persist selected language.', error);
    }
  };

  window.initLanguageSwitcher = function initLanguageSwitcher() {
    const select = document.getElementById('language-select');
    if (!select) return;

    const saved = (() => {
      try {
        return localStorage.getItem('tve-lang');
      } catch (error) {
        console.warn('Unable to read persisted language.', error);
        return null;
      }
    })();

    const lang = saved || 'ro';
    window.applyLanguage(lang);

    select.addEventListener('change', (event) => {
      window.applyLanguage(event.target.value);
    });
  };
})();
