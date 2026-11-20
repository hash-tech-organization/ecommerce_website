import Image from 'next/image';
import Link from 'next/link';
import './bottoms-category-navigation.css';

const categories = [
  { title: 'Trousers', href: '/collections/trousers-and-shorts-for-women-pakistan', image: 'trousers.webp' },
  { title: 'Shorts', href: '/collections/shorts-for-women-online-pakistan', image: 'shorts.webp' },
  { title: 'Printed Trousers', href: '/collections/printed-trousers', image: 'printed-trousers.webp' },
  { title: 'Fleece Trouser', href: '/collections/winter-trousers', image: 'fleece-trouser.webp' },
];

export function BottomsCategoryNavigation() {
  return <nav className="bottoms-category-nav" aria-label="Bottoms categories">
    <svg className="bottoms-category-theme-filter" aria-hidden="true" focusable="false"><defs><filter id="bottoms-category-dusty-rose" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -.2126 -.7152 -.0722 1 0" result="artwork" /><feComponentTransfer in="artwork" result="mask"><feFuncA type="linear" slope="2" intercept="-.2" /></feComponentTransfer><feFlood floodColor="var(--brand)" /><feComposite in2="mask" operator="in" /></filter></defs></svg>
    <ul className="bottoms-category-list">
      {categories.map(category => <li key={category.href}>
        <Link className="bottoms-category-link" href={category.href} aria-label={category.title} prefetch={false}>
          <Image className="bottoms-category-image" src={`/images/bottoms-header/${category.image}`} alt="" width={560} height={700} unoptimized loading="eager" />
          <Image className="bottoms-category-label" src={`/images/bottoms-header/${category.image}`} alt="" aria-hidden="true" width={560} height={700} unoptimized loading="eager" />
        </Link>
      </li>)}
    </ul>
  </nav>;
}
