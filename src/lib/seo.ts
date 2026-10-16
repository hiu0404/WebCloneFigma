export const SITE_NAME = 'Ecolink'

export function makeSeoSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function productSeoTitle(name: string, value?: string): string {
  return value?.trim() || `${name} | ${SITE_NAME}`
}

export function productSeoDescription(name: string, description?: string, value?: string): string {
  const raw = value?.trim() || description?.replace(/\s+/g, ' ').trim() || `Thông tin sản phẩm ${name} tại Ecolink.`
  return raw.slice(0, 160)
}

export type ProductKind = 'product' | 'microscope' | 'forensic' | 'picc'

export function productUrl(product: { id: string; slug?: string; title?: string; name?: string; type?: ProductKind }, kind: ProductKind = 'product'): string {
  const resolvedKind = product.type || kind
  const fallback = `${makeSeoSlug(product.title || product.name || '') || 'san-pham'}-${resolvedKind}-${makeSeoSlug(product.id) || 'item'}`
  return `/san-pham/${encodeURIComponent(product.slug?.trim() || fallback)}`
}
