import 'server-only';
import { notFound } from 'next/navigation';
import rawProducts from '@/data/products.json';
import rawCollections from '@/data/collections.json';
import home from '@/data/home.json';
import type { Product, ProductCardData } from './types';
import { brandText } from './brand';

const allProducts: Product[] = rawProducts.map(product => ({ ...product, title: brandText(product.title), description: brandText(product.description) }));
export const products = allProducts.filter(product => product.active !== false);
export const productMap = new Map(allProducts.map(p => [p.handle, p]));
export function cardData(p: Product): ProductCardData {
  return { id: p.id, handle: p.handle, title: p.title, images: p.images, variants: p.variants, options: p.options };
}
const collectionMap = new Map(rawCollections.map(c => [c.handle, c]));
export const collectionNames = new Map(rawCollections.map(collection => [collection.handle, brandText(collection.title)]));
export function getCollection(handle: string) {
  const collection = collectionMap.get(handle);
  if (!collection) notFound();
  const title = brandText(collection.title);
  return { title, products: collection.handles.map(h => productMap.get(h)).filter((p): p is Product => !!p) };
}
export function homeTabs(kind: 'bestselling' | 'new_arrivals') {
  return home.tabs[kind].map(tab => ({
    ...tab,
    count: getCollection(tab.href!.split('/').pop()!).products.length,
    products: tab.handles.map(h => productMap.get(h)).filter((p): p is Product => !!p).map(p => {
      const reference = tab.cards.find(card => card.handle === p.handle);
      return { ...cardData(p), images: reference ? [reference.image, ...p.images.slice(1)] : p.images, isNew: reference?.isNew };
    }),
  }));
}
