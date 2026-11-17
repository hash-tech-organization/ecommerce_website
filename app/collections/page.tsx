import Image from 'next/image';
import Link from 'next/link';
import home from '@/data/home.json';
export const metadata = { title: 'Shop collections' };
export default function CollectionsPage() { return <main id="main-content" className="page-container collection-page"><div className="collection-heading"><h1>Shop Collections</h1><p>Everyday favourites. Exceptional comfort.</p></div><div className="category-tiles">{home.categories.map((c, i) => <Link href={c.href} key={c.href}><Image src={c.image} width={900} height={1157} alt={['Body Shapers', 'Bras', 'PJ Sets', 'Lingerie', 'Panties', 'Tops', 'Bottoms', 'Bra Panty Sets'][i]} unoptimized /></Link>)}</div></main>; }
