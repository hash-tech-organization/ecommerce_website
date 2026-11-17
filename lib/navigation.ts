import home from '@/data/home.json';
export type NavLink = { title: string; href: string };
const link = (title: string, handle: string): NavLink => ({ title, href: `/collections/${handle}` });
export const navigation = [
  { ...link('New Arrivals 🔥', 'new-arrivals'), children: home.nav.filter(n => /new-arrival/.test(n.href) && !n.href.endsWith('/new-arrivals')).map(n => ({ ...n, title: n.title.replace('New Arrivals', '').trim() || n.title })) },
  { ...link('Winter Collection ❄️', 'winter-collection-sajiero'), children: [link('Plush Fleece PJ Sets', 'fleece-night-suits'), link('Lounge Sets & Tracksuits', 'winter-lounge-sets-and-tracksuits'), link('Trousers', 'winter-trousers')] },
  { ...link('Clearance 🚨', 'sajiero-clearance-items'), children: [] },
  { ...link('PJ Sets', 'women-pajama-sets-nightwear-pakistan'), children: [link('New Arrivals', 'pj-sets-new-arrivals'), ...home.nav.filter(n => /linen-pajama|crinkled-cotton|soft-cotton-pjs|cotton-pajama|silk-nightdress|sleeveless-pajama|half-sleeves|full-sleeves|oversized|winter-pj/.test(n.href))] },
  { ...link('Bras', 'bras-in-pakistan'), children: home.nav.filter(n => /bra-bundles|cotton-bras|lace-bras|silicone-bra|lycra|dry-fit|bridal-bra|party-bra|daily-wear|seamless-bras|underwired|strapless|pushup|teen-bras|t-shirt-bra|front-open|bralette|sports-bra|maternity|padded-bras|single-padded/.test(n.href)) },
  { ...link('Panties', 'women-panties-underwear-pakistan'), children: home.nav.filter(n => /panty-bundles|cotton-underwear|net-panties|spandex|high-waisted|briefs-panties|thong-panties|boyshorts|bikni|hipster/.test(n.href)) },
  { ...link('Bra Panty Sets', 'bra-panty-sets'), children: home.nav.filter(n => /padded-bra-sets|garter-sets/.test(n.href)) },
  { ...link('Body Shapers', 'body-shapers-women-pakistan'), children: home.nav.filter(n => /full-body-shaper|half-body-shaper|waist-slimming/.test(n.href)) },
  { ...link('Lingerie', 'sexy-night-dresses-pakistan'), children: home.nav.filter(n => /nighty-dress|body-suits|inner-slips|cami-sets/.test(n.href)) },
  { ...link('Stockings', 'bodystocking-lingerie-pakistan'), children: home.nav.filter(n => /full-bodystocking|half-bodystocking|leg-stocking/.test(n.href)) },
  { ...link('Tops', 'sajiero-tops'), children: home.nav.filter(n => /t-shirts-for|camisole-in|tank-tops/.test(n.href)) },
  { ...link('Bottoms', 'trousers-and-shorts-for-women-pakistan'), children: home.nav.filter(n => /trouser-bundles|printed-trousers|winter-trousers|shorts-bundles/.test(n.href)) },
  { ...link('Summer Loungewear', 'summer-loungewear'), children: [] },
  { ...link('Accessories', 'sajiero-accessories-premium-quality'), children: home.nav.filter(n => /silicone-nipple|scrunchies/.test(n.href)) },
  { ...link('Fusion', 'fusion-clothing'), children: [] },
  { ...link('Active wear', 'womens-activewear-pakistan'), children: [] },
];
