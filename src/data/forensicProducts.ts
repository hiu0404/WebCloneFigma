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
  sortOrder?: number
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
  sortOrder?: number
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
      sortOrder: normalizeProductDisplayOrder(item.sortOrder),
      status: normalizeForensicProductStatus(item.status),
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

export function makeForensicProductId() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6)
}
