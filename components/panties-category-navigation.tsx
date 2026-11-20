import Image from 'next/image';
import Link from 'next/link';
import './panties-category-navigation.css';

const categories = [
  { title: 'New Arrivals', href: '/collections/sajiero-panties-new-arrivals', image: 'new-arrivals.jpg' },
  { title: 'Cotton Panties', href: '/collections/cotton-underwear-women-pakistan', image: 'cotton.webp' },
  { title: 'Lace Panties', href: '/collections/net-panties-ladies-underwear', image: 'lace.webp' },
  { title: 'Bikini', href: '/collections/bikni-panty', image: 'bikini.webp' },
  { title: 'Brief Panty', href: '/collections/womens-briefs-panties', image: 'brief.webp' },
  { title: 'Thongs', href: '/collections/thong-panties-for-women', image: 'thongs.webp' },
  { title: 'Hipster', href: '/collections/hipster-panty', image: 'hipster.webp' },
];

export function PantiesCategoryNavigation() {
  return <nav className="panties-category-nav" aria-label="Panties categories">
    <svg className="panties-category-theme-filter" aria-hidden="true" focusable="false"><defs><filter id="panties-category-dusty-rose" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -.2126 -.7152 -.0722 1 0" result="artwork" /><feComponentTransfer in="artwork" result="mask"><feFuncA type="linear" slope="2" intercept="-.2" /></feComponentTransfer><feFlood floodColor="var(--brand)" /><feComposite in2="mask" operator="in" /></filter></defs></svg>
    <ul className="panties-category-list">
      {categories.map((category, index) => <li key={category.href}>
        <Link className={`panties-category-link${index === 0 ? ' panties-category-link--new' : ''}`} href={category.href} aria-label={category.title} prefetch={false}>
          <Image className="panties-category-image" src={`/images/panties-header/${category.image}`} alt="" width={560} height={index === 0 ? 560 : 700} unoptimized loading="eager" />
          <Image className="panties-category-label" src={`/images/panties-header/${category.image}`} alt="" aria-hidden="true" width={560} height={index === 0 ? 560 : 700} unoptimized loading="eager" />
        </Link>
      </li>)}
    </ul>
  </nav>;
}
