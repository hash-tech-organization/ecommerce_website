import type { Metadata } from 'next';
import { StoreProvider } from '@/components/store';
import { products } from '@/lib/catalog';
import './globals.css';
import '@/components/product-carousel.css';
import '@/components/storefront.css';
import '@/components/awards.css';
import '@/components/footer.css';
import '@/components/customer-voice.css';
import '@/components/trusted-partners.css';

export const metadata: Metadata = {
  title: { default: 'Sajiero | Lingerie, Nightwear & Everyday Comfort', template: '%s | Sajiero' },
  description: 'Discover Sajiero’s PJ sets, bras, lingerie, body shapers and everyday essentials. Thoughtfully made for your comfort.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const searchProducts = products.map(p => ({ handle: p.handle, title: p.title, image: p.images[0], price: p.variants[0]?.price || 0 }));
  return <html lang="en" data-scroll-behavior="smooth"><body><StoreProvider searchProducts={searchProducts}>{children}</StoreProvider></body></html>;
}
