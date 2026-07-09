export type MicroscopeCategoryStatus = 'active' | 'hidden'

export type MicroscopeCategory = {
  id: string
  label: string
  slug: string
  sortOrder: number
  status: MicroscopeCategoryStatus
}

export type Microscope = {
  id: string
  name: string
  model: string
  categorySlug: string
  imageUrl?: string
  shortDescription: string
  status: MicroscopeCategoryStatus
  createdAt: number
  updatedAt: number
}

export type MicroscopeCategoryInput = {
  id?: string
  label: string
  slug: string
  sortOrder?: number
  status?: MicroscopeCategoryStatus
}

export type MicroscopeInput = {
  id: string
  name: string
  model: string
  categorySlug: string
  imageUrl?: string
  shortDescription: string
  status?: MicroscopeCategoryStatus
}

export const DEFAULT_MICROSCOPE_CATEGORIES: MicroscopeCategory[] = [
  { id: 'light-microscopes', label: 'Kính hiển vi quang học', slug: 'light-microscopes', sortOrder: 1, status: 'active' },
  { id: 'digital-microscopes', label: 'Kính hiển vi kỹ thuật số', slug: 'digital-microscopes', sortOrder: 2, status: 'active' },
]

export function normalizeMicroscopeCategoryStatus(status?: string): MicroscopeCategoryStatus {
  return status === 'hidden' ? 'hidden' : 'active'
}

export function isActiveMicroscopeCategory(category?: { status?: string }) {
  return normalizeMicroscopeCategoryStatus(category?.status) === 'active'
}

export function normalizeMicroscopeCategories(categories: MicroscopeCategory[]) {
  return categories
    .map((item, index) => ({
      ...item,
      id: item.id || item.slug,
      sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : index + 1,
      status: normalizeMicroscopeCategoryStatus(item.status),
    }))
    .filter((item) => item.id && item.slug && item.label)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.label.localeCompare(b.label, 'vi'))
}

export function normalizeMicroscopes(microscopes: Microscope[]) {
  return microscopes
    .map((item) => ({
      ...item,
      imageUrl: item.imageUrl || undefined,
      status: normalizeMicroscopeCategoryStatus(item.status),
      createdAt: Number(item.createdAt) || Date.now(),
      updatedAt: Number(item.updatedAt) || Date.now(),
    }))
    .filter((item) => item.id && item.name)
}

export function getMicroscopeCategoryLabel(categories: MicroscopeCategory[], slug?: string) {
  return categories.find((item) => item.slug === slug)?.label ?? 'Chưa phân loại'
}

export function makeMicroscopeId() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6)
}

export function makeMicroscopeSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
