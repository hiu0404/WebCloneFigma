import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Header } from '../components/Header/Header'
import { Breadcrumb } from '../components/Breadcrumb'
import { CategorySeo } from '../components/CategorySeo'
import { apiGetInstallation } from '../services/installationService'
import { publicRegionLabels, type PublicInstallation } from '../data/installations'
import styles from './InstallationsPage.module.css'

export function InstallationDetailPage() {
  const { slug = '' } = useParams()
  const [item, setItem] = useState<PublicInstallation | null>(null)
  const [resolvedSlug, setResolvedSlug] = useState('')
  const [selectedImage, setSelectedImage] = useState('')

  useEffect(() => {
    let active = true
    apiGetInstallation(slug)
      .then((record) => { if (active) setItem(record) })
      .catch(() => { if (active) setItem(null) })
      .finally(() => { if (active) setResolvedSlug(slug) })
    return () => { active = false }
  }, [slug])

  const loading = resolvedSlug !== slug
  const activeImage = item?.imageUrls.includes(selectedImage) ? selectedImage : item?.imageUrls[0]
  const activeIndex = item && activeImage ? item.imageUrls.indexOf(activeImage) : -1
  const breadcrumbs = [{ label: 'Trang chủ', to: '/' }, { label: 'Thiết bị đã triển khai', to: '/thiet-bi-da-trien-khai' }, ...(item ? [{ label: item.title }] : [])]

  return <div className={styles.page}>
    {item && !loading && <CategorySeo title={item.title} description={item.summary || `Hình ảnh lắp đặt ${item.product.name} do Ecolink công bố.`} canonical={`/thiet-bi-da-trien-khai/${encodeURIComponent(item.slug)}`} image={item.imageUrls[0]} breadcrumbs={breadcrumbs} />}
    <Header />
    <main className={styles.main}>
      <Breadcrumb items={breadcrumbs} />
      {loading ? <p className={styles.message}>Đang tải công trình...</p> : !item ? <div className={styles.message}>Không tìm thấy công trình. <Link to="/thiet-bi-da-trien-khai">Xem danh sách</Link></div> : <>
        <h1>{item.title}</h1>
        {item.summary && <p className={styles.intro}>{item.summary}</p>}
        <div className={styles.detailLayout}>
          <div className={styles.gallery}>
            {activeImage && <figure className={styles.mainPhoto}>
              <img src={activeImage} alt={item.imageCaptions?.[activeImage] || `${item.product.name} — ảnh thực tế ${activeIndex + 1}`} loading="eager" />
              <figcaption>{item.imageCaptions?.[activeImage] || `${item.product.name} — ảnh ${activeIndex + 1}`}</figcaption>
            </figure>}
            {item.imageUrls.length > 1 && <div className={styles.thumbnails} role="group" aria-label="Chọn ảnh">
              {item.imageUrls.map((url, index) => <button type="button" key={url} className={url === activeImage ? styles.thumbnailActive : ''} aria-label={`Xem ảnh ${index + 1}`} aria-pressed={url === activeImage} onClick={() => setSelectedImage(url)}>
                <img src={url} alt="" loading="lazy" />
              </button>)}
            </div>}
          </div>
          <aside className={styles.detailInfo}>
            <h2>Thiết bị</h2>
            <dl>
              <dt>Tên sản phẩm</dt><dd>{item.product.name}</dd>
              {item.product.model && <><dt>Model</dt><dd>{item.product.model}</dd></>}
              {item.product.brand && <><dt>Hãng sản xuất</dt><dd>{item.product.brand}</dd></>}
              {item.publicRegion && <><dt>Khu vực</dt><dd>{publicRegionLabels[item.publicRegion]}</dd></>}
            </dl>
            <Link className={styles.productLink} to={item.product.url}>Xem thông tin sản phẩm →</Link>
          </aside>
        </div>
      </>}
    </main>
  </div>
}
