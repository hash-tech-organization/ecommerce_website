'use client';

import Image from 'next/image';
import Link from 'next/link';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import home from '@/data/home.json';
import { navigation } from '@/lib/navigation';
import { money, type CartItem, type ProductCardData, type Variant } from '@/lib/types';
import { Icon } from './icon';
import { AddToCartButton } from './add-to-cart-button';
import { Footer } from './footer';
import { EnvelopeGift } from './envelope-gift';

type Store = { items: CartItem[]; add: (product: ProductCardData, variant: Variant, quantity?: number, openBag?: boolean) => void; update: (id: number, quantity: number) => void; clear: () => void; openCart: () => void; quickAdd: (product: ProductCardData) => void };
const StoreContext = createContext<Store | null>(null);
export function useStore() { const context = useContext(StoreContext); if (!context) throw new Error('Store provider missing'); return context; }
export type SearchProduct = { handle: string; title: string; image: string; price: number };

export function Modal({ title, onClose, side = 'center', children, className = '' }: { title: string; onClose: () => void; side?: 'left' | 'right' | 'center' | 'top'; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current; const active = document.activeElement as HTMLElement;
    dialog?.showModal(); const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { dialog?.close(); document.body.style.overflow = overflow; active?.focus(); };
  }, []);
  return <dialog ref={ref} className={`modal modal-${side} ${className}`} aria-label={title} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === ref.current) onClose(); }}>
    <div className="modal-surface"><div className="modal-heading"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close"><Icon name="close" /></button></div>{children}</div>
  </dialog>;
}

export function StoreProvider({ children, searchProducts }: { children: React.ReactNode; searchProducts: SearchProduct[] }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [panel, setPanel] = useState<'menu' | 'cart' | 'search' | null>(null);
  const [quickProduct, setQuickProduct] = useState<ProductCardData | null>(null);
  const [toast, setToast] = useState('');
  const [giftOpen, setGiftOpen] = useState(true);
  const close = useCallback(() => setPanel(null), []);
  useEffect(() => {
    try { const saved = JSON.parse(localStorage.getItem('sajiero-cart') || '[]'); if (Array.isArray(saved)) setItems(saved.filter(i => i?.product?.handle && i?.variant?.id && Number.isInteger(i.quantity) && i.quantity > 0).map(i => ({ ...i, quantity: Math.min(i.quantity, 99) }))); } catch { /* Start with an empty cart if stored data is invalid. */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) { try { localStorage.setItem('sajiero-cart', JSON.stringify(items)); } catch { /* The cart still works when browser storage is unavailable. */ } } }, [items, ready]);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(''), 3500); return () => clearTimeout(id); }, [toast]);
  const add = (product: ProductCardData, variant: Variant, quantity = 1, openBag = true) => {
    if (!variant.available) return;
    setItems(previous => { const found = previous.find(i => i.variant.id === variant.id); return found ? previous.map(i => i.variant.id === variant.id ? { ...i, quantity: Math.min(99, i.quantity + quantity) } : i) : [...previous, { product, variant, quantity: Math.min(99, Math.max(1, quantity)) }]; });
    setQuickProduct(null); if (openBag) setPanel('cart');
  };
  const update = (id: number, quantity: number) => setItems(previous => previous.map(i => i.variant.id === id ? { ...i, quantity: Math.min(99, quantity) } : i).filter(i => i.quantity > 0));
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return <StoreContext.Provider value={{ items, add, update, clear: () => setItems([]), openCart: () => setPanel('cart'), quickAdd: p => p.variants.length === 1 ? add(p, p.variants[0]) : setQuickProduct(p) }}>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="site-header"><button className="icon-button menu-trigger" aria-label="Open menu" onClick={() => setPanel('menu')}><Icon name="menu" /></button><Link href="/" className="brand" aria-label="Sajiero home"><Image src={home.logo} width={80} height={80} alt="Sajiero" preload unoptimized /></Link><div className="header-actions"><button className="icon-button" aria-label="Search" onClick={() => setPanel('search')}><Icon name="search" /></button><button className="icon-button cart-trigger" aria-label={`Shopping bag${count ? `, ${count} items` : ''}`} onClick={() => setPanel('cart')}><Icon name="bag" />{count > 0 && <span className="cart-count">{count}</span>}</button></div></header>
    {children}
    <Footer onSubscribed={() => setToast('Thank you! Your email has been saved on this device.')} />
    <button className="gift-tab" aria-label="Pick a gift envelope" onClick={() => setGiftOpen(true)}><Icon name="gift" width={16} height={16} /></button>
    {giftOpen && <EnvelopeGift onClose={() => setGiftOpen(false)} />}
    {panel === 'menu' && <Modal title="Menu" onClose={close} side="left"><nav className="drawer-navigation" aria-label="Main navigation">{navigation.map(item => <div className="nav-group" key={item.href}>{item.children.length ? <details><summary><Link href={item.href} onClick={close}>{item.title}</Link><Icon name="plus" width={16} height={16} /></summary><div className="nav-submenu">{item.children.map(child => <Link key={child.href} href={child.href} onClick={close}>{child.title}</Link>)}</div></details> : <Link className="nav-single" href={item.href} onClick={close}>{item.title}<Icon name="chevron" width={15} height={15} /></Link>}</div>)}<div className="drawer-help"><Link href="/pages/about-us" onClick={close}>About Us</Link><Link href="/pages/contact" onClick={close}>Contact us</Link><Link href="/customer_authentication/redirect?locale=en&region_country=PK" onClick={close}><Icon name="user" width={17} height={17} /> My account</Link></div></nav></Modal>}
    {panel === 'search' && <Modal title="Search" onClose={close} side="top"><SearchPanel products={searchProducts} onClose={close} /></Modal>}
    {panel === 'cart' && <Modal title={`Your bag (${count})`} onClose={close} side="right"><CartContents onClose={close} /></Modal>}
    {quickProduct && <Modal title="Choose your size" onClose={() => setQuickProduct(null)}><QuickAdd product={quickProduct} /></Modal>}
    {toast && <div className="toast" role="status"><Icon name="check" />{toast}</div>}
  </StoreContext.Provider>;
}

