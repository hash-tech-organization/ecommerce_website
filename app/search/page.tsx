import { Suspense } from 'react';
import { cardData, products } from '@/lib/catalog';
import { CollectionCatalogView } from '@/components/new-arrivals';
import { availableCollectionFilters, getCollectionFilterData } from '@/lib/collection-filters';
export const metadata = { title: 'Search' };
async function Results({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams; const words = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const result = words.length ? products.filter(p => words.every(w => `${p.title} ${p.type} ${p.tags.join(' ')}`.toLowerCase().includes(w))) : [];
  const cards = result.map(product => ({ ...cardData(product), ...getCollectionFilterData(product) }));
  return <CollectionCatalogView key={q} title="Search" products={cards} enabledFilters={availableCollectionFilters(cards)} searchQuery={q} />;
}
export default function SearchPage(props: { searchParams: Promise<{ q?: string }> }) { return <Suspense fallback={<main className="empty-state" id="main-content">Searching…</main>}><Results {...props} /></Suspense>; }
