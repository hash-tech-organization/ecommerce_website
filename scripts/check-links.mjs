import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const read = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const [reference, legacy, home, products, collections, pages, posts] = await Promise.all([
  'data/reference-routes.json', 'data/reference-redirects.json', 'data/home.json',
  'data/products.json', 'data/collections.json', 'data/pages.json', 'data/blogs.json',
].map(read));
const origin = reference.source;
const known = new Set([
  '/', '/collections', '/cart', '/checkout', '/search', '/account/login',
  '/customer_authentication/redirect', '/pages/contact', '/blogs/news',
  ...products.map(product => `/products/${product.handle}`),
  ...collections.map(collection => `/collections/${collection.handle}`),
  ...pages.map(page => page.route), ...posts.map(post => `/blogs/news/${post.slug}`),
]);
const redirects = new Map(legacy.redirects.map(redirect => [redirect.source, redirect]));
const originalNotFound = new Set(legacy.notFound);
const checked = new Set();

function localPath(href) {
  const url = new URL(href.replace(/&amp;/g, '&'), origin);
  return ['sajiero.com', 'www.sajiero.com'].includes(url.hostname) ? url.pathname : undefined;
}

function check(href, source) {
  const path = localPath(href);
  if (!path) return;
  assert(known.has(path) || redirects.has(path) || originalNotFound.has(path), `${source}: no local route for ${href}`);
  checked.add(path);
}

for (const file of [
  'app/collections/[handle]/page.tsx', 'app/products/[handle]/page.tsx',
  'app/pages/[slug]/page.tsx', 'app/policies/[slug]/page.tsx',
  'app/blogs/news/page.tsx', 'app/blogs/news/[slug]/page.tsx',
  'app/customer_authentication/redirect/page.tsx',
]) await fs.access(file);

assert.equal(new Set(products.map(product => product.handle)).size, products.length, 'Duplicate product slugs');
assert.equal(new Set(collections.map(collection => collection.handle)).size, collections.length, 'Duplicate collection slugs');
const collectionMap = new Map(collections.map(collection => [collection.handle, collection]));
const pageMap = new Map(pages.map(page => [page.route, page]));
for (const original of reference.collections) {
  assert.equal(collectionMap.get(original.handle)?.title, original.title, `Original collection title: ${original.handle}`);
  check(`/collections/${original.handle}`, 'Original collection');
}
for (const original of reference.pages) {
  assert.equal(pageMap.get(original.route)?.title, original.title, `Original page title: ${original.route}`);
  check(original.route, 'Original page');
}
for (const path of reference.products) check(path, 'Original product sitemap');
for (const group of reference.navigation) {
  check(group.href, group.title);
  for (const child of group.children) check(child.href, `${group.title}: ${child.title}`);
}
for (const link of reference.homepageLinks) check(link.href, 'Original homepage');
for (const redirect of legacy.redirects) {
  assert(known.has(localPath(redirect.destination)), `Invalid redirect destination: ${redirect.source}`);
  assert.notEqual(redirect.source, redirect.destination, 'Redirect loop');
}

function checkData(value, source) {
  if (Array.isArray(value)) for (const item of value) checkData(item, source);
  else if (value && typeof value === 'object') {
    for (const [key, content] of Object.entries(value)) {
      if (key === 'href') check(content, source);
      else if (key === 'html') {
        for (const match of content.matchAll(/href=["']([^"']+)["']/g)) check(match[1], source);
      } else checkData(content, source);
    }
  }
}
checkData(home, 'Homepage data');
checkData(pages, 'Page content');
checkData(posts, 'Article content');

async function checkSource(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = `${directory}/${entry.name}`;
    if (entry.isDirectory()) await checkSource(file);
    else if (/\.tsx?$/.test(entry.name)) {
      const source = await fs.readFile(file, 'utf8');
      for (const match of source.matchAll(/href\s*(?:=|:)\s*["']([^"']+)["']/g)) check(match[1], file);
    }
  }
}
await checkSource('app');
await checkSource('components');

const report = {
  originalCollections: reference.collections.length,
  originalPages: reference.pages.length,
  originalProductUrls: reference.products.length,
  navigationGroups: reference.navigation.length,
  importedArticles: posts.length,
  legacyRedirects: redirects.size,
  verifiedOriginal404s: [...originalNotFound],
  checkedPaths: checked.size,
};

if (process.argv.includes('--http')) {
  const localOrigin = process.env.LOCAL_SITE_URL || 'http://localhost:3000';
  const negativePaths = new Set([...originalNotFound, '/collections/not-a-real-collection', '/products/not-a-real-product', '/pages/not-a-real-page']);
  const paths = new Set([
    ...reference.homepageLinks.map(link => localPath(link.href)),
    ...collections.map(collection => `/collections/${collection.handle}`),
    ...pages.map(page => page.route), ...posts.map(post => `/blogs/news/${post.slug}`),
    ...legacy.redirects.map(redirect => redirect.source), ...negativePaths,
    '/collections', '/cart', '/checkout', '/search?q=bras', '/account/login',
  ].filter(Boolean));
  const queue = [...paths];
  const results = [];
  let cursor = 0;
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (cursor < queue.length) {
      const path = queue[cursor++];
      const response = await fetch(new URL(path, localOrigin), { redirect: 'manual', signal: AbortSignal.timeout(60000) });
      if (redirects.has(path)) {
        const expected = redirects.get(path);
        assert.equal(response.status, expected.statusCode, `Redirect status: ${path}`);
        assert.equal(new URL(response.headers.get('location'), localOrigin).pathname, expected.destination, `Redirect destination: ${path}`);
        await response.body?.cancel();
      } else {
        const html = await response.text();
        const mains = [...html.matchAll(/<main\b[^>]*id="main-content"[^>]*>([\s\S]*?)<\/main>/g)].map(match => match[1]);
        const isNotFound = response.status === 404 || mains.some(main => main.includes('This page has wandered off.')) || html.includes('NEXT_HTTP_ERROR_FALLBACK;404');
        if (negativePaths.has(path)) assert(isNotFound, `Expected missing page: ${path}`);
        else {
          assert.equal(response.status, 200, `Page response: ${path}`);
          assert(!isNotFound, `Unexpected missing page: ${path}`);
          assert(!html.includes('id="__next_error__"'), `Runtime error: ${path}`);
          assert(html.includes('id="main-content"'), `Missing page content: ${path}`);
          assert(/<h1\b/.test(html), `Page did not finish rendering: ${path}`);
        }
      }
      results.push({ path, status: response.status });
    }
  }));
  report.httpChecks = results.length;
  report.httpResults = results.sort((a, b) => a.path.localeCompare(b.path));
}

await fs.mkdir('artifacts', { recursive: true });
await fs.writeFile('artifacts/link-audit.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, httpResults: undefined }, null, 2));
