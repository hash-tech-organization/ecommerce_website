import type { SVGProps } from 'react';
export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    instagram: <><rect x="2.75" y="2.75" width="14.5" height="14.5" rx="4.2" fill="none" stroke="currentColor" strokeWidth="1.4" /><circle cx="10" cy="10" r="3.45" fill="none" stroke="currentColor" strokeWidth="1.4" /><circle cx="14.65" cy="5.35" r=".95" /></>,
    facebook: <path d="M18 10.049C18 5.603 14.419 2 10 2c-4.419 0-8 3.603-8 8.049C2 14.067 4.925 17.396 8.75 18v-5.624H6.719v-2.328h2.03V8.275c0-2.017 1.195-3.132 3.023-3.132.874 0 1.79.158 1.79.158v1.98h-1.009c-.994 0-1.303.621-1.303 1.258v1.51h2.219l-.355 2.326H11.25V18c3.825-.604 6.75-3.933 6.75-7.951Z" />,
    tiktok: <path d="M10.511 1.705h2.74s-.157 3.51 3.795 3.768v2.711s-2.114.129-3.796-1.158l.028 5.606A5.073 5.073 0 1 1 8.213 7.56h.708v2.785a2.298 2.298 0 1 0 1.618 2.205L10.51 1.705Z" />,
    youtube: <path d="M18.16 5.87c.34 1.309.34 4.08.34 4.08s0 2.771-.34 4.08a2.125 2.125 0 0 1-1.53 1.53c-1.309.34-6.63.34-6.63.34s-5.321 0-6.63-.34a2.125 2.125 0 0 1-1.53-1.53c-.34-1.309-.34-4.08-.34-4.08s0-2.771.34-4.08a2.173 2.173 0 0 1 1.53-1.53C4.679 4 10 4 10 4s5.321 0 6.63.34a2.173 2.173 0 0 1 1.53 1.53ZM8.3 12.5l4.42-2.55L8.3 7.4v5.1Z" />,
    menu: <><path d="M5 8h14M5 15h14" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
    bag: <><path d="M5 7.5h14l1 13H4l1-13Z" /><path d="M8.5 8V5a3.5 3.5 0 0 1 7 0v3" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    arrow: <path d="M3 12h17m-6-6 6 6-6 6" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
    user: <><circle cx="12" cy="7" r="4" /><path d="M4 22v-3a8 8 0 0 1 16 0v3" /></>,
    gift: <><path d="M4 11h16v10H4zM3 7h18v4H3zM12 7v14" /><path d="M12 7H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z" /></>,
    check: <path d="m5 12 4 4L20 5" />,
    'check-square': <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="m7 12 3 3 7-7" /></>,
    ruler: <><path d="m3 8 5-5 13 13-5 5L3 8Z" /><path d="m7 7 2-2m1 5 2-2m1 5 2-2m1 5 2-2" /></>,
    play: <path d="m8 5 11 7-11 7V5Z" />,
    whatsapp: <><path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.7a8.5 8.5 0 1 1 16.1-4.2Z" /><path d="M8.4 7.3c-.5 0-1 .6-1 1.4 0 2.7 3.7 6.3 6.4 6.3.8 0 1.5-.5 1.6-1.1l.1-.8-2-1-.6.8c-.9-.3-2.6-1.9-2.9-2.8l.7-.7-.9-2.1h-.8Z" /></>,
    truck: <><path d="M2 5h12v12H2zM14 9h4l4 5v3h-8" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
    return: <><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="1" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m3 6 9 7 9-7" /></>,
    filter: <><path d="M3 6h18M3 12h18M3 18h18" /><path d="M8 3v6M16 9v6M10 15v6" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
    star: <path d="m12 2 3.1 6.3L22 9.4l-5 4.9 1.2 6.9L12 18l-6.2 3.2L7 14.3 2 9.4l6.9-1.1L12 2Z" />,
  };
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.arrow}</svg>;
}
