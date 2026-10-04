(() => {
  const collections = window.portfolioCollections;
  let summaryNodes = document.querySelectorAll('[data-collection-summary]');
  const page = document.querySelector('[data-collection-page]');
  const statusNames = { owned: 'Owned', missing: 'Missing', unrecorded: 'Not logged' };
  const tagIcons = {
    region: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c4 5 4 13 0 18-4-5-4-13 0-18Z',
    'complete-set': 'M8 2h14v14M5 5h14v14M2 8h14v14H2z',
    custom: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z'
  };

  function prepareCollection(collection) {
    if (!['complete-set', 'custom'].includes(collection?.type)) {
      throw new Error('Unknown collection type.');
    }
    if (!Array.isArray(collection.titles) || (collection.type === 'complete-set' && !collection.titles.length)) {
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
    return { ...collection, counts, games, percentage: titles.size ? Math.round(owned.size / titles.size * 1000) / 10 : 0 };
  }

  function createSummary(collection) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.className = 'collection-link';
    link.href = `collections/${collection.key}/`;
    link.dataset.collectionSummary = collection.key;
    const badge = document.createElement('span');
    badge.className = 'console-mark';
    badge.setAttribute('aria-hidden', 'true');
    const icon = document.createElement('img');
    icon.src = collection.icon;
    icon.width = 28;
    icon.height = 28;
    icon.alt = '';
    badge.append(icon);
    const info = document.createElement('div');
    info.className = 'collection-info';
    const title = document.createElement('h3');
    title.id = `${collection.key}-collection-title`;
    title.textContent = collection.name;
    link.setAttribute('aria-labelledby', title.id);
    const arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    title.append(arrow);
    const tags = document.createElement('div');
    tags.className = 'collection-tags';
    tags.dataset.collectionTags = '';
    const progress = document.createElement('progress');
    progress.dataset.collectionProgress = '';
    progress.setAttribute('aria-label', `${collection.name} owned games logged`);
    info.append(title, tags, progress);
    const percentage = document.createElement('span');
    percentage.className = 'collection-percentage';
    percentage.dataset.collectionPercentage = '';
    link.append(badge, info, percentage);
    item.append(link);
    return item;
  }

  function createTag(label, pathData, tooltip, element = 'span') {
    const tag = document.createElement(element);
    tag.className = 'collection-tag';
    tag.title = tooltip;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    svg.append(path);
    tag.append(svg, document.createTextNode(label));
    return tag;
  }

  function setupCollectionFilters(list, prepared) {
    const bar = list.parentElement.querySelector('[data-collection-filters]');
    if (!bar) return;
    const entries = [...prepared.values()];
    const active = { region: new Set(), type: new Set() };
    const empty = list.parentElement.querySelector('[data-collection-empty]');
    const status = list.parentElement.querySelector('[data-collection-filter-status]');
    const all = document.createElement('button');
    all.type = 'button';
    all.className = 'collection-tag collection-filter';
    all.textContent = 'All';
    all.setAttribute('aria-pressed', 'true');
    bar.replaceChildren(all);
    const buttons = [];

    function applyFilters() {
      let visible = 0;
      [...list.children].forEach((item, index) => {
        const collection = entries[index];
        const matches = [...active.region].every((region) => collection.region === region) &&
          [...active.type].every((type) => collection.type === type);
        item.hidden = !matches;
        if (matches) visible++;
      });
      buttons.forEach(({ button, kind, value }) => button.setAttribute('aria-pressed', String(active[kind].has(value))));
      all.setAttribute('aria-pressed', String(!active.region.size && !active.type.size));
      list.hidden = visible === 0;
      empty.hidden = visible > 0;
      empty.textContent = entries.length ? 'No collections match these filters.' : 'No collections yet.';
      status.textContent = `Showing ${visible} of ${entries.length} collections.`;
    }

    function addFilter(kind, value, label, path) {
      const button = createTag(label, path, `Filter by ${kind}: ${label}`, 'button');
      button.type = 'button';
      button.classList.add('collection-filter');
      button.dataset.filterKind = kind;
      button.dataset.filterValue = value;
      button.addEventListener('click', () => {
        if (active[kind].has(value)) active[kind].delete(value);
        else active[kind].add(value);
        applyFilters();
      });
      buttons.push({ button, kind, value });
      bar.append(button);
    }

    [...new Set(entries.map((collection) => collection.region).filter(Boolean))].forEach((region) => {
      addFilter('region', region, region, tagIcons.region);
    });
    ['complete-set', 'custom'].forEach((type) => {
      if (entries.some((collection) => collection.type === type)) {
        addFilter('type', type, type === 'complete-set' ? 'Complete set' : 'Custom', tagIcons[type]);
      }
    });
    all.addEventListener('click', () => {
      active.region.clear();
      active.type.clear();
      applyFilters();
    });
    bar.hidden = entries.length === 0;
    applyFilters();
  }

  try {
    if (!Array.isArray(collections)) throw new Error('Collection data is unavailable.');
    const prepared = new Map(collections.map((collection) => [collection.key, prepareCollection(collection)]));
    document.querySelectorAll('[data-collection-list]').forEach((list) => {
      const items = [...prepared.values()].map((collection) => {
        const existing = [...summaryNodes].find((node) => node.dataset.collectionSummary === collection.key);
        return existing ? existing.parentElement : createSummary(collection);
      });
      list.replaceChildren(...items);
      list.hidden = items.length === 0;
      list.parentElement.querySelector('[data-collection-empty]').hidden = items.length > 0;
      setupCollectionFilters(list, prepared);
    });
    summaryNodes = document.querySelectorAll('[data-collection-summary]');
    summaryNodes.forEach((node) => {
      const collection = prepared.get(node.dataset.collectionSummary);
      if (!collection) throw new Error('Unknown collection.');
      const tags = node.querySelector('[data-collection-tags]');
      if (tags) {
        const pills = [];
        if (collection.region) pills.push(createTag(collection.region, tagIcons.region, `Region: ${collection.region}`));
        pills.push(collection.type === 'complete-set'
          ? createTag('Complete set', tagIcons['complete-set'], 'Complete release set')
          : createTag('Custom', tagIcons.custom, 'Personal selection of games'));
        tags.replaceChildren(...pills);
      }
      node.querySelector('[data-collection-percentage]').textContent = collection.counts.all ? `${collection.percentage}%` : '—';
      const count = node.querySelector('[data-collection-count]');
      if (count) count.textContent = collection.counts.all ? `${collection.counts.owned} of ${collection.counts.all} owned games logged` : 'No games added yet.';
      const progress = node.querySelector('[data-collection-progress]');
      progress.max = collection.counts.all || 1;
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
    const references = collection.sources || [];
    sources.hidden = references.length === 0;
    sources.previousElementSibling.hidden = references.length === 0;
    references.forEach((source) => {
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
    if (!collection.counts.all) {
      empty.querySelector('p').textContent = 'No games added to this collection yet.';
      empty.querySelector('.reset-filters').hidden = true;
    }
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
    page.querySelector('.collection-controls').hidden = collection.counts.all === 0;
    results.hidden = collection.counts.all === 0;
    render();
  } catch (error) {
    summaryNodes.forEach((node) => {
      node.querySelector('[data-collection-percentage]').textContent = '—';
      const count = node.querySelector('[data-collection-count]');
      if (count) count.textContent = 'Collection progress is unavailable.';
      node.querySelector('[data-collection-progress]').removeAttribute('value');
    });
    if (page) page.querySelector('[data-collection-results]').textContent = 'The checklist could not be loaded. Please try refreshing the page.';
    console.error('Unable to display collection:', error);
  }
})();
