import { useEffect, useMemo, useState } from 'react'
import { Header } from '../components/Header/Header'
import { Breadcrumb } from '../components/Breadcrumb'
import { CategorySeo } from '../components/CategorySeo'
import { InstallationCard } from '../components/InstallationCard'
import { apiGetInstallations } from '../services/installationService'
import { publicRegionLabels, type PublicInstallation, type PublicRegion } from '../data/installations'
import styles from './InstallationsPage.module.css'

function searchText(value: string) {
  return value.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
}

export function InstallationsPage() {
  const [items, setItems] = useState<PublicInstallation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedRegion, setSelectedRegion] = useState<PublicRegion | 'all'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let active = true
    apiGetInstallations()
      .then((records) => { if (active) setItems(records) })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Không tải được hình ảnh') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const categories = useMemo(() => [...new Set(items.map((item) => item.product.category || 'Thiết bị'))].sort((a, b) => a.localeCompare(b, 'vi')), [items])
  const regions = useMemo(() => (Object.keys(publicRegionLabels) as PublicRegion[]).filter((region) => items.some((item) => item.publicRegion === region)), [items])
  const shown = useMemo(() => items.filter((item) => {
    if (selectedCategory !== 'all' && (item.product.category || 'Thiết bị') !== selectedCategory) return false
    if (selectedRegion !== 'all' && item.publicRegion !== selectedRegion) return false
    if (!search.trim()) return true
    return searchText([item.title, item.product.name, item.product.model, item.product.brand].join(' ')).includes(searchText(search.trim()))
  }), [items, selectedCategory, selectedRegion, search])
  const breadcrumbs = [{ label: 'Trang chủ', to: '/' }, { label: 'Thiết bị đã triển khai' }]

  return <div className={styles.page}>
    <CategorySeo title="Thiết bị đã triển khai" description="Hình ảnh thực tế của các thiết bị Ecolink đã lắp đặt và được phép công bố." canonical="/thiet-bi-da-trien-khai" breadcrumbs={breadcrumbs} />
    <Header />
    <main className={styles.main}>
      <Breadcrumb items={breadcrumbs} />
      <section className={styles.hero}>
        <span className={styles.eyebrow}>Hình ảnh thực tế</span>
        <h1>Thiết bị đã triển khai</h1>
        <p className={styles.intro}>Khám phá hình ảnh theo thiết bị và nhóm sản phẩm. Thông tin đơn vị sử dụng không hiển thị.</p>
      </section>
      {items.length > 0 && <div className={styles.catalogueControls}>
        <div className={styles.controlTop}>
          <label className={styles.searchField}>
            <span>Tìm thiết bị hoặc model</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nhập tên hoặc model" />
          </label>
          {regions.length > 0 && <label className={styles.regionField}>
            <span>Khu vực công khai</span>
            <select value={selectedRegion} onChange={(event) => setSelectedRegion(event.target.value as PublicRegion | 'all')}>
              <option value="all">Tất cả khu vực</option>
              {regions.map((region) => <option value={region} key={region}>{publicRegionLabels[region]}</option>)}
            </select>
          </label>}
        </div>
        {categories.length > 1 && <div className={styles.filters} role="group" aria-label="Lọc theo nhóm thiết bị">
          <button type="button" aria-pressed={selectedCategory === 'all'} className={selectedCategory === 'all' ? styles.filterActive : ''} onClick={() => setSelectedCategory('all')}>Tất cả</button>
          {categories.map((category) => <button type="button" key={category} aria-pressed={selectedCategory === category} className={selectedCategory === category ? styles.filterActive : ''} onClick={() => setSelectedCategory(category)}>{category}</button>)}
        </div>}
        <p className={styles.resultCount} role="status">{shown.length} bộ ảnh</p>
      </div>}
      {loading ? <p className={styles.message}>Đang tải hình ảnh...</p> : error ? <p className={styles.message} role="alert">{error}</p> : shown.length
        ? <div className={styles.grid}>{shown.map((item, index) => <InstallationCard item={item} priority={index === 0} key={item.id} />)}</div>
        : <p className={styles.message}>{items.length ? 'Không có bộ ảnh phù hợp với bộ lọc.' : 'Chưa có bộ ảnh nào được công bố.'}</p>}
    </main>
  </div>
}
