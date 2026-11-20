'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { emptySelection, facetKeys, facetLabel, getFacetOptions, matchesCollectionFilters } from '@/lib/collection-filters';
import type { FacetKey, FacetProduct, FacetSelection, PriceRange } from '@/lib/collection-filters';
import { money } from '@/lib/types';
import { ProductCard } from './featured-product-card';
import { Icon } from './icon';
import { Modal } from './store';
import './new-arrivals.css';

const batchSize = 24;
const filters: { key: FacetKey | 'price'; label: string }[] = [
  { key: 'availability', label: 'Availability' },
  { key: 'size', label: 'Size' },
  { key: 'cup', label: 'Cup Size' },
  { key: 'color', label: 'Color' },
  { key: 'price', label: 'Price' },
  { key: 'occasion', label: 'By Occasion' },
  { key: 'fabric', label: 'Fabric' },
];
const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'title-ascending', label: 'Alphabetically, A–Z' },
  { value: 'title-descending', label: 'Alphabetically, Z–A' },
  { value: 'price-ascending', label: 'Price, low to high' },
  { value: 'price-descending', label: 'Price, high to low' },
  { value: 'newest', label: 'Date, new to old' },
  { value: 'oldest', label: 'Date, old to new' },
];

function Caret() {
  return <svg className="arrivals-caret" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M11 5.5L7 9.5L3 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function CollectionCatalogView({ title, products, enabledFilters, className = '', searchQuery, headerContent, inlineFilters = false, defaultAvailability }: { title: string; products: FacetProduct[]; enabledFilters?: (FacetKey | 'price')[]; className?: string; searchQuery?: string; headerContent?: ReactNode; inlineFilters?: boolean; defaultAvailability?: 'in stock' | 'out of stock' }) {
  const displayedFilters = enabledFilters ? filters.filter(filter => enabledFilters.includes(filter.key)) : filters;
  const [selection, setSelection] = useState<FacetSelection>(() => ({ ...emptySelection(), availability: defaultAvailability ? [defaultAvailability] : [] }));
  const [price, setPrice] = useState<PriceRange>({ min: '', max: '' });
  const [sort, setSort] = useState('featured');
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const [mobileFilters, setMobileFilters] = useState(false);
  const root = useRef<HTMLElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  const options = useMemo(() => getFacetOptions(products, selection, price), [products, selection, price]);
  const maximumPrice = useMemo(() => Math.max(0, ...products.flatMap(product => product.variants.map(variant => variant.price))), [products]);
  const filtered = useMemo(() => {
    const result = products.filter(product => matchesCollectionFilters(product, selection, price));
    const lowestPrice = (product: FacetProduct) => Math.min(...product.variants.map(variant => variant.price));
    if (sort === 'price-ascending') result.sort((left, right) => lowestPrice(left) - lowestPrice(right));
    if (sort === 'price-descending') result.sort((left, right) => lowestPrice(right) - lowestPrice(left));
    if (sort === 'title-ascending') result.sort((left, right) => left.title.localeCompare(right.title));
    if (sort === 'title-descending') result.sort((left, right) => right.title.localeCompare(left.title));
    if (sort === 'newest') result.sort((left, right) => right.id - left.id);
    if (sort === 'oldest') result.sort((left, right) => left.id - right.id);
    return result;
  }, [products, selection, price, sort]);
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visible.length < filtered.length;
  const hasPrice = price.min !== '' || price.max !== '';
  const hasFilters = hasPrice || facetKeys.some(key => selection[key].length > 0);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const size = query.get('filter.v.option.size');
    const cup = query.get('filter.v.option.cup size');
    if (size || cup) setSelection(previous => ({ ...previous, size: size ? [size.toLowerCase()] : previous.size, cup: cup ? [cup.toLowerCase()] : previous.cup }));
  }, []);

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      root.current?.querySelectorAll<HTMLDetailsElement>('.arrivals-popover[open]').forEach(details => {
        if (!details.contains(event.target as Node)) details.open = false;
      });
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);

  useEffect(() => {
    const element = sentinel.current;
    if (!element || !hasMore || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        setVisibleCount(current => Math.min(current + batchSize, filtered.length));
      }
    }, { rootMargin: '600px 0px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, [visibleCount, filtered.length, hasMore]);

  function toggle(key: FacetKey, value: string) {
    setSelection(previous => ({ ...previous, [key]: previous[key].includes(value) ? previous[key].filter(item => item !== value) : [...previous[key], value] }));
    setVisibleCount(batchSize);
  }

  function reset(key?: FacetKey | 'price') {
    if (!key) { setSelection(emptySelection()); setPrice({ min: '', max: '' }); }
    else if (key === 'price') setPrice({ min: '', max: '' });
    else setSelection(previous => ({ ...previous, [key]: [] }));
    setVisibleCount(batchSize);
  }

  function changePrice(key: keyof PriceRange, value: string) {
    setPrice(previous => ({ ...previous, [key]: value }));
    setVisibleCount(batchSize);
  }

  function activeCount(key: FacetKey | 'price') {
    return key === 'price' ? Number(hasPrice) : selection[key].length;
  }

  function fields(key: FacetKey | 'price') {
    if (key === 'price') return <div className="arrivals-price-filter">
      <p>The highest price is {money(maximumPrice)}</p>
      <div className="arrivals-price-inputs">
        <label>From<span><span aria-hidden="true">Rs.</span><input type="number" name="price-min" inputMode="decimal" min="0" max={maximumPrice} placeholder="0" aria-label="Minimum price" value={price.min} onChange={event => changePrice('min', event.target.value)} /></span></label>
        <label>To<span><span aria-hidden="true">Rs.</span><input type="number" name="price-max" inputMode="decimal" min="0" max={maximumPrice} placeholder={String(maximumPrice)} aria-label="Maximum price" value={price.max} onChange={event => changePrice('max', event.target.value)} /></span></label>
      </div>
    </div>;

    return <div className={`arrivals-options arrivals-options--${key}`}>
      {options[key].map(option => <label className="arrivals-option" key={option.value}>
        <input type="checkbox" name={`filter-${key}`} value={option.value} checked={selection[key].includes(option.value)} disabled={!option.count && !selection[key].includes(option.value)} onChange={() => toggle(key, option.value)} />
        <span>{option.label}</span><span className="arrivals-option-count">({option.count})</span>
      </label>)}
    </div>;
  }

  return <main
    ref={root}
    id="main-content"
    className={`page-container new-arrivals-page ${className}`}
    onKeyDown={event => {
      if (event.key !== 'Escape') return;
      const details = (event.target as HTMLElement).closest<HTMLDetailsElement>('.arrivals-popover[open]');
      if (details) { details.open = false; details.querySelector<HTMLElement>('summary')?.focus(); event.preventDefault(); }
    }}
  >
    {searchQuery === undefined ? <h1 className="sr-only">{title}</h1> : <div className="collection-heading"><h1>{title}</h1><form action="/search" className="page-search search-field"><input name="q" defaultValue={searchQuery} placeholder="Search products" aria-label="Search products" /><button className="icon-button" aria-label="Search"><Icon name="arrow" /></button></form><p>{filtered.length} results for “{searchQuery}”</p></div>}
    {headerContent}
    <div className="arrivals-toolbar" aria-label="Collection filters and sorting">
      <div className="arrivals-desktop-filters">
        {displayedFilters.map(filter => <details className="arrivals-popover" name="new-arrivals-popovers" key={filter.key}>
          <summary className={`arrivals-filter-summary${inlineFilters && filter.key === 'availability' ? ' arrivals-inline-availability' : ''}`}><span className="arrivals-filter-label">{filter.label}</span>{inlineFilters && filter.key === 'availability' ? <span className="arrivals-availability-value">{selection.availability.length ? selection.availability.map(value => facetLabel('availability', value)).join(', ') : 'All'}<Caret /></span> : <>{activeCount(filter.key) > 0 && <span className="arrivals-selected-count">{activeCount(filter.key)}</span>}<Caret /></>}</summary>
          <div className="arrivals-popover-panel">
            <div className="arrivals-popover-heading"><span>{activeCount(filter.key)} selected</span><button type="button" onClick={() => reset(filter.key)}>Reset</button></div>
            {fields(filter.key)}
          </div>
        </details>)}
        {inlineFilters && hasFilters && <button className="arrivals-inline-clear" type="button" onClick={() => reset()}>Clear all</button>}
      </div>
      <button className="arrivals-mobile-toggle" type="button" onClick={() => setMobileFilters(true)}><Icon name="filter" width={18} height={18} />Filter{hasFilters && <span className="arrivals-selected-count">{facetKeys.reduce((total, key) => total + selection[key].length, Number(hasPrice))}</span>}</button>
      <span className="arrivals-item-count" aria-live="polite">{filtered.length} items</span>
      <details className="arrivals-popover arrivals-sort" name="new-arrivals-popovers">
        <summary className="arrivals-filter-summary" aria-label={`Sort products, ${sortOptions.find(option => option.value === sort)?.label}`}><span>Sort</span><Caret /></summary>
        <fieldset className="arrivals-popover-panel arrivals-sort-panel" aria-label="Sort products">
          {sortOptions.map(option => <label className="arrivals-sort-option" key={option.value}><input type="radio" name="arrivals-sort" value={option.value} checked={sort === option.value} onChange={event => { setSort(option.value); setVisibleCount(batchSize); const details = event.currentTarget.closest('details'); if (details) details.open = false; }} /><span>{option.label}</span></label>)}
        </fieldset>
      </details>
    </div>

    {hasFilters && !inlineFilters && <div className="arrivals-active-filters" aria-label="Active filters">
      {facetKeys.flatMap(key => selection[key].map(value => <button type="button" key={`${key}-${value}`} aria-label={`Remove ${facetLabel(key, value)} filter`} onClick={() => toggle(key, value)}>{facetLabel(key, value)}<Icon name="close" width={14} height={14} /></button>))}
      {hasPrice && <button type="button" aria-label="Remove price filter" onClick={() => reset('price')}>{price.min ? money(Number(price.min)) : money(0)} – {price.max ? money(Number(price.max)) : money(maximumPrice)}<Icon name="close" width={14} height={14} /></button>}
      <button className="arrivals-clear-all" type="button" onClick={() => reset()}>Clear all</button>
    </div>}

    {visible.length ? <div className="product-grid arrivals-product-grid">{visible.map((product, index) => <ProductCard product={product} index={index} key={product.handle} />)}</div> : <div className="empty-state"><Icon name="search" width={36} height={36} /><h2>No products found</h2><p>Try another filter or clear your selections.</p><button className="button button-dark" type="button" onClick={() => reset()}>Clear filters</button></div>}
    <p className="sr-only" role="status">Showing {visible.length} of {filtered.length} items.</p>
    {hasMore && <div className="arrivals-load-more" ref={sentinel}><button type="button" onClick={() => setVisibleCount(current => Math.min(current + batchSize, filtered.length))}>Load more products</button></div>}

    {mobileFilters && <Modal title="Filters" side="left" className="arrivals-filter-drawer" onClose={() => setMobileFilters(false)}>
      <div className="arrivals-mobile-filter-groups">{displayedFilters.map((filter, index) => <details className="arrivals-mobile-group" key={filter.key} open={index === 0}><summary>{filter.label}<Caret /></summary>{fields(filter.key)}</details>)}<details className="arrivals-mobile-group"><summary>Sort<Caret /></summary><fieldset className="arrivals-mobile-sort" aria-label="Sort products">{sortOptions.map(option => <label className="arrivals-sort-option" key={option.value}><input type="radio" name="mobile-sort" value={option.value} checked={sort === option.value} onChange={() => { setSort(option.value); setVisibleCount(batchSize); }} />{option.label}</label>)}</fieldset></details></div>
      <div className="arrivals-mobile-filter-actions"><button type="button" onClick={() => reset()}>Clear all</button><button className="button button-dark" type="button" onClick={() => setMobileFilters(false)}>Show {filtered.length} items</button></div>
    </Modal>}
  </main>;
}

export { CollectionCatalogView as NewArrivalsView };
