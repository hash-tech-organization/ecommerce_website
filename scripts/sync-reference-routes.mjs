import fs from 'node:fs/promises';

const origin = 'https://www.sajiero.com';
const cacheDirectory = '.reference/routes';
await fs.mkdir(cacheDirectory, { recursive: true });

async function request(path, cacheName) {
  const file = `${cacheDirectory}/${cacheName}`;
  if (!process.argv.includes('--refresh')) {
    try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { /* Fetch an uncached response. */ }
  }
  const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  const result = path.includes('.json') ? await response.json() : await response.text();
  await fs.writeFile(file, JSON.stringify(result));
  return result;
}

function decode(value) {
  return value.replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ');
}

function text(value) {
  return decode(value.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

function localHref(href) {
  const url = new URL(decode(href), origin);
  return ['sajiero.com', 'www.sajiero.com'].includes(url.hostname) ? url.pathname + url.search + url.hash : url.href;
}

function sanitize(content) {
  return content.replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<(script|style|svg|form|noscript|iframe)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?([a-z][a-z0-9-]*)\b([^>]*)>/gi, (full, name, attributes) => {
      const tag = name.toLowerCase() === 'h1' ? 'h2' : name.toLowerCase();
      if (!['p', 'h2', 'h3', 'h4', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'br', 'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'blockquote'].includes(tag)) return '';
      if (full.startsWith('</')) return `</${tag}>`;
      if (tag !== 'a') return `<${tag}>`;
      const raw = attributes.match(/href\s*=\s*["']([^"']+)["']/i)?.[1] || '#';
      let href = '#';
      try {
        const url = new URL(decode(raw), origin);
        if (['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol)) href = localHref(raw);
      } catch { /* Ignore malformed links. */ }
      return `<a href="${href.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">`;
    }).replace(/\s+/g, ' ').trim();
}

function normalizeProduct(product) {
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: text(product.body_html || ''),
    type: product.product_type,
    tags: Array.isArray(product.tags) ? product.tags : String(product.tags || '').split(', '),
    images: product.images.slice(0, 6).map(image => {
      const url = new URL(image.src);
      url.searchParams.set('width', '1100');
      return url.href;
    }),
    options: product.options.map(option => ({ name: option.name, values: option.values })),
    variants: product.variants.map(variant => ({
      id: variant.id,
      title: variant.title,
      price: Number(variant.price),
      compareAt: Number(variant.compare_at_price || 0),
      available: variant.available ?? true,
      options: [variant.option1, variant.option2, variant.option3].filter(Boolean),
    })),
  };
}

const [html, collectionResponse, pageResponse, sitemap, existingProducts, existingCollections, existingPages] = await Promise.all([
  request('/', 'home.json'),
  request('/collections.json?limit=250', 'collections.json'),
  request('/pages.json?limit=250', 'pages.json'),
  request('/sitemap.xml', 'sitemap.json'),
  fs.readFile('data/products.json', 'utf8').then(JSON.parse),
  fs.readFile('data/collections.json', 'utf8').then(JSON.parse),
  fs.readFile('data/pages.json', 'utf8').then(JSON.parse),
]);

const header = html.slice(html.indexOf('<header'), html.indexOf('</header>') + 9);
const starts = [...header.matchAll(/<li\b[^>]*class="[^"]*\bsj-nav__item\b[^"]*"[^>]*>/g)];
const navigation = [];
for (let index = 0; index < starts.length; index++) {
  const item = header.slice(starts[index].index, starts[index + 1]?.index);
  const title = text(item.match(/<span\b[^>]*class="[^"]*\bsj-nav__label\b[^"]*"[^>]*>([\s\S]*?)<\/span>/)?.[1] || '');
  const anchors = [...item.matchAll(/<a\b([^>]*?)href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/g)];
  const children = anchors.filter(match => /sj-nav__row--(?:child|grandchild)/.test(match[1] + match[3])).map(match => ({ title: text(match[4]), href: localHref(match[2]) }));
  const href = children[0]?.href || (anchors[0] && localHref(anchors[0][2]));
  if (title && href && !navigation.some(link => link.title === title)) navigation.push({ title, href, children });
}
if (navigation.length !== 16) throw new Error(`Expected 16 original navigation groups, found ${navigation.length}`);

const products = new Map(existingProducts.map(product => [product.handle, product]));
const collectionMap = new Map(existingCollections.map(collection => [collection.handle, collection]));
let cursor = 0;
const originalCollections = collectionResponse.collections;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < originalCollections.length) {
    const original = originalCollections[cursor++];
    const existing = collectionMap.get(original.handle);
    if (existing) {
      collectionMap.set(original.handle, { ...existing, title: original.title });
      continue;
    }
    const handles = [];
    if (original.handle !== 'all') {
      for (let page = 1; ; page++) {
        const result = await request(`/collections/${original.handle}/products.json?limit=250&page=${page}`, `collection-${original.handle}-${page}.json`);
        for (const product of result.products) {
          handles.push(product.handle);
          if (!products.has(product.handle)) products.set(product.handle, normalizeProduct(product));
        }
        if (result.products.length < 250) break;
      }
    }
    collectionMap.set(original.handle, { handle: original.handle, title: original.title, handles: [...new Set(handles)] });
  }
}));

