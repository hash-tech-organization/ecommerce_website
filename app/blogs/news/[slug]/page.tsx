import Link from 'next/link';
import { notFound } from 'next/navigation';
import posts from '@/data/blogs.json';
export function generateStaticParams() { return posts.map(post => ({ slug: post.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return { title: posts.find(p => p.slug === slug)?.title || 'Journal' }; }
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const post = posts.find(p => p.slug === slug); if (!post) notFound(); return <main id="main-content" className="page-container content-page"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/blogs/news">Journal</Link></nav><h1>{post.title}</h1><article className="prose" dangerouslySetInnerHTML={{ __html: post.html.replace(/<!\[CDATA\[|\]\]>/g, '') }} /><div className="prose"><Link className="text-link" href="/blogs/news">← Back to journal</Link></div></main>; }
