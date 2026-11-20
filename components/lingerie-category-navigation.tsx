import Image from 'next/image';
import Link from 'next/link';
import './lingerie-category-navigation.css';

const categories = [
  { title: 'New Arrivals', href: '/collections/lingerie-new-arrivals', image: 'new-arrivals.jpg' },
  { title: 'Gown Sets', href: '/collections/sexy-night-dresses-pakistan', image: 'gown-sets.webp' },
  { title: 'Slips', href: '/collections/inner-slips-for-women', image: 'slips.webp' },
  { title: 'Cami Sets', href: '/collections/cami-sets', image: 'cami-sets.webp' },
  { title: 'Bodysuits', href: '/collections/body-suits-for-women-pakistan', image: 'bodysuits.webp' },
];

export function LingerieCategoryNavigation() {
  return <nav className="lingerie-category-nav" aria-label="Lingerie categories">
    <svg className="lingerie-category-theme-filter" aria-hidden="true" focusable="false"><defs><filter id="lingerie-category-dusty-rose" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -.2126 -.7152 -.0722 1 0" result="artwork" /><feComponentTransfer in="artwork" result="mask"><feFuncA type="linear" slope="2" intercept="-.2" /></feComponentTransfer><feFlood floodColor="var(--brand)" /><feComposite in2="mask" operator="in" /></filter></defs></svg>
    <ul className="lingerie-category-list">
      {categories.map((category, index) => <li key={category.href}>
        <Link className={`lingerie-category-link${index === 0 ? ' lingerie-category-link--new' : ''}`} href={category.href} aria-label={category.title} prefetch={false}>
          <Image className="lingerie-category-image" src={`/images/lingerie-header/${category.image}`} alt="" width={560} height={index === 0 ? 560 : 700} unoptimized loading="eager" />
          <Image className="lingerie-category-label" src={`/images/lingerie-header/${category.image}`} alt="" aria-hidden="true" width={560} height={index === 0 ? 560 : 700} unoptimized loading="eager" />
        </Link>
      </li>)}
    </ul>
  </nav>;
}
