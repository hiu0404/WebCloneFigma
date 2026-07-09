import { FaArrowRight, FaCalendarAlt, FaTags } from 'react-icons/fa'
import { FigmaImage } from '../components/FigmaImage'
import { Header } from '../components/Header/Header'
import styles from './NewsPage.module.css'

const newsItems = [
  {
    category: 'Tin tức',
    date: '08/07/2026',
    title: 'P16 + Ki-67 Nhuộm miễn dịch đa kênh',
    excerpt:
      'Giải pháp hỗ trợ đánh giá dấu ấn sinh học trong mô bệnh học với quy trình nhuộm rõ ràng, ổn định và phù hợp cho phòng xét nghiệm hiện đại.',
    image: '/assetsFull/tintuc1.png',
    url: 'https://bio-optica.it/it/news/detail/1149',
  },
  {
    category: 'Tin tức',
    date: '08/07/2026',
    title: 'p16 INK4a [BC42] Kháng thể đơn dòng chuột',
    excerpt:
      'Cập nhật sản phẩm kháng thể dùng trong chẩn đoán mô bệnh học, tối ưu cho độ lặp lại và khả năng quan sát tín hiệu.',
    image: '/assetsFull/tintuc2.png',
    url: 'https://bio-optica.it/it/news/detail/1147',
  },
  {
    category: 'Sản phẩm',
    date: '08/07/2026',
    title: 'Bộ nhuộm tự động GIEMSA mới',
    excerpt:
      'Bộ sản phẩm hai màu giúp phòng xét nghiệm chuẩn hóa quy trình nhuộm, giảm thao tác thủ công và cải thiện hiệu quả vận hành.',
    image: '/assetsFull/tintuc4.png',
    url: 'https://bio-optica.it/it/news/detail/917',
  },
  {
    category: 'Giải pháp',
    date: '07/07/2026',
    title: 'Số hóa tiêu bản trong giải phẫu bệnh',
    excerpt:
      'Các hệ thống quét lam kính giúp lưu trữ, chia sẻ và hội chẩn hình ảnh mô bệnh học thuận tiện hơn trong môi trường bệnh viện.',
    image: '/assetsFull/VX504.webp',
    url: '/Scaning',
  },
  {
    category: 'Thiết bị',
    date: '07/07/2026',
    title: 'Tối ưu quy trình xử lý mô tự động',
    excerpt:
      'Thiết bị xử lý mô giúp chuẩn hóa các bước khử nước, làm trong và thấm paraffin để nâng cao chất lượng mẫu bệnh phẩm.',
    image: '/assetsFull/mayxuly.png',
    url: '/TissueProcessing',
  },
  {
    category: 'Dịch vụ',
    date: '06/07/2026',
    title: 'Đồng hành kỹ thuật sau triển khai',
    excerpt:
      'Ecolink cung cấp hỗ trợ kỹ thuật, tư vấn vận hành và bảo trì nhằm bảo đảm hệ thống hoạt động ổn định trong dài hạn.',
    image: '/assetsFull/dichvuhotro.jpeg',
    url: '/SupportService',
  },
]

const categories = ['Tất cả', 'Tin tức', 'Sản phẩm', 'Giải pháp', 'Thiết bị', 'Dịch vụ']

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url)
}

export default function NewsPage() {
  const featured = newsItems[0]
  const latest = newsItems.slice(1)

  return (
    <div className={styles.page}>
      <Header />

      <section className={styles.hero}>
        <FigmaImage className={styles.heroImage} src="/assetsFull/testimonial.png" alt="" ariaHidden />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span>Tin tức & sự kiện</span>
          <h1>Cập nhật công nghệ, sản phẩm và giải pháp mới</h1>
          <p>
            Tổng hợp thông tin từ Ecolink và các đối tác trong lĩnh vực giải phẫu bệnh,
            xét nghiệm, pháp y và thiết bị khoa học công nghệ.
          </p>
        </div>
      </section>

      <main className={styles.content}>
        <section className={styles.featuredSection}>
          <article className={styles.featuredCard}>
            <FigmaImage className={styles.featuredImage} src={featured.image} alt={featured.title} />
            <div className={styles.featuredBody}>
              <span className={styles.category}>{featured.category}</span>
              <h2>{featured.title}</h2>
              <p>{featured.excerpt}</p>
              <a
                href={featured.url}
                target={isExternalUrl(featured.url) ? '_blank' : undefined}
                rel={isExternalUrl(featured.url) ? 'noreferrer' : undefined}
              >
                Đọc bài viết <FaArrowRight />
              </a>
            </div>
          </article>
        </section>

        <section className={styles.newsLayout}>
          <div className={styles.newsColumn}>
            <div className={styles.sectionHeader}>
              <span>Bài viết mới</span>
              <h2>Tin tức nổi bật</h2>
            </div>

            <div className={styles.newsGrid}>
              {latest.map((item) => (
                <article className={styles.newsCard} key={item.title}>
                  <FigmaImage className={styles.newsImage} src={item.image} alt={item.title} />
                  <div className={styles.newsBody}>
                    <div className={styles.meta}>
                      <span><FaTags />{item.category}</span>
                      <span><FaCalendarAlt />{item.date}</span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.excerpt}</p>
                    <a
                      href={item.url}
                      target={isExternalUrl(item.url) ? '_blank' : undefined}
                      rel={isExternalUrl(item.url) ? 'noreferrer' : undefined}
                    >
                      Đọc thêm <FaArrowRight />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className={styles.sidebar}>
            <section className={styles.sidePanel}>
              <h2>Danh mục</h2>
              <div className={styles.categoryList}>
                {categories.map((item) => (
                  <button type="button" key={item}>{item}</button>
                ))}
              </div>
            </section>

            <section className={styles.sidePanel}>
              <h2>Theo dõi cập nhật</h2>
              <p>Nhận tư vấn nhanh về sản phẩm, giải pháp và thông tin kỹ thuật phù hợp với nhu cầu của đơn vị.</p>
              <a className={styles.contactButton} href="/ContactPage">Liên hệ Ecolink</a>
            </section>
          </aside>
        </section>
      </main>
    </div>
  )
}
