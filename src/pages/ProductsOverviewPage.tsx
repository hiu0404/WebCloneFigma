import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaLink } from 'react-icons/fa'
import { Header } from '../components/Header/Header'
import { Breadcrumb } from '../components/Breadcrumb'
import { CategorySeo } from '../components/CategorySeo'
import { compareByDisplayOrder, type Product } from '../lib/adminStore'
import { productMainImageUrl } from '../lib/productImages'
import { productUrl } from '../lib/seo'
import {
  getProductChildCategorySlug,
  getProductParentCategorySlug,
  isCategoryVisible,
  normalizeProductCategoryFields,
  type AdminCategory,
} from '../data/categories'
import { isActiveMicroscopeCategory, type Microscope, type MicroscopeCategory } from '../data/microscopes'
import type { ForensicProduct } from '../data/forensicProducts'
import type { PiccProduct } from '../data/piccProducts'
import { apiGetProducts } from '../services/productService'
import { apiGetCategories } from '../services/categoryService'
import { apiGetMicroscopes } from '../services/microscopeService'
import { apiGetMicroscopeCategories } from '../services/microscopeCategoryService'
import { apiGetForensicProducts } from '../services/forensicProductService'
import { apiGetPiccProducts } from '../services/piccProductService'
import styles from './ProductsOverviewPage.module.css'

type GroupKey = 'equipment' | 'forensic-science' | 'microscopes' | 'consumables' | 'chemicals' | 'antibodies' | 'intensive-care'
type Preview = { id: string; name: string; imageUrl?: string; to: string }
type Catalog = {
  products: Product[]
  categories: AdminCategory[]
  microscopes: Microscope[]
  microscopeCategories: MicroscopeCategory[]
  forensic: ForensicProduct[]
  picc: PiccProduct[]
}

const groups: { key: GroupKey; title: string; to: string }[] = [
  { key: 'equipment', title: 'Giải phẫu bệnh', to: '/giai-phau-benh' },
  { key: 'forensic-science', title: 'Giám định hình sự', to: '/giam-dinh-hinh-su' },
  { key: 'microscopes', title: 'Kính hiển vi', to: '/kinh-hien-vi' },
  { key: 'consumables', title: 'Vật tư tiêu hao', to: '/vat-tu-tieu-hao' },
  { key: 'chemicals', title: 'Hóa chất', to: '/hoa-chat' },
  { key: 'antibodies', title: 'Kháng thể', to: '/khang-the' },
  { key: 'intensive-care', title: 'Hồi sức tích cực', to: '/hoi-suc-tich-cuc' },
]

const emptyCatalog: Catalog = {
  products: [], categories: [], microscopes: [], microscopeCategories: [], forensic: [], picc: [],
}

function settledValue<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === 'fulfilled' ? result.value : fallback
}

function visibleCategory(categories: AdminCategory[], slug: string) {
  return categories.find((item) => item.slug === slug && isCategoryVisible(item))
}

function previewProducts(catalog: Catalog, parentSlug: GroupKey): Preview[] {
  const parent = visibleCategory(catalog.categories, parentSlug)
  if (!parent) return []
  return catalog.products
    .map(normalizeProductCategoryFields)
    .filter((item) => getProductParentCategorySlug(item) === parentSlug && (item.status ?? 'active') === 'active')
    .filter((item) => parent.children.some((child) => child.slug === getProductChildCategorySlug(item) && isCategoryVisible(child)))
    .sort(compareByDisplayOrder)
    .slice(0, 4)
    .map((item) => ({ id: item.id, name: item.title, imageUrl: productMainImageUrl(item), to: productUrl(item) }))
}

function previewSpecial<T extends ForensicProduct | PiccProduct>(
  products: T[], categories: AdminCategory[], parentSlug: 'forensic-science' | 'intensive-care', kind: 'forensic' | 'picc',
): Preview[] {
  const parent = visibleCategory(categories, parentSlug)
  if (!parent) return []
  return products
    .filter((item) => (item.status ?? 'active') === 'active')
    .filter((item) => !item.categorySlug || parent.children.some((child) => child.slug === item.categorySlug && isCategoryVisible(child)))
    .sort(compareByDisplayOrder)
    .slice(0, 4)
    .map((item) => ({ id: item.id, name: item.name, imageUrl: item.imageUrl, to: productUrl(item, kind) }))
}

