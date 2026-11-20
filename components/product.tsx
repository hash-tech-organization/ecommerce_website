'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Product } from '@/lib/types';
import { money } from '@/lib/types';
import { Icon } from './icon';
import { AddToCartButton } from './add-to-cart-button';
import { Modal, useStore } from './store';
import './product.css';

export type ProductDetails = {
  barcodes?: Record<string, string>;
  skus?: Record<string, string>;
  sizeChart?: string;
  video?: string;
};

export function ProductView({ product, details }: { product: Product; details?: ProductDetails }) {
  const [image, setImage] = useState(0);
  const [selected, setSelected] = useState(() => {
    const first = product.variants.find(variant => variant.available) || product.variants[0];
    return product.options.map((option, index) => /size/i.test(option.name) && option.values.length > 1 ? '' : first.options[index]);
  });
  const [sizeGuide, setSizeGuide] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [previewAutoplay, setPreviewAutoplay] = useState(false);
  const optionFields = useRef<(HTMLFieldSetElement | null)[]>([]);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const { add } = useStore();

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 750px)');
    const update = () => setPreviewAutoplay(!reducedMotion.matches && desktop.matches);
    update();
    reducedMotion.addEventListener('change', update);
    desktop.addEventListener('change', update);
    return () => {
      reducedMotion.removeEventListener('change', update);
      desktop.removeEventListener('change', update);
    };
  }, []);

  const missingOption = product.options.findIndex((_, index) => !selected[index]);
  const variant = missingOption < 0 ? product.variants.find(candidate => candidate.options.every((value, index) => value === selected[index])) : undefined;
  const priceVariant = variant || product.variants.find(candidate => candidate.available && candidate.options.every((value, index) => !selected[index] || value === selected[index])) || product.variants[0];
  const soldOut = !product.variants.some(candidate => candidate.available);
  const discount = priceVariant.compareAt > priceVariant.price ? Math.round((1 - priceVariant.price / priceVariant.compareAt) * 100) : 0;
  const hasSize = product.options.some(option => /size/i.test(option.name));
  const buttonLabel = soldOut ? 'Sold out' : missingOption >= 0 ? `Select ${product.options[missingOption].name.toLowerCase()}` : variant?.available ? 'Add to cart' : 'Unavailable';

  function chooseOption(index: number, value: string) {
    setSelected(previous => {
      const next = [...previous];
      next[index] = value;
      if (!product.variants.some(candidate => candidate.available && candidate.options.every((choice, position) => !next[position] || choice === next[position]))) {
        product.options.forEach((option, position) => {
          if (position !== index && option.values.length > 1) next[position] = '';
        });
      }
      return next;
    });
  }

  function purchase() {
    if (missingOption >= 0) {
      const field = optionFields.current[missingOption];
      field?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
      field?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus({ preventScroll: true });
      return;
    }
    if (variant?.available) add(product, variant);
  }

  return (
    <>
      <div className="pdp-layout" style={{ '--pdp-image-ratio': product.imageAspectRatio || .75 } as CSSProperties}>
        <section className="pdp-gallery" aria-label="Product images">
          <div
            className="pdp-gallery-stage"
            onKeyDown={event => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault();
                setImage(previous => (previous + (event.key === 'ArrowRight' ? 1 : -1) + product.images.length) % product.images.length);
              }
            }}
            onTouchStart={event => {
              touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
              swiped.current = false;
            }}
            onTouchEnd={event => {
              if (!touchStart.current) return;
              const dx = event.changedTouches[0].clientX - touchStart.current.x;
              const dy = event.changedTouches[0].clientY - touchStart.current.y;
              if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                swiped.current = true;
                setImage(previous => (previous + (dx < 0 ? 1 : -1) + product.images.length) % product.images.length);
              }
              touchStart.current = null;
            }}
          >
            <button className="pdp-main-image" type="button" aria-label="Enlarge product image" onClick={() => {
              if (swiped.current) { swiped.current = false; return; }
              setZoom(true);
            }}>
              <Image src={product.images[image]} alt={`${product.title} - view ${image + 1}`} width={1000} height={1340} unoptimized preload={image === 0} />
            </button>
            {product.images.length > 1 && <>
              <button className="pdp-gallery-arrow pdp-gallery-previous" type="button" aria-label="Previous product image" onClick={() => setImage(previous => (previous - 1 + product.images.length) % product.images.length)}><Icon name="chevron" width={22} height={22} /></button>
              <button className="pdp-gallery-arrow pdp-gallery-next" type="button" aria-label="Next product image" onClick={() => setImage(previous => (previous + 1) % product.images.length)}><Icon name="chevron" width={22} height={22} /></button>
            </>}
          </div>
          <div className="pdp-thumbnails" aria-label="Choose a product image">
            {product.images.map((src, index) => <button key={src} type="button" onClick={() => setImage(index)} className={index === image ? 'is-selected' : ''} aria-label={`View image ${index + 1}`} aria-pressed={index === image}><Image src={src} width={90} height={120} alt={`${product.title} detail ${index + 1}`} unoptimized /></button>)}
            {details?.video && <button className="pdp-video-thumbnail" type="button" aria-label="Watch product video" onClick={() => setVideoOpen(true)}><Image src={product.images[0]} width={90} height={120} alt="Product video preview" unoptimized /><Icon name="play" width={22} height={22} fill="currentColor" /></button>}
          </div>
          <p className="sr-only" aria-live="polite">Image {image + 1} of {product.images.length}</p>
        </section>

        <div className="pdp-info">
          <div className="pdp-notices" aria-label="Shopping information"><p className="pdp-fit-notice"><Icon name="return" width={14} height={14} /><span>7 Days Hassle Free Returns &amp; Exchange</span></p><p className="pdp-fit-notice"><Icon name="check-square" width={14} height={14} /><span>For the perfect fit, always check size chart on each product</span></p></div>
          <h1>{product.title}</h1>
          <div className="pdp-price-row" aria-live="polite">
            <div className="pdp-price"><span>{money(priceVariant.price)}</span>{discount > 0 && <s>{money(priceVariant.compareAt)}</s>}</div>
            {discount > 0 && <span className="pdp-discount">{discount}% OFF</span>}
          </div>

          <div className="pdp-options">
            {product.options.map((option, index) => option.name === 'Title' ? null : (
              <fieldset className={`pdp-option${/colou?r/i.test(option.name) ? ' pdp-color-option' : ''}`} key={option.name} ref={element => { optionFields.current[index] = element; }}>
                <legend>{option.name}</legend>
                <div className="pdp-option-values">
                  {option.values.map(value => <button key={value} type="button" className={selected[index] === value ? 'is-selected' : ''} aria-pressed={selected[index] === value} disabled={!product.variants.some(candidate => candidate.available && candidate.options[index] === value)} onClick={() => chooseOption(index, value)}>{value}</button>)}
                </div>
              </fieldset>
            ))}
          </div>

          {hasSize && <button className="pdp-size-guide-link" type="button" aria-haspopup="dialog" onClick={() => setSizeGuide(true)}><Icon name="ruler" width={19} height={19} />Size guide</button>}
          <div className="product-accordions pdp-accordions">
            <details><summary>Product Description<Icon name="plus" width={16} height={16} /></summary><p>{product.description || 'Thoughtfully selected for everyday comfort. Find your perfect fit with Veloura.'}</p></details>
            <details><summary>Return &amp; Exchange Policy<Icon name="plus" width={16} height={16} /></summary><p>Please see our <Link href="/policies/refund-policy">return and exchange policy</Link> for details.</p></details>
          </div>
        </div>
      </div>

      <div className="pdp-purchase-bar" role="region" aria-label="Quick add to cart">
        <AddToCartButton className="pdp-purchase-button" disabled={soldOut || (missingOption < 0 && !variant?.available)} data-needs-selection={missingOption >= 0 || undefined} onClick={purchase}>{buttonLabel}</AddToCartButton>
      </div>

      {details?.video && previewVisible && <div className="pdp-video-teaser">
        <button className="pdp-video-dismiss" type="button" aria-label="Dismiss video preview" onClick={() => setPreviewVisible(false)}><Icon name="close" width={14} height={14} /></button>
        <button className="pdp-video-open" type="button" aria-label="Watch product video" aria-haspopup="dialog" onClick={() => setVideoOpen(true)}>
          <video key={String(previewAutoplay)} autoPlay={previewAutoplay} muted loop playsInline preload="metadata" poster={product.images[0]}><source src={details.video} type="video/mp4" /></video>
          <span>WATCH</span>
        </button>
      </div>}

      {sizeGuide && <Modal title="Size guide" onClose={() => setSizeGuide(false)} className="pdp-size-guide-dialog">
        {details?.sizeChart ? <Image className="pdp-size-chart" src={details.sizeChart} alt={`Size chart for ${product.title}`} width={1600} height={2000} unoptimized /> : <div className="size-guide"><p>Choose from the sizes available for this design:</p><div className="size-options">{product.options.filter(option => /size/i.test(option.name)).flatMap(option => option.values).map(size => <span key={size}>{size}</span>)}</div><p>Measure around your body with a soft tape, keeping it comfortably level. Fit and garment measurements vary by design.</p><p>For exact measurements for <strong>{product.title}</strong>, please <Link href="/pages/contact">contact our team</Link> before ordering.</p>{/bra/i.test(product.title) && <Link href="/pages/bra-size-calculator" className="button button-dark">Try the bra size calculator</Link>}</div>}
      </Modal>}
      {zoom && <Modal title={product.title} onClose={() => setZoom(false)} className="image-modal"><Image src={product.images[image]} alt={product.title} width={1100} height={1474} unoptimized className="zoom-image" /></Modal>}
      {videoOpen && details?.video && <Modal title={product.title} onClose={() => setVideoOpen(false)} className="pdp-video-dialog"><video className="pdp-product-video" src={details.video} controls autoPlay playsInline preload="metadata" /></Modal>}
    </>
  );
}
