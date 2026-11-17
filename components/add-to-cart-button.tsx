'use client';

import type { ButtonHTMLAttributes } from 'react';

export function AddToCartButton({ children = 'Add to cart', className = '', type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={`add-to-cart-button ${className}`.trim()} {...props}>{children}</button>;
}
