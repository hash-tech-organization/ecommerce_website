import type { Product, ProductCardData, Variant } from './types';

export const facetKeys = ['availability', 'size', 'cup', 'color', 'occasion', 'fabric'] as const;
export type FacetKey = typeof facetKeys[number];
type VariantFacet = 'size' | 'cup' | 'color';
export type FacetSelection = Record<FacetKey, string[]>;
export type PriceRange = { min: string; max: string };
export type FacetProduct = ProductCardData & {
  filterValues: Record<FacetKey, string[]>;
  filterOptions: Record<VariantFacet, number[]>;
};
export type FacetOption = { value: string; label: string; count: number };
export type HeaderFilterKey = FacetKey | 'price';
export const collectionFilterOrder: HeaderFilterKey[] = ['availability', 'size', 'cup', 'color', 'price', 'occasion', 'fabric'];

export function availableCollectionFilters(products: FacetProduct[]): HeaderFilterKey[] {
  return collectionFilterOrder.filter(key => key === 'price' ? products.some(product => product.variants.length > 0) : products.some(product => product.filterValues[key].length > 0));
}

export const emptySelection = (): FacetSelection => ({ availability: [], size: [], cup: [], color: [], occasion: [], fabric: [] });
const unique = (values: string[]) => [...new Set(values.filter(Boolean))];
const normalise = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();
const sizeValue = (value: string) => ({ small: 's', medium: 'm', large: 'l' } as Record<string, string>)[normalise(value)] || normalise(value);
const colorNames = ['black', 'blue', 'brown', 'cheetah', 'green', 'grey', 'maroon', 'multi', 'pink', 'purple', 'red', 'skin', 'white', 'yellow', 'orange', 'beige', 'cream', 'peach', 'olive', 'rust', 'ivory', 'nude'];
const fabricNames = ['cotton', 'fleece', 'linen', 'lycra', 'mesh', 'nylon', 'other', 'polyester', 'satin', 'silk', 'synthetic', 'twill', 'velvet'];

function colors(values: string[]) {
  const exact = values.map(value => normalise(value).replace(/\bgray\b/g, 'grey'));
  return unique([...exact, ...colorNames.filter(color => exact.some(value => new RegExp(`\\b${color}\\b`).test(value)))]);
}

export function getCollectionFilterData(product: Product): Pick<FacetProduct, 'filterValues' | 'filterOptions'> {
  const filterOptions: Record<VariantFacet, number[]> = { size: [], cup: [], color: [] };
  product.options.forEach((option, index) => {
    const name = normalise(option.name);
    if (name === 'size') filterOptions.size.push(index);
    else if (/^cup(?: sizes?)?$/.test(name)) filterOptions.cup.push(index);
    else if (/^colou?r$/.test(name)) filterOptions.color.push(index);
  });
  const values = (key: VariantFacet) => filterOptions[key].flatMap(index => product.options[index].values);
  const text = normalise([product.title, product.type, ...product.tags, product.description].join(' '));
  const colorValues = filterOptions.color.length ? colors(values('color')) : colorNames.filter(color => new RegExp(`\\b${color}\\b`).test(normalise(product.title).replace(/\bgray\b/g, 'grey')));
  return {
    filterOptions,
    filterValues: {
      availability: unique(product.variants.map(variant => variant.available ? 'in stock' : 'out of stock')),
      size: unique(values('size').map(sizeValue)),
      cup: unique(values('cup').map(normalise)),
      color: colorValues,
      occasion: [
        ...(/bridal|wedding|honeymoon/.test(text) ? ['bridal'] : []),
        ...(/party/.test(text) ? ['party'] : []),
        ...(/daily|everyday|casual/.test(text) ? ['daily'] : []),
      ],
      fabric: fabricNames.filter(fabric => new RegExp(`\\b${fabric}\\b`).test(text) || (fabric === 'lycra' && /\bspandex\b/.test(text))),
    },
  };
}

function variantHasValue(product: FacetProduct, variant: Variant, key: VariantFacet, selected: string[]) {
  if (!selected.length) return true;
  const indexes = product.filterOptions[key];
  if (!indexes.length) return product.filterValues[key].some(value => selected.includes(value));
  return indexes.some(index => {
    const raw = variant.options[index] || '';
    const values = key === 'color' ? colors([raw]) : [key === 'size' ? sizeValue(raw) : normalise(raw)];
    return values.some(value => selected.includes(value));
  });
}

export function matchesCollectionFilters(product: FacetProduct, selection: FacetSelection, price: PriceRange, ignored?: FacetKey) {
  for (const key of ['occasion', 'fabric'] as const) {
    if (key !== ignored && selection[key].length && !product.filterValues[key].some(value => selection[key].includes(value))) return false;
  }
  const minimum = price.min === '' ? undefined : Math.max(0, Number(price.min));
  const maximum = price.max === '' ? undefined : Math.max(0, Number(price.max));
  return product.variants.some(variant => {
    if (ignored !== 'availability' && selection.availability.length && !selection.availability.includes(variant.available ? 'in stock' : 'out of stock')) return false;
    for (const key of ['size', 'cup', 'color'] as const) {
      if (key !== ignored && !variantHasValue(product, variant, key, selection[key])) return false;
    }
    return (minimum === undefined || variant.price >= minimum) && (maximum === undefined || variant.price <= maximum);
  });
}

export function facetLabel(key: FacetKey, value: string) {
  if (key === 'availability') return value === 'in stock' ? 'In stock' : 'Out of stock';
  if (key === 'size') return ({ s: 'Small', m: 'Medium', l: 'Large' } as Record<string, string>)[value] || value.toUpperCase();
  if (key === 'cup') return value === 'free size' ? 'Free Size' : value.toUpperCase();
  return value.replace(/\b\w/g, letter => letter.toUpperCase());
}

export function getFacetOptions(products: FacetProduct[], selection: FacetSelection, price: PriceRange): Record<FacetKey, FacetOption[]> {
  const sizeOrder = ['xs', 'xs/s', 's', 's/m', 'm', 'm/l', 'l', 'l/xl', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'];
  return Object.fromEntries(facetKeys.map(key => {
    const values = unique(products.flatMap(product => product.filterValues[key]));
    const counts = new Map(values.map(value => [value, 0]));
    for (const product of products) {
      if (!matchesCollectionFilters(product, selection, price, key)) continue;
      for (const value of product.filterValues[key]) {
        if (matchesCollectionFilters(product, { ...selection, [key]: [value] }, price)) counts.set(value, (counts.get(value) || 0) + 1);
      }
    }
    values.sort((left, right) => {
      if (key === 'availability') return left === right ? 0 : left === 'in stock' ? -1 : 1;
      if (key === 'size') {
        const leftIndex = sizeOrder.indexOf(left), rightIndex = sizeOrder.indexOf(right);
        if (leftIndex >= 0 || rightIndex >= 0) return (leftIndex < 0 ? 100 : leftIndex) - (rightIndex < 0 ? 100 : rightIndex);
      }
      return left.localeCompare(right, 'en', { numeric: true });
    });
    return [key, values.map(value => ({ value, label: facetLabel(key, value), count: counts.get(value) || 0 }))];
  })) as Record<FacetKey, FacetOption[]>;
}
