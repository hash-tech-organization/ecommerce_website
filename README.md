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
- Public catalog snapshot: **1,339 products, 92 collections and 30 journal articles**.
- Collection filtering by size, stock and price, sorting and pagination.
- Product galleries, image zoom, available variants, quantity controls and related products.
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
- Exact garment measurement charts are not exposed in the catalog feed; the size guide directs visitors to support.

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

## Validation

- Production build: `npm run build`.
- TypeScript: checked by the production build.
- Browser smoke checks verified desktop and mobile layouts, predictive search, product size selection, cart quantity updates and persistence, category filters, checkout preview, Buy it now, and supporting routes.
- Browser screenshots from this implementation are in the ignored `artifacts/` directory.
