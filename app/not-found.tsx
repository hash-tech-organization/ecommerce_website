import Link from 'next/link';
export default function NotFound() { return <main id="main-content" className="empty-state page-container"><p className="eyebrow">404</p><h1>This page has wandered off.</h1><p>There’s still something comfortable waiting for you.</p><Link href="/" className="button button-dark">Back to home</Link></main>; }
