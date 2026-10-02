const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const context = { window: {} };
vm.runInNewContext(fs.readFileSync('assets/data/backlog.js', 'utf8'), context);
const backlog = context.window.portfolioBacklog;
assert.ok(backlog && backlog.consoles && Array.isArray(backlog.games), 'Invalid backlog data.');
for (const [key, platform] of Object.entries(backlog.consoles)) {
  assert.ok(/^[a-z0-9-]+$/.test(key), 'Invalid console key.');
  assert.ok(typeof platform.name === 'string' && platform.name.trim(), 'Missing console name.');
  assert.ok(typeof platform.icon === 'string' && /^assets\/logos\/[a-z0-9-]+\.svg$/.test(platform.icon), 'Invalid console icon path.');
  assert.ok(fs.existsSync(platform.icon), `Missing console icon: ${platform.icon}.`);
}
const entries = new Set();
for (const game of backlog.games) {
  assert.ok(typeof game.title === 'string' && game.title.trim(), 'Missing game title.');
  assert.ok(Object.hasOwn(backlog.consoles, game.console), `Unknown console: ${game.console}.`);
  const key = `${game.console}:${game.title.trim().toLowerCase()}`;
  assert.ok(!entries.has(key), `Duplicate backlog entry: ${game.title}.`);
  entries.add(key);
  if (game.year !== undefined) assert.ok(Number.isInteger(game.year) && game.year >= 1970 && game.year <= 2100, 'Invalid release year.');
  for (const field of ['genre', 'description', 'note']) {
    if (game[field] !== undefined) assert.equal(typeof game[field], 'string', `Invalid ${field}.`);
  }
}
console.log(`Backlog: ${backlog.games.length} games; data and console icons valid.`);

// Exercise the renderer independently of the personal backlog's current contents.
class Element {
  constructor(tag) { this.tag = tag; this.children = []; this.hidden = false; this.attributes = {}; }
  append(...nodes) { this.children.push(...nodes.flatMap(node => node.tag === 'fragment' ? node.children : [node])); }
  replaceChildren(...nodes) { this.children = []; this.append(...nodes); }
  setAttribute(name, value) { this.attributes[name] = value; }
}
const renderer = fs.readFileSync('assets/backlog.js', 'utf8');
function render(data) {
  const list = new Element('ul');
  const message = new Element('p');
  const errors = [];
  const document = {
    querySelector: selector => selector === '[data-backlog-list]' ? list : message,
    createElement: tag => new Element(tag),
    createDocumentFragment: () => new Element('fragment')
  };
  vm.runInNewContext(renderer, { window: { portfolioBacklog: data }, document, console: { error: error => errors.push(error) } });
  return { list, message, errors };
}
const sample = {
  consoles: backlog.consoles,
  games: [
    { title: '<b>Game & title</b>', console: 'gamecube', year: 2002, genre: 'Adventure', description: 'A description.', note: 'A personal note.' },
    { title: 'Second game', console: 'n64' }
  ]
};
const filled = render(sample);
assert.equal(filled.errors.length, 0);
assert.equal(filled.list.hidden, false);
assert.equal(filled.message.hidden, true);
assert.equal(filled.list.children.length, 2);
const [badge, info] = filled.list.children[0].children;
assert.equal(badge.className, 'console-mark');
assert.equal(badge.children[0].src, 'assets/logos/gamecube.svg');
assert.equal(badge.attributes['aria-hidden'], 'true');
assert.equal(info.children[0].textContent, '<b>Game & title</b>');
assert.equal(info.children[1].textContent, 'GameCube · 2002 · Adventure');
assert.equal(info.children[2].textContent, 'A description.');
assert.equal(info.children[3].textContent, 'A personal note.');
assert.equal(filled.list.children[1].children[1].children.length, 2);
assert.equal(filled.list.children[1].children[1].children[1].textContent, 'Nintendo 64');
const empty = render({ consoles: backlog.consoles, games: [] });
assert.equal(empty.list.hidden, true);
assert.equal(empty.message.hidden, false);
assert.equal(empty.message.textContent, 'No games on the list yet.');
const allConsoles = render({ consoles: backlog.consoles, games: Object.keys(backlog.consoles).map(console => ({ title: 'Sample game', console })) });
assert.equal(allConsoles.errors.length, 0);
assert.equal(allConsoles.list.children.length, Object.keys(backlog.consoles).length);
Object.values(backlog.consoles).forEach((platform, index) => {
  const badge = allConsoles.list.children[index].children[0];
  assert.equal(badge.children[0].src, platform.icon);
  assert.equal(badge.className, 'console-mark');
});
for (const data of [undefined, { consoles: {}, games: [{ title: 'Unknown platform', console: 'unknown' }] }]) {
  const failed = render(data);
  assert.equal(failed.list.hidden, true);
  assert.equal(failed.message.hidden, false);
  assert.equal(failed.errors.length, 1);
}
console.log('Backlog rendering: metadata, notes, matching icons, literal text, empty list, and error fallback passed.');
