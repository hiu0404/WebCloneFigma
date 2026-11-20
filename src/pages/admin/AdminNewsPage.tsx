import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiEdit2, FiExternalLink, FiPlus, FiRefreshCw, FiTrash2, FiUpload } from 'react-icons/fi'
import { newsDate, newsHref, type NewsArticle, type NewsInput } from '../../data/news'
import { apiDeleteNews, apiGetAdminNews, apiSaveNews, apiUploadNewsImage } from '../../services/newsService'
import styles from './AdminPages.module.css'
import newsStyles from './AdminNewsPage.module.css'

function blank(): NewsInput {
  return {
    slug: '', title: '', category: 'Tin tức', excerpt: '', content: '',
    imageUrl: '', sourceUrl: '', relatedProductUrl: '', linkUrl: '',
    status: 'draft', publishedAt: new Date().toISOString().slice(0, 10), featured: false,
  }
}

export function AdminNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all')
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<NewsInput>({ defaultValues: blank() })
  const imageUrl = watch('imageUrl')
  const title = watch('title')

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setArticles(await apiGetAdminNews())
      setMessage('')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không tải được tin tức')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void reload() }, [reload])

  function clear() {
    setEditingId(null)
    reset(blank())
  }

  function edit(article: NewsArticle) {
    setEditingId(article.id)
    reset({
      slug: article.slug, title: article.title, category: article.category,
      excerpt: article.excerpt, content: article.content,
      imageUrl: article.imageUrl, sourceUrl: article.sourceUrl,
      relatedProductUrl: article.relatedProductUrl, linkUrl: article.linkUrl,
      status: article.status, publishedAt: article.publishedAt,
      featured: article.featured,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = (status: 'draft' | 'published') => handleSubmit(async (values) => {
    setBusy(true)
    setMessage('')
    try {
      await apiSaveNews({ ...values, status }, editingId || undefined)
      await reload()
      clear()
      setMessage(status === 'published' ? 'Đã đăng bài viết' : 'Đã lưu bản nháp')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không lưu được bài viết')
    } finally {
      setBusy(false)
    }
  })

  async function upload(file: File) {
    setBusy(true)
    try {
      setValue('imageUrl', await apiUploadNewsImage(file), { shouldDirty: true })
      setMessage('Đã tải ảnh lên')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không tải được ảnh')
    } finally {
      setBusy(false)
    }
  }

  async function remove(article: NewsArticle) {
    if (!window.confirm(`Xóa bài viết “${article.title}”?`)) return
    setBusy(true)
    try {
      await apiDeleteNews(article.id)
      if (editingId === article.id) clear()
      await reload()
      setMessage('Đã xóa bài viết')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không xóa được bài viết')
    } finally {
      setBusy(false)
    }
  }

  const visible = articles.filter((article) => {
    if (filter !== 'all' && article.status !== filter) return false
    const term = search.trim().toLocaleLowerCase('vi')
    return !term || `${article.title} ${article.category}`.toLocaleLowerCase('vi').includes(term)
  })

  return <div className={styles.stack}>
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>{editingId ? 'Chỉnh sửa bài viết' : 'Thêm bài viết'}</h2>
          <p className={styles.panelSub}>Viết nội dung bằng tiếng Việt. Mỗi đoạn cách nhau một dòng trống.</p>
        </div>
        <button type="button" className={styles.secondaryButton} onClick={clear}><FiRefreshCw /> Làm mới</button>
      </div>
      <div className={styles.panelBody}>
        <form onSubmit={submit('published')}>
          <div className={styles.formGrid}>
            <label className={`${styles.field} ${styles.full}`}>
              <span className={styles.label}>Tiêu đề *</span>
              <input className={styles.input} maxLength={180} {...register('title', { required: 'Vui lòng nhập tiêu đề' })} />
              {errors.title && <span className={styles.error}>{errors.title.message}</span>}
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Danh mục *</span>
              <input className={styles.input} list="news-categories" maxLength={80} {...register('category', { required: 'Vui lòng nhập danh mục' })} />
              <datalist id="news-categories"><option value="Tin tức" /><option value="Sản phẩm" /><option value="Giải pháp" /><option value="Thiết bị" /><option value="Sự kiện" /></datalist>
              {errors.category && <span className={styles.error}>{errors.category.message}</span>}
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Ngày đăng</span>
              <input className={styles.input} type="date" {...register('publishedAt')} />
            </label>
            <label className={`${styles.field} ${styles.full}`}>
              <span className={styles.label}>Mô tả ngắn *</span>
              <textarea className={styles.textarea} maxLength={600} {...register('excerpt', { required: 'Vui lòng nhập mô tả ngắn' })} />
              {errors.excerpt && <span className={styles.error}>{errors.excerpt.message}</span>}
            </label>
            <label className={`${styles.field} ${styles.full}`}>
              <span className={styles.label}>Nội dung bài viết</span>
              <textarea className={`${styles.textarea} ${newsStyles.contentInput}`} placeholder="Nhập nội dung bài viết…" {...register('content')} />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Ảnh đại diện</span>
              <input className={styles.input} type="file" accept="image/*" disabled={busy} onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void upload(file)
                event.target.value = ''
              }} />
              <span className={styles.muted}><FiUpload /> Tải ảnh từ máy hoặc nhập đường dẫn bên dưới.</span>
              <input className={styles.input} placeholder="/assetsFull/anh.jpg" {...register('imageUrl')} />
              {imageUrl && <img className={newsStyles.imagePreview} src={imageUrl} alt="Ảnh đại diện bài viết" />}
            </label>
            <div className={newsStyles.optionalFields}>
              <label className={styles.field}><span className={styles.label}>Đường dẫn bài viết</span><input className={styles.input} placeholder="Tự tạo từ tiêu đề nếu để trống" {...register('slug')} /></label>
              <label className={styles.field}><span className={styles.label}>Nguồn tham khảo</span><input className={styles.input} type="url" placeholder="https://..." {...register('sourceUrl')} /></label>
              <label className={styles.field}><span className={styles.label}>Sản phẩm liên quan</span><input className={styles.input} placeholder="/san-pham/..." {...register('relatedProductUrl')} /></label>
              <label className={styles.field}><span className={styles.label}>Liên kết ngoài thay bài chi tiết</span><input className={styles.input} placeholder="https://..." {...register('linkUrl')} /></label>
            </div>
            <label className={styles.switchRow}>
              <input className={styles.checkbox} type="checkbox" {...register('featured')} />
              <span className={styles.label}>Đưa vào mục tin tức trên trang chủ</span>
            </label>
          </div>
          <div className={styles.actions}>
            <button className={styles.secondaryButton} type="button" disabled={busy} onClick={() => void submit('draft')()}>{editingId ? 'Lưu bản nháp' : 'Tạo bản nháp'}</button>
            <button className={styles.button} type="submit" disabled={busy}><FiPlus /> {editingId ? 'Lưu và đăng' : 'Đăng bài'}</button>
            {title && <span className={styles.muted}>Xem trước đường dẫn: /tin-tuc/{watch('slug') || 'tieu-de-bai-viet'}</span>}
          </div>
        </form>
      </div>
    </section>

    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div><h2 className={styles.panelTitle}>Danh sách bài viết</h2><p className={styles.panelSub}>{articles.length} bài · {articles.filter((item) => item.status === 'published').length} đã đăng</p></div>
      </div>
      <div className={`${styles.panelBody} ${newsStyles.filters}`}>
        <input className={styles.input} type="search" placeholder="Tìm theo tiêu đề hoặc danh mục" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Tìm bài viết" />
        <select className={styles.select} value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} aria-label="Lọc trạng thái">
          <option value="all">Tất cả trạng thái</option><option value="published">Đã đăng</option><option value="draft">Bản nháp</option>
        </select>
      </div>
      {loading ? <div className={styles.loadingState}>Đang tải...</div> : visible.length === 0 ? <div className={styles.emptyState}>Chưa có bài viết phù hợp.</div> :
        <div className={styles.tableWrap}><table className={styles.table}>
          <thead><tr><th>Ảnh</th><th>Tiêu đề</th><th>Danh mục</th><th>Ngày đăng</th><th>Trạng thái</th><th>Trang chủ</th><th>Thao tác</th></tr></thead>
          <tbody>{visible.map((article) => <tr key={article.id}>
            <td>{article.imageUrl ? <img className={styles.thumb} src={article.imageUrl} alt="" /> : <span className={styles.thumbEmpty} />}</td>
            <td><div className={styles.productName}>{article.title}</div><span className={styles.muted}>/tin-tuc/{article.slug}</span></td>
            <td>{article.category}</td><td>{newsDate(article.publishedAt)}</td>
            <td><span className={article.status === 'published' ? styles.statusActive : styles.statusDraft}>{article.status === 'published' ? 'Đã đăng' : 'Bản nháp'}</span></td>
            <td>{article.featured ? 'Có' : 'Không'}</td>
            <td><div className={styles.rowActions}>
              {article.status === 'published' && <a className={styles.iconButton} href={newsHref(article)} target="_blank" rel="noreferrer" title="Xem bài viết" aria-label={`Xem ${article.title}`}><FiExternalLink /></a>}
              <button className={styles.iconButton} type="button" title="Sửa" aria-label={`Sửa ${article.title}`} onClick={() => edit(article)}><FiEdit2 /></button>
              <button className={styles.dangerButton} type="button" title="Xóa" aria-label={`Xóa ${article.title}`} disabled={busy} onClick={() => void remove(article)}><FiTrash2 /></button>
            </div></td>
          </tr>)}</tbody>
        </table></div>}
    </section>
    {message && <div className={styles.toast} role="status">{message}</div>}
  </div>
}
