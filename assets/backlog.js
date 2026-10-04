(() => {
  const list = document.querySelector('[data-backlog-list]');
  const message = document.querySelector('[data-backlog-message]');
  if (!list || !message) return;

  try {
    const backlog = window.portfolioBacklog;
    if (!backlog || !Array.isArray(backlog.games)) throw new Error('Backlog data is unavailable.');
    const fragment = document.createDocumentFragment();

    backlog.games.forEach((game) => {
      const platform = backlog.consoles?.[game.console];
      if (!platform || typeof game.title !== 'string' || !game.title.trim()) {
        throw new Error('Invalid backlog entry.');
      }

      const item = document.createElement('li');
      item.className = 'backlog-game';
      const badge = document.createElement('span');
      badge.className = 'console-mark';
      badge.setAttribute('aria-hidden', 'true');
      const icon = document.createElement('img');
      icon.src = platform.icon;
      icon.alt = '';
      icon.width = 28;
      icon.height = 28;
      badge.append(icon);

      const info = document.createElement('div');
      info.className = 'backlog-info';
      const title = document.createElement('h3');
      title.textContent = game.title;
      const metadata = document.createElement('p');
      metadata.className = 'backlog-metadata';
      metadata.textContent = [platform.name, game.year, game.genre].filter(Boolean).join(' · ');
      info.append(title, metadata);

      for (const field of ['description', 'note']) {
        if (!game[field]) continue;
        const text = document.createElement('p');
        text.className = `backlog-${field}`;
        text.textContent = game[field];
        info.append(text);
      }
      item.append(badge, info);
      fragment.append(item);
    });

    list.replaceChildren(fragment);
    list.hidden = backlog.games.length === 0;
    message.hidden = backlog.games.length > 0;
    message.textContent = 'No games on the list yet.';
  } catch (error) {
    list.hidden = true;
    message.hidden = false;
    message.textContent = 'The backlog could not be loaded. Please try refreshing the page.';
    console.error('Unable to display backlog:', error);
  }
})();
