import { notFound } from 'next/navigation';
import { cardData, collectionNames, getCollection } from '@/lib/catalog';
import { CollectionView } from '@/components/collection';

export function generateStaticParams() { return [...collectionNames.keys()].map(handle => ({ handle })); }
export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) { const { handle } = await params; return { title: getCollection(handle).title }; }
export default async function CollectionPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  if (!collectionNames.has(handle)) notFound();
  const collection = getCollection(handle);
  return <CollectionView title={collection.title} products={collection.products.map(cardData)} />;
}
