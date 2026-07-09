import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '../components/Header/Header'
import { FigmaImage } from '../components/FigmaImage'
import styles from './ConsumablesPage.module.css'
import type { Product } from '../lib/adminStore'
import { apiGetProducts } from '../services/productService'
import { apiGetCategories } from '../services/categoryService'
import { productMainImageUrl } from '../lib/productImages'
import {
  getChildCategoryLabel,
  getProductChildCategorySlug,
  isCategoryVisible,
  normalizeProductCategoryFields,
  visibleChildCategories,
  type AdminCategory,
} from '../data/categories'

export function ConsumablesPage() {
  const navigate = useNavigate()
  const { categorySlug } = useParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])

  const childCategories = useMemo(() => visibleChildCategories(categories, 'consumables'), [categories])
  const selectedGroup =
    categorySlug && childCategories.some((item) => item.slug === categorySlug) ? categorySlug : 'all'

  useEffect(() => {
    let alive = true
    Promise.all([apiGetProducts(), apiGetCategories()])
      .then(([list, categoryList]) => {
        if (!alive) return
        setCategories(categoryList)
        const visibleConsumables = categoryList.find(
          (category) => category.slug === 'consumables' && isCategoryVisible(category),
        )
        setProducts(
          list
            .map(normalizeProductCategoryFields)
            .filter((product) => (product.parentCategorySlug ?? product.category ?? 'equipment') === 'consumables')
            .filter((product) => (product.status ?? 'active') === 'active')
            .filter((product) => {
              if (!visibleConsumables) return false
              const childSlug = getProductChildCategorySlug(product)
              return visibleConsumables.children.some((child) => child.slug === childSlug && isCategoryVisible(child))
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
      const key = getProductChildCategorySlug(product)
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return map
  }, [products])

  const shownProducts = useMemo(() => {
    if (selectedGroup === 'all') return products
    return products.filter((product) => getProductChildCategorySlug(product) === selectedGroup)
  }, [products, selectedGroup])

  const selectedTitle =
    selectedGroup === 'all'
      ? 'Tất cả vật tư tiêu hao'
      : getChildCategoryLabel(categories, 'consumables', selectedGroup)

  return (
    <div className={styles.page}>
      <Header />

      <FigmaImage
        className={styles.hero}
        src="/assetsFull/testimonial.png"
        alt=""
        ariaHidden
        width={1920}
        height={461}
      />

      <div className={styles.heroTitle}>
        <div>Vật tư tiêu hao</div>
        <div className={styles.heroTitleSmall}>Trang chủ / Vật tư tiêu hao</div>
      </div>

      <main className={styles.container}>
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
        <h1 className={styles.title}>Vật tư tiêu hao</h1>

        <div className={styles.categorypage}>
          <aside className={styles.sidebar}>
            <h2>DANH MỤC SẢN PHẨM</h2>
            <ul>
              <li>
                <button
                  className={`${styles.categoryLink} ${selectedGroup === 'all' ? styles.active : ''}`}
                  type="button"
                  onClick={() => navigate('/vat-tu-tieu-hao')}
                >
                  <span>›</span>
                  Tất cả vật tư ({products.length})
                </button>
              </li>
              {childCategories.map((item) => (
                <li key={item.slug}>
                  <button
                    className={`${styles.categoryLink} ${selectedGroup === item.slug ? styles.active : ''}`}
                    type="button"
                    onClick={() => navigate(`/vat-tu-tieu-hao/${item.slug}`)}
                  >
                    <span>›</span>
                    {item.label} ({groupCounts.get(item.slug) ?? 0})
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className={styles.content}>
            <div className={styles.groupHeader}>
              <h2>{selectedTitle}</h2>
              <p>{shownProducts.length} sản phẩm</p>
            </div>

            {shownProducts.length > 0 ? (
              <div className={styles.productgrid}>
                {shownProducts.map((item) => {
                  const src = productMainImageUrl(item)
                  return (
                    <article className={styles.productcard} key={item.id}>
                      {src ? (
                        <img src={src} alt={item.title} />
                      ) : (
                        <div className={styles.imagePlaceholder} aria-hidden />
                      )}
                      <div className={styles.productcardContent}>
                        <span className={styles.groupPill}>
                          {getChildCategoryLabel(categories, 'consumables', getProductChildCategorySlug(item))}
                        </span>
                        <h3>{item.title}</h3>
                        <p>{item.shortDescription || item.description || 'Chưa có mô tả ngắn.'}</p>
                        {item.specs ? <pre className={styles.specs}>{item.specs}</pre> : null}
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>Chưa có sản phẩm trong danh mục này.</div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
