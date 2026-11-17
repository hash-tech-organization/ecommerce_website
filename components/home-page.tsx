import Image from 'next/image';
import Link from 'next/link';
import home from '@/data/home.json';
import { homeTabs } from '@/lib/catalog';
import { Hero, ProductCarousel, Faq } from '@/components/home';
import { AwardsSection } from '@/components/awards';
import { CustomerVoice } from '@/components/customer-voice';
import { TrustedPartners } from '@/components/trusted-partners';

export default function HomePage() {
  return <main id="main-content">
    <h1 className="sr-only">Sajiero — Made for your comfort</h1>
    <Hero />
    <ProductCarousel title="Most Loved Designs" tabs={homeTabs('bestselling')} />
    <section className="page-container category-tiles" aria-label="Shop by category">{home.categories.map((tile, i) => <Link href={tile.href} key={tile.href}><Image src={tile.image} alt={['Body Shapers', 'Bras', 'PJ Sets', 'Lingerie', 'Panties', 'Tops', 'Bottoms', 'Bra Panty Sets'][i]} width={900} height={1157} unoptimized loading="lazy" /></Link>)}</section>
    <ProductCarousel title="New Arrivals" tabs={homeTabs('new_arrivals')} />
    <TrustedPartners />
    <section className="page-container home-section"><h2>Featured Categories</h2><div className="featured-grid">{home.featured.map((tile, i) => <Link href={tile.href} key={tile.href}><Image src={tile.image} alt={['Seamless Bras', 'Fusion', 'Nightgowns', 'Cami Sets'][i]} width={1000} height={1250} unoptimized loading="lazy" /></Link>)}</div></section>
    <CustomerVoice />
    <section className="page-container home-section social-proof-section" aria-label="Sajiero in numbers"><div className="social-stats"><div><span>Customers served</span><strong>200k+</strong></div><div><span>Average rating</span><strong>4.8/5</strong></div><div><span>Years</span><strong>5+</strong></div></div></section>
    <section id="promises" className="page-container home-section promises-section" aria-labelledby="promises-heading">
      <h2 id="promises-heading">Promises</h2>
      <div className="promises-grid">
        {home.promises.map((src, i) => (
          <div className="promise-card" key={src}>
            <Image src={src} alt={['Discreet Packaging', 'Fast Shipping', 'Hassle Free Return & Exchange Policy'][i]} width={1200} height={1200} unoptimized loading="lazy" />
          </div>
        ))}
      </div>
    </section>
    <AwardsSection />
    <section className="page-container home-section faq-section"><div className="faq-photo"><Image src={home.faqImage} alt="Everyday comfort with Sajiero" width={1200} height={1200} unoptimized loading="lazy" /></div><div className="faq-content"><h2>Frequently Asked Questions</h2><Faq /></div></section>
  </main>;
}
