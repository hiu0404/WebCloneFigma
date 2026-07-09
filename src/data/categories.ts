import type { Product } from '../lib/adminStore'

export type AdminCategoryChild = {
  id: string
  slug: string
  label: string
  description?: string
  imageUrl?: string
  sortOrder?: number
  status?: 'active' | 'hidden'
}

export type AdminCategory = {
  id: string
  slug: string
  label: string
  description?: string
  imageUrl?: string
  sortOrder?: number
  status?: 'active' | 'hidden'
  children: AdminCategoryChild[]
}

export type CategoryInput = {
  id?: string
  slug: string
  label: string
  description?: string
  imageUrl?: string
  sortOrder?: number
  status?: 'active' | 'hidden'
  parentId?: string
  previousSlug?: string
  previousParentId?: string
}

export const DEFAULT_CATEGORIES: AdminCategory[] = [
  {
    id: 'equipment',
    slug: 'equipment',
    label: 'Sản phẩm thiết bị',
    sortOrder: 1,
    status: 'active',
    children: [],
  },
  {
    id: 'consumables',
    slug: 'consumables',
    label: 'Vật tư tiêu hao',
    sortOrder: 2,
    status: 'active',
    children: [
      { id: 'lam-kinh', slug: 'lam-kinh', label: 'Lam kính', sortOrder: 1, status: 'active' },
      { id: 'lamen-phu-tieu-ban', slug: 'lamen-phu-tieu-ban', label: 'Lamen phủ tiêu bản', sortOrder: 2, status: 'active' },
      { id: 'cassette', slug: 'cassette', label: 'Cassette', sortOrder: 3, status: 'active' },
      { id: 'luoi-dao-cat-benh-pham', slug: 'luoi-dao-cat-benh-pham', label: 'Lưỡi dao cắt bệnh phẩm', sortOrder: 4, status: 'active' },
      { id: 'nen-hat-tinh-khiet', slug: 'nen-hat-tinh-khiet', label: 'Nến hạt tinh khiết', sortOrder: 5, status: 'active' },
      { id: 'khuon-duc-inox', slug: 'khuon-duc-inox', label: 'Khuôn đúc inox', sortOrder: 6, status: 'active' },
    ],
  },
  {
    id: 'chemicals',
    slug: 'chemicals',
    label: 'Hóa chất',
    sortOrder: 3,
    status: 'active',
    children: [
      { id: 'nhuom-thuong-quy', slug: 'nhuom-thuong-quy', label: 'Nhuộm thường quy', sortOrder: 1, status: 'active' },
      { id: 'nhuom-hoa-mo-mien-dich', slug: 'nhuom-hoa-mo-mien-dich', label: 'Nhuộm hóa mô miễn dịch', sortOrder: 2, status: 'active' },
      { id: 'nhuom-dac-biet', slug: 'nhuom-dac-biet', label: 'Nhuộm đặc biệt', sortOrder: 3, status: 'active' },
    ],
  },
  {
    id: 'antibodies',
    slug: 'antibodies',
    label: 'Kháng thể',
    sortOrder: 4,
    status: 'active',
    children: [
      { id: 'khang-the-vitro', slug: 'khang-the-vitro', label: 'Kháng thể Vitro', sortOrder: 1, status: 'active' },
      { id: 'quartett', slug: 'quartett', label: 'Quartett', sortOrder: 2, status: 'active' },
    ],
  },
  {
    id: 'forensic-science',
    slug: 'forensic-science',
    label: 'Giám định, khoa học, kỹ thuật, hình sự',
    sortOrder: 5,
    status: 'active',
    children: [
      {
        id: 'giam-dinh-truyen-thong-co-hoc-sung-dan',
        slug: 'giam-dinh-truyen-thong-co-hoc-sung-dan',
        label: 'Truyền thống, cơ học, súng đạn',
        sortOrder: 1,
        status: 'active',
      },
      {
        id: 'giam-dinh-tai-lieu-chu-viet-tien-tem',
        slug: 'giam-dinh-tai-lieu-chu-viet-tien-tem',
        label: 'Tài liệu, chữ viết, tiền, tem',
        sortOrder: 2,
        status: 'active',
      },
      { id: 'giam-dinh-sinh-hoc', slug: 'giam-dinh-sinh-hoc', label: 'Sinh học', sortOrder: 3, status: 'active' },
      { id: 'giam-dinh-adn', slug: 'giam-dinh-adn', label: 'ADN', sortOrder: 4, status: 'active' },
    ],
  },
  {
    id: 'intensive-care',
    slug: 'intensive-care',
    label: 'Hồi sức tích cực',
    sortOrder: 6,
    status: 'active',
    children: [
      { id: 'picc-3f-1n', slug: 'picc-3f-1n', label: '(PICC) LOẠI 3F 1 nòng', sortOrder: 1, status: 'active' },
      { id: 'picc-4f-1n', slug: 'picc-4f-1n', label: '(PICC) LOẠI 4F 1 nòng', sortOrder: 2, status: 'active' },
      { id: 'picc-5fr-1n', slug: 'picc-5fr-1n', label: '(PICC) LOẠI 5F 1 nòng', sortOrder: 3, status: 'active' },
      { id: 'picc-5fr-2n', slug: 'picc-5fr-2n', label: '(PICC) LOẠI 5F 2 nòng', sortOrder: 4, status: 'active' },
      { id: 'picc-6f-3n', slug: 'picc-6f-3n', label: '(PICC) LOẠI 6F 3 nòng', sortOrder: 5, status: 'active' },
    ],
  },
]

