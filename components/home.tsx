'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import home from '@/data/home.json';
import type { ProductCardData } from '@/lib/types';
import { Icon } from './icon';
import { ProductCard } from './featured-product-card';

export function Hero() {
  const [slide, setSlide] = useState(0); const [paused, setPaused] = useState(false);
  const touch = useRef(0);
  const change = (offset: number) => setSlide(current => (current + offset + home.sliders.length) % home.sliders.length);
  useEffect(() => { if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; const id = setInterval(() => setSlide(s => (s + 1) % home.sliders.length), 8000); return () => clearInterval(id); }, [paused]);
  return <section className="hero" aria-roledescription="carousel" aria-label="Featured collections" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false); }} onTouchStart={e => { touch.current = e.touches[0].clientX; }} onTouchEnd={e => { const delta = touch.current - e.changedTouches[0].clientX; if (Math.abs(delta) > 50) change(delta > 0 ? 1 : -1); }}>
    <svg className="hero-copy-shadow-filters" aria-hidden="true" focusable="false">
      <defs>
        {[
          { id: 'hero-bra-copy-shadow-desktop', x: .07, y: .24, width: .37, height: .51, blur: '.0015 .005', offset: .004 },
          { id: 'hero-bra-copy-shadow-mobile', x: .15, y: .09, width: .7, height: .27, blur: '.0038 .003', offset: .003 },
        ].map(shadow => (
          <filter key={shadow.id} id={shadow.id} x="0" y="0" width="1" height="1" filterUnits="objectBoundingBox" primitiveUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
            {/* Render only a shadow around the image-embedded copy, preserving the base artwork. */}
            <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 40 40 40 0 -118.5" result="whitePixels" />
            <feComponentTransfer in="whitePixels" result="whiteMask"><feFuncA type="discrete" tableValues="0 1" /></feComponentTransfer>
            <feFlood x={shadow.x} y={shadow.y} width={shadow.width} height={shadow.height} floodColor="white" result="copyRegion" />
            <feComposite in="whiteMask" in2="copyRegion" operator="in" result="copyMask" />
            <feMorphology in="copyMask" operator="dilate" radius=".001 .002" result="protectedCopy" />
            <feGaussianBlur in="protectedCopy" stdDeviation={shadow.blur} result="copyBlur" />
            <feOffset in="copyBlur" dy={shadow.offset} result="copyOffset" />
            <feFlood floodColor="black" floodOpacity=".85" result="shadowColor" />
            <feComposite in="shadowColor" in2="copyOffset" operator="in" result="copyShadow" />
            <feComposite in="copyShadow" in2="protectedCopy" operator="out" />
          </filter>
        ))}
      </defs>
    </svg>
    {home.sliders.map((item, i) => <Link href={item.href!} className={`hero-slide hero-slide-${i} ${slide === i ? 'is-active' : ''}`} key={item.image} aria-hidden={slide !== i} tabIndex={slide === i ? 0 : -1} aria-label={['Explore oversized PJ sets in cotton, linen and silk', 'Explore the bra collection', 'Explore body shapers'][i]}><picture><source media="(max-width: 749px)" srcSet={item.mobile} /><Image src={item.image} alt={['OVERSIZED PJS — COTTON | LINEN | SILK. Relaxed drop shoulder fits in SMALL to XL. Explore Collection.', 'Discover your perfect fit — Shop Bras', 'Beautiful comfort — Shop Body Shapers'][i]} width={2560} height={854} unoptimized preload={i === 0} /></picture><span className="hero-themed-cta" aria-hidden="true"><picture><source media="(max-width: 749px)" srcSet={`/images/hero-cta-mobile-${i}.png`} /><Image src={`/images/hero-cta-desktop-${i}.png`} alt="" width={358} height={54} unoptimized loading="eager" /></picture></span>{item.href === '/collections/bras-in-pakistan' && <picture className="hero-copy-shadow" aria-hidden="true"><source media="(max-width: 749px)" srcSet={item.mobile} /><Image src={item.image} alt="" width={2560} height={854} unoptimized /></picture>}</Link>)}
    <button className="hero-arrow hero-prev" onClick={() => change(-1)} aria-label="Previous slide"><Icon name="arrow" width={28} height={28} /></button><button className="hero-arrow hero-next" onClick={() => change(1)} aria-label="Next slide"><Icon name="arrow" width={28} height={28} /></button><div className="hero-dots">{home.sliders.map((s, i) => <button key={s.image} className={slide === i ? 'active' : ''} aria-label={`Go to slide ${i + 1}`} aria-current={slide === i} onClick={() => setSlide(i)} />)}</div><button className="hero-pause" aria-label={paused ? 'Play slideshow' : 'Pause slideshow'} onClick={() => setPaused(p => !p)}>{paused ? '▶' : 'Ⅱ'}</button>
  </section>;
}

type Tab = { title: string; href?: string; count: number; exploreImage: string; products: ProductCardData[] };

export function ProductCarousel({ title, tabs }: { title: string; tabs: Tab[] }) {
  const [active, setActive] = useState(0);
  const rail = useRef<HTMLDivElement>(null);
  const tab = tabs[active];
  const id = title.toLowerCase().replace(/\s+/g, '-');

  function selectTab(index: number) {
    setActive(index);
    rail.current?.scrollTo({ left: 0 });
  }

  return (
    <section className="page-container home-section product-section" aria-labelledby={id + '-heading'}>
      <div className="section-heading">
        <h2 id={id + '-heading'}>{title}</h2>
      </div>
      <div className="product-tabs" role="tablist" aria-label={title}>
        {tabs.map((item, index) => (
          <button
            key={item.title}
            id={id + '-tab-' + index}
            role="tab"
            aria-selected={active === index}
            aria-controls={id + '-panel'}
            tabIndex={active === index ? 0 : -1}
            onClick={() => selectTab(index)}
            onKeyDown={event => {
              if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
              event.preventDefault();
              const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (active + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
              selectTab(next);
              document.getElementById(id + '-tab-' + next)?.focus();
            }}
          >{item.title}</button>
        ))}
      </div>
      <div
        className="product-rail"
        id={id + '-panel'}
        ref={rail}
        role="tabpanel"
        aria-labelledby={id + '-tab-' + active}
        tabIndex={0}
      >
        {tab.products.map(product => <ProductCard product={product} key={product.handle} />)}
        <Link className="explore-card" href={tab.href || '/collections/all'} aria-label={'Discover ' + Math.max(0, tab.count - 5) + ' more ' + tab.title}>
          <Image src={tab.exploreImage} alt="" width={600} height={750} unoptimized loading="lazy" className="explore-card-image" />
          <span className="explore-card-content">
            <span className="explore-card-label">
              <span>Discover<br />{Math.max(0, tab.count - 5)} More</span>
              <Icon name="arrow" className="explore-card-arrow" width={12} height={12} />
            </span>
            <span className="explore-card-button">Explore</span>
          </span>
        </Link>
      </div>
    </section>
  );
}

export function Faq() {
  return <div className="faq-list">{home.faq.map((item, i) => <details key={item.question} name="faq" open={i === 0 ? true : undefined}><summary>{item.question}<Icon name="plus" width={16} height={16} /></summary><p>{item.answer}</p></details>)}</div>;
}
