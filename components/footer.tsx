'use client';

import Link from 'next/link';
import { useState } from 'react';
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
      { title: 'Sajiero Affiliates', href: '/pages/sajiero-affiliates' },
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
  { label: 'Instagram', icon: 'instagram', href: 'https://www.instagram.com/sajiero/' },
  { label: 'Facebook', icon: 'facebook', href: 'https://www.facebook.com/sajierosc' },
  { label: 'TikTok', icon: 'tiktok', href: 'https://www.tiktok.com/@sajiero_secrets' },
  { label: 'YouTube', icon: 'youtube', href: 'https://www.youtube.com/@Sajiero_Secrets' },
];

export function Footer({ onSubscribed }: { onSubscribed: () => void }) {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer id="site-footer" className="site-footer">
      <div className="footer-inner">
        <div className="footer-newsletter">
          <div className="footer-newsletter-copy">
            <h2>Join the<br />Sajiero family</h2>
            <p>Get new arrivals, fit guides and members-only offers delivered straight to your inbox.</p>
          </div>
          <form
            className="footer-newsletter-form"
            aria-label="Join the Sajiero family"
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
            <p className="footer-newsletter-disclaimer">By subscribing, you agree to receive Sajiero updates and offers. You can unsubscribe anytime.</p>
          </form>
        </div>

        <div className="footer-main">
          <nav className="footer-socials" aria-label="Follow Sajiero">
            {socials.map(social => (
              <a key={social.label} href={social.href} aria-label={social.label} target="_blank" rel="noopener noreferrer">
                <Icon name={social.icon} viewBox="0 0 20 20" width={14} height={14} fill="currentColor" stroke="none" />
              </a>
            ))}
          </nav>
          {groups.map(group => (
            <nav className="footer-link-group" aria-label={group.title} key={group.title}>
              <h3>{group.title}</h3>
              <ul>{group.links.map(link => <li key={link.href}><Link href={link.href}>{link.title}</Link></li>)}</ul>
            </nav>
          ))}
          <div className="footer-link-group footer-contact">
            <h3>Contact Us</h3>
            <ul>
              <li><a href="tel:+923397254376">+92 339 7254376 / 021-38381029</a></li>
              <li><a href="mailto:comfort@sajiero.com">comfort@sajiero.com</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-copyright"><p>© 2026 <Link href="/">Sajiero</Link>. All rights reserved.</p></div>
      </div>
    </footer>
  );
}
