import Image from 'next/image';
import home from '@/data/home.json';

const awards = [
  { title: 'Brand Of the Year 2025', caption: 'National Brand Of The Year' },
  { title: 'Best Lingerie & UGs', caption: 'Global Digital Awards' },
  { title: 'Cohort 13 Graduation', caption: 'National Incubation Center Karachi' },
  { title: '10,000+ Prepaid Orders', caption: 'Recognition From Shopify' },
];

export function AwardsSection() {
  return (
    <section id="sajiero-awards" className="page-container home-section awards-section" aria-labelledby="sajiero-awards-heading">
      <h2 id="sajiero-awards-heading">Sajiero Awards</h2>
      <div className="awards-grid">
        {awards.map((award, index) => (
          <article className="award-card" key={award.title}>
            <div className="award-card-media">
              <Image src={home.awards[index]} alt={award.title} width={600} height={600} unoptimized loading="lazy" />
            </div>
            <div className="award-card-copy">
              <h3>{award.title}</h3>
              <p>{award.caption}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
