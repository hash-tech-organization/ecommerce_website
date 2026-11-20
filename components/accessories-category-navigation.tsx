import Image from 'next/image';
import Link from 'next/link';
import './accessories-category-navigation.css';

const categories = [
  { title: 'Nipple Pasties & Body Tapes', href: '/collections/silicone-nipple-covers-pakistan', image: 'nipple-pasties-body-tapes.webp' },
  { title: 'Gift Packaging', href: '/collections/sj-gift-box', image: 'gift-packaging.webp' },
];

export function AccessoriesCategoryNavigation() {
  return <nav className="accessories-category-nav" aria-label="Accessories categories">
    <svg className="accessories-category-theme-filter" aria-hidden="true" focusable="false"><defs><filter id="accessories-category-dusty-rose" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -.2126 -.7152 -.0722 1 0" result="artwork" /><feComponentTransfer in="artwork" result="mask"><feFuncA type="linear" slope="2" intercept="-.2" /></feComponentTransfer><feFlood floodColor="var(--brand)" /><feComposite in2="mask" operator="in" /></filter></defs></svg>
    <ul className="accessories-category-list">
      {categories.map(category => <li key={category.href}>
        <Link className="accessories-category-link" href={category.href} aria-label={category.title} prefetch={false}>
          <Image className="accessories-category-image" src={`/images/accessories-header/${category.image}`} alt="" width={560} height={700} unoptimized loading="eager" />
          <Image className="accessories-category-label" src={`/images/accessories-header/${category.image}`} alt="" aria-hidden="true" width={560} height={700} unoptimized loading="eager" />
        </Link>
      </li>)}
    </ul>
  </nav>;
}
