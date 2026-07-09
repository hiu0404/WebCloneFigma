export type PiccProductStatus = 'active' | 'hidden'

export type PiccProduct = {
  id: string
  name: string
  model: string
  categorySlug: string
  imageUrl?: string
  shortDescription: string
  specs?: string
  status: PiccProductStatus
  createdAt: number
  updatedAt: number
}

export type PiccProductInput = {
  id: string
  name: string
  model: string
  categorySlug: string
  imageUrl?: string
  shortDescription: string
  specs?: string
  status?: PiccProductStatus
}

export function normalizePiccProductStatus(status?: string): PiccProductStatus {
  return status === 'hidden' ? 'hidden' : 'active'
}

export function normalizePiccProducts(products: PiccProduct[]) {
  return products
    .map((item) => ({
      ...item,
      imageUrl: item.imageUrl || undefined,
      specs: item.specs || undefined,
      status: normalizePiccProductStatus(item.status),
      createdAt: Number(item.createdAt) || Date.now(),
      updatedAt: Number(item.updatedAt) || Date.now(),
    }))
    .filter((item) => item.id && item.name)
}

export function makePiccProductId() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6)
}
