import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '../components/Header/Header'
import { FigmaImage } from '../components/FigmaImage'
import styles from './ChemicalsPage.module.css'
import { apiGetCategories } from '../services/categoryService'
import { apiGetPiccProducts } from '../services/piccProductService'
import type { PiccProduct } from '../data/piccProducts'
import {
  getChildCategoryLabel,
  isCategoryVisible,
  visibleChildCategories,
  type AdminCategory,
} from '../data/categories'

const PARENT_SLUG = 'intensive-care'

export default function PICC() {
  const navigate = useNavigate()
  const { categorySlug } = useParams()
  const [products, setProducts] = useState<PiccProduct[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])

  const childCategories = useMemo(() => visibleChildCategories(categories, PARENT_SLUG), [categories])
  const selectedGroup =
    categorySlug && childCategories.some((item) => item.slug === categorySlug) ? categorySlug : 'all'

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
              return !childSlug || visibleParent.children.some((child) => child.slug === childSlug && isCategoryVisible(child))
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
    return map
  }, [products])

  const shownProducts = useMemo(() => {
    if (selectedGroup === 'all') return products
    return products.filter((product) => product.categorySlug === selectedGroup)
  }, [products, selectedGroup])

  const pageTitle = 'Hồi sức tích cực'
  const selectedTitle =
    selectedGroup === 'all' ? 'Tất cả sản phẩm hồi sức tích cực' : getChildCategoryLabel(categories, PARENT_SLUG, selectedGroup)

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
        <div>{pageTitle}</div>
        <div className={styles.heroTitleSmall}>Trang chủ / {pageTitle}</div>
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
        <h1 className={styles.title}>{pageTitle}</h1>

        <div className={styles.categorypage}>
          <aside className={styles.sidebar}>
            <h2>DANH MỤC HỒI SỨC</h2>
            <ul>
              <li>
                <button
                  className={`${styles.categoryLink} ${selectedGroup === 'all' ? styles.active : ''}`}
                  type="button"
                  onClick={() => navigate('/PICC')}
                >
                  <span>›</span>
                  Tất cả sản phẩm ({products.length})
                </button>
              </li>
              {childCategories.map((item) => (
                <li key={item.slug}>
                  <button
                    className={`${styles.categoryLink} ${selectedGroup === item.slug ? styles.active : ''}`}
                    type="button"
                    onClick={() => navigate(`/PICC/${item.slug}`)}
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
                {shownProducts.map((item) => (
                  <article className={styles.productcard} key={item.id}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} />
                    ) : (
                      <div className={styles.imagePlaceholder} aria-hidden />
                    )}
                    <div className={styles.productcardContent}>
                      <span className={styles.groupPill}>
                        {getChildCategoryLabel(categories, PARENT_SLUG, item.categorySlug)}
                      </span>
                      <h3>{item.name}</h3>
                      {item.model ? <p>Model: {item.model}</p> : null}
                      <p>{item.shortDescription || 'Chưa có mô tả ngắn.'}</p>
                      {item.specs ? <pre className={styles.specs}>{item.specs}</pre> : null}
                    </div>
                  </article>
                ))}
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
