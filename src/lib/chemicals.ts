import { DEFAULT_CATEGORIES, getChildCategoryLabel } from '../data/categories'

const defaultChemicals = DEFAULT_CATEGORIES.find((item) => item.slug === 'chemicals')

export const CHEMICAL_GROUPS = defaultChemicals?.children.map((item) => ({
  value: item.slug,
  label: item.label,
})) ?? []

export type ChemicalGroup = (typeof CHEMICAL_GROUPS)[number]['value']

export function chemicalGroupLabel(value?: string): string {
  return getChildCategoryLabel(DEFAULT_CATEGORIES, 'chemicals', value)
}
