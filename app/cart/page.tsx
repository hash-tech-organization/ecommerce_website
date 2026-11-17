import { CartContents } from '@/components/store';
export const metadata = { title: 'Your bag' };
export default function CartPage() { return <main id="main-content" className="page-container cart-page"><h1>Your shopping bag</h1><CartContents /></main>; }
