import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '../components/Header/Header'
import { FigmaImage } from '../components/FigmaImage'
import styles from './ChemicalsPage.module.css'
import { apiGetCategories } from '../services/categoryService'
import { apiGetForensicProducts } from '../services/forensicProductService'
import type { ForensicProduct } from '../data/forensicProducts'
import { compareByDisplayOrder } from '../lib/adminStore'
import {
  getChildCategoryLabel,
  isCategoryVisible,
  visibleChildCategories,
  type AdminCategory,
} from '../data/categories'

const PARENT_SLUG = 'forensic-science'

const legacyCategorySlugs = {
  traditional: 'giam-dinh-truyen-thong-co-hoc-sung-dan',
  documents: 'giam-dinh-tai-lieu-chu-viet-tien-tem',
  biology: 'giam-dinh-sinh-hoc',
  dna: 'giam-dinh-adn',
} as const

const legacyCategoryPaths: Record<string, string> = {
  'giam-dinh-truyen-thong-co-hoc-sung-dan': '/GiamDinhTruyenThongCoHocSungDan',
  'giam-dinh-tai-lieu-chu-viet-tien-tem': '/GiamDinhTaiLieuChuVietTienTem',
  'giam-dinh-sinh-hoc': '/GiamDinhSinhHoc',
  'giam-dinh-adn': '/GiamDinhADN',
}

type ForensicPageProps = {
  categoryKey?: keyof typeof legacyCategorySlugs
}

function categoryPath(slug: string) {
  return legacyCategoryPaths[slug] ?? `/GiamDinhKhoaHocKyThuatHinhSu/${slug}`
}

export default function ForensicPage({ categoryKey }: ForensicPageProps) {
  const navigate = useNavigate()
  const { categorySlug } = useParams()
  const [products, setProducts] = useState<ForensicProduct[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])

  const childCategories = useMemo(() => visibleChildCategories(categories, PARENT_SLUG), [categories])
  const requestedSlug = categoryKey ? legacyCategorySlugs[categoryKey] : categorySlug
  const selectedGroup =
    requestedSlug && childCategories.some((item) => item.slug === requestedSlug) ? requestedSlug : 'all'

  useEffect(() => {
    let alive = true
    Promise.all([apiGetForensicProducts(), apiGetCategories()])
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
    const list = selectedGroup === 'all' ? products : products.filter((product) => product.categorySlug === selectedGroup)
    return [...list].sort(compareByDisplayOrder)
  }, [products, selectedGroup])

  const pageTitle = 'Giám định, khoa học, kỹ thuật, hình sự'
  const selectedTitle =
    selectedGroup === 'all' ? 'Tất cả sản phẩm giám định hình sự' : getChildCategoryLabel(categories, PARENT_SLUG, selectedGroup)

  return (
    <div className={styles.page}>
      <Header />

      <FigmaImage
        className={styles.hero}
        src="/assetsFull/Giamdinh.png"
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
            <h2>DANH MỤC GIÁM ĐỊNH</h2>
            <ul>
              <li>
                <button
                  className={`${styles.categoryLink} ${selectedGroup === 'all' ? styles.active : ''}`}
                  type="button"
                  onClick={() => navigate('/GiamDinhKhoaHocKyThuatHinhSu')}
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
                    onClick={() => navigate(categoryPath(item.slug))}
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
                  return (
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
