'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import type { ProductCardData } from '@/lib/types';
import { AddToCartButton } from './add-to-cart-button';
import { Price, Quantity, useStore } from './store';

export function QuickAdd({ product, onClose }: { product: ProductCardData; onClose: () => void }) {
  const { add } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState(() => {
    const first = product.variants.find(value => value.available) || product.variants[0];
    return product.options.map((option, index) => /size/i.test(option.name) && option.values.length > 1 ? '' : first.options[index]);
  });
  const fields = useRef<(HTMLFieldSetElement | null)[]>([]);
  const missing = product.options.findIndex((_, index) => !selected[index]);
  const variant = missing < 0 ? product.variants.find(value => value.options.every((option, index) => option === selected[index])) : undefined;
  const displayVariant = variant || product.variants.find(value => value.available) || product.variants[0];
  const soldOut = !product.variants.some(value => value.available);

  function choose(index: number, value: string) {
    setSelected(previous => {
      const next = [...previous]; next[index] = value;
      if (!product.variants.some(candidate => candidate.available && candidate.options.every((option, position) => !next[position] || option === next[position]))) {
        product.options.forEach((option, position) => { if (position !== index && option.values.length > 1) next[position] = ''; });
      }
      return next;
    });
  }
  function purchase() {
    if (missing >= 0) {
      fields.current[missing]?.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      fields.current[missing]?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus({ preventScroll: true });
      return;
    }
    if (variant?.available) add(product, variant, quantity);
  }

  return <div className="quick-add-content">
    <div className="quick-add-gallery" aria-label="Product images">{product.images.map((image, index) => <Image key={image + index} src={image} alt={`${product.title} - view ${index + 1}`} width={900} height={1200} unoptimized loading={index ? 'lazy' : 'eager'} />)}</div>
    <div className="quick-add-info">
      <div className="quick-add-product"><Image src={product.images[0]} width={90} height={120} alt={product.title} unoptimized /><div><Link href={`/products/${product.handle}`} onClick={onClose}>{product.title}</Link><Price variant={displayVariant} /></div></div>
      <div className="quick-add-options">{product.options.map((option, index) => option.name === 'Title' ? null : <fieldset key={option.name} ref={element => { fields.current[index] = element; }}><legend>{option.name}</legend><div className="quick-add-values">{option.values.map(value => <button key={value} type="button" aria-pressed={selected[index] === value} disabled={!product.variants.some(candidate => candidate.available && candidate.options[index] === value)} onClick={() => choose(index, value)}>{value}</button>)}</div></fieldset>)}</div>
      <div className="quick-add-purchase"><Quantity value={quantity} onChange={setQuantity} /><AddToCartButton disabled={soldOut || (missing < 0 && !variant?.available)} data-needs-selection={missing >= 0 || undefined} onClick={purchase}>{soldOut ? 'Sold out' : missing >= 0 ? `Select ${product.options[missing].name.toLowerCase()}` : variant?.available ? 'Add to cart' : 'Unavailable'}</AddToCartButton></div>
    </div>
  </div>;
}
