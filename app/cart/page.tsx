import { CartContents } from '@/components/store';
import Link from 'next/link';
import { ProductCard } from '@/components/featured-product-card';
import { cardData, getCollection } from '@/lib/catalog';
export const metadata = { title: 'Your bag' };
export default function CartPage() {
  const recommended = getCollection('all').products.filter(product => product.variants.some(variant => variant.available)).slice(0, 4);
  return <main id="main-content" className="page-container cart-page"><h1>Your shopping bag</h1><CartContents /><section className="cart-recommendations" aria-labelledby="cart-recommendations-heading"><div className="section-heading"><h2 id="cart-recommendations-heading">You may also like</h2><Link href="/collections/all">View all</Link></div><div className="product-grid">{recommended.map(product => <ProductCard product={cardData(product)} key={product.handle} />)}</div></section></main>;
}