export function cloneCategories(categories: AdminCategory[]) {
  return normalizeCategories(categories).map((item) => ({
    ...item,
    children: item.children.map((child) => ({ ...child })),
  }))
}

export function normalizeCategories(categories: AdminCategory[]) {
  return categories
    .map((item, index) => ({
      ...item,
      sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : index + 1,
      status: normalizeCategoryStatus(item.status),
      children: (item.children ?? [])
        .map((child, childIndex) => ({
          ...child,
          sortOrder: Number.isFinite(Number(child.sortOrder)) ? Number(child.sortOrder) : childIndex + 1,
          status: normalizeCategoryStatus(child.status),
        }))
        .sort(sortCategoryNodes),
    }))
    .sort(sortCategoryNodes)
}

export function sortCategoryNodes<T extends { sortOrder?: number; label: string }>(a: T, b: T) {
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.label.localeCompare(b.label, 'vi')
}

export function normalizeCategoryStatus(status?: string) {
  return status === 'hidden' ? 'hidden' as const : 'active' as const
}

export function isCategoryVisible(category?: { status?: string }) {
  return normalizeCategoryStatus(category?.status) === 'active'
}

export function visibleChildCategories(categories: AdminCategory[], parentSlug: string) {
  return (findParentCategory(categories, parentSlug)?.children ?? []).filter(isCategoryVisible)
}

export function findParentCategory(categories: AdminCategory[], slug?: string) {
  return categories.find((item) => item.slug === slug)
}

export function findChildCategory(categories: AdminCategory[], parentSlug?: string, childSlug?: string) {
  return findParentCategory(categories, parentSlug)?.children.find((item) => item.slug === childSlug)
}

export function getCategoryLabel(categories: AdminCategory[], slug?: string) {
  return findParentCategory(categories, slug)?.label ?? 'Chưa phân loại'
}

export function getChildCategoryLabel(categories: AdminCategory[], parentSlug?: string, childSlug?: string) {
  return findChildCategory(categories, parentSlug, childSlug)?.label ?? 'Chưa phân nhóm'
}

export function getProductParentCategorySlug(product: Pick<Product, 'category' | 'parentCategorySlug'>) {
  return product.parentCategorySlug ?? product.category ?? 'equipment'
}

export function getProductChildCategorySlug(
  product: Pick<Product, 'categoryId' | 'categorySlug' | 'consumableGroup' | 'chemicalGroup' | 'category' | 'parentCategorySlug'>,
) {
  const parent = getProductParentCategorySlug(product)
  if (product.categorySlug) return product.categorySlug
  if (product.categoryId) return product.categoryId
  if (parent === 'consumables') return product.consumableGroup ?? ''
  if (parent === 'chemicals') return product.chemicalGroup ?? ''
  return ''
}

export function normalizeProductCategoryFields<T extends Partial<Product>>(product: T): T {
  const parentCategorySlug = product.parentCategorySlug ?? product.category ?? 'equipment'
  const categorySlug =
    product.categorySlug ??
    product.categoryId ??
    (parentCategorySlug === 'consumables'
      ? product.consumableGroup
      : parentCategorySlug === 'chemicals'
        ? product.chemicalGroup
        : undefined)

  return {
    ...product,
    category: parentCategorySlug,
    parentCategorySlug,
    categoryId: product.categoryId ?? categorySlug,
    categorySlug,
    consumableGroup: parentCategorySlug === 'consumables' ? categorySlug : product.consumableGroup,
    chemicalGroup: parentCategorySlug === 'chemicals' ? categorySlug : product.chemicalGroup,
  }
}

export function makeSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
