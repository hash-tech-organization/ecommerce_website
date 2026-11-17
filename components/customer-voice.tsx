'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import reviews from '@/data/reviews.json';
import { Icon } from './icon';
import { Modal } from './store';

type Review = (typeof reviews)[number];

function Stars({ rating }: { rating: number }) {
  return <div className="review-stars" role="img" aria-label={`${rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Icon key={index} name="star" width={22} height={22} fill={index < rating ? 'currentColor' : 'none'} strokeWidth={index < rating ? 1 : 2} />)}</div>;
}

function Reviewer({ review }: { review: Review }) {
  return <div className="review-author"><span>{review.author}</span>{review.verified && <span className="review-verified" role="img" aria-label="Verified buyer"><Icon name="check" width={8} height={8} strokeWidth={2.5} /></span>}</div>;
}

export function CustomerVoice() {
  const section = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [paused, setPaused] = useState(false);
  const [openedReview, setOpenedReview] = useState<Review | null>(null);

  const advance = useCallback((direction: number) => {
    const viewport = rail.current;
    const card = viewport?.querySelector<HTMLElement>('.review-card');
    if (!viewport || !card) return;
    const stride = card.getBoundingClientRect().width + parseFloat(getComputedStyle(viewport).columnGap);
    const maximum = viewport.scrollWidth - viewport.clientWidth;
    const currentStep = Math.round(viewport.scrollLeft / stride);
    const lastStep = Math.ceil(maximum / stride);
    const target = direction > 0
      ? currentStep >= lastStep ? 0 : Math.min(maximum, (currentStep + 1) * stride)
      : currentStep === 0 ? maximum : Math.max(0, (currentStep - 1) * stride);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    viewport.scrollTo({ left: target, behavior: reducedMotion ? 'instant' : 'smooth' });
  }, []);

  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const updateVisibility = () => {
      const bounds = element.getBoundingClientRect();
      const visibleHeight = Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0);
      setVisible(visibleHeight >= Math.min(bounds.height, window.innerHeight) * .35);
    };
    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);
    return () => {
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!visible || hovered || focused || paused || openedReview || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => { if (!document.hidden) advance(1); }, 5000);
    return () => clearInterval(timer);
  }, [visible, hovered, focused, paused, openedReview, advance]);

  return (
    <>
      <section
        id="customer-voice"
        className="page-container home-section customer-voice-section"
        ref={section}
        aria-labelledby="customer-voice-heading"
        aria-roledescription="carousel"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}
      >
        <h2 id="customer-voice-heading">Customer voice</h2>
        <button className="reviews-playback" onClick={() => setPaused(value => !value)} aria-label={paused ? 'Play review slideshow' : 'Pause review slideshow'}>{paused ? '▶' : 'Ⅱ'}</button>
        <div className="reviews-slider">
          <button className="review-arrow review-arrow-previous" type="button" aria-label="Previous customer reviews" onClick={() => advance(-1)}><Icon name="chevron" width={22} height={26} strokeWidth={1.7} /></button>
          <div
            className="reviews-rail"
            ref={rail}
            tabIndex={0}
            role="group"
            aria-label="Customer reviews"
            onScroll={event => {
              const viewport = event.currentTarget;
              const card = viewport.querySelector<HTMLElement>('.review-card');
              if (card) setActive(Math.round(viewport.scrollLeft / (card.getBoundingClientRect().width + parseFloat(getComputedStyle(viewport).columnGap))));
            }}
            onKeyDown={event => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault();
                advance(event.key === 'ArrowRight' ? 1 : -1);
              } else if (event.key === 'Home' || event.key === 'End') {
                event.preventDefault();
                event.currentTarget.scrollTo({ left: event.key === 'Home' ? 0 : event.currentTarget.scrollWidth, behavior: 'instant' });
              }
            }}
          >
            {reviews.map((review, index) => (
              <article className="review-card" key={review.id} role="group" aria-roledescription="slide" aria-label={`Review ${index + 1} of ${reviews.length}`}>
                <button className="review-photo-button" onClick={() => setOpenedReview(review)} aria-label={`Read the full review by ${review.author}`}>
                  <Image className="review-photo" src={review.image} alt={`Customer photo for ${review.productTitle}`} width={360} height={460} unoptimized loading="lazy" />
                </button>
                <div className="review-quote"><p>{review.body}</p></div>
                <Stars rating={review.rating} />
                <Reviewer review={review} />
                {review.productHref ? <Link className="review-product" href={review.productHref} title={review.productTitle}>{review.productTitle}</Link> : <span className="review-product" title={review.productTitle}>{review.productTitle}</span>}
              </article>
            ))}
          </div>
          <button className="review-arrow review-arrow-next" type="button" aria-label="Next customer reviews" onClick={() => advance(1)}><Icon name="chevron" width={22} height={26} strokeWidth={1.7} /></button>
        </div>
        <p className="sr-only" aria-live={focused || hovered || paused ? 'polite' : 'off'}>Showing customer reviews starting at {active + 1} of {reviews.length}.</p>
      </section>
      {openedReview && <Modal title="Customer review" onClose={() => setOpenedReview(null)}><div className="review-detail"><Image src={openedReview.image} alt={`Customer photo for ${openedReview.productTitle}`} width={480} height={600} unoptimized /><Stars rating={openedReview.rating} /><Reviewer review={openedReview} /><p>{openedReview.body}</p><span className="review-detail-product">{openedReview.productTitle}</span></div></Modal>}
    </>
  );
}
