import reference from '@/data/reference-routes.json';
export type NavLink = { title: string; href: string };
export const navigation: (NavLink & { children: NavLink[] })[] = reference.navigation;
