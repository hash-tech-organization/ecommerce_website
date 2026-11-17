import 'server-only';
import rawProducts from '@/data/products.json';
import rawCollections from '@/data/collections.json';
import home from '@/data/home.json';
import type { Product, ProductCardData } from './types';

export const products = rawProducts as Product[];
export const productMap = new Map(products.map(p => [p.handle, p]));
export function cardData(p: Product): ProductCardData {
  return { id: p.id, handle: p.handle, title: p.title, images: p.images.slice(0, 2), variants: p.variants, options: p.options };
}
const collectionMap = new Map(rawCollections.map(c => [c.handle, c]));
export const collectionNames = new Map(home.nav.map(c => [c.href.split('/').pop()!, c.title.replace(/^All /, '')]));
collectionNames.set('all', 'All Products');
const rules: Record<string, RegExp> = {
  'women-panties-underwear-pakistan': /panty|panties|underwear|brief|thong|boyshort/i,
  'bra-panty-sets': /bra set|bra and panty|garter|bra panty|bra & panty/i,
  'body-shapers-women-pakistan': /shaper|shapewear|waist trainer|belly wrap/i,
  'sexy-night-dresses-pakistan': /lingerie|nightgown|nighty|bodysuit|robe|babydoll|cami set/i,
  'bodystocking-lingerie-pakistan': /stocking/i,
  'sajiero-tops': /camisole|tank top|t-shirt|t shirt|bralette/i,
  'trousers-and-shorts-for-women-pakistan': /trouser|shorts/i,
  'sajiero-accessories-premium-quality': /scrunchie|nipple|tape|gift/i,
  'fusion-clothing': /fusion|co-ord|kurta|tunic|lounge set/i,
  'bras-in-pakistan': /bra(?! set| and panty| panty)|bralette/i,
};
export function getCollection(handle: string) {
  const collection = collectionMap.get(handle);
  const title = collectionNames.get(handle) || collection?.title || handle.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  if (handle === 'all') return { title, products };
  if (collection) return { title, products: collection.handles.map(h => productMap.get(h)).filter((p): p is Product => !!p) };
  const rule = rules[handle];
  const words = handle.replace(/sajiero|women|womens|for|pakistan|online|new|arrival|arrivals|and|in|the|s|all/g, ' ').split(/[-\s]+/).filter(w => w.length > 2);
  const found = products.filter(p => {
    const text = `${p.title} ${p.type} ${p.tags.join(' ')}`;
    return rule ? rule.test(text) : words.some(w => text.toLowerCase().includes(w.replace(/s$/, '')));
  });
  return { title, products: found };
}
export function homeTabs(kind: 'bestselling' | 'new_arrivals') {
  return home.tabs[kind].map(tab => ({
    ...tab,
    count: getCollection(tab.href!.split('/').pop()!).products.length,
    products: tab.handles.map(h => productMap.get(h)).filter((p): p is Product => !!p).map(p => {
      const reference = tab.cards.find(card => card.handle === p.handle);
      return { ...cardData(p), images: reference ? [reference.image] : p.images.slice(0, 1), isNew: reference?.isNew };
    }),
  }));
}
