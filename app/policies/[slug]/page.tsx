import Link from 'next/link';
import { contact } from '@/lib/contact';
import { notFound } from 'next/navigation';
import { pages } from '@/lib/content';
export function generateStaticParams() { return pages.filter(p => p.route.startsWith('/policies/')).map(p => ({ slug: p.route.split('/').pop()! })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return { title: pages.find(p => p.route === `/policies/${slug}`)?.title || 'Policy' }; }
export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const page = pages.find(p => p.route === `/policies/${slug}`); if (!page) notFound(); return <main id="main-content" className="page-container content-page policy-page"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>{page.title}</span></nav><h1>{page.title}</h1><article className="prose" dangerouslySetInnerHTML={{ __html: page.html }} />{!page.html && <div className="prose"><p>Orders are usually delivered within 3 to 5 working days across Pakistan. Contact <a href={`mailto:${contact.email}`}>{contact.email}</a> for delivery details.</p></div>}</main>; }
