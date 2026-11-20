import Image from 'next/image';
import Link from 'next/link';
import './stockings-category-navigation.css';

const categories = [
  { title: 'New Arrivals', href: '/collections/bodystocking-lingerie-new-arrival', image: 'new-arrivals.jpg' },
  { title: 'Full Body Stockings', href: '/collections/full-bodystocking-lingerie', image: 'full-body.webp' },
  { title: 'Half Body Stockings', href: '/collections/half-bodystocking-lingerie', image: 'half-body.webp' },
  { title: 'Leg Stockings', href: '/collections/leg-stocking-pakistan', image: 'leg-stockings.webp' },
];

export function StockingsCategoryNavigation() {
  return <nav className="stockings-category-nav" aria-label="Stockings categories">
    <svg className="stockings-category-theme-filter" aria-hidden="true" focusable="false"><defs><filter id="stockings-category-dusty-rose" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -.2126 -.7152 -.0722 1 0" result="artwork" /><feComponentTransfer in="artwork" result="mask"><feFuncA type="linear" slope="2" intercept="-.2" /></feComponentTransfer><feFlood floodColor="var(--brand)" /><feComposite in2="mask" operator="in" /></filter></defs></svg>
    <ul className="stockings-category-list">
      {categories.map((category, index) => <li key={category.href}>
        <Link className={`stockings-category-link${index === 0 ? ' stockings-category-link--new' : ''}`} href={category.href} aria-label={category.title} prefetch={false}>
          <Image className="stockings-category-image" src={`/images/stockings-header/${category.image}`} alt="" width={560} height={index === 0 ? 560 : 700} unoptimized loading="eager" />
          <Image className="stockings-category-label" src={`/images/stockings-header/${category.image}`} alt="" aria-hidden="true" width={560} height={index === 0 ? 560 : 700} unoptimized loading="eager" />
        </Link>
      </li>)}
    </ul>
  </nav>;
}
