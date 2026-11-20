import 'server-only';
import rawPages from '@/data/pages.json';
import rawPosts from '@/data/blogs.json';
import { brandHtml, brandText } from './brand';

export const pages = rawPages.map(page => ({ ...page, title: brandText(page.title), html: brandHtml(page.html) }));
export const posts = rawPosts.map(post => ({ ...post, title: brandText(post.title), excerpt: brandText(post.excerpt), html: brandHtml(post.html) }));
