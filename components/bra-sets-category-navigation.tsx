import Image from 'next/image';
import Link from 'next/link';
import './bra-sets-category-navigation.css';

const categories = [
  { title: 'New Arrivals', href: '/collections/bra-sets-new-arrivals', image: 'new-arrivals.jpg' },
  { title: 'Padded Bra Panty Sets', href: '/collections/padded-bra-sets', image: 'padded.webp' },
  { title: 'Non Padded Bra Panty Sets', href: '/collections/non-padded-bra-sets', image: 'non-padded.webp' },
  { title: 'Sets With Garter Belts', href: '/collections/garter-sets', image: 'garter-belts.webp' },
];

export function BraSetsCategoryNavigation() {
  return <nav className="bra-sets-category-nav" aria-label="Bra panty sets categories">
    <svg className="bra-sets-category-theme-filter" aria-hidden="true" focusable="false"><defs><filter id="bra-sets-category-dusty-rose" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -.2126 -.7152 -.0722 1 0" result="artwork" /><feComponentTransfer in="artwork" result="mask"><feFuncA type="linear" slope="2" intercept="-.2" /></feComponentTransfer><feFlood floodColor="var(--brand)" /><feComposite in2="mask" operator="in" /></filter></defs></svg>
    <ul className="bra-sets-category-list">
      {categories.map((category, index) => <li key={category.href}>
        <Link className={`bra-sets-category-link${index === 0 ? ' bra-sets-category-link--new' : ''}`} href={category.href} aria-label={category.title} prefetch={false}>
          <Image className="bra-sets-category-image" src={`/images/bra-panty-sets-header/${category.image}`} alt="" width={560} height={index === 0 ? 560 : 700} unoptimized loading="eager" />
          <Image className="bra-sets-category-label" src={`/images/bra-panty-sets-header/${category.image}`} alt="" aria-hidden="true" width={560} height={index === 0 ? 560 : 700} unoptimized loading="eager" />
        </Link>
      </li>)}
    </ul>
  </nav>;
}
