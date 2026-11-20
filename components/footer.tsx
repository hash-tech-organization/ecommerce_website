'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { contact } from '@/lib/contact';
import { Icon } from './icon';

const groups = [
  {
    title: 'Shop',
    links: [
      { title: 'New Arrivals 🔥', href: '/collections/new-arrivals' },
      { title: 'Winter Collection ❄️', href: '/collections/winter-collection-sajiero' },
      { title: 'Clearance 🚨', href: '/collections/sajiero-clearance-items' },
      { title: 'PJ Sets', href: '/collections/women-pajama-sets-nightwear-pakistan' },
      { title: 'Bras', href: '/collections/bras-in-pakistan' },
      { title: 'Panties', href: '/collections/women-panties-underwear-pakistan' },
    ],
  },
  {
    title: 'Discover',
    links: [
      { title: "FAQ's", href: '/pages/faqs' },
      { title: 'Bra Size Calculator', href: '/pages/bra-size-calculator' },
      { title: 'Period Tracker', href: '/pages/women-period-tracker-in-pakistan' },
      { title: 'Blogs', href: '/blogs/news' },
      { title: 'Veloura Affiliates', href: '/pages/sajiero-affiliates' },
    ],
  },
  {
    title: 'Help & Support',
    links: [
      { title: 'Return and Exchange', href: '/policies/refund-policy' },
      { title: 'About Us', href: '/pages/about-us' },
      { title: 'Terms of service', href: '/policies/terms-of-service' },
      { title: 'Privacy Policy', href: '/pages/privacy-policy' },
    ],
  },
];

const socials = [
  { label: 'Instagram', icon: 'instagram' },
  { label: 'Facebook', icon: 'facebook' },
  { label: 'TikTok', icon: 'tiktok' },
  { label: 'YouTube', icon: 'youtube' },
];

export function Footer({ onSubscribed }: { onSubscribed: () => void }) {
  const [subscribed, setSubscribed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 749px)');
    const update = () => setMobile(query.matches);
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const toggle = (title: string) => setExpanded(current => current.includes(title) ? current.filter(value => value !== title) : [...current, title]);

  return (
    <footer id="site-footer" className="site-footer">
      <div className="footer-inner">
        <div className="footer-newsletter">
          <div className="footer-newsletter-copy">
            <h2>Join the<br />Veloura family</h2>
            <p>Get new arrivals, fit guides and members-only offers delivered straight to your inbox.</p>
          </div>
          <form
            className="footer-newsletter-form"
            aria-label="Join the Veloura family"
            onSubmit={event => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              try { localStorage.setItem('sajiero-newsletter', String(data.get('email'))); } catch { /* Keep the form usable when storage is unavailable. */ }
              setSubscribed(true);
              onSubscribed();
            }}
          >
            <div className="footer-newsletter-field">
              <input type="email" name="email" placeholder="Email address" aria-label="Email address" autoComplete="email" autoCapitalize="none" spellCheck={false} required disabled={subscribed} />
              <button type="submit" disabled={subscribed}>{subscribed ? 'Email saved ✓' : 'Join the family'}</button>
            </div>
            <p className="footer-newsletter-disclaimer">By subscribing, you agree to receive Veloura updates and offers. You can unsubscribe anytime.</p>
          </form>
        </div>

        <div className="footer-main">
          <nav className="footer-socials" aria-label="Follow Veloura">
            {socials.map(social => (
              <a key={social.label} href="#" aria-label={social.label} aria-disabled="true" onClick={event => event.preventDefault()}>
                <Icon name={social.icon} viewBox="0 0 20 20" width={14} height={14} fill="currentColor" stroke="none" />
              </a>
            ))}
          </nav>
          {groups.map(group => (
            <nav className="footer-link-group" aria-label={group.title} key={group.title}>
              <h3>{mobile ? <button className="footer-group-toggle" aria-expanded={expanded.includes(group.title)} aria-controls={`footer-${group.title.replace(/\W/g, '')}`} onClick={() => toggle(group.title)}>{group.title}<Icon name={expanded.includes(group.title) ? 'minus' : 'plus'} width={14} height={14} /></button> : group.title}</h3>
              <ul id={`footer-${group.title.replace(/\W/g, '')}`} hidden={mobile && !expanded.includes(group.title)}>{group.links.map(link => <li key={link.href}><Link href={link.href}>{link.title}</Link></li>)}</ul>
            </nav>
          ))}
          <div className="footer-link-group footer-contact">
            <h3>{mobile ? <button className="footer-group-toggle" aria-expanded={expanded.includes('Contact')} aria-controls="footer-contact" onClick={() => toggle('Contact')}>Contact Us<Icon name={expanded.includes('Contact') ? 'minus' : 'plus'} width={14} height={14} /></button> : 'Contact Us'}</h3>
            <ul id="footer-contact" hidden={mobile && !expanded.includes('Contact')}>
              <li><a href="#" aria-disabled="true" onClick={event => event.preventDefault()}>{contact.phone} / {contact.landline}</a></li>
              <li><a href={`mailto:${contact.email}`}>{contact.email}</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-copyright"><p>© 2026 <Link href="/">Veloura</Link>. All rights reserved.</p></div>
      </div>
    </footer>
  );
}
