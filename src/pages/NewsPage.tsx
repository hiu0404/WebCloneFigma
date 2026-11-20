import { useEffect, useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { FigmaImage } from '../components/FigmaImage'
import { SeoHead } from '../components/SeoHead'
import { newsDate, newsHref, type NewsArticle } from '../data/news'
import { apiGetNews } from '../services/newsService'
import styles from './NewsPage.module.css'

function NewsCard({ article }: { article: NewsArticle }) {
  const body = <>
    <div className={styles.imageFrame}>
      {article.imageUrl ? <FigmaImage className={styles.newsImage} src={article.imageUrl} alt="" loading="lazy" /> :
        <div className={styles.imagePlaceholder} aria-hidden="true">ECOLINK</div>}
    </div>
    <div className={styles.newsBody}>
      <span className={styles.category}>{article.category}</span>
      <h2>{article.title}</h2>
      <time dateTime={article.publishedAt}>{newsDate(article.publishedAt)}</time>
    </div>
  </>
  const url = newsHref(article)
  return /^https?:\/\//i.test(url) ?
    <a className={styles.newsCard} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${article.title} (mở trang mới)`}>{body}</a> :
    <Link className={styles.newsCard} to={url}>{body}</Link>
}

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [items, setItems] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    apiGetNews().then((articles) => {
      if (alive) setItems(articles)
    }).catch((cause) => {
      if (alive) setError(cause instanceof Error ? cause.message : 'Không tải được tin tức')
    }).finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  const categories = ['Tất cả', ...new Set(items.map((item) => item.category))]
  const visible = selectedCategory === 'Tất cả' ? items : items.filter((item) => item.category === selectedCategory)

  return <div className={styles.page}>
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
      {loading ? <p className={styles.state}>Đang tải tin tức...</p> : error ?
        <p className={styles.state} role="alert">{error}</p> : visible.length === 0 ?
          <p className={styles.state}>Chưa có bài viết trong danh mục này.</p> :
          <section className={styles.newsGrid} aria-label="Danh sách tin tức">
            {visible.map((article) => <NewsCard article={article} key={article.id} />)}
          </section>}
    </main>
  </div>
}
