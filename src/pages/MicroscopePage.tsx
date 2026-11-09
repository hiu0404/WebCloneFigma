import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Header } from '../components/Header/Header'
import { FigmaImage } from '../components/FigmaImage'
import { MicroscopeCard } from '../components/microscope/MicroscopeCard'
import { ProductCategorySidebar } from '../components/ProductCategorySidebar'
import {
  getMicroscopeCategoryLabel,
  isActiveMicroscopeCategory,
  microscopeCategoryUrl,
  type Microscope,
  type MicroscopeCategory,
} from '../data/microscopes'
import { apiGetMicroscopeCategories } from '../services/microscopeCategoryService'
import { apiGetMicroscopes } from '../services/microscopeService'
import { compareByDisplayOrder } from '../lib/adminStore'
import { CategorySeo } from '../components/CategorySeo'
import { Breadcrumb } from '../components/Breadcrumb'
import styles from './ConsumablesPage.module.css'

const MicroscopePage = () => {
  const { categorySlug, subcategorySlug } = useParams()
  const [categories, setCategories] = useState<MicroscopeCategory[]>([])
  const [microscopes, setMicroscopes] = useState<Microscope[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    Promise.all([apiGetMicroscopeCategories(), apiGetMicroscopes()])
      .then(([categoryList, microscopeList]) => {
        if (!alive) return
        const activeCategories = categoryList.filter((category) =>
          isActiveMicroscopeCategory(category) &&
          (!category.parentSlug || categoryList.some((parent) => parent.slug === category.parentSlug && isActiveMicroscopeCategory(parent))),
        )
        const activeSlugs = new Set(activeCategories.map((item) => item.slug))
        setCategories(activeCategories)
        setMicroscopes(
          microscopeList.filter(
            (item) => (item.status ?? 'active') === 'active' && activeSlugs.has(item.categorySlug),
          ),
        )
      })
      .catch(() => {
        if (!alive) return
        setCategories([])
        setMicroscopes([])
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const requestedCategory = subcategorySlug
    ? categories.find((category) => category.slug === subcategorySlug && category.parentSlug === categorySlug)
    : categories.find((category) => category.slug === categorySlug)
  const selectedSlug = requestedCategory?.slug ?? 'all'
  const parentCategory = requestedCategory?.parentSlug
    ? categories.find((category) => category.slug === requestedCategory.parentSlug)
    : undefined
  const sidebarCategories = useMemo(() => categories
    .filter((category) => !category.parentSlug)
    .map((category) => ({
      ...category,
      children: categories.filter((child) => child.parentSlug === category.slug),
    })), [categories])

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const microscope of microscopes) {
      map.set(microscope.categorySlug, (map.get(microscope.categorySlug) ?? 0) + 1)
    }
    for (const category of categories.filter((item) => !item.parentSlug)) {
      const childSlugs = categories.filter((child) => child.parentSlug === category.slug).map((child) => child.slug)
      map.set(category.slug, (map.get(category.slug) ?? 0) + childSlugs.reduce((sum, slug) => sum + (map.get(slug) ?? 0), 0))
    }
    return map
  }, [microscopes, categories])

  const childSlugs = categories.filter((category) => category.parentSlug === selectedSlug).map((category) => category.slug)
  const shownMicroscopes = [...(selectedSlug === 'all'
    ? microscopes
    : microscopes.filter((item) => item.categorySlug === selectedSlug || childSlugs.includes(item.categorySlug)))].sort(compareByDisplayOrder)

  const selectedTitle =
    selectedSlug === 'all' ? 'Kính hiển vi' : getMicroscopeCategoryLabel(categories, selectedSlug)
  const canonical = requestedCategory ? microscopeCategoryUrl(requestedCategory) : '/MicroscopePage'
  const breadcrumbs = [
    { label: 'Trang chủ', to: '/' },
    { label: 'Kính hiển vi', to: '/MicroscopePage' },
    ...(parentCategory ? [{ label: parentCategory.label, to: microscopeCategoryUrl(parentCategory) }] : []),
    ...(selectedSlug === 'all' ? [] : [{ label: selectedTitle }]),
  ]

  return (
    <div className={styles.page}>
      <CategorySeo title={selectedTitle} canonical={canonical} breadcrumbs={breadcrumbs} />
      <Header />

      <div className={styles.heroWrapper}>
        <FigmaImage className={styles.hero} src="/assetsFull/page-banner-dna.png" alt="" ariaHidden width={1920} height={461} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroTitle}><div>Kính hiển vi</div><p>Trang chủ / Kính hiển vi</p></div>
      </div>

      <main className={styles.container}>
        <Breadcrumb items={breadcrumbs} />
                <section className={styles.benefitBar}>
                    <div className={styles.benefitItem}>
                        <span aria-hidden>&#9678;</span>
                        <div><strong>Chất lượng quốc tế</strong><small>Đạt tiêu chuẩn</small></div>
                    </div>
                    <div className={styles.benefitItem}>
                        <span aria-hidden>&#9673;</span>
                        <div><strong>Công nghệ tiên tiến</strong><small>Hiệu quả vượt trội</small></div>
                    </div>
                    <div className={styles.benefitItem}>
                        <span aria-hidden>&#9881;</span>
                        <div><strong>Đa dạng sản phẩm</strong><small>Đáp ứng mọi nhu cầu</small></div>
                    </div>
                    <div className={styles.benefitItem}>
                        <span aria-hidden>&#9742;</span>
                        <div><strong>Hỗ trợ kỹ thuật 24/7</strong><small>Đồng hành cùng bạn</small></div>
                    </div>
                </section>
        <h1 className={styles.title}>{selectedTitle}</h1>

        <div className={styles.categorypage}>
          <ProductCategorySidebar
            activeGroup="microscopes"
            selectedSlug={selectedSlug}
            subcategories={sidebarCategories}
            subcategoryUrl={(slug) => microscopeCategoryUrl(categories.find((category) => category.slug === slug) ?? { slug })}
            counts={counts}
          />

          <section className={styles.content}>
            <div className={styles.groupHeader}>
              <h2>{selectedTitle}</h2>
              <p>{shownMicroscopes.length} kính hiển vi</p>
            </div>

            {loading ? (
              <div className={styles.emptyState}>Đang tải kính hiển vi...</div>
            ) : shownMicroscopes.length > 0 ? (
              <div className={styles.productgrid}>
                {shownMicroscopes.map((microscope) => (
                  <MicroscopeCard
                    key={microscope.id}
                    microscope={microscope}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>Chưa có kính hiển vi trong danh mục này.</div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default MicroscopePage

