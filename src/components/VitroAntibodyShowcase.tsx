import { Link } from 'react-router-dom'
import styles from './VitroAntibodyShowcase.module.css'

import { VITRO_ANTIBODY_PANELS, VITRO_ANTIBODY_SOURCE, vitroPanelUrl } from '../data/vitroAntibodyPanels'

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
