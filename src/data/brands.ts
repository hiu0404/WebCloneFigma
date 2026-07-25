export type Brand = {
  id: string
  name: string
  country: string
  url: string
  description: string
  imageUrl?: string
  featured: boolean
  status: 'active' | 'hidden'
  sortOrder?: number
  createdAt: number
  updatedAt: number
}

export type BrandInput = Omit<Brand, 'createdAt' | 'updatedAt'>

export function makeBrandId() {
  return `brand-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function sortBrands(brands: Brand[]) {
  return [...brands].sort(
    (a, b) =>
      (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER) ||
      a.name.localeCompare(b.name, 'vi'),
  )
}
