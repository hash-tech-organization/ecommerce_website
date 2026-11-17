import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cardData, productMap, products } from '@/lib/catalog';
import { ProductView } from '@/components/product';
import { ProductCard } from '@/components/featured-product-card';

export function generateStaticParams() { return products.slice(0, 12).map(p => ({ handle: p.handle })); }
export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) { const { handle } = await params; const p = productMap.get(handle); return { title: p?.title || 'Product', description: p?.description.slice(0, 155) }; }
export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params; const product = productMap.get(handle); if (!product) notFound();
  const related = products.filter(p => p.handle !== handle && p.type === product.type).slice(0, 4);
  return <main id="main-content" className="page-container product-page"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/collections/all">Shop</Link><span>/</span><span>{product.title}</span></nav><ProductView product={product} />{related.length > 0 && <section className="related-products home-section"><h2>You may also like</h2><div className="product-grid">{related.map(p => <ProductCard key={p.handle} product={cardData(p)} />)}</div></section>}</main>;
}
