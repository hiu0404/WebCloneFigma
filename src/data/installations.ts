import type { ProductKind } from '../lib/seo'
import provinceDirectory from './vietnam-provinces.json'

export const currentProvinces = provinceDirectory.current
export const formerProvinces = provinceDirectory.former

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
  publicProvince?: string
  status: 'draft' | 'published'
  sortOrder?: number
  createdAt: number
  updatedAt: number
}

export type PublicInstallation = Pick<InstallationRecord, 'id' | 'slug' | 'title' | 'summary' | 'productType' | 'productId' | 'imageUrls' | 'imageCaptions' | 'publicRegion' | 'publicProvince' | 'sortOrder' | 'updatedAt'> & {
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
