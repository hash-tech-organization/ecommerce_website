'use client';

import Image from 'next/image';
import Link from 'next/link';
import home from '@/data/home.json';
import './site-header.css';

type SiteHeaderProps = {
  count: number;
  menuOpen: boolean;
  searchOpen: boolean;
  cartOpen: boolean;
  onMenu: () => void;
  onSearch: () => void;
  onCart: () => void;
};

export function SiteHeader({ count, menuOpen, searchOpen, cartOpen, onMenu, onSearch, onCart }: SiteHeaderProps) {
  return <header className="site-header store-header">
    <button className="icon-button menu-trigger" type="button" aria-label="Open menu" aria-expanded={menuOpen} aria-controls="navigation-drawer" onClick={onMenu}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 3.5H13M1 10.5H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
    </button>
    <Link href="/" className="brand" aria-label="Veloura home"><Image src={home.logo} width={2172} height={724} alt="Veloura" preload unoptimized /></Link>
    <div className="header-actions">
      <button className="icon-button" type="button" aria-label="Search" aria-haspopup="dialog" aria-expanded={searchOpen} onClick={onSearch}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.5" /><path d="m12.5 12.5 3.25 3.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
      <button className="icon-button cart-trigger" type="button" aria-label={`Shopping bag${count ? `, ${count} items` : ''}`} aria-haspopup="dialog" aria-expanded={cartOpen} onClick={onCart}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.392 6.875h13.216v8.016c0 .567-.224 1.112-.624 1.513-.4.402-.941.627-1.506.627H5.522a2.13 2.13 0 0 1-1.506-.627 2.15 2.15 0 0 1-.624-1.513zM8.818 2.969h2.333c.618 0 1.211.247 1.649.686a2.35 2.35 0 0 1 .683 1.658v1.562H6.486V5.313c0-.622.246-1.218.683-1.658a2.33 2.33 0 0 1 1.65-.686" /></svg>
        {count > 0 && <span className="cart-count">{count}</span>}
      </button>
    </div>
  </header>;
}
