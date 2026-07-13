import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Header } from '../components/Header/Header'
import { FigmaImage } from '../components/FigmaImage'
import type { Product } from '../lib/adminStore'
import { compareByDisplayOrder } from '../lib/adminStore'
import {
  getChildCategoryLabel,
  getProductChildCategorySlug,
  isCategoryVisible,
  normalizeProductCategoryFields,
  visibleChildCategories,
  type AdminCategory,
} from '../data/categories'
import { productMainImageUrl } from '../lib/productImages'
import { apiGetCategories } from '../services/categoryService'
import { apiGetProducts } from '../services/productService'
import styles from './ConsumablesPage.module.css'

export const EQUIPMENT_CATEGORY_ROUTES: Record<string, string> = {
  trimmingtech: '/Trimmingtech',
  'tissue-processing': '/TissueProcessing',
  casting: '/Casting',
  'cutting-machine': '/CuttingMachine',
  'tissue-tension': '/TissueTension',
  'drying-table': '/DryingTable',
  'dyeing-machine': '/DyeingMachine',
  immunohistochemistry: '/Immunohistochemistry',
  'laminating-machine': '/LaminatingMachine',
  scaning: '/Scaning',
  'laser-cassette': '/LaserCassette',
}

type Props = { categorySlug?: string }

export function EquipmentCatalogPage({ categorySlug }: Props) {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    Promise.all([apiGetProducts(), apiGetCategories()])
      .then(([productList, categoryList]) => {
        if (!alive) return
        setCategories(categoryList)
        const equipment = categoryList.find((item) => item.slug === 'equipment' && isCategoryVisible(item))
        setProducts(
          productList
            .map(normalizeProductCategoryFields)
            .filter((item) => (item.parentCategorySlug ?? item.category) === 'equipment')
            .filter((item) => (item.status ?? 'active') === 'active')
            .filter((item) => equipment?.children.some(
              (child) => child.slug === getProductChildCategorySlug(item) && isCategoryVisible(child),
            )),
        )
      })
      .catch(() => alive && (setProducts([]), setCategories([])))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [])

  const childCategories = useMemo(() => visibleChildCategories(categories, 'equipment'), [categories])
  const selectedSlug = categorySlug && childCategories.some((item) => item.slug === categorySlug) ? categorySlug : 'all'
  const counts = useMemo(() => {
    const result = new Map<string, number>()
    products.forEach((item) => {
      const slug = getProductChildCategorySlug(item)
      result.set(slug, (result.get(slug) ?? 0) + 1)
    })
    return result
  }, [products])
  const shownProducts = useMemo(
    () => [...(selectedSlug === 'all' ? products : products.filter((item) => getProductChildCategorySlug(item) === selectedSlug))]
      .sort(compareByDisplayOrder),
    [products, selectedSlug],
  )
  const title = selectedSlug === 'all' ? 'Tất cả sản phẩm thiết bị' : getChildCategoryLabel(categories, 'equipment', selectedSlug)

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.heroWrapper}>
        <FigmaImage className={styles.hero} src="/assetsFull/page-banner-dna.png" alt="" ariaHidden width={1920} height={461} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroTitle}><h1>Sản phẩm thiết bị</h1><p>Trang chủ / Sản phẩm thiết bị</p></div>
      </div>
      <main className={styles.container}>
        <section className={styles.benefitBar}>
          <div className={styles.benefitItem}><span>◎</span><div><strong>Chất lượng quốc tế</strong><small>Đạt tiêu chuẩn</small></div></div>
          <div className={styles.benefitItem}><span>◉</span><div><strong>Công nghệ tiên tiến</strong><small>Hiệu quả vượt trội</small></div></div>
          <div className={styles.benefitItem}><span>⚙</span><div><strong>Đa dạng sản phẩm</strong><small>Đáp ứng mọi nhu cầu</small></div></div>
          <div className={styles.benefitItem}><span>☎</span><div><strong>Hỗ trợ kỹ thuật 24/7</strong><small>Đồng hành cùng bạn</small></div></div>
        </section>
        <h1 className={styles.title}>Sản phẩm thiết bị</h1>
        <div className={styles.categorypage}>
          <aside className={styles.sidebar}>
            <h2>DANH MỤC SẢN PHẨM</h2>
            <ul>
              <li><button type="button" className={`${styles.categoryLink} ${selectedSlug === 'all' ? styles.active : ''}`} onClick={() => navigate('/EquipmentPage')}><span>›</span>Tất cả sản phẩm ({products.length})</button></li>
              {childCategories.map((category) => (
                <li key={category.slug}><button type="button" className={`${styles.categoryLink} ${selectedSlug === category.slug ? styles.active : ''}`} onClick={() => navigate(EQUIPMENT_CATEGORY_ROUTES[category.slug] ?? '/EquipmentPage')}><span>›</span>{category.label} ({counts.get(category.slug) ?? 0})</button></li>
              ))}
            </ul>
          </aside>
          <section className={styles.content}>
            <div className={styles.groupHeader}><h2>{title}</h2><p>{shownProducts.length} sản phẩm</p></div>
            {loading ? <div className={styles.emptyState}>Đang tải sản phẩm...</div> : shownProducts.length ? (
              <div className={styles.productgrid}>{shownProducts.map((item) => {
                const image = productMainImageUrl(item)
                return <Link className={`${styles.productcard} ${styles.equipmentCard}`} to={`/san-pham-chi-tiet?id=${encodeURIComponent(item.id)}`} key={item.id}>
                  {image ? <img src={image} alt={item.title} /> : <div className={styles.imagePlaceholder} />}
                  <div className={styles.productcardContent}>
                    <h3>{item.title}</h3>
                    <dl className={styles.equipmentMeta}>
                      <div><dt>Model</dt><dd>{item.sku || 'Đang cập nhật'}</dd></div>
                      <div><dt>Hãng sản xuất</dt><dd>{item.brand || 'Đang cập nhật'}</dd></div>
                    </dl>
                    <span className={styles.detailButton}>Xem chi tiết <b>→</b></span>
                  </div>
                </Link>
              })}</div>
            ) : <div className={styles.emptyState}>Chưa có sản phẩm trong danh mục này.</div>}
          </section>
        </div>
      </main>
    </div>
  )
}
