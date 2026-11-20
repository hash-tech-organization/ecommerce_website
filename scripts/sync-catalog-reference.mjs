import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const origin = 'https://www.sajiero.com';
const cache = '.reference/parity-catalog';
await fs.mkdir(cache, { recursive: true });
const decode = value => value.replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ');
const text = value => decode(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
async function request(path, file) {
  const saved = `${cache}/${file}`;
  try { return JSON.parse(await fs.readFile(saved, 'utf8')); } catch {}
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(45000) });
      if (response.status === 429) { await response.body?.cancel(); await new Promise(r => setTimeout(r, Math.max(5000, Number(response.headers.get('retry-after') || 0) * 1000, 5000 * (attempt + 1)))); continue; }
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${path}`);
      const value = await response.json();
      await fs.writeFile(saved, JSON.stringify(value));
      await new Promise(r => setTimeout(r, 650));
      return value;
    } catch (error) { if (attempt === 7) throw error; await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); }
  }
  throw new Error(`Reference rate limit persisted: ${path}`);
}
const original = JSON.parse(await fs.readFile('data/products.json', 'utf8'));
const collections = JSON.parse(await fs.readFile('data/collections.json', 'utf8'));
const products = new Map();
const normalize = p => ({
  id: p.id, handle: p.handle, title: p.title, description: text(p.body_html || ''), type: p.product_type,
  tags: Array.isArray(p.tags) ? p.tags : String(p.tags || '').split(', '), createdAt: p.created_at, active: true,
  imageAspectRatio: p.images[0]?.width && p.images[0]?.height ? p.images[0].width / p.images[0].height : .75,
  images: p.images.slice(0, 6).map(image => { const url = new URL(image.src); url.searchParams.set('width', '1100'); return url.href; }),
  options: p.options.map(o => ({ name: o.name, values: o.values })),
  variants: p.variants.map(v => ({ id: v.id, title: v.title, price: Number(v.price), compareAt: Number(v.compare_at_price || 0), available: v.available ?? true, options: [v.option1, v.option2, v.option3].filter(Boolean) })),
});
for (let page = 1; ; page++) {
  const { products: batch } = await request(`/products.json?limit=250&page=${page}`, `products-${page}.json`);
  for (const p of batch) products.set(p.handle, normalize(p));
  console.log('Catalog page', page, batch.length);
  if (batch.length < 250) break;
}
let cursor = 0;
await Promise.all(Array.from({ length: 1 }, async () => {
  while (cursor < collections.length) {
    const collection = collections[cursor++];
    if (collection.handle === 'all') { collection.handles = [...collection.handles.filter(handle => products.has(handle)), ...[...products.keys()].filter(handle => !collection.handles.includes(handle))]; continue; }
    const handles = [];
    for (let page = 1; ; page++) {
      const { products: batch } = await request(`/collections/${collection.handle}/products.json?limit=250&page=${page}`, `${collection.handle}-${page}.json`);
      for (const p of batch) { handles.push(p.handle); products.set(p.handle, normalize(p)); }
      if (batch.length < 250) break;
    }
    collection.handles = [...new Set(handles)];
    console.log('Collection', collection.handle, collection.handles.length);
  }
}));
// Retain previously imported product routes even if the live store has retired them.
for (const p of original) if (!products.has(p.handle)) products.set(p.handle, { ...p, active: collections.find(collection => collection.handle === 'all')?.handles.includes(p.handle) || false });
const home = JSON.parse(await fs.readFile('data/home.json', 'utf8'));
const html = await fs.readFile('.reference/parity-source/home.html', 'utf8');
for (const kind of ['bestselling', 'new_arrivals']) {
  const start = html.indexOf(`__${kind}`);
  const section = html.slice(start, html.indexOf('</section>', start) + 10);
  const panels = [...section.matchAll(/<div\b[^>]*\brole="tabpanel"[^>]*>/g)];
  const labels = [...section.matchAll(/<button\b[^>]*\brole="tab"[^>]*>([\s\S]*?)<\/button>/g)].map(m => text(m[1]));
  if (panels.length !== home.tabs[kind].length) throw new Error(`Unexpected ${kind} tab count ${panels.length}`);
  home.tabs[kind] = panels.map((m, index) => {
    const panel = section.slice(m.index, panels[index + 1]?.index);
    const cards = [...panel.matchAll(/<product-card\b[\s\S]*?<\/product-card>/g)].slice(0, 5).map(match => ({
      handle: match[0].match(/href="\/products\/([^"?]+)/)[1],
      image: 'https:' + decode(match[0].match(/<img[^>]+src="([^"]+)/)[1]),
      isNew: /sj-badge--neutral[^>]*>New</.test(match[0]),
    }));
    if (cards.some(card => !products.has(card.handle))) throw new Error('Missing home product');
    const previous = home.tabs[kind][index];
    return { ...previous, title: labels[index], handles: cards.map(card => card.handle), cards };
  });
}
// Download the visible home and first collection-page images, plus the product gallery.
const visible = new Set(home.tabs.bestselling.flatMap(tab => tab.handles).concat(home.tabs.new_arrivals.flatMap(tab => tab.handles)));
for (const handle of ['new-arrivals', 'womens-activewear-pakistan', 'women-panties-underwear-pakistan', 'sexy-night-dresses-pakistan', 'sajiero-accessories-premium-quality', 'bra-panty-sets', 'sajiero-tops', 'trousers-and-shorts-for-women-pakistan', 'bodystocking-lingerie-pakistan']) {
  collections.find(c => c.handle === handle)?.handles.slice(0, 24).forEach(h => visible.add(h));
}
const downloads = new Map();
function asset(raw) {
  const url = new URL(raw); const ext = url.pathname.match(/\.[a-z0-9]+$/i)?.[0] || '.jpg';
  const file = `/images/catalog/${crypto.createHash('sha1').update(url.origin + url.pathname + (url.searchParams.get('v') || '')).digest('hex').slice(0, 16)}${ext}`;
  downloads.set(file, url.href); return file;
}
await fs.mkdir('public/images/catalog', { recursive: true });
for (const handle of visible) { const p = products.get(handle); if (p) p.images = p.images.map((image, i) => i < 2 ? asset(image) : image); }
const cherry = products.get('linen-pajama-suit-cherry-blossom');
if (cherry) cherry.images = cherry.images.map(image => image.startsWith('http') ? asset(image) : image);
for (const kind of Object.keys(home.tabs)) for (const tab of home.tabs[kind]) for (const card of tab.cards) card.image = asset(card.image);
const jobs = [...downloads]; cursor = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (cursor < jobs.length) {
    const [file, url] = jobs[cursor++];
    try { await fs.access('public' + file); continue; } catch {}
    const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
    if (!response.ok) throw new Error(`Image HTTP ${response.status}: ${url}`);
    await fs.writeFile('public' + file, Buffer.from(await response.arrayBuffer()));
  }
}));
await fs.writeFile('data/products.json', JSON.stringify([...products.values()]));
await fs.writeFile('data/collections.json', JSON.stringify(collections));
await fs.writeFile('data/home.json', JSON.stringify(home, null, 2) + '\n');
console.log('Updated', products.size, 'products,', collections.length, 'collections,', jobs.length, 'images');
