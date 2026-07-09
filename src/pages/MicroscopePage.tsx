import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from '../components/Header/Header'
import { FigmaImage } from '../components/FigmaImage'
import { MicroscopeCard } from '../components/microscope/MicroscopeCard'
import { MicroscopeSidebar } from '../components/microscope/MicroscopeSidebar'
import {
  getMicroscopeCategoryLabel,
  isActiveMicroscopeCategory,
  type Microscope,
  type MicroscopeCategory,
} from '../data/microscopes'
import { apiGetMicroscopeCategories } from '../services/microscopeCategoryService'
import { apiGetMicroscopes } from '../services/microscopeService'
import { compareByDisplayOrder } from '../lib/adminStore'
import styles from './MicroscopePage.module.css'

const PAGE_PATH = '/MicroscopePage'

const MicroscopePage = () => {
  const navigate = useNavigate()
  const { categorySlug } = useParams()
  const [categories, setCategories] = useState<MicroscopeCategory[]>([])
  const [microscopes, setMicroscopes] = useState<Microscope[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    Promise.all([apiGetMicroscopeCategories(), apiGetMicroscopes()])
      .then(([categoryList, microscopeList]) => {
        if (!alive) return
        const activeCategories = categoryList.filter(isActiveMicroscopeCategory)
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

  const selectedSlug =
    categorySlug && categories.some((category) => category.slug === categorySlug) ? categorySlug : 'all'

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const microscope of microscopes) {
      map.set(microscope.categorySlug, (map.get(microscope.categorySlug) ?? 0) + 1)
    }
    return map
  }, [microscopes])

  const shownMicroscopes = useMemo(() => {
    const list = selectedSlug === 'all' ? microscopes : microscopes.filter((item) => item.categorySlug === selectedSlug)
    return [...list].sort(compareByDisplayOrder)
  }, [microscopes, selectedSlug])

  function selectCategory(slug: string) {
    navigate(slug === 'all' ? PAGE_PATH : `${PAGE_PATH}/${slug}`)
  }

  const selectedTitle =
    selectedSlug === 'all' ? 'Tất cả kính hiển vi' : getMicroscopeCategoryLabel(categories, selectedSlug)

  return (
    <div className={styles.page}>
      <Header />

      <FigmaImage
        className={styles.hero}
        src="/assetsFull/page-banner-dna.png"
        alt=""
        ariaHidden
        width={1920}
        height={461}
      />

      <div className={styles.heroTitle}>
        <div>Kính hiển vi</div>
        <div className={styles.heroTitleSmall}>Trang chủ / Kính hiển vi</div>
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
        <h1 className={styles.title}>Kính hiển vi</h1>

        <div className={styles.categorypage}>
          <MicroscopeSidebar
            categories={categories}
            selectedSlug={selectedSlug}
            counts={counts}
            total={microscopes.length}
            onSelect={selectCategory}
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
                    categoryLabel={getMicroscopeCategoryLabel(categories, microscope.categorySlug)}
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

