import Link from 'next/link';
import { notFound } from 'next/navigation';
import pages from '@/data/pages.json';
import { Faq } from '@/components/home';
import { BraCalculator, ContactForm, PeriodTracker } from '@/components/forms';
const custom = new Map([['faqs', 'Frequently Asked Questions'], ['contact', 'Contact Us'], ['bra-size-calculator', 'Bra Size Calculator'], ['women-period-tracker-in-pakistan', 'Period Tracker'], ['sajiero-affiliates', 'Sajiero Affiliates']]);
export function generateStaticParams() { return [...new Set([...pages.filter(p => p.route.startsWith('/pages/')).map(p => p.route.split('/').pop()!), ...custom.keys()])].map(slug => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return { title: custom.get(slug) || pages.find(p => p.route === `/pages/${slug}`)?.title || 'Sajiero' }; }
export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const page = pages.find(p => p.route === `/pages/${slug}`); const title = custom.get(slug) || page?.title;
  if (!title) notFound();
  return <main id="main-content" className="page-container content-page"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>{title}</span></nav><h1>{title}</h1>{slug === 'faqs' ? <div className="prose"><Faq /></div> : slug === 'contact' ? <div className="contact-grid"><div className="contact-details"><h2>We’re here to help.</h2><p>Need help with your fit, an order, or a product? Get in touch with the Sajiero team.</p><a href="tel:+923397254376">+92 339 7254376</a><a href="tel:02138381029">021-38381029</a><a href="mailto:comfort@sajiero.com">comfort@sajiero.com</a></div><ContactForm /></div> : slug === 'bra-size-calculator' ? <BraCalculator /> : slug === 'women-period-tracker-in-pakistan' ? <PeriodTracker /> : slug === 'sajiero-affiliates' ? <div className="prose"><h2>Be part of the Sajiero family</h2><p>Interested in working with Sajiero? Contact our team to learn about affiliate and collaboration opportunities.</p><a className="button button-dark" href="mailto:comfort@sajiero.com?subject=Sajiero%20Affiliate%20Enquiry">Get in touch</a></div> : <article className="prose" dangerouslySetInnerHTML={{ __html: page?.html || '' }} />}</main>;
}
