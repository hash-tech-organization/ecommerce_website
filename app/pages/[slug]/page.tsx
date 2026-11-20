import Link from 'next/link';
import { notFound } from 'next/navigation';
import { pages } from '@/lib/content';
import { Faq } from '@/components/home';
import { ContactForm } from '@/components/forms';
import { PeriodTracker } from '@/components/period-tracker';
import { BraCalculator } from '@/components/bra-calculator';
import { cardData, getCollection } from '@/lib/catalog';
import { contact } from '@/lib/contact';
const custom = new Map([['faqs', "FAQ's"], ['contact', 'Contact Us'], ['bra-size-calculator', 'Bra Size Calculator'], ['women-period-tracker-in-pakistan', 'Women Period Tracker In Pakistan'], ['sajiero-affiliates', 'Veloura Affiliates']]);
export function generateStaticParams() { return [...new Set([...pages.filter(p => p.route.startsWith('/pages/')).map(p => p.route.split('/').pop()!), ...custom.keys()])].map(slug => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return { title: pages.find(p => p.route === `/pages/${slug}`)?.title || custom.get(slug) || 'Veloura' }; }
export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const page = pages.find(p => p.route === `/pages/${slug}`); const title = page?.title || custom.get(slug);
  if (!title) notFound();
  return <main id="main-content" className="page-container content-page"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>{title}</span></nav><h1>{title}</h1>{slug === 'faqs' ? <div className="prose"><Faq /></div> : slug === 'contact' ? <div className="contact-grid"><div className="contact-details"><h2>We’re here to help.</h2><p>Need help with your fit, an order, or a product? Get in touch with the Veloura team.</p><a aria-disabled="true">{contact.phone}</a><a aria-disabled="true">{contact.landline}</a><a href={`mailto:${contact.email}`}>{contact.email}</a></div><ContactForm /></div> : slug === 'bra-size-calculator' ? <BraCalculator products={getCollection('bras-in-pakistan').products.map(cardData)} /> : slug === 'women-period-tracker-in-pakistan' ? <PeriodTracker /> : slug === 'sajiero-affiliates' ? <div className="prose"><h2>Be part of the Veloura family</h2><p>Interested in working with Veloura? Contact our team to learn about affiliate and collaboration opportunities.</p><a className="button button-dark" href={`mailto:${contact.email}?subject=Veloura%20Affiliate%20Enquiry`}>Get in touch</a></div> : <article className="prose" dangerouslySetInnerHTML={{ __html: page?.html || '' }} />}</main>;
}
