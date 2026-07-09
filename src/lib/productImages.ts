/** Ảnh chính từ backend — không dùng file tĩnh làm mặc định. */
export function productMainImageUrl(product: { imageUrl?: string } | null | undefined): string | undefined {
  const u = product?.imageUrl?.trim()
  return u ? u : undefined
}
