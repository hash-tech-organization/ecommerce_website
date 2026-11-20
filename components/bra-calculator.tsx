'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import content from '@/data/bra-calculator-content.json';
import type { ProductCardData } from '@/lib/types';
import { calculateBraSize } from '@/lib/bra-size';
import './bra-calculator.css';

function shopUrl(size: number, cup: string) {
  const query = new URLSearchParams({ 'filter.v.option.size': String(size), 'filter.v.option.cup size': cup, sort_by: 'manual' });
  return '/collections/bras-in-pakistan?' + query;
}

export function BraCalculator({ products }: { products: ProductCardData[] }) {
  const [unit, setUnit] = useState<'in' | 'cm'>('in');
  const [under, setUnder] = useState('');
  const [bust, setBust] = useState('');
  const [result, setResult] = useState<ReturnType<typeof calculateBraSize> | null>(null);
  const matching = result && !('error' in result) ? products.filter(product => product.variants.some(variant => {
    const sizeIndex = product.options.findIndex(option => option.name.toLowerCase() === 'size');
    const cupIndex = product.options.findIndex(option => /^cup/i.test(option.name));
    const cups = (variant.options[cupIndex] || '').toUpperCase().split(/[\s/,-]+/);
    return variant.available && variant.options[sizeIndex] === String(result.band) && (cupIndex < 0 || cups.includes(result.cup));
  })) : [];

  function changeUnit(value: 'in' | 'cm') { setUnit(value); setUnder(''); setBust(''); setResult(null); }
  return <div className="bra-calculator" id="bra-calculator">
    <div dangerouslySetInnerHTML={{ __html: content.intro }} />
    <div className="card calc" id="calculator">
      <div className="tabs" role="tablist" aria-label="Measurement units">{(['in', 'cm'] as const).map(value => <button key={value} type="button" role="tab" aria-selected={unit === value} className={'tab' + (unit === value ? ' active' : '')} onClick={() => changeUnit(value)}>{value === 'in' ? 'Inches' : 'Centimeters'}</button>)}</div>
      <form onSubmit={event => { event.preventDefault(); setResult(calculateBraSize(Number(under), Number(bust), unit)); }}>
        <label htmlFor="bra-underbust">Underbust measurement ({unit === 'in' ? 'inches' : 'cm'})</label><input id="bra-underbust" name="under" type="number" inputMode="decimal" min={unit === 'in' ? 20 : 50} step={unit === 'in' ? .5 : 1} placeholder={unit === 'in' ? "e.g. 28 (don't add 4 or 5)" : "e.g. 71 (don't add anything)"} value={under} onChange={event => setUnder(event.target.value)} />
        <label htmlFor="bra-bust">Bust measurement ({unit === 'in' ? 'inches' : 'cm'})</label><input id="bra-bust" name="bust" type="number" inputMode="decimal" min={unit === 'in' ? 20 : 50} step={unit === 'in' ? .5 : 1} placeholder={unit === 'in' ? 'e.g. 35' : 'e.g. 89'} value={bust} onChange={event => setBust(event.target.value)} />
        <div className="err" role="alert">{result && 'error' in result ? result.error : ''}</div><button className="btn" type="submit">Calculate Bra Size</button>
      </form>
      {result && !('error' in result) && <div className="result show" aria-live="polite"><div>Your estimated bra size is</div><strong className="size">{result.size}</strong><div className="sis">Sister sizes: {result.sisters.map((size, index) => <span key={size}>{index ? ', ' : ''}<Link href={shopUrl(Number(size.match(/^\d+/)?.[0]), size.replace(/^\d+/, ''))}>{size}</Link></span>)}</div><div className="stock">{matching.length ? `${matching.length} styles available in ${result.size}` : `Size ${result.size} is not in stock right now. Try your sister sizes.`}</div><Link className="btn" href={matching.length ? shopUrl(result.band, result.cup) : '/collections/bras-in-pakistan'}>{matching.length ? `Shop size ${result.size}` : 'Browse all bras'}</Link><Link className="btn ghost" href="/collections/bras-in-pakistan">Browse all bras</Link>{matching.length > 0 && <div className="matching-products">{matching.slice(0, 4).map(product => <Link key={product.handle} href={`/products/${product.handle}`}><Image src={product.images[0]} alt={product.title} width={200} height={267} unoptimized />{product.title}</Link>)}</div>}</div>}
    </div>
    <div dangerouslySetInnerHTML={{ __html: content.outro }} />
  </div>;
}
