import { Link } from 'react-router-dom'
import styles from './VitroAntibodyShowcase.module.css'

export const VITRO_ANTIBODY_SOURCE = 'https://vitro.bio/en/anatomical-pathology-reagent/anatomical-pathology-immunohistochemistry-reagents-antibodies/'
export const VITRO_ANTIBODY_DESCRIPTION = 'Tìm hiểu tám nhóm kháng thể hóa mô miễn dịch được Vitro giới thiệu, xem tài liệu nhà sản xuất và các sản phẩm hiện có tại Ecolink.'
export const vitroPanelUrl = (slug: string) => `/khang-the/khang-the-vitro/${slug}`

export const VITRO_ANTIBODY_PANELS = [
  {
    slug: 'benh-ly-than-kinh', title: 'Bệnh lý thần kinh', original: 'Neuropathology',
    description: 'Nhóm kháng thể cho bệnh lý hệ thần kinh trung ương và ngoại biên.',
    pdf: 'https://vitro.bio/wp-content/uploads/2026/07/Panel-Neuropatologia.pdf',
  },
  {
    slug: 'benh-truyen-nhiem', title: 'Bệnh truyền nhiễm', original: 'Infectious Diseases',
    description: 'Nhóm kháng thể phục vụ khảo sát tác nhân nhiễm trùng trong mô.',
    pdf: 'https://vitro.bio/wp-content/uploads/2026/07/Panel-Enfermedades-infecciosas.pdf',
  },
  {
    slug: 'benh-ly-mo-mem', title: 'Bệnh lý mô mềm', original: 'Soft Tissue Pathology',
    description: 'Nhóm dấu ấn cho việc phân loại và khảo sát tổn thương mô mềm.',
    pdf: 'https://vitro.bio/wp-content/uploads/2026/07/Panel-Patologia-de-tejidos-blandos.pdf',
  },
  {
    slug: 'benh-ly-tuyen-yen', title: 'Bệnh lý tuyến yên', original: 'Pituitary Pathology',
    description: 'Nhóm kháng thể liên quan đến tổn thương tuyến yên và vùng yên.',
    pdf: 'https://vitro.bio/wp-content/uploads/2026/07/Panel-patologia-de-la-hipofisis.pdf',
  },
  {
    slug: 'benh-ly-mo-lympho', title: 'Bệnh lý mô lympho', original: 'Lymphoid Pathology',
    description: 'Nhóm dấu ấn cho khảo sát mô lympho và bệnh lý huyết học.',
    pdf: 'https://vitro.bio/wp-content/uploads/2026/07/Panel-Patologia-del-tejido-linfatico.pdf',
  },
  {
    slug: 'benh-ly-tiet-nieu', title: 'Bệnh lý tiết niệu', original: 'Uropathology',
    description: 'Nhóm dấu ấn liên quan đến thận, tuyến tiền liệt và đường tiết niệu.',
    pdf: 'https://vitro.bio/wp-content/uploads/2026/07/Panel-Uropatologia.pdf',
  },
  {
    slug: 'benh-ly-phoi-mang-phoi', title: 'Bệnh lý phổi và màng phổi', original: 'Pleuropulmonary Pathology',
    description: 'Nhóm kháng thể cho các tổn thương phổi, màng phổi và lồng ngực.',
    pdf: 'https://vitro.bio/wp-content/uploads/2026/07/Panel-Patologia-pleuropulmonar.pdf',
  },
  {
    slug: 'benh-ly-tuyen-giap', title: 'Bệnh lý tuyến giáp', original: 'Thyroid Pathology',
    description: 'Nhóm kháng thể liên quan đến tổn thương và bệnh lý tuyến giáp.',
    pdf: 'https://vitro.bio/wp-content/uploads/2026/07/Panel-Patologia-tiroidea.pdf',
  },
]

export function VitroAntibodyShowcase() {
  return (
    <div className={styles.showcase}>
      <section className={styles.intro} aria-labelledby="vitro-intro-title">
        <div className={styles.introCopy}>
          <span className={styles.eyebrow}>VITRO MASTER DIAGNÓSTICA · HÓA MÔ MIỄN DỊCH</span>
          <h2 id="vitro-intro-title">Khám phá các nhóm kháng thể Vitro</h2>
          <p>Vitro giới thiệu các nhóm kháng thể theo lĩnh vực bệnh lý. Bạn có thể xem tài liệu gốc của nhà sản xuất bên dưới và liên hệ Ecolink để hỏi về sản phẩm cụ thể.</p>
          <div className={styles.actions}>
            <a href={VITRO_ANTIBODY_SOURCE} target="_blank" rel="noopener noreferrer">Xem trang Vitro ↗</a>
            <Link to="/lien-he">Liên hệ tư vấn</Link>
          </div>
        </div>
        <div className={styles.brandPanel}>
          <span>NHÀ SẢN XUẤT</span>
          <img src="/assetsFull/vitro.png" alt="Vitro Master Diagnóstica" />
          <p>Tài liệu và nhóm kháng thể được tham chiếu từ website chính thức của Vitro.</p>
        </div>
      </section>

      <section className={styles.panels} aria-labelledby="vitro-panels-title">
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>DANH MỤC NHÀ SẢN XUẤT</span>
            <h2 id="vitro-panels-title">Các nhóm kháng thể</h2>
          </div>
          <p>Tám nhóm được Vitro công bố. Tài liệu PDF mở trên website của nhà sản xuất.</p>
        </div>
        <div className={styles.panelGrid}>
          {VITRO_ANTIBODY_PANELS.map((panel, index) => (
            <article className={styles.panelCard} key={panel.original}>
              <div className={`${styles.panelVisual} ${styles[`tone${index % 4}`]}`} aria-hidden="true">
                <span className={styles.panelNumber}>{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.panelMotif} />
              </div>
              <div className={styles.panelBody}>
                <span className={styles.panelOriginal}>{panel.original}</span>
                <h3>{panel.title}</h3>
                <p>{panel.description}</p>
                <Link to={vitroPanelUrl(panel.slug)} aria-label={`Xem các kháng thể: ${panel.title}`}>
                  Xem thêm <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className={styles.note}>
        <div>
          <strong>Bạn cần mã kháng thể cụ thể?</strong>
          <p>Các nhóm trên là danh mục tham khảo của Vitro. Liên hệ Ecolink để xác nhận mã hàng và tài liệu phù hợp với nhu cầu của bạn.</p>
        </div>
        <Link to="/lien-he">Gửi yêu cầu →</Link>
      </aside>
    </div>
  )
}
