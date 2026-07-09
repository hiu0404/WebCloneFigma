export type Product = {
  id: string
  title: string
  category?: string
  parentCategorySlug?: string
  categoryId?: string
  categorySlug?: string
  consumableGroup?: string
  chemicalGroup?: string
  imageUrl?: string
  imageUrls?: string[]
  shortDescription?: string
  price?: string
  sku?: string
  brand?: string
  origin?: string
  description?: string
  specs?: string
  pdfUrl?: string
  youtubeUrl?: string
  status?: 'active' | 'draft' | 'hidden'
  featured?: boolean
  createdAt: number
  updatedAt: number
}

const LS_PRODUCTS_KEY = 'admin_products_v1'

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function getProducts(): Product[] {
  const list = safeJsonParse<Product[]>(localStorage.getItem(LS_PRODUCTS_KEY), [])
  return Array.isArray(list) ? list.map(normalizeLegacyProduct) : []
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find((p) => p.id === id)
}

export function upsertProduct(input: Omit<Product, 'createdAt' | 'updatedAt'> & Partial<Pick<Product, 'createdAt' | 'updatedAt'>>): Product {
  const now = Date.now()
  const list = getProducts()
  const normalizedInput = normalizeLegacyProduct(input as Product)
  const idx = list.findIndex((p) => p.id === input.id)
  if (idx >= 0) {
    const updated: Product = {
      ...list[idx],
      ...normalizedInput,
      updatedAt: now,
      createdAt: list[idx].createdAt ?? now,
    }
    const next = [...list]
    next[idx] = updated
    localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(next))
    return updated
  }

  const created: Product = {
    ...normalizedInput,
    createdAt: normalizedInput.createdAt ?? input.createdAt ?? now,
    updatedAt: normalizedInput.updatedAt ?? input.updatedAt ?? now,
  }
  const next = [created, ...list]
  localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(next))
  return created
}

export function normalizeLegacyProduct<T extends Partial<Product>>(input: T): T {
  const parentCategorySlug = input.parentCategorySlug ?? input.category ?? 'equipment'
  const categorySlug =
    input.categorySlug ??
    (parentCategorySlug === 'consumables'
      ? input.consumableGroup
      : parentCategorySlug === 'chemicals'
        ? input.chemicalGroup
        : undefined)

  return {
    ...input,
    category: parentCategorySlug,
    parentCategorySlug,
    categoryId: input.categoryId ?? categorySlug,
    categorySlug,
    consumableGroup: parentCategorySlug === 'consumables' ? categorySlug : input.consumableGroup,
    chemicalGroup: parentCategorySlug === 'chemicals' ? categorySlug : input.chemicalGroup,
    status: input.status ?? 'active',
    featured: Boolean(input.featured),
  }
}

export function deleteProduct(id: string) {
  const next = getProducts().filter((p) => p.id !== id)
  localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(next))
}

export function newId(): string {
  // short, unique enough for localStorage usage
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6)
}
