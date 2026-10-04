const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const context = { window: {} };
vm.runInNewContext(fs.readFileSync('assets/data/collections.js', 'utf8'), context);
const collections = context.window.portfolioCollections;
assert.ok(Array.isArray(collections) && collections.length, 'No collections found.');
const keys = new Set();
for (const collection of collections) {
  assert.ok(typeof collection.key === 'string' && !keys.has(collection.key), 'Invalid or duplicate collection key.');
  keys.add(collection.key);
  assert.ok(/^[a-z0-9-]+$/.test(collection.key), 'Unsafe collection key.');
  assert.ok(['complete-set', 'custom'].includes(collection.type), 'Invalid collection type.');
  if (collection.region !== undefined) assert.ok(typeof collection.region === 'string' && collection.region.trim(), 'Invalid collection region.');
  assert.ok(typeof collection.icon === 'string' && /^assets\/logos\/[a-z0-9-]+\.svg$/.test(collection.icon), 'Invalid collection icon path.');
  assert.ok(fs.existsSync(collection.icon), `Missing icon for ${collection.key}.`);
  assert.ok(fs.existsSync(`collections/${collection.key}/index.html`), `Missing page for ${collection.key}.`);
  assert.ok(Array.isArray(collection.titles), 'Invalid catalogue.');
  if (collection.type === 'complete-set') assert.ok(collection.titles.length, 'Empty complete-set catalogue.');
  assert.ok(collection.titles.every((title) => typeof title === 'string' && title.trim()), 'Invalid title.');
  const titles = new Set(collection.titles);
  assert.equal(titles.size, collection.titles.length, 'Duplicate game titles.');
  for (const status of ['owned', 'missing']) {
    assert.ok(Array.isArray(collection[status]), `Invalid ${status} list.`);
    assert.equal(new Set(collection[status]).size, collection[status].length, `Duplicate ${status} entries.`);
    assert.ok(collection[status].every((title) => titles.has(title)), `Unknown title in ${status}.`);
  }
  assert.ok(collection.owned.every((title) => !collection.missing.includes(title)), 'A game cannot be both owned and missing.');
  assert.ok(typeof collection.scope === 'string' && collection.scope.length, 'Missing scope.');
  const sources = collection.sources || [];
  assert.ok(Array.isArray(sources), 'Invalid checklist references.');
  if (collection.type === 'complete-set') assert.ok(sources.length, 'Missing complete-set checklist references.');
  for (const source of sources) {
    assert.ok(source.name && new URL(source.url).protocol === 'https:', 'Invalid reference.');
  }
  console.log(`${collection.name}: ${titles.size} titles, ${collection.owned.length} owned, ${collection.missing.length} missing; data valid.`);
}
