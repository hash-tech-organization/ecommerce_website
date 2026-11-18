'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Icon } from './icon';
import './envelope-gift.css';

function Envelope({ opened }: { opened: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M2 23 32 3l30 20v34a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V23Z" fill="#F5D7A8" />
      <g className={`envelope-gift-letter ${opened ? 'envelope-gift-letter-revealed' : ''}`}>
        <rect x="12" y="17" width="40" height="34" rx="3" fill="#FFF7E9" />
        <path d="M32 39s-10-6-10-12a5.5 5.5 0 0 1 10-3 5.5 5.5 0 0 1 10 3c0 6-10 12-10 12Z" fill="#A04767" />
      </g>
      <path d="M2 23 32 45l30-22v34a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V23Z" fill="#FFE5BD" />
      <path d="m2 23 30 22 30-22" stroke="#DE8C3B" strokeWidth="1.5" strokeLinejoin="round" />
      {!opened && <circle cx="32" cy="21" r="4.5" fill="#DD8B3B" />}
    </svg>
  );
}

export function EnvelopeGift({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';

    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="envelope-gift-dialog"
      aria-labelledby="envelope-title"
      aria-describedby="envelope-description"
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => { if (event.target === dialogRef.current) onClose(); }}
    >
      <div className={`envelope-gift-content ${selected !== null ? 'envelope-gift-has-selected' : ''}`}>
        <button type="button" className="envelope-gift-close" onClick={onClose} aria-label="Close gift popup">
          <Icon name="close" width={12} height={12} />
        </button>

        <header className="envelope-gift-header">
          <h2 id="envelope-title">Pick an envelope</h2>
          <p id="envelope-description">One of them is hiding your gift</p>
        </header>

        <div className="envelope-gift-envelopes" aria-label="Choose an envelope">
          {[0, 1, 2].map(index => (
            <button
              key={index}
              type="button"
              className={`envelope-gift-envelope ${selected === index ? 'envelope-gift-selected' : ''} ${selected !== null && selected !== index ? 'envelope-gift-unselected' : ''}`}
              aria-label={`Open envelope ${index + 1}`}
              aria-pressed={selected === index}
              disabled={selected !== null}
              onClick={() => setSelected(index)}
            >
              <Envelope opened={selected === index} />
            </button>
          ))}
        </div>

        <div className="envelope-gift-reveal" role="status" aria-live="polite">
          {selected !== null && (
            <>
              <h3>A little something for you</h3>
              <p>Discover the little extras that make every day special.</p>
              <Link href="/collections/sajiero-accessories-premium-quality" className="envelope-gift-explore" onClick={onClose}>
                Explore gifts <Icon name="arrow" width={15} height={15} />
              </Link>
            </>
          )}
        </div>

        <p className="envelope-gift-hint">{selected === null ? 'Tap an envelope to open it' : 'A little joy, just for you'}</p>
      </div>
    </dialog>
  );
}
