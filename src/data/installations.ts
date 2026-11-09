import type { ProductKind } from '../lib/seo'

export const publicRegionLabels = {
  north: 'Miền Bắc',
  central: 'Miền Trung',
  south: 'Miền Nam',
} as const

export type PublicRegion = keyof typeof publicRegionLabels

export type InstallationRecord = {
  id: string
  slug: string
  title: string
  summary: string
  internalReference?: string
  productType: ProductKind
  productId: string
  imageUrls: string[]
  imageCaptions?: Record<string, string>
  publicRegion?: PublicRegion | ''
  status: 'draft' | 'published'
  sortOrder?: number
  createdAt: number
  updatedAt: number
}

export type PublicInstallation = Pick<InstallationRecord, 'id' | 'slug' | 'title' | 'summary' | 'productType' | 'productId' | 'imageUrls' | 'imageCaptions' | 'publicRegion' | 'sortOrder' | 'updatedAt'> & {
  product: {
    name: string
    model: string
    brand: string
    category: string
    url: string
  }
}

export type InstallationInput = Omit<InstallationRecord, 'slug' | 'createdAt' | 'updatedAt'> & {
  privacyReviewed: boolean
}

export function installationUrl(item: Pick<InstallationRecord, 'slug'>) {
  return `/thiet-bi-da-trien-khai/${encodeURIComponent(item.slug)}`
}
