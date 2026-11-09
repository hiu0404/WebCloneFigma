// Keep the public response as an explicit allowlist. Internal customer references
// and publication review fields must never be sent to public clients.
export function toPublicInstallations(records, products) {
  const byProduct = new Map(products.map((item) => [`${item.type}:${item.id}`, item]))
  return records
    .filter((item) => item.status === 'published')
    .map((item) => {
      const product = byProduct.get(`${item.productType}:${item.productId}`)
      if (!product || (product.status ?? 'active') !== 'active') return null
      return {
        id: item.id,
        slug: item.slug,
        title: item.title,
        summary: item.summary || '',
        imageUrls: item.imageUrls,
        productType: item.productType,
        productId: item.productId,
        product: {
          name: product.name,
          model: product.model || product.sku || '',
          brand: product.brand || '',
          category: product.parentCategoryLabel || '',
          url: product.canonicalPath,
        },
        sortOrder: item.sortOrder,
        updatedAt: item.updatedAt,
      }
    })
    .filter(Boolean)
    .sort((a, b) => (a.sortOrder || 9999) - (b.sortOrder || 9999) || b.updatedAt - a.updatedAt)
}

export function isPublishedInstallationImage(records, url) {
  return records.some((item) => item.status === 'published' && Array.isArray(item.imageUrls) && item.imageUrls.includes(url))
}
