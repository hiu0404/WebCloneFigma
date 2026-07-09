import { DEFAULT_CATEGORIES, getChildCategoryLabel } from '../data/categories'

const defaultConsumables = DEFAULT_CATEGORIES.find((item) => item.slug === 'consumables')

export const CONSUMABLE_GROUPS = defaultConsumables?.children.map((item) => ({
  value: item.slug,
  label: item.label,
})) ?? []

export type ConsumableGroup = (typeof CONSUMABLE_GROUPS)[number]['value']

export function consumableGroupLabel(value?: string): string {
  return getChildCategoryLabel(DEFAULT_CATEGORIES, 'consumables', value)
}