const productSitemaps = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => decode(match[1])).filter(url => /sitemap_products_/.test(url));
const originalProductPaths = [];
for (const url of productSitemaps) {
  const xml = await request(url, new URL(url).pathname.split('/').pop() + '.json');
  for (const match of xml.matchAll(/<url>\s*<loc>(.*?)<\/loc>/g)) {
    const path = new URL(decode(match[1])).pathname;
    if (path.startsWith('/products/')) originalProductPaths.push(path);
  }
}
const missingProducts = originalProductPaths.filter(path => !products.has(path.split('/').pop()));
cursor = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < missingProducts.length) {
    const path = missingProducts[cursor++];
    const { product } = await request(`${path}.json`, `product-${path.split('/').pop()}.json`);
    if (!products.has(product.handle)) products.set(product.handle, normalizeProduct(product));
  }
}));

const pageMap = new Map(existingPages.map(page => [page.route, page]));
for (const original of pageResponse.pages) {
  const route = `/pages/${original.handle}`;
  pageMap.set(route, { route, title: original.title, html: pageMap.get(route)?.html || sanitize(original.body_html || '') });
}

const homepageLinks = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
  .map(match => ({ href: localHref(match[1]), title: text(match[2]) }))
  .filter(link => link.href.startsWith('/') && !link.href.startsWith('//'));
const reference = {
  source: origin,
  navigation,
  homepageLinks: [...new Map(homepageLinks.map(link => [link.href, link])).values()],
  collections: originalCollections.map(({ handle, title }) => ({ handle, title })),
  pages: pageResponse.pages.map(({ handle, title }) => ({ route: `/pages/${handle}`, title })),
  products: originalProductPaths,
};

// Keep verified original redirects for retired links appearing in imported articles.
const posts = JSON.parse(await fs.readFile('data/blogs.json', 'utf8'));
const knownPaths = new Set([
  '/', '/collections', '/cart', '/checkout', '/search', '/blogs/news',
  '/account/login', '/customer_authentication/redirect', '/pages/contact',
  ...[...products.keys()].map(handle => `/products/${handle}`),
  ...[...collectionMap.keys()].map(handle => `/collections/${handle}`),
  ...pageMap.keys(), ...posts.map(post => `/blogs/news/${post.slug}`),
]);
const legacyPaths = new Set();
for (const post of posts) {
  for (const match of post.html.matchAll(/href=["']([^"']+)["']/g)) {
    const url = new URL(decode(match[1]), origin);
    if (['sajiero.com', 'www.sajiero.com'].includes(url.hostname) && /^\/(products|collections)\//.test(url.pathname) && !knownPaths.has(url.pathname)) legacyPaths.add(url.pathname);
  }
}
const redirects = [];
const notFound = [];
for (const path of legacyPaths) {
  const cacheFile = `${cacheDirectory}/legacy-${path.replaceAll('/', '_')}.json`;
  let result;
  if (!process.argv.includes('--refresh')) {
    try { result = JSON.parse(await fs.readFile(cacheFile, 'utf8')); } catch { /* Check the original response headers. */ }
  }
  if (!result) {
    const response = await fetch(new URL(path, origin), { redirect: 'manual', signal: AbortSignal.timeout(30000) });
    result = { status: response.status, location: response.headers.get('location') };
    await response.body?.cancel();
    if (result.status !== 404 && ![301, 302, 303, 307, 308].includes(result.status)) throw new Error(`Unable to verify legacy route ${path}: HTTP ${result.status}`);
    await fs.writeFile(cacheFile, JSON.stringify(result));
  }
  if (result.status === 404) {
    notFound.push(path);
    continue;
  }
  const destination = localHref(result.location);
  if (!knownPaths.has(new URL(destination, origin).pathname)) throw new Error(`Unknown redirect destination for ${path}: ${destination}`);
  redirects.push({ source: path, destination, statusCode: result.status });
}

await Promise.all([
  fs.writeFile('data/reference-routes.json', JSON.stringify(reference, null, 2) + '\n'),
  fs.writeFile('data/reference-redirects.json', JSON.stringify({ redirects, notFound }, null, 2) + '\n'),
  fs.writeFile('data/products.json', JSON.stringify([...products.values()])),
  fs.writeFile('data/collections.json', JSON.stringify([...collectionMap.values()])),
  fs.writeFile('data/pages.json', JSON.stringify([...pageMap.values()])),
]);
console.log(JSON.stringify({ navigationGroups: navigation.length, collections: collectionMap.size, pages: pageMap.size, originalProducts: originalProductPaths.length, addedProducts: products.size - existingProducts.length, redirects: redirects.length, originalNotFound: notFound.length }));
