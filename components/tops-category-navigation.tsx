import Image from 'next/image';
import Link from 'next/link';
import './tops-category-navigation.css';

const categories = [
  { title: 'Camisoles', href: '/collections/camisole-in-pakistan', image: 'camisoles.webp' },
  { title: 'T-Shirts', href: '/collections/t-shirts-for-women', image: 't-shirts.webp' },
  { title: 'Tank Top', href: '/collections/tank-tops-for-women-girls-pakistan', image: 'tank-top.webp' },
  { title: 'Bralettes', href: '/collections/bralette-bra-for-women-pakistan', image: 'bralettes.webp' },
];

export function TopsCategoryNavigation() {
  return <nav className="tops-category-nav" aria-label="Tops categories">
    <svg className="tops-category-theme-filter" aria-hidden="true" focusable="false"><defs><filter id="tops-category-dusty-rose" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -.2126 -.7152 -.0722 1 0" result="artwork" /><feComponentTransfer in="artwork" result="mask"><feFuncA type="linear" slope="2" intercept="-.2" /></feComponentTransfer><feFlood floodColor="var(--brand)" /><feComposite in2="mask" operator="in" /></filter></defs></svg>
    <ul className="tops-category-list">
      {categories.map(category => <li key={category.href}>
        <Link className="tops-category-link" href={category.href} aria-label={category.title} prefetch={false}>
          <Image className="tops-category-image" src={`/images/tops-header/${category.image}`} alt="" width={560} height={700} unoptimized loading="eager" />
          <Image className="tops-category-label" src={`/images/tops-header/${category.image}`} alt="" aria-hidden="true" width={560} height={700} unoptimized loading="eager" />
        </Link>
      </li>)}
    </ul>
  </nav>;
}
