import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FigmaImage } from '../components/FigmaImage'
import styles from './ChemicalsPage.module.css'
import { apiGetCategories } from '../services/categoryService'
import { apiGetPiccProducts } from '../services/piccProductService'
import type { PiccProduct } from '../data/piccProducts'
import { compareByDisplayOrder } from '../lib/adminStore'
import { productUrl } from '../lib/seo'
import { CategorySeo } from '../components/CategorySeo'
import { Breadcrumb } from '../components/Breadcrumb'
import { ProductCategorySidebar } from '../components/ProductCategorySidebar'
import {
  getChildCategoryLabel,
  findChildCategory,
  findChildCategoryParent,
  isCategoryVisible,
  visibleChildCategories,
  type AdminCategory,
} from '../data/categories'

const PARENT_SLUG = 'intensive-care'

export default function PICC() {
  const { categorySlug } = useParams()
  const [products, setProducts] = useState<PiccProduct[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])

  const childCategories = useMemo(() => visibleChildCategories(categories, PARENT_SLUG), [categories])
  const selectedGroup =
    categorySlug && childCategories.some((item) => item.slug === categorySlug || item.children?.some((child) => child.slug === categorySlug)) ? categorySlug : 'all'

  useEffect(() => {
    let alive = true
    Promise.all([apiGetPiccProducts(), apiGetCategories()])
      .then(([list, categoryList]) => {
        if (!alive) return
        setCategories(categoryList)
        const visibleParent = categoryList.find(
          (category) => category.slug === PARENT_SLUG && isCategoryVisible(category),
        )
        setProducts(
          list
            .filter((product) => (product.status ?? 'active') === 'active')
            .filter((product) => {
              if (!visibleParent) return false
              const childSlug = product.categorySlug
              return !childSlug || visibleParent.children.some((child) =>
                isCategoryVisible(child) && (child.slug === childSlug || child.children?.some((nested) => nested.slug === childSlug && isCategoryVisible(nested))))
            }),
        )
      })
      .catch(() => {
        if (!alive) return
        setProducts([])
        setCategories([])
      })
    return () => {
      alive = false
    }
  }, [])

  const groupCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const product of products) {
      const key = product.categorySlug
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    for (const category of childCategories) {
      for (const nested of category.children ?? []) map.set(category.slug, (map.get(category.slug) ?? 0) + (map.get(nested.slug) ?? 0))
    }
    return map
  }, [products, childCategories])

  const shownProducts = useMemo(() => {
    const selected = childCategories.find((category) => category.slug === selectedGroup)
    const slugs = new Set([selectedGroup, ...(selected?.children ?? []).map((child) => child.slug)])
    const list = selectedGroup === 'all' ? products : products.filter((product) => slugs.has(product.categorySlug))
    return [...list].sort(compareByDisplayOrder)
  }, [products, selectedGroup, childCategories])

  const pageTitle = 'Đường tiếp cận mạch máu'
  const selectedTitle =
    selectedGroup === 'all' ? pageTitle : getChildCategoryLabel(categories, PARENT_SLUG, selectedGroup)
  const selectedCategory = findChildCategory(categories, PARENT_SLUG, selectedGroup)
  const selectedParent = findChildCategoryParent(categories, PARENT_SLUG, selectedGroup)
  const categoryCards = selectedGroup === 'all' ? childCategories : childCategories.find((item) => item.slug === selectedGroup)?.children ?? []
  const canonical = selectedGroup === 'all' ? '/hoi-suc-tich-cuc' : `/hoi-suc-tich-cuc/${selectedGroup}`
  const breadcrumbs = [{ label: 'Trang chủ', to: '/' }, { label: pageTitle, to: '/hoi-suc-tich-cuc' }, ...(selectedParent ? [{ label: selectedParent.label, to: `/hoi-suc-tich-cuc/${selectedParent.slug}` }] : []), ...(selectedGroup === 'all' ? [] : [{ label: selectedTitle }])]

  return (
    <div className={styles.page}>
      <CategorySeo title={selectedTitle} description={selectedCategory?.description} canonical={canonical} breadcrumbs={breadcrumbs} />

      <FigmaImage
        className={styles.hero}
        src="/assetsFull/page-banner-dna.png"
        alt=""
        ariaHidden
        width={1920}
        height={461}
      />

      <div className={styles.heroTitle}>
        <div>{pageTitle}</div>
        <div className={styles.heroTitleSmall}>Trang chủ / {pageTitle}</div>
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
          <ProductCategorySidebar activeGroup="intensive-care" selectedSlug={selectedGroup} subcategories={childCategories} subcategoryUrl={(slug) => `/hoi-suc-tich-cuc/${slug}`} counts={groupCounts} categories={categories} />

          <section className={styles.content}>
            {categoryCards.length > 0 ? (
              <div className={styles.vascularCategories}>
                {categoryCards.map((category) => (
                  <Link className={styles.vascularCategoryCard} key={category.id} to={`/hoi-suc-tich-cuc/${category.slug}`}>
                    {category.imageUrl ? <img src={category.imageUrl} alt="" loading="lazy" /> : <span className={styles.vascularCategoryPlaceholder} aria-hidden="true">✚</span>}
                    <span className={styles.vascularCategoryTitle}>{category.label}</span>
                    <span className={styles.vascularCategoryCount}>{groupCounts.get(category.slug) ?? 0} sản phẩm <b aria-hidden="true">→</b></span>
                  </Link>
                ))}
              </div>
            ) : null}
            <div className={styles.groupHeader}>
              <h2>{selectedTitle}</h2>
              <p>{shownProducts.length} sản phẩm</p>
            </div>

            {shownProducts.length > 0 ? (
              <div className={styles.productgrid}>
                {shownProducts.map((item) => (
                  <Link className={`${styles.productcard} ${styles.equipmentCard}`} key={item.id} to={productUrl(item, 'picc')}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} loading="lazy" />
                    ) : (
                      <div className={styles.imagePlaceholder} aria-hidden />
                    )}
                    <div className={styles.productcardContent}>
                      <h3>{item.name}</h3>
                      <dl className={styles.equipmentMeta}>
                        <div><dt>Model</dt><dd>{item.model || 'Đang cập nhật'}</dd></div>
                        <div><dt>Danh mục</dt><dd>{getChildCategoryLabel(categories, PARENT_SLUG, item.categorySlug)}</dd></div>
                      </dl>
                      <span className={styles.detailButton}>Xem chi tiết <b>→</b></span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>{selectedGroup === 'all' && categoryCards.length ? 'Chọn một danh mục để xem sản phẩm.' : 'Chưa có sản phẩm trong danh mục này.'}</div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

