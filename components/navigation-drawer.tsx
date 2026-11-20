'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import rawMenu from '@/data/navigation-menu.json';
import { Icon } from './icon';
import './navigation-drawer.css';

type MenuItem = {
  title: string;
  href?: string;
  image?: string;
  children?: MenuItem[];
};

const menu = rawMenu as MenuItem[];

function MenuList({ items, depth = 0, onNavigate, pathname }: {
  items: MenuItem[];
  depth?: number;
  onNavigate: () => void;
  pathname: string;
}) {
  return <ul className="navigation-drawer__list" data-depth={depth}>
    {items.map(item => {
      const hasChildren = !!item.children?.length;
      const contents = <>
        {item.image && <span className={`navigation-drawer__thumbnail${/\/\d+_/.test(item.image) ? ' navigation-drawer__thumbnail--themed' : ''}`}><Image src={item.image} alt="" width={44} height={44} unoptimized /></span>}
        <span className="navigation-drawer__label">{item.title}</span>
        {hasChildren && <svg className="navigation-drawer__chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M11 5.5L7 9.5L3 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </>;

      return <li className="navigation-drawer__item" key={item.href || item.title}>
        {hasChildren ? <details>
          <summary className="navigation-drawer__row">{contents}</summary>
          <MenuList items={item.children!} depth={depth + 1} onNavigate={onNavigate} pathname={pathname} />
        </details> : <Link className="navigation-drawer__row" href={item.href!} aria-current={pathname === item.href ? 'page' : undefined} prefetch={false} onClick={onNavigate}>{contents}</Link>}
      </li>;
    })}
  </ul>;
}

export function NavigationDrawer({ onClose, onGift }: { onClose: () => void; onGift: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closing = useRef(false);
  const [isClosing, setIsClosing] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      element?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  function requestClose() {
    if (closing.current) return;
    closing.current = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onClose();
      return;
    }
    setIsClosing(true);
    closeTimer.current = setTimeout(onClose, 200);
  }

  return <dialog
    ref={dialog}
    id="navigation-drawer"
    className="navigation-drawer"
    aria-label="Menu"
    data-closing={isClosing || undefined}
    onCancel={event => { event.preventDefault(); requestClose(); }}
    onClick={event => {
      if (event.target !== dialog.current) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) requestClose();
    }}
  >
    <svg className="navigation-drawer__theme-filter" aria-hidden="true" focusable="false"><defs><filter id="navigation-dusty-rose" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -.2126 -.7152 -.0722 1 0" result="artwork" /><feComponentTransfer in="artwork" result="mask"><feFuncA type="linear" slope="6" intercept="-.2" /></feComponentTransfer><feFlood floodColor="var(--brand)" /><feComposite in2="mask" operator="in" /></filter></defs></svg>
    <div className="navigation-drawer__header"><button className="navigation-drawer__close" type="button" aria-label="Close menu" onClick={requestClose}><Icon name="close" width={16} height={16} /></button></div>
    <div className="navigation-drawer__scroll">
      <nav className="navigation-drawer__navigation" aria-label="Main navigation"><MenuList items={menu} onNavigate={requestClose} pathname={pathname} /></nav>
    </div>
    <button className="gift-tab navigation-drawer__gift" type="button" aria-label="Pick a gift envelope" onClick={onGift}><Icon name="gift" width={16} height={16} /></button>
  </dialog>;
}
