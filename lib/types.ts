export type Variant = { id: number; title: string; price: number; compareAt: number; available: boolean; options: string[] };
export type Product = { id: number; handle: string; title: string; description: string; type: string; tags: string[]; createdAt?: string; active?: boolean; imageAspectRatio?: number; images: string[]; options: { name: string; values: string[] }[]; variants: Variant[] };
export type ProductCardData = Pick<Product, 'id' | 'handle' | 'title' | 'images' | 'variants' | 'options'> & { isNew?: boolean };
export type CartItem = { product: ProductCardData; variant: Variant; quantity: number };
export const money = (value: number) => `Rs.${Math.round(value).toLocaleString('en-PK')}`;
