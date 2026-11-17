import { Suspense } from 'react';
import { cardData, products } from '@/lib/catalog';
import { CollectionView } from '@/components/collection';
export const metadata = { title: 'Search' };
async function Results({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams; const words = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const result = words.length ? products.filter(p => words.every(w => `${p.title} ${p.type} ${p.tags.join(' ')}`.toLowerCase().includes(w))) : [];
  return <CollectionView key={q} title="Search" products={result.map(cardData)} searchQuery={q} />;
}
export default function SearchPage(props: { searchParams: Promise<{ q?: string }> }) { return <Suspense fallback={<main className="empty-state" id="main-content">Searching…</main>}><Results {...props} /></Suspense>; }
