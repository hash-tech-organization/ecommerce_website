export const contact = {
  email: 'hello@veloura.example',
  phone: '+92 300 0000000',
  landline: '021-00000000',
};

export function placeholderContactText(text: string) {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, contact.email)
    .replace(/\+92[\s()-]*(?:\d[\s()-]*){9}\d/g, value => value.replace(/\D/g, '').startsWith('9221') ? '+92 21 00000000' : contact.phone)
    .replace(/\b021[\s-]?\d{8}\b/g, contact.landline)
    .replace(/\b03\d{2}[\s-]?\d{7}\b/g, '0300 0000000');
}

// Only contact destinations change; product/page links and media attributes stay intact.
export function placeholderContactHtml(html: string) {
  return html.split(/(<[^>]*>)/g).map((part, index) => {
    if (index % 2 === 0) return placeholderContactText(part);
    return part.replace(/\bhref\s*=\s*(["'])(.*?)\1/gi, (attribute, quote: string, href: string) => {
      if (/^mailto:/i.test(href)) return `href=${quote}mailto:${contact.email}${href.includes('?') ? href.slice(href.indexOf('?')) : ''}${quote}`;
      if (/^tel:/i.test(href) || /^https?:\/\/(?:www\.)?(?:wa\.me|(?:api\.|web\.)?whatsapp\.com|instagram\.com|facebook\.com|tiktok\.com|(?:m\.)?youtube\.com|youtu\.be)(?:\/|$)/i.test(href)) return 'aria-disabled="true"';
      return attribute;
    });
  }).join('');
}
