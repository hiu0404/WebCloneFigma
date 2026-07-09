/** Các đường dẫn dùng làm fallback trên storefront — trong admin không coi là ảnh đã chọn để không “dính” ảnh mẫu. */
export const STOREFRONT_FALLBACK_MAIN_IMAGES = new Set([
  '/assetsFull/SanPham1.png',
  '/assetsFull/Chemicals.png',
])

function pathnameOf(url: string): string {
  const t = url.trim()
  if (!t) return ''
  if (/^https?:\/\//i.test(t)) {
    try {
      return new URL(t).pathname
    } catch {
      return t
    }
  }
  return t.startsWith('/') ? t : `/${t}`
}

/** Trả rỗng nếu URL trùng ảnh mặc định của site (hoặc chỉ chứa path fallback). */
export function sanitizeAdminMainImageUrl(url?: string | null): string {
  const raw = (url ?? '').trim()
  if (!raw) return ''
  const path = pathnameOf(raw)
  for (const fallback of STOREFRONT_FALLBACK_MAIN_IMAGES) {
    if (path === fallback || path.endsWith(fallback)) return ''
    if (raw.includes(fallback)) return ''
  }
  return raw
}

export function sanitizeAdminImageUrls(urls?: string[] | null): string[] {
  if (!Array.isArray(urls)) return []
  return urls.map((u) => sanitizeAdminMainImageUrl(u)).filter(Boolean)
}
