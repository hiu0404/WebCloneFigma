export type ForensicProductStatus = 'active' | 'hidden'

export type ForensicProduct = {
  id: string
  name: string
  model: string
  categorySlug: string
  imageUrl?: string
  shortDescription: string
  specs?: string
  status: ForensicProductStatus
  createdAt: number
  updatedAt: number
}

export type ForensicProductInput = {
  id: string
  name: string
  model: string
  categorySlug: string
  imageUrl?: string
  shortDescription: string
  specs?: string
  status?: ForensicProductStatus
}

export function normalizeForensicProductStatus(status?: string): ForensicProductStatus {
  return status === 'hidden' ? 'hidden' : 'active'
}

export function normalizeForensicProducts(products: ForensicProduct[]) {
  return products
    .map((item) => ({
      ...item,
      imageUrl: item.imageUrl || undefined,
      specs: item.specs || undefined,
      status: normalizeForensicProductStatus(item.status),
      createdAt: Number(item.createdAt) || Date.now(),
      updatedAt: Number(item.updatedAt) || Date.now(),
    }))
    .filter((item) => item.id && item.name)
}

export function makeForensicProductId() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6)
}
