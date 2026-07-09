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
  sortOrder?: number
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
  sortOrder?: number
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
      sortOrder: normalizeProductDisplayOrder(item.sortOrder),
      status: normalizePiccProductStatus(item.status),
      createdAt: Number(item.createdAt) || Date.now(),
      updatedAt: Number(item.updatedAt) || Date.now(),
    }))
    .filter((item) => item.id && item.name)
    .sort(compareProductDisplayOrder)
}

function normalizeProductDisplayOrder(value: unknown) {
  const order = Number(value)
  return Number.isFinite(order) && order > 0 ? order : undefined
}

function compareProductDisplayOrder<T extends { sortOrder?: number; createdAt?: number; updatedAt?: number }>(a: T, b: T) {
  const left = normalizeProductDisplayOrder(a.sortOrder)
  const right = normalizeProductDisplayOrder(b.sortOrder)
  if (left != null && right != null && left !== right) return left - right
  if (left != null && right == null) return -1
  if (left == null && right != null) return 1
  return (Number(a.createdAt) || Number(a.updatedAt) || 0) - (Number(b.createdAt) || Number(b.updatedAt) || 0)
}

export function makePiccProductId() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6)
}
