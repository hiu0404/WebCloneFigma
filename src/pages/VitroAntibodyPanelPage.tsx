import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Breadcrumb } from '../components/Breadcrumb'
import { Header } from '../components/Header/Header'
import { QuoteRequestModal } from '../components/QuoteRequestModal'
import { SeoHead } from '../components/SeoHead'
import { VITRO_ANTIBODY_PANELS, VITRO_ANTIBODY_SOURCE, vitroPanelUrl } from '../components/VitroAntibodyShowcase'
import antibodyNames from '../data/vitroAntibodyNames.json'
import styles from './VitroAntibodyPanelPage.module.css'

const siteUrl = 'https://eco-link.vn'
const parentPath = '/khang-the/khang-the-vitro'

export function VitroAntibodyPanelPage() {
  const { panelSlug } = useParams()
  const panel = VITRO_ANTIBODY_PANELS.find((item) => item.slug === panelSlug)
  const [query, setQuery] = useState('')
  const [quotedName, setQuotedName] = useState<string | null>(null)
  if (!panel) return <Navigate to={parentPath} replace />

  const path = vitroPanelUrl(panel.slug)
  const names = antibodyNames[panel.slug as keyof typeof antibodyNames]
  const filteredNames = names.filter((name) => name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
  const source = names.length ? panel.pdf : VITRO_ANTIBODY_SOURCE
  const breadcrumb = [
    { label: 'Trang chủ', to: '/' },
    { label: 'Kháng thể', to: '/khang-the' },
    { label: 'Kháng thể Vitro', to: parentPath },
    { label: panel.title },
  ]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumb.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${siteUrl}${item.to || path}`,
    })),
  }

  return (
    <div className={styles.shell}>
      <SeoHead
        title={`Kháng thể Vitro – ${panel.title} | Ecolink`}
        description={names.length
          ? `Xem danh sách kháng thể ${panel.title.toLocaleLowerCase('vi')} theo tài liệu Vitro và gửi yêu cầu báo giá từng kháng thể tại Ecolink.`
          : `Tìm hiểu nhóm kháng thể ${panel.title.toLocaleLowerCase('vi')} của Vitro và gửi yêu cầu tư vấn tại Ecolink.`}
        canonical={path}
        jsonLd={jsonLd}
      />
      <Header />
      <main className={styles.page}>
        <div className={styles.inner}>
          <Breadcrumb items={breadcrumb} />
          <div className={styles.heading}>
            <span className={styles.eyebrow}>VITRO · HÓA MÔ MIỄN DỊCH</span>
            <h1>{panel.title}</h1>
            <p>{panel.description}</p>
            <p className={styles.disclaimer}>Danh sách tên được tham chiếu từ tài liệu nhà sản xuất. Vui lòng gửi yêu cầu để Ecolink xác nhận mã hàng và khả năng cung cấp.</p>
            <div className={styles.headingLinks}>
              <Link to={parentPath}>← Tất cả nhóm kháng thể</Link>
              {names.length > 0 && <a href={panel.pdf} target="_blank" rel="noopener noreferrer">Xem PDF Vitro ↗</a>}
            </div>
          </div>

          {names.length > 0 ? (
            <section className={styles.listSection} aria-labelledby="antibody-list-title">
              <div className={styles.listHeader}>
                <div>
                  <h2 id="antibody-list-title">Danh sách kháng thể</h2>
                  <p>{names.length} tên trong tài liệu Vitro</p>
                </div>
                <label className={styles.search}>Tìm trong nhóm
                  <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nhập tên hoặc clone" />
                </label>
              </div>
              {filteredNames.length > 0 ? (
                <div className={styles.grid}>
                  {filteredNames.map((name) => (
                    <article className={styles.card} key={name}>
                      <div>
                        <span className={styles.cardLabel}>KHÁNG THỂ VITRO</span>
                        <h3>{name}</h3>
                      </div>
                      <button type="button" onClick={() => setQuotedName(name)} aria-label={`Yêu cầu báo giá kháng thể ${name}`}>Báo giá →</button>
                    </article>
                  ))}
                </div>
              ) : <p className={styles.empty}>Không tìm thấy tên kháng thể phù hợp trong nhóm này.</p>}
            </section>
          ) : (
            <section className={styles.unverified} aria-labelledby="unverified-title">
              <h2 id="unverified-title">Danh sách đang chờ xác minh</h2>
              <p>PDF đang được liên kết từ nhóm này trên website Vitro hiển thị một panel khác. Ecolink chưa đăng danh sách từng kháng thể để tránh nhầm lẫn.</p>
              <button type="button" onClick={() => setQuotedName(panel.title)}>Yêu cầu tư vấn và báo giá nhóm này →</button>
              <a href={VITRO_ANTIBODY_SOURCE} target="_blank" rel="noopener noreferrer">Xem trang nhóm của Vitro ↗</a>
            </section>
          )}
        </div>
      </main>
      {quotedName && <QuoteRequestModal
        catalogueItem={{ name: quotedName, panel: panel.title, path, source }}
        onClose={() => setQuotedName(null)}
      />}
    </div>
  )
}
