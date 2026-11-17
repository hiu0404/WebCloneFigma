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
  const [selectedProvince, setSelectedProvince] = useState('all')
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
  const provinces = useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of items) {
      if (item.publicProvince) counts.set(item.publicProvince, (counts.get(item.publicProvince) || 0) + 1)
    }
    return [...counts].sort(([a], [b]) => a.localeCompare(b, 'vi'))
  }, [items])
  const shown = useMemo(() => items.filter((item) => {
    if (selectedCategory !== 'all' && (item.product.category || 'Thiết bị') !== selectedCategory) return false
    if (selectedRegion !== 'all' && item.publicRegion !== selectedRegion) return false
    if (selectedProvince !== 'all' && item.publicProvince !== selectedProvince) return false
    if (!search.trim()) return true
    return searchText([item.title, item.product.name, item.product.model, item.product.brand, item.publicProvince].join(' ')).includes(searchText(search.trim()))
  }), [items, selectedCategory, selectedRegion, selectedProvince, search])

  function chooseProvince(province: string) {
    setSelectedProvince(province)
    setSelectedCategory('all')
    setSelectedRegion('all')
    setSearch('')
  }
  const breadcrumbs = [{ label: 'Trang chủ', to: '/' }, { label: 'Thiết bị đã triển khai' }]

  return <div className={styles.page}>
    <CategorySeo title="Thiết bị đã triển khai" description="Hình ảnh thực tế của các thiết bị Ecolink đã lắp đặt và được phép công bố." canonical="/thiet-bi-da-trien-khai" breadcrumbs={breadcrumbs} />
    <Header />
    <main className={styles.main}>
      <Breadcrumb items={breadcrumbs} />
      <section className={styles.hero}>
        <span className={styles.eyebrow}>Hình ảnh thực tế</span>
        <h1>Thiết bị đã triển khai</h1>
        <p className={styles.intro}>Khám phá hình ảnh thiết bị theo tỉnh, thành và nhóm sản phẩm. Thông tin đơn vị sử dụng không hiển thị.</p>
      </section>
      {provinces.length > 0 && <section className={styles.provinceSection} aria-labelledby="province-heading">
        <div className={styles.provinceIntro}>
          <div>
            <span className={styles.provinceEyebrow}>Địa phương đã có hình ảnh</span>
            <h2 id="province-heading">Thiết bị theo tỉnh, thành</h2>
          </div>
          <p>Chọn địa phương để xem thiết bị đã được công bố tại đó.</p>
        </div>
        <div className={styles.provinceGrid} role="group" aria-label="Lọc thiết bị theo địa phương">
          <button type="button" className={selectedProvince === 'all' ? styles.provinceActive : ''} aria-pressed={selectedProvince === 'all'} onClick={() => chooseProvince('all')}>
            <span>Tất cả địa phương</span><strong>{items.length}</strong>
          </button>
          {provinces.map(([province, count]) => <button type="button" key={province} className={selectedProvince === province ? styles.provinceActive : ''} aria-pressed={selectedProvince === province} onClick={() => chooseProvince(province)}>
            <span>{province}</span><strong>{count}</strong>
          </button>)}
        </div>
      </section>}
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
        <p className={styles.resultCount} role="status">{shown.length} bộ ảnh{selectedProvince !== 'all' ? ` tại ${selectedProvince}` : ''}</p>
      </div>}
      {loading ? <p className={styles.message}>Đang tải hình ảnh...</p> : error ? <p className={styles.message} role="alert">{error}</p> : shown.length
        ? <div className={styles.grid}>{shown.map((item, index) => <InstallationCard item={item} priority={index === 0} key={item.id} />)}</div>
        : <p className={styles.message}>{items.length ? 'Không có bộ ảnh phù hợp với bộ lọc.' : 'Chưa có bộ ảnh nào được công bố.'}</p>}
    </main>
  </div>
}
