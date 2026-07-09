import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/Header/Header'
import { FigmaImage } from '../components/FigmaImage'
import type { Product } from '../lib/adminStore'
import { productMainImageUrl } from '../lib/productImages'
import { apiGetProducts } from '../services/productService'
import styles from './ProductPage.module.css'

const categories = [
  { label: 'Bàn phẫu tích bệnh phẩm', to: '/Trimmingtech' },
  { label: 'Máy xử lý mô bệnh phẩm', to: '/TissueProcessing' },
  { label: 'Máy đúc mô bệnh phẩm', to: '/Casting' },
  { label: 'Máy cắt bệnh phẩm', to: '/CuttingMachine' },
  { label: 'Bể căng mô', to: '/TissueTension' },
  { label: 'Bàn sấy tiêu bản', to: '/DryingTable' },
  { label: 'Máy nhuộm tiêu bản IHC', to: '/Immunohistochemistry' },
  { label: 'Máy nhuộm hóa mô miễn dịch', to: '/DyeingMachine' },
  { label: 'Máy dán lamen tự động', to: '/LaminatingMachine' },
  { label: 'Máy quét tiêu bản kỹ thuật số', to: '/Scaning' },
  { label: 'Máy in mã vạch cassette', to: '/LaserCassette' },
  { label: 'Máy in mã vạch lam kính', to: '/LaserSlide' },
]

const benefits = [
  { icon: '◎', title: 'Chất lượng quốc tế', text: 'Đạt tiêu chuẩn' },
  { icon: '◉', title: 'Công nghệ tiên tiến', text: 'Hiệu quả vượt trội' },
  { icon: '⚙', title: 'Đa dạng sản phẩm', text: 'Đáp ứng mọi nhu cầu' },
  { icon: '☎', title: 'Hỗ trợ kỹ thuật 24/7', text: 'Đồng hành cùng bạn' },
]

export function ProductPage() {
  const [all, setAll] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const pageSize = 12

  useEffect(() => {
    let alive = true
    apiGetProducts()
      .then((list) => {
        if (!alive) return
        const equipmentOnly = list.filter((p) => (p.category ?? 'equipment') === 'equipment')
        setAll(equipmentOnly)
        setPage(1)
      })
      .catch(() => {
        if (!alive) return
        setAll([])
        setPage(1)
      })
    return () => {
      alive = false
    }
  }, [])

  const totalPages = Math.max(1, Math.ceil(all.length / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize
  const shown = all.slice(start, start + pageSize)
  const from = all.length === 0 ? 0 : start + 1
  const toCount = Math.min(start + shown.length, all.length)

  return (
    <div className={styles.page}>
      <Header />

      <section className={styles.hero}>
        <div className={styles.heroTitle}>
          <h1>Sản phẩm</h1>
          <p>Cung cấp thiết bị, hóa chất và giải pháp công nghệ hiện đại cho phòng thí nghiệm</p>
          <div className={styles.breadcrumb}>Trang chủ <span>›</span> Sản phẩm</div>
        </div>
      </section>

      <main className={styles.container}>
        <section className={styles.benefitBar}>
          {benefits.map((item) => (
            <div className={styles.benefitItem} key={item.title}>
              <span aria-hidden>{item.icon}</span>
              <div>
                <strong>{item.title}</strong>
                <small>{item.text}</small>
              </div>
            </div>
          ))}
        </section>

        <div className={styles.categorypage}>
          <aside className={styles.sidebar}>
            <h2>Danh mục sản phẩm</h2>
            <ul>
              {categories.map((item, index) => (
                <li key={item.to}>
                  <Link className={`${styles.categoryLink} ${index === 0 ? styles.active : ''}`} to={item.to}>
                    <span aria-hidden>⌬</span>
                    {item.label}
                    <em aria-hidden>›</em>
                  </Link>
                </li>
              ))}
            </ul>

            <div className={styles.supportBox}>
              <span aria-hidden>☎</span>
              <strong>Bạn cần tư vấn sản phẩm?</strong>
              <p>Đội ngũ chuyên gia của Ecolink luôn sẵn sàng đồng hành cùng bạn.</p>
              <a href="tel:+84812119668">+84 812 119 668</a>
            </div>
          </aside>

          <section className={styles.content}>
            <div className={styles.toolbar}>
              <p>Hiển thị {from}-{toCount} / {all.length} sản phẩm</p>
              <div>
                <select aria-label="Lọc thương hiệu">
                  <option>Tất cả thương hiệu</option>
                </select>
                <select aria-label="Sắp xếp">
                  <option>Sắp xếp: Mới nhất</option>
                </select>
              </div>
            </div>

            <div className={styles.productGrid}>
              {shown.map((p) => {
                const src = productMainImageUrl(p)
                const detailTo = `/san-pham-chi-tiet?id=${encodeURIComponent(p.id)}`
                return (
                  <article className={styles.productCard} key={p.id}>
                    <Link className={styles.productImageLink} to={detailTo}>
                      {src ? (
                        <FigmaImage className={styles.productImage} src={src} alt={p.title} width={340} height={249} />
                      ) : (
                        <div className={styles.imagePlaceholder} aria-hidden />
                      )}
                    </Link>
                    <div className={styles.productBody}>
                      <h2>{p.title}</h2>
                      <p>{[p.brand, p.origin].filter(Boolean).join(' - ') || 'ECOLINK'}</p>
                      <Link className={styles.detailLink} to={detailTo}>Xem chi tiết <span aria-hidden>→</span></Link>
                    </div>
                  </article>
                )
              })}
            </div>

            {totalPages > 1 ? (
              <nav className={styles.pager} aria-label="Phân trang sản phẩm">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}>‹</button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 5).map((n) => (
                  <button
                    className={n === safePage ? styles.pageBtnActive : undefined}
                    type="button"
                    key={n}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}>›</button>
              </nav>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  )
}
