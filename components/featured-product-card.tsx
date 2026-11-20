'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { ProductCardData } from '@/lib/types';
import { Price, useStore } from './store';
import { AddToCartButton } from './add-to-cart-button';

export function ProductCard({ product, index = 2 }: { product: ProductCardData; index?: number }) {
  const { add, quickAdd } = useStore();
  const [selection, setSelection] = useState<Record<number, string>>({});
  const variant = product.variants.find(v => v.available) || product.variants[0];
  const selectedVariant = product.variants.find(v => v.options.every((value, index) => value === (selection[index] ?? (product.options[index]?.values.length === 1 ? product.options[index].values[0] : undefined))));

  if (!variant) return null;
  const discount = variant.compareAt > variant.price ? Math.round((1 - variant.price / variant.compareAt) * 100) : 0;
  const available = product.variants.some(v => v.available);

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link href={`/products/${product.handle}`} className="product-image-link" aria-label={product.title}>
          <Image src={product.images[0]} alt={product.title} width={900} height={1200} unoptimized loading={index < 2 ? 'eager' : 'lazy'} className="product-primary-image" />
          {product.images[1] && <Image src={product.images[1]} alt="" width={900} height={1200} unoptimized loading="lazy" className="product-hover-image" />}
        </Link>
        {discount > 0 && <span className="sale-badge">-{discount}%</span>}
        {product.isNew && <span className="card-new-badge">New</span>}
      </div>
      <div className="product-card-info">
        <Link className="product-name" title={product.title} href={`/products/${product.handle}`}>{product.title}</Link>
        {product.options.map((option, optionIndex) => !/^(size|cup(?: size)?)$/i.test(option.name) || (option.values.length === 1 && !/cup/i.test(option.name)) ? null : (
          <div className="card-option-group" key={option.name} role="group" aria-label={option.name}>
            {option.name.toLowerCase() !== 'size' && <span className="card-option-label">{option.name}</span>}
            {option.values.map(value => {
              const inStock = product.variants.some(v => v.options[optionIndex] === value && v.available);
              return <button
                key={value}
                type="button"
                disabled={!inStock}
                aria-label={`Select ${option.name.toLowerCase()} ${value}`}
                aria-pressed={selection[optionIndex] === value}
                onClick={() => setSelection(previous => ({ ...previous, [optionIndex]: value }))}
              >{value}</button>;
            })}
          </div>
        ))}
        <Price variant={selectedVariant || variant} />
        <AddToCartButton
          className="card-add"
          disabled={!available || (selectedVariant !== undefined && !selectedVariant.available)}
          onClick={() => selectedVariant ? add(product, selectedVariant) : quickAdd(product)}
        >{available ? 'Add to cart' : 'Sold out'}</AddToCartButton>
      </div>
    </article>
  );
}
