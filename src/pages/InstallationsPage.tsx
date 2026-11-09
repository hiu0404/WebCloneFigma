import { useEffect, useMemo, useState } from 'react'
import { Header } from '../components/Header/Header'
import { Breadcrumb } from '../components/Breadcrumb'
import { CategorySeo } from '../components/CategorySeo'
import { InstallationCard } from '../components/InstallationCard'
import { apiGetInstallations } from '../services/installationService'
import type { PublicInstallation } from '../data/installations'
import styles from './InstallationsPage.module.css'

export function InstallationsPage() {
  const [items, setItems] = useState<PublicInstallation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    let active = true
    apiGetInstallations()
      .then((records) => { if (active) setItems(records) })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Không tải được hình ảnh') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const categories = useMemo(() => [...new Set(items.map((item) => item.product.category).filter(Boolean))], [items])
  const shown = selectedCategory === 'all' ? items : items.filter((item) => item.product.category === selectedCategory)
  const breadcrumbs = [{ label: 'Trang chủ', to: '/' }, { label: 'Thiết bị đã triển khai' }]

  return <div className={styles.page}>
    <CategorySeo title="Thiết bị đã triển khai" description="Hình ảnh thực tế của các thiết bị Ecolink đã lắp đặt và được phép công bố." canonical="/thiet-bi-da-trien-khai" breadcrumbs={breadcrumbs} />
    <Header />
    <main className={styles.main}>
      <Breadcrumb items={breadcrumbs} />
      <h1>Thiết bị đã triển khai</h1>
      <p className={styles.intro}>Hình ảnh lắp đặt thực tế được công bố theo từng thiết bị. Thông tin đơn vị sử dụng không hiển thị.</p>
      {categories.length > 1 && <div className={styles.filters} aria-label="Lọc theo nhóm thiết bị">
        <button type="button" className={selectedCategory === 'all' ? styles.filterActive : ''} onClick={() => setSelectedCategory('all')}>Tất cả</button>
        {categories.map((category) => <button type="button" key={category} className={selectedCategory === category ? styles.filterActive : ''} onClick={() => setSelectedCategory(category)}>{category}</button>)}
      </div>}
      {loading ? <p className={styles.message}>Đang tải hình ảnh...</p> : error ? <p className={styles.message} role="alert">{error}</p> : shown.length
        ? <div className={styles.grid}>{shown.map((item) => <InstallationCard item={item} key={item.id} />)}</div>
        : <p className={styles.message}>Chưa có hình ảnh công trình được công bố.</p>}
    </main>
  </div>
}