function previewMicroscopes(catalog: Catalog): Preview[] {
  const visibleSlugs = new Set(catalog.microscopeCategories.filter(isActiveMicroscopeCategory).map((item) => item.slug))
  return catalog.microscopes
    .filter((item) => (item.status ?? 'active') === 'active' && visibleSlugs.has(item.categorySlug))
    .sort(compareByDisplayOrder)
    .slice(0, 4)
    .map((item) => ({ id: item.id, name: item.name, imageUrl: item.imageUrl, to: productUrl(item, 'microscope') }))
}

export function ProductsOverviewPage() {
  const [catalog, setCatalog] = useState<Catalog>(emptyCatalog)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    Promise.allSettled([
      apiGetProducts(), apiGetCategories(), apiGetMicroscopes(), apiGetMicroscopeCategories(),
      apiGetForensicProducts(), apiGetPiccProducts(),
    ]).then(([products, categories, microscopes, microscopeCategories, forensic, picc]) => {
      if (!alive) return
      setCatalog({
        products: settledValue(products, []),
        categories: settledValue(categories, []),
        microscopes: settledValue(microscopes, []),
        microscopeCategories: settledValue(microscopeCategories, []),
        forensic: settledValue(forensic, []),
        picc: settledValue(picc, []),
      })
      setLoading(false)
    })
    return () => { alive = false }
  }, [])

  const previews = useMemo<Record<GroupKey, Preview[]>>(() => ({
    equipment: previewProducts(catalog, 'equipment'),
    'forensic-science': previewSpecial(catalog.forensic, catalog.categories, 'forensic-science', 'forensic'),
    microscopes: previewMicroscopes(catalog),
    consumables: previewProducts(catalog, 'consumables'),
    chemicals: previewProducts(catalog, 'chemicals'),
    antibodies: previewProducts(catalog, 'antibodies'),
    'intensive-care': previewSpecial(catalog.picc, catalog.categories, 'intensive-care', 'picc'),
  }), [catalog])

  return (
    <div className={styles.page}>
      <CategorySeo
        title="Sản phẩm"
        description="Sản phẩm Ecolink theo nhóm: giải phẫu bệnh, giám định hình sự, kính hiển vi, vật tư tiêu hao, hóa chất, kháng thể và hồi sức tích cực."
        canonical="/san-pham"
        breadcrumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Sản phẩm' }]}
      />
      <Header />
      <main className={styles.main}>
        <Breadcrumb items={[{ label: 'Trang chủ', to: '/' }, { label: 'Sản phẩm' }]} />
        <h1 className={styles.pageTitle}>Sản phẩm</h1>

        {groups.map((group) => (
          <section className={styles.group} key={group.key} aria-labelledby={`group-${group.key}`}>
            <div className={styles.groupHeading}>
              <FaLink aria-hidden="true" />
              <h2 id={`group-${group.key}`}>{group.title}</h2>
            </div>
            {loading ? (
              <p className={styles.empty}>Đang tải sản phẩm...</p>
            ) : previews[group.key].length ? (
              <div className={styles.productGrid}>
                {previews[group.key].map((item) => (
                  <Link className={styles.productCard} key={`${group.key}-${item.id}`} to={item.to}>
                    <span className={styles.imageFrame}>
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.name} loading="lazy" /> : <span className={styles.imagePlaceholder} aria-hidden="true" />}
                    </span>
                    <span className={styles.productName}>{item.name}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className={styles.empty}>Chưa có sản phẩm đang hiển thị trong nhóm này.</p>
            )}
            <Link className={styles.moreButton} to={group.to}>Xem thêm</Link>
          </section>
        ))}
      </main>
    </div>
  )
}
