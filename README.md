# Sajiero — Next.js storefront

A responsive Next.js recreation of [sajiero.com](https://www.sajiero.com/), using the original oversized PJ banner, branding, product data and photography.

## Run locally

Requires Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:3000. On Windows PowerShell, use `npm.cmd` if execution policy prevents `npm` from running.

```sh
npm run build
npm start
```

## Included

- Desktop and mobile homepage, original responsive hero slideshow, product tabs, category tiles, partner logos, promises, awards, FAQs and footer.
- Public catalog snapshot: **1,390 products, 115 collections and 30 journal articles**.
- Original menu labels and URL slugs, all 12 public information-page routes, and verified redirects for retired article links.
- Collection filtering by size, stock and price, sorting and pagination.
- Product detail layout with large galleries, rounded size/color selectors, a fixed purchase button, image zoom, quantity controls and related products. The Cherry Blossom product also includes its original size chart and product video.
- Predictive search and a complete search results page.
- Cart drawer and shopping bag page, with browser-local persistence.
- Customer voice slider immediately after Featured Categories, with 19 original photo reviews, ratings, verified-buyer badges, arrows, autoplay, keyboard navigation and mobile swiping.
- Checkout preview with form validation and a locally saved preview reference.
- About, contact, FAQ, policy, affiliate, journal, bra size calculator and period calendar pages.
- Keyboard-accessible dialogs, reduced-motion support and responsive layouts.

## Store connections

This project is a **frontend storefront with a local checkout preview**. It does not connect to the original store’s private Shopify API.

- Login does not authenticate an account.
- Checkout does not charge money, send orders, reserve stock or calculate live shipping.
- Newsletter email addresses are saved only on the current device.
- The contact form prepares an email for the visitor to send using their email app.
- Inventory, prices, policies and articles are downloaded snapshots, not live feeds.
- Imported measurement charts appear in the size guide; designs without an imported chart direct visitors to support for exact measurements.

For production, connect an authorized store API or a separate commerce backend for accounts, orders, payments, shipping, inventory and email subscriptions. Do not submit real payment information in the preview.

## Source structure

| Path | Purpose |
| --- | --- |
| `app/` | Next.js App Router pages, loading states, metadata and global styles |
| `components/` | Store provider, navigation, cart, product views, forms and homepage sections |
| `lib/catalog.ts` | Server-only catalog access and collection lookup |
| `lib/types.ts` | Shared product/cart types and price formatting |
| `data/` | Downloaded catalog, collection membership, homepage, pages and journal snapshots |
| `public/images/` | Original homepage and featured-product photography stored locally |
| `public/fonts/` | Original Inter font files |
| `scripts/sync-reference.mjs` | Repeatable public reference import |
| `scripts/sync-reference-routes.mjs` | Refresh original route names and menu links while preserving existing products and image edits |
| `data/reference-routes.json` | Original menu, page names and public catalog URLs used for link checks |
| `data/reference-redirects.json` | Verified original redirects and unavailable legacy URLs |
| `data/product-details.json` | Public variant identifiers and available product-specific size chart/video assets |

The homepage and its featured products use local assets. Remaining catalog photography loads from the original public Shopify CDN.

## Refresh the public snapshot

Run from the project root with network access:

```sh
node scripts/sync-reference.mjs
```

Refresh the public customer-review snapshot and its local photos separately:

```sh
node scripts/sync-reviews.mjs --refresh
```

The importer caches source responses in the ignored `.reference/` directory to make interrupted downloads resumable. Existing cache files are reused; remove the specific cached response you intend to refresh before importing again. Catalog text is sanitized before it is stored as rendered HTML.

To refresh page names, menu links and missing catalog routes without replacing existing product records or local images:

```sh
npm run sync:routes -- --refresh
```

Menu labels keep the original spelling and capitalization. Page paths retain the original `/pages/`, `/policies/`, `/collections/` and `/products/` slugs. The local sign-in screen also accepts the original `/customer_authentication/redirect` path. The journal currently contains the 30 imported articles; older archive articles have not been imported.

## Validation

- Production build: `npm run build`.
- Original route names and internal links: `npm run check:links`. With the dev server running, use `npm run check:links -- --http` to check page responses and original redirect destinations.
- TypeScript: checked by the production build.
- Browser smoke checks verified desktop and mobile layouts, predictive search, product size selection, cart quantity updates and persistence, category filters, checkout preview, Buy it now, and supporting routes.
- Browser screenshots from this implementation are in the ignored `artifacts/` directory.
