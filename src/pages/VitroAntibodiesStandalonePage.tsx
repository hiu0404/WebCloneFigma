import { Link } from 'react-router-dom'
import { SeoHead } from '../components/SeoHead'
import {
  VITRO_ANTIBODY_PANELS,
  VITRO_ANTIBODY_SOURCE,
  vitroPanelUrl,
} from '../data/vitroAntibodyPanels'
import styles from './VitroAntibodiesStandalonePage.module.css'

const media = 'https://vitro.bio/wp-content/uploads/2026'
const dossier = `${media}/07/IHQ-ANTIBODIES-FOR-USE-IN-VITROSTAINER_compressed-1.pdf`

const panelImages = [
  ['cabecera-neuropatologia.webp', 'neuropatologia.webp'],
  ['cabecera-enfermedades-infecciosas.webp', 'enfermedades-infecciosas.webp'],
  ['cabecera-tejidos-blandos.webp', 'tejidos-blandos.webp'],
  ['cabecera-hipofisis.webp', 'hipofisis.webp'],
  ['cabecera-tejido-linfatico.webp', 'tejido-linfatico.webp'],
  ['cabeceras-uropatologia.webp', 'uropatologia.webp'],
  ['cabeceras-pleuropulmonar.webp', 'pleuropulmonar.webp'],
  ['cabeceras-tiroide.webp', 'tiroidea.webp'],
] as const

const solutions = [
  {
    image: 'anticuerpos.webp',
    title: 'Các nhóm kháng thể',
    description: 'Danh mục kháng thể và thuốc thử hóa mô miễn dịch được Vitro giới thiệu.',
    to: '/khang-the',
    label: 'Xem kháng thể Ecolink',
  },
  {
    image: 'vitrostainer-1.webp',
    title: 'VitroStainer',
    description: 'Thiết bị tự động hóa quy trình nhuộm và lai tại phòng xét nghiệm.',
    to: '/giai-phau-benh/immunohistochemistry',
    label: 'Xem thiết bị',
  },
  {
    image: 'anapath.webp',
    title: 'Anapath',
    description: 'Phần mềm quản lý quy trình giải phẫu bệnh được Vitro giới thiệu.',
    to: VITRO_ANTIBODY_SOURCE,
    label: 'Tìm hiểu tại Vitro',
  },
] as const

const features = [
  { image: '1-1.webp', label: 'Tính lặp lại' },
  { image: '5.webp', label: 'Dấu ấn chuyên biệt' },
  { image: '3-1.webp', label: 'Tương thích quy trình tự động' },
  { image: '4.webp', label: 'Độ nhất quán giữa các lô' },
] as const

export function VitroAntibodiesStandalonePage() {
  return (
    <div className={styles.shell}>
      <SeoHead
        title="Kháng thể hóa mô miễn dịch Vitro | Ecolink"
        description="Tám nhóm kháng thể hóa mô miễn dịch theo danh mục Vitro: thần kinh, bệnh truyền nhiễm, mô mềm, tuyến yên, mô lympho, tiết niệu, phổi và tuyến giáp."
        canonical="/khang-the/khang-the-vitro"
        image="/assetsFull/vitro-antibody-hero-leica.png"
      />
      <main className={styles.page}>

      <section className={styles.hero} aria-labelledby="vitro-page-title">
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>VITRO · HÓA MÔ MIỄN DỊCH</span>
            <h1 id="vitro-page-title">Kháng thể cho hóa mô miễn dịch</h1>
            <span className={styles.rule} aria-hidden="true" />
            <p>Khám phá các nhóm kháng thể theo lĩnh vực bệnh lý trong danh mục của Vitro. Ecolink hỗ trợ tư vấn mã sản phẩm và tài liệu phù hợp khi bạn cần.</p>
            <a className={styles.dossier} href={dossier} target="_blank" rel="noopener noreferrer">
              Xem tài liệu Vitro <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </section>

      <section className={styles.panels} aria-label="Các nhóm kháng thể Vitro">
        <div className={styles.panelGrid}>
          {VITRO_ANTIBODY_PANELS.map((panel, index) => (
            <article className={styles.panelCard} key={panel.original}>
              <div className={styles.panelImage}>
                <img
                  src={`${media}/06/${panelImages[index][0]}`}
                  alt={`Hình minh họa nhóm ${panel.title} từ Vitro`}
                  loading="lazy"
                  width="1000"
                  height="600"
                />
                <img
                  className={styles.panelIcon}
                  src={`${media}/06/${panelImages[index][1]}`}
                  alt=""
                  loading="lazy"
                  width="512"
                  height="512"
                />
              </div>
              <div className={styles.panelCopy}>
                <h2>{panel.title}</h2>
                <p>{panel.description}</p>
                <Link to={vitroPanelUrl(panel.slug)} aria-label={`Xem các kháng thể: ${panel.title}`}>
                  Xem thêm <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.recombinant} aria-labelledby="vitro-recombinant-title">
        <div className={styles.recombinantImage} aria-hidden="true" />
        <div className={styles.recombinantCopy}>
          <h2 id="vitro-recombinant-title">Kháng thể tái tổ hợp trong danh mục Vitro</h2>
          <span className={styles.rule} aria-hidden="true" />
          <p>Theo Vitro, các kháng thể tái tổ hợp được phát triển nhằm hỗ trợ tính nhất quán và độ lặp lại trong quy trình hóa mô miễn dịch. Xem hồ sơ nhà sản xuất để biết thông tin về từng mã.</p>
          <a href={VITRO_ANTIBODY_SOURCE} target="_blank" rel="noopener noreferrer">Xem thông tin nhà sản xuất →</a>
        </div>
      </section>

      <section className={styles.solutions} aria-labelledby="vitro-solutions-title">
        <div className={styles.solutionsInner}>
          <div className={styles.solutionsHeading}>
            <h2 id="vitro-solutions-title">Giải pháp chẩn đoán</h2>
            <span className={styles.rule} aria-hidden="true" />
            <p>Vitro giới thiệu các nhóm thuốc thử, thiết bị và phần mềm cho quy trình giải phẫu bệnh.</p>
          </div>
          {solutions.map((item) => (
            <article className={styles.solutionCard} key={item.title}>
              <img src={`${media}/05/${item.image}`} alt="" loading="lazy" width="176" height="176" />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              {item.to.startsWith('https:') ? (
                <a href={item.to} target="_blank" rel="noopener noreferrer">{item.label} →</a>
              ) : (
                <Link to={item.to}>{item.label} →</Link>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className={styles.portfolio} aria-labelledby="vitro-portfolio-title">
        <div className={styles.portfolioInner}>
          <div className={styles.portfolioHeading}>
            <h2 id="vitro-portfolio-title">Danh mục cho phòng xét nghiệm</h2>
            <span className={styles.rule} aria-hidden="true" />
          </div>
          {features.map((feature) => (
            <div className={styles.feature} key={feature.label}>
              <img src={`${media}/05/${feature.image}`} alt="" loading="lazy" width="112" height="112" />
              <h3>{feature.label}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.contact} aria-labelledby="vitro-contact-title">
        <div className={styles.contactInner}>
          <div>
            <h2 id="vitro-contact-title">Bạn cần tư vấn về kháng thể Vitro?</h2>
            <p>Gửi yêu cầu cho Ecolink để xác nhận mã hàng, tài liệu và khả năng cung cấp trước khi lựa chọn sản phẩm.</p>
          </div>
          <Link to="/lien-he">Liên hệ Ecolink →</Link>
        </div>
      </section>
      </main>
    </div>
  )
}
