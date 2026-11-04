import type { Microscope } from '../../data/microscopes'
import styles from '../../pages/ConsumablesPage.module.css'
import { Link } from 'react-router-dom'
import { productUrl } from '../../lib/seo'

type Props = {
  microscope: Microscope
}

export function MicroscopeCard({ microscope }: Props) {
  return (
    <Link className={`${styles.productcard} ${styles.equipmentCard}`} to={productUrl(microscope, 'microscope')}>
      {microscope.imageUrl ? (
        <img src={microscope.imageUrl} alt={microscope.name} loading="lazy" />
      ) : (
        <div className={styles.cardPlaceholder} aria-hidden>
          <span>{microscope.model || microscope.name.slice(0, 2)}</span>
        </div>
      )}
      <div className={styles.productcardContent}>
        <h3>{microscope.name}</h3>
        <dl className={styles.equipmentMeta}>
          <div><dt>Model</dt><dd>{microscope.model || 'Đang cập nhật'}</dd></div>
          <div><dt>Hãng sản xuất</dt><dd>{microscope.brand || 'Đang cập nhật'}</dd></div>
        </dl>
        <span className={styles.detailButton}>Xem chi tiết <b>→</b></span>
      </div>
    </Link>
  )
}
