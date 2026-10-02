(() => {
  const button = document.querySelector('.theme-toggle');
  if (button) {
    const updateLabel = () => {
      const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      button.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
      button.title = `Switch to ${nextTheme} theme`;
    };
    updateLabel();
    button.hidden = false;
    button.addEventListener('click', () => {
      const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = theme;
      try {
        localStorage.setItem('portfolio-theme', theme);
      } catch {
        // The switch still works when storage is unavailable.
      }
      updateLabel();
    });
  }

  document.querySelectorAll('[data-year]').forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
})();
