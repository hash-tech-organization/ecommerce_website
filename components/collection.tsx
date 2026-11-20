'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ProductCardData } from '@/lib/types';
import { navigation } from '@/lib/navigation';
import { Icon } from './icon';
import { Modal } from './store';
import { ProductCard } from './featured-product-card';

export function CollectionView({ title, products, searchQuery }: { title: string; products: ProductCardData[]; searchQuery?: string }) {
  const [sort, setSort] = useState('featured'); const [size, setSize] = useState(''); const [maxPrice, setMaxPrice] = useState(''); const [available, setAvailable] = useState(false); const [filterOpen, setFilterOpen] = useState(false);
  const sizes = useMemo(() => [...new Set(products.flatMap(p => p.options.filter(o => /size/i.test(o.name)).flatMap(o => o.values)))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })), [products]);
  const filtered = useMemo(() => {
    const list = products.filter(p => (!size || p.variants.some(v => v.options.includes(size) && (!available || v.available))) && (!maxPrice || p.variants[0].price <= Number(maxPrice)) && (!available || p.variants.some(v => v.available)));
    if (sort === 'price-ascending') list.sort((a, b) => a.variants[0].price - b.variants[0].price);
    if (sort === 'price-descending') list.sort((a, b) => b.variants[0].price - a.variants[0].price);
    if (sort === 'title-ascending') list.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'newest') list.sort((a, b) => b.id - a.id);
    return list;
  }, [products, size, maxPrice, available, sort]);
  const visible = filtered;
  const reset = () => { setSize(''); setMaxPrice(''); setAvailable(false); };
  const filters = <div className="filter-fields"><label className="checkbox-label"><input type="checkbox" checked={available} onChange={e => { setAvailable(e.target.checked); }} />In stock only</label><label>Size<select value={size} onChange={e => { setSize(e.target.value); }}><option value="">All sizes</option>{sizes.map(s => <option key={s}>{s}</option>)}</select></label><label>Maximum price (PKR)<input type="number" min="0" placeholder="Any price" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); }} /></label><button onClick={reset} className="text-link">Clear filters</button></div>;
  return <main id="main-content" className="page-container collection-page"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>{searchQuery !== undefined ? 'Search' : title}</span></nav><div className="collection-heading"><h1>{title}</h1>{searchQuery !== undefined && <form action="/search" className="page-search search-field"><input name="q" defaultValue={searchQuery} placeholder="Search products" aria-label="Search products" /><button className="icon-button" aria-label="Search"><Icon name="search" /></button></form>}<p>{searchQuery !== undefined ? `${filtered.length} results for “${searchQuery}”` : `${products.length} products`}</p></div>{searchQuery === undefined && <div className="collection-category-links">{navigation.filter(n => !/New|Winter|Clearance/.test(n.title)).slice(0, 10).map(n => <Link href={n.href} key={n.href}>{n.title}</Link>)}</div>}<div className="collection-toolbar"><button className="filter-toggle" onClick={() => setFilterOpen(true)}><Icon name="filter" width={18} height={18} />Filter{(size || maxPrice || available) && <span className="filter-dot" />}</button><span className="result-count">{filtered.length} products</span><label className="sort-label">Sort by<select aria-label="Sort products" value={sort} onChange={e => { setSort(e.target.value); }}><option value="featured">Featured</option><option value="newest">Newest first</option><option value="price-ascending">Price, low to high</option><option value="price-descending">Price, high to low</option><option value="title-ascending">Alphabetically, A–Z</option></select></label></div>{(size || maxPrice || available) && <div className="active-filters">{size && <button onClick={() => setSize('')}>Size: {size} ×</button>}{maxPrice && <button onClick={() => setMaxPrice('')}>Under Rs.{maxPrice} ×</button>}{available && <button onClick={() => setAvailable(false)}>In stock ×</button>}<button onClick={reset}>Clear all</button></div>}{visible.length ? <div className="product-grid">{visible.map((p, i) => <ProductCard product={p} index={i} key={p.handle} />)}</div> : <div className="empty-state"><Icon name="search" width={40} height={40} /><h2>No products found</h2><p>Try another search or adjust your filters.</p><button className="button button-dark" onClick={reset}>Clear filters</button></div>}{filterOpen && <Modal title="Filter products" side="left" onClose={() => setFilterOpen(false)}>{filters}<div className="filter-apply"><button className="button button-dark full-width" onClick={() => setFilterOpen(false)}>Show {filtered.length} products</button></div></Modal>}</main>;
}
