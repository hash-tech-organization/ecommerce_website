import { placeholderContactHtml, placeholderContactText } from './contact';

export const brandName = 'Veloura';

export function brandText(text: string) {
  return placeholderContactText(text.replace(/\bSajiero\b/g, brandName));
}

// Keep page, product and media links while updating brand copy and contact placeholders.
export function brandHtml(html: string) {
  return placeholderContactHtml(html.split(/(<[^>]*>)/g).map((part, index) => index % 2 ? part : brandText(part)).join(''));
}
