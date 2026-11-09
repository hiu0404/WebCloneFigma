import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Header } from '../components/Header/Header'
import { Breadcrumb } from '../components/Breadcrumb'
import { CategorySeo } from '../components/CategorySeo'
import { apiGetInstallation } from '../services/installationService'
import type { PublicInstallation } from '../data/installations'
import styles from './InstallationsPage.module.css'

export function InstallationDetailPage() {
  const { slug = '' } = useParams()
  const [item, setItem] = useState<PublicInstallation | null>(null)
  const [resolvedSlug, setResolvedSlug] = useState('')

  useEffect(() => {
    let active = true
    apiGetInstallation(slug)
      .then((record) => { if (active) setItem(record) })
      .catch(() => { if (active) setItem(null) })
      .finally(() => { if (active) setResolvedSlug(slug) })
    return () => { active = false }
  }, [slug])

  const loading = resolvedSlug !== slug
  const breadcrumbs = [{ label: 'Trang chủ', to: '/' }, { label: 'Thiết bị đã triển khai', to: '/thiet-bi-da-trien-khai' }, ...(item ? [{ label: item.title }] : [])]

  return <div className={styles.page}>
    {item && !loading && <CategorySeo title={item.title} description={item.summary || `Hình ảnh lắp đặt ${item.product.name} do Ecolink công bố.`} canonical={`/thiet-bi-da-trien-khai/${encodeURIComponent(item.slug)}`} image={item.imageUrls[0]} breadcrumbs={breadcrumbs} />}
    <Header />
    <main className={styles.main}>
      <Breadcrumb items={breadcrumbs} />
      {loading ? <p className={styles.message}>Đang tải công trình...</p> : !item ? <div className={styles.message}>Không tìm thấy công trình. <Link to="/thiet-bi-da-trien-khai">Xem danh sách</Link></div> : <>
        <h1>{item.title}</h1>
        <p className={styles.intro}>{item.summary || `Hình ảnh lắp đặt ${item.product.name}.`}</p>
        <div className={styles.detailLayout}>
          <div className={styles.gallery}>
            {item.imageUrls.map((url, index) => <figure key={url}>
              <img src={url} alt={`${item.product.name} — ảnh lắp đặt ${index + 1}`} loading={index === 0 ? 'eager' : 'lazy'} />
              <figcaption>Hình ảnh lắp đặt {index + 1}</figcaption>
            </figure>)}
          </div>
          <aside className={styles.detailInfo}>
            <h2>Thiết bị</h2>
            <dl>
              <dt>Tên sản phẩm</dt><dd>{item.product.name}</dd>
              {item.product.model && <><dt>Model</dt><dd>{item.product.model}</dd></>}
              {item.product.brand && <><dt>Hãng sản xuất</dt><dd>{item.product.brand}</dd></>}
            </dl>
            <Link className={styles.productLink} to={item.product.url}>Xem thông tin sản phẩm →</Link>
          </aside>
        </div>
      </>}
    </main>
  </div>
}
