(() => {
  const collections = window.portfolioCollections;
  const summaryNodes = document.querySelectorAll('[data-collection-summary]');
  const page = document.querySelector('[data-collection-page]');
  const statusNames = { owned: 'Owned', missing: 'Missing', unrecorded: 'Not logged' };

  function prepareCollection(collection) {
    if (!collection || !Array.isArray(collection.titles) || !collection.titles.length) {
      throw new Error('Collection catalogue is missing.');
    }
    const titles = new Set(collection.titles);
    const owned = new Set(collection.owned);
    const missing = new Set(collection.missing);
    if (titles.size !== collection.titles.length || owned.size !== collection.owned.length || missing.size !== collection.missing.length) {
      throw new Error('Duplicate collection entries.');
    }
    for (const title of [...owned, ...missing]) {
      if (!titles.has(title) || (owned.has(title) && missing.has(title))) {
        throw new Error('Invalid ownership entry.');
      }
    }
    const counts = { all: titles.size, owned: owned.size, missing: missing.size, unrecorded: titles.size - owned.size - missing.size };
    const games = collection.titles.map((title) => ({ title, status: owned.has(title) ? 'owned' : missing.has(title) ? 'missing' : 'unrecorded' }));
    games.sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base', numeric: true }));
    return { ...collection, counts, games, percentage: Math.round(owned.size / titles.size * 1000) / 10 };
  }

  try {
    if (!Array.isArray(collections)) throw new Error('Collection data is unavailable.');
    const prepared = new Map(collections.map((collection) => [collection.key, prepareCollection(collection)]));
    summaryNodes.forEach((node) => {
      const collection = prepared.get(node.dataset.collectionSummary);
      if (!collection) throw new Error('Unknown collection.');
      node.querySelector('[data-collection-percentage]').textContent = `${collection.percentage}%`;
      node.querySelector('[data-collection-count]').textContent = `${collection.counts.owned} of ${collection.counts.all} owned games logged`;
      const progress = node.querySelector('[data-collection-progress]');
      progress.max = collection.counts.all;
      progress.value = collection.counts.owned;
    });

    if (!page) return;
    const collection = prepared.get(page.dataset.collectionPage);
    if (!collection) throw new Error('Unknown collection.');
    page.querySelectorAll('[data-collection-stat]').forEach((node) => {
      node.textContent = collection.counts[node.dataset.collectionStat];
    });
    page.querySelector('[data-collection-scope]').textContent = collection.scope;
    const sources = page.querySelector('[data-collection-sources]');
    collection.sources.forEach((source) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = source.url;
      link.textContent = source.name;
      item.append(link);
      sources.append(item);
    });

    const list = page.querySelector('[data-game-list]');
    const search = page.querySelector('#game-search');
    const filters = page.querySelectorAll('[data-collection-filter]');
    const results = page.querySelector('[data-collection-results]');
    const empty = page.querySelector('.collection-empty');
    let activeFilter = 'all';
    const normalize = (value) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

    function render() {
      const query = normalize(search.value.trim());
      const games = collection.games.filter((game) => (activeFilter === 'all' || game.status === activeFilter) && normalize(game.title).includes(query));
      const fragment = document.createDocumentFragment();
      games.forEach((game) => {
        const item = document.createElement('li');
        item.className = 'game-row';
        const title = document.createElement('span');
        title.className = 'game-title';
        title.textContent = game.title;
        const status = document.createElement('span');
        status.className = `game-status game-status-${game.status}`;
        status.textContent = statusNames[game.status];
        item.append(title, status);
        fragment.append(item);
      });
      list.replaceChildren(fragment);
      results.textContent = `Showing ${games.length} of ${collection.counts.all} games`;
      empty.hidden = games.length > 0;
      filters.forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.collectionFilter === activeFilter));
      });
    }

    filters.forEach((button) => {
      button.querySelector('.filter-count').textContent = collection.counts[button.dataset.collectionFilter];
      button.addEventListener('click', () => { activeFilter = button.dataset.collectionFilter; render(); });
    });
    search.addEventListener('input', render);
    page.querySelector('.reset-filters').addEventListener('click', () => {
      search.value = '';
      activeFilter = 'all';
      render();
      search.focus();
    });
    page.querySelector('.collection-controls').hidden = false;
    render();
  } catch (error) {
    summaryNodes.forEach((node) => {
      node.querySelector('[data-collection-percentage]').textContent = '—';
      node.querySelector('[data-collection-count]').textContent = 'Collection progress is unavailable.';
      node.querySelector('[data-collection-progress]').removeAttribute('value');
    });
    if (page) page.querySelector('[data-collection-results]').textContent = 'The checklist could not be loaded. Please try refreshing the page.';
    console.error('Unable to display collection:', error);
  }
})();