function SearchPanel({ products, onClose }: { products: SearchProduct[]; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const matches = query.trim() ? products.filter(p => query.toLowerCase().trim().split(/\s+/).every(w => p.title.toLowerCase().includes(w))).slice(0, 6) : [];
  return <div className="search-panel"><form action="/search" onSubmit={onClose}><div className="search-field"><Icon name="search" /><input autoFocus name="q" aria-label="Search products" placeholder="What are you looking for?" value={query} onChange={e => setQuery(e.target.value)} /><button className="icon-button" aria-label="Submit search"><Icon name="arrow" /></button></div></form>{!query.trim() ? <div className="trending"><p>Trending searches</p>{['Bras', 'PJ sets', 'Body shapers', 'Lingerie', 'Panties'].map(term => <button key={term} onClick={() => setQuery(term)}>{term}<Icon name="arrow" width={16} height={16} /></button>)}</div> : <div className="search-results">{matches.length ? matches.map(p => <Link href={`/products/${p.handle}`} onClick={onClose} key={p.handle} className="search-result"><Image src={p.image} alt={p.title} width={75} height={95} unoptimized /><span>{p.title}<small>{money(p.price)}</small></span><Icon name="arrow" width={18} height={18} /></Link>) : <p className="muted">No products found. Try a different search.</p>}<Link href={`/search?q=${encodeURIComponent(query)}`} onClick={onClose} className="text-link">View all results <Icon name="arrow" width={18} height={18} /></Link></div>}</div>;
}

function QuickAdd({ product }: { product: ProductCardData }) {
  const { add } = useStore();
  const [variantId, setVariantId] = useState(product.variants.find(v => v.available)?.id || product.variants[0].id);
  const variant = product.variants.find(v => v.id === variantId)!;
  return <div className="quick-add-content"><div className="quick-add-product"><Image src={product.images[0]} width={130} height={165} alt={product.title} unoptimized /><div><Link href={`/products/${product.handle}`}>{product.title}</Link><Price variant={variant} /></div></div><p className="field-label">Size</p><div className="size-options">{product.variants.map(v => <button key={v.id} disabled={!v.available} aria-pressed={variantId === v.id} className={variantId === v.id ? 'selected' : ''} onClick={() => setVariantId(v.id)}>{v.title === 'Default Title' ? 'One size' : v.title}</button>)}</div><AddToCartButton disabled={!variant.available} onClick={() => add(product, variant)}>{variant.available ? 'Add to cart' : 'Sold out'}</AddToCartButton><Link className="text-link" href={`/products/${product.handle}`}>View full details <Icon name="arrow" width={16} height={16} /></Link></div>;
}

export function Price({ variant }: { variant: Variant }) { return <div className="price"><span>{money(variant.price)}</span>{variant.compareAt > variant.price && <s>{money(variant.compareAt)}</s>}</div>; }

export function CartContents({ onClose }: { onClose?: () => void }) {
  const { items, update } = useStore();
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.variant.price, 0);
  if (!items.length) return <div className="empty-cart"><Icon name="bag" width={48} height={48} /><h2>Your cart is empty</h2><p>Find your next everyday favourite.</p><Link href="/collections/all" className="button button-dark" onClick={onClose}>Continue shopping</Link><p className="small">Have an account? <Link href="/customer_authentication/redirect?locale=en&region_country=PK" onClick={onClose}>Log in</Link> to check out faster.</p></div>;
  return <div className="cart-contents"><p className="cart-note"><Icon name="lock" width={16} height={16} />Your comfort, delivered discreetly.</p><div className="cart-items">{items.map(item => <div className="cart-item" key={item.variant.id}><Link href={`/products/${item.product.handle}`} onClick={onClose}><Image src={item.product.images[0]} alt={item.product.title} width={100} height={130} unoptimized /></Link><div className="cart-item-info"><Link href={`/products/${item.product.handle}`} onClick={onClose}>{item.product.title}</Link><p className="small muted">{item.variant.title === 'Default Title' ? 'One size' : item.variant.title}</p><span>{money(item.variant.price)}</span><div className="cart-item-controls"><Quantity value={item.quantity} onChange={q => update(item.variant.id, q)} min={0} /><button className="remove-link" onClick={() => update(item.variant.id, 0)}>Remove</button></div></div></div>)}</div><div className="cart-summary"><div><strong>Subtotal</strong><strong>{money(subtotal)}</strong></div><p className="small muted">Shipping calculated at checkout.</p><Link href="/checkout" className="button button-dark full-width" onClick={onClose}>Checkout <Icon name="arrow" width={18} height={18} /></Link><Link href="/cart" className="text-link" onClick={onClose}>View bag</Link></div></div>;
}

export function Quantity({ value, onChange, min = 1 }: { value: number; onChange: (n: number) => void; min?: number }) {
  return <div className="quantity"><button aria-label="Decrease quantity" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}><Icon name="minus" width={14} height={14} /></button><span aria-label="Quantity">{value}</span><button aria-label="Increase quantity" disabled={value >= 99} onClick={() => onChange(Math.min(99, value + 1))}><Icon name="plus" width={14} height={14} /></button></div>;
}
