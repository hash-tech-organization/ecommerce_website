'use client';

import Image from 'next/image';
import { useState } from 'react';
import home from '@/data/home.json';

const partners = [
  { name: 'Final Choice', image: home.partners[6] },
  { name: 'Hyder Supermarket', image: home.partners[7] },
  { name: 'Telemart', image: home.partners[8] },
  { name: 'The Skinfit', image: home.partners[0] },
  { name: 'Newway Supermart', image: home.partners[1] },
  { name: 'Naheed', image: home.partners[2] },
  { name: 'Daraz', image: home.partners[3] },
  { name: 'NICE', image: home.partners[4] },
  { name: 'TASCO Supermart', image: home.partners[5] },
];

// Each half covers wide desktop screens so the loop never reveals an empty edge.
const loopPartners = Array.from({ length: 3 }, () => partners).flat();

export function TrustedPartners() {
  const [paused, setPaused] = useState(false);

  return (
    <section id="trusted-partners" className="trusted-partners" aria-labelledby="trusted-partners-heading" data-paused={paused ? 'true' : undefined}>
      <h2 id="trusted-partners-heading" className="trusted-partners-heading">Our Trusted Partners</h2>
      <button
        className="partners-playback"
        type="button"
        aria-label={paused ? 'Resume partner logo animation' : 'Pause partner logo animation'}
        aria-pressed={paused}
        onClick={() => setPaused(value => !value)}
      >{paused ? '▶' : 'Ⅱ'}</button>
      <div className="trusted-partners-viewport">
        <div className="trusted-partners-track">
          {[0, 1].map(group => (
            <ul className="trusted-partners-group" key={group} aria-hidden={group === 1 ? true : undefined}>
              {loopPartners.map((partner, index) => (
                <li className="trusted-partner-logo" key={`${group}-${index}`} aria-hidden={index >= partners.length ? true : undefined}>
                  <Image src={partner.image} alt={group === 0 && index < partners.length ? partner.name : ''} width={200} height={200} unoptimized loading="eager" draggable={false} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
