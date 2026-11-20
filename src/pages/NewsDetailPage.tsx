import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft, FiArrowRight, FiExternalLink } from 'react-icons/fi'
import { SeoHead } from '../components/SeoHead'
import { newsDate, type NewsArticle } from '../data/news'
import { apiGetNewsArticle } from '../services/newsService'
import styles from './NewsDetailPage.module.css'

export default function NewsDetailPage() {
  const { slug = '' } = useParams()
  return <NewsArticleView key={slug} slug={slug} />
}

function NewsArticleView({ slug }: { slug: string }) {
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    apiGetNewsArticle(slug).then((item) => { if (alive) setArticle(item) })
      .catch((cause) => { if (alive) setError(cause instanceof Error ? cause.message : 'Không tìm thấy bài viết') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [slug])

  return <div className={styles.page}>
    <SeoHead title={article ? `${article.title} | Ecolink` : 'Tin tức | Ecolink'} description={article?.excerpt || 'Tin tức và cập nhật từ Ecolink.'} canonical={`/tin-tuc/${slug}`} image={article?.imageUrl || undefined} />
    <main className={styles.content}>
      <nav className={styles.breadcrumb} aria-label="Đường dẫn trang"><Link to="/">Trang chủ</Link><span>›</span><Link to="/tin-tuc">Tin tức</Link><span>›</span><span aria-current="page">{article?.title || 'Bài viết'}</span></nav>
      {loading ? <p>Đang tải bài viết...</p> : error || !article ? <div className={styles.empty}><h1>Không tìm thấy bài viết</h1><Link to="/tin-tuc"><FiArrowLeft /> Quay lại tin tức</Link></div> :
        <article className={styles.article}>
          <div className={styles.head}><span className={styles.category}>{article.category}</span><time dateTime={article.publishedAt}>{newsDate(article.publishedAt)}</time></div>
          <h1>{article.title}</h1>
          <p className={styles.lead}>{article.excerpt}</p>
          {article.imageUrl && <img className={styles.hero} src={article.imageUrl} alt={article.title} />}
          <div className={styles.body}>{article.content.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
          <div className={styles.links}>
            {article.relatedProductUrl && <Link className={styles.primary} to={article.relatedProductUrl}>Xem sản phẩm liên quan <FiArrowRight /></Link>}
            {article.sourceUrl && <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">Nguồn tham khảo <FiExternalLink /></a>}
          </div>
          <Link className={styles.back} to="/tin-tuc"><FiArrowLeft /> Xem các tin khác</Link>
        </article>}
    </main>
  </div>
}
