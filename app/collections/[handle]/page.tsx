import { notFound } from 'next/navigation';
import { cardData, collectionNames, getCollection } from '@/lib/catalog';
import { CollectionCatalogView } from '@/components/new-arrivals';
import { getCollectionFilterData } from '@/lib/collection-filters';
import type { HeaderFilterKey } from '@/lib/collection-filters';
import headerFilters from '@/data/collection-header-filters.json';
import { PantiesCategoryNavigation } from '@/components/panties-category-navigation';
import { TopsCategoryNavigation } from '@/components/tops-category-navigation';
import { BottomsCategoryNavigation } from '@/components/bottoms-category-navigation';
import { StockingsCategoryNavigation } from '@/components/stockings-category-navigation';
import { BraSetsCategoryNavigation } from '@/components/bra-sets-category-navigation';
import { LingerieCategoryNavigation } from '@/components/lingerie-category-navigation';
import { AccessoriesCategoryNavigation } from '@/components/accessories-category-navigation';

const categoryHeaders = {
  'women-panties-underwear-pakistan': { className: 'all-panties-page', Navigation: PantiesCategoryNavigation, inlineFilters: true },
  'sajiero-tops': { className: 'all-tops-page', Navigation: TopsCategoryNavigation, inlineFilters: true },
  'trousers-and-shorts-for-women-pakistan': { className: 'all-bottoms-page', Navigation: BottomsCategoryNavigation, inlineFilters: true },
  'bodystocking-lingerie-pakistan': { className: 'all-stockings-page', Navigation: StockingsCategoryNavigation, inlineFilters: true },
  'bra-panty-sets': { className: 'all-bra-sets-page', Navigation: BraSetsCategoryNavigation, inlineFilters: true },
  'sexy-night-dresses-pakistan': { className: 'all-lingerie-page', Navigation: LingerieCategoryNavigation, inlineFilters: false },
  'sajiero-accessories-premium-quality': { className: 'all-accessories-page', Navigation: AccessoriesCategoryNavigation, inlineFilters: true },
};

export function generateStaticParams() { return [...collectionNames.keys()].map(handle => ({ handle })); }
export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) { const { handle } = await params; return { title: getCollection(handle).title }; }
export default async function CollectionPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  if (!collectionNames.has(handle)) notFound();
  const collection = getCollection(handle);
  const categoryHeader = categoryHeaders[handle as keyof typeof categoryHeaders];
  const HeaderNavigation = categoryHeader?.Navigation;
  return <CollectionCatalogView
    key={handle}
    title={collection.title}
    products={collection.products.map(product => ({ ...cardData(product), ...getCollectionFilterData(product) }))}
    enabledFilters={headerFilters[handle as keyof typeof headerFilters] as HeaderFilterKey[]}
    className={categoryHeader?.className}
    headerContent={HeaderNavigation ? <HeaderNavigation /> : undefined}
    inlineFilters
    defaultAvailability="in stock"
  />;
}
