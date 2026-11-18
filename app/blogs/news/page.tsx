import Image from 'next/image';
import Link from 'next/link';
import posts from '@/data/blogs.json';
import { Icon } from '@/components/icon';
export const metadata = { title: 'News' };
export default function BlogPage() { return <main id="main-content" className="page-container content-page" style={{ maxWidth: 1400 }}><div className="collection-heading"><h1>News</h1><p>Fit guides, everyday essentials and a little inspiration.</p></div><div className="blog-grid">{posts.map(post => <article className="blog-card" key={post.slug}><Link href={`/blogs/news/${post.slug}`}><Image src={post.image} width={700} height={500} alt={post.title} unoptimized /><h2>{post.title}</h2></Link><p>{post.excerpt.replace(/<!\[CDATA\[/g, '')}…</p><Link className="text-link" href={`/blogs/news/${post.slug}`}>Read more <Icon name="arrow" width={16} height={16} /></Link></article>)}</div></main>; }
