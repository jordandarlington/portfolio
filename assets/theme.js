// Apply a saved preference before the page paints. Storage can be unavailable.
(() => {
  let theme;
  try {
    theme = localStorage.getItem('portfolio-theme');
  } catch {
    // Fall back to the operating system preference.
  }
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = theme;
})();
