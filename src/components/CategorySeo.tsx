import { SeoHead } from './SeoHead'
import { SITE_NAME } from '../lib/seo'
import type { BreadcrumbItem } from './Breadcrumb'

type Props = { title: string; description?: string; canonical: string; image?: string; breadcrumbs: BreadcrumbItem[] }

export function categorySeoDescription(title: string, description?: string) {
  return (description?.replace(/\s+/g, ' ').trim() || `Danh mục ${title} tại Ecolink. Xem các sản phẩm đang được giới thiệu.`).slice(0, 160)
}

export function CategorySeo({ title, description, canonical, image, breadcrumbs }: Props) {
  const fullTitle = `${title} | ${SITE_NAME}`
  const text = categorySeoDescription(title, description)
  const site = typeof window === 'undefined' ? 'https://eco-link.vn' : window.location.origin
  return <SeoHead title={fullTitle} description={text} canonical={canonical} image={image} jsonLd={{
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.label, item: `${site}${item.to || canonical}`,
    })),
  }} />
}
