import { useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { FigmaImage } from '../components/FigmaImage'
import { SeoHead } from '../components/SeoHead'
import styles from './NewsPage.module.css'

const newsItems = [
  {
    category: 'Tin tức',
    date: '08/07/2026',
    title: 'P16 + Ki-67 Nhuộm miễn dịch đa kênh',
    image: '/assetsFull/tintuc1.png',
    url: 'https://bio-optica.it/it/news/detail/1149',
  },
  {
    category: 'Tin tức',
    date: '08/07/2026',
    title: 'p16 INK4a [BC42] Kháng thể đơn dòng chuột',
    image: '/assetsFull/tintuc2.png',
    url: 'https://bio-optica.it/it/news/detail/1147',
  },
  {
    category: 'Sản phẩm',
    date: '08/07/2026',
    title: 'Bộ nhuộm tự động GIEMSA mới',
    image: '/assetsFull/tintuc4.png',
    url: 'https://bio-optica.it/it/news/detail/917',
  },
  {
    category: 'Giải pháp',
    date: '07/07/2026',
    title: 'Số hóa tiêu bản trong giải phẫu bệnh',
    image: '/assetsFull/VX504.webp',
    url: '/Scaning',
  },
  {
    category: 'Thiết bị',
    date: '07/07/2026',
    title: 'Tối ưu quy trình xử lý mô tự động',
    image: '/assetsFull/mayxuly.png',
    url: '/TissueProcessing',
  },
  {
    category: 'Dịch vụ',
    date: '06/07/2026',
    title: 'Đồng hành kỹ thuật sau triển khai',
    image: '/assetsFull/dichvuhotro.jpeg',
    url: '/dich-vu-ho-tro',
  },
]

const categories = ['Tất cả', ...new Set(newsItems.map((item) => item.category))]

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url)
}

function isoDate(date: string) {
  const [day, month, year] = date.split('/')
  return `${year}-${month}-${day}`
}

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const visibleNews = selectedCategory === 'Tất cả' ? newsItems : newsItems.filter((item) => item.category === selectedCategory)

  return (
    <div className={styles.page}>
      <SeoHead title="Tin tức và cập nhật | Ecolink" description="Tin tức về sản phẩm, thiết bị và giải pháp được Ecolink giới thiệu trong lĩnh vực khoa học và y tế." canonical="/tin-tuc" />

      <main className={styles.content}>
        <nav className={styles.breadcrumb} aria-label="Đường dẫn trang">
          <Link to="/">Trang chủ</Link><span aria-hidden="true">›</span><span aria-current="page">Tin tức</span>
        </nav>
        <h1 className={styles.visuallyHidden}>Tin tức và sự kiện Ecolink</h1>

        <div className={styles.filterBar}>
          <label htmlFor="news-category">Lọc theo danh mục:</label>
          <div className={styles.selectWrap}>
            <select id="news-category" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
              {categories.map((category) => <option key={category} value={category}>{category === 'Tất cả' ? 'Chọn danh mục' : category}</option>)}
            </select>
            <FiChevronDown aria-hidden="true" />
          </div>
        </div>

        <section className={styles.newsGrid} aria-label="Danh sách tin tức">
          {visibleNews.map((item) => {
            const external = isExternalUrl(item.url)
            const cardContent = <>
              <div className={styles.imageFrame}>
                <FigmaImage className={styles.newsImage} src={item.image} alt="" loading="lazy" />
              </div>
              <div className={styles.newsBody}>
                <span className={styles.category}>{item.category}</span>
                <h2>{item.title}</h2>
                <time dateTime={isoDate(item.date)}>{item.date}</time>
              </div>
            </>

            return external ? (
              <a className={styles.newsCard} href={item.url} target="_blank" rel="noopener noreferrer" key={item.title} aria-label={`${item.title} (mở trang mới)`}>
                {cardContent}
              </a>
            ) : (
              <Link className={styles.newsCard} to={item.url} key={item.title}>
                {cardContent}
              </Link>
            )
          })}
        </section>
      </main>
    </div>
  )
}
