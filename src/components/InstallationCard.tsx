import { Link } from 'react-router-dom'
import { installationUrl, publicRegionLabels, type PublicInstallation } from '../data/installations'
import styles from '../pages/InstallationsPage.module.css'

export function InstallationCard({ item, priority = false }: { item: PublicInstallation; priority?: boolean }) {
  return <Link className={styles.card} to={installationUrl(item)}>
    <span className={styles.cardImage}><img src={item.imageUrls[0]} alt={item.imageCaptions?.[item.imageUrls[0]] || `Hình ảnh thực tế ${item.product.name}`} loading={priority ? 'eager' : 'lazy'} width="640" height="430" /></span>
    <span className={styles.cardBody}>
      <span className={styles.cardCategory}>{item.product.category || 'Thiết bị'}</span>
      <strong>{item.title}</strong>
      {item.product.model && <span className={styles.cardModel}>Model: {item.product.model}</span>}
      {item.product.brand && <span className={styles.cardModel}>Hãng: {item.product.brand}</span>}
      {item.publicRegion && <span className={styles.cardRegion}>{publicRegionLabels[item.publicRegion]}</span>}
      <span className={styles.cardAction}>Xem hình ảnh →</span>
    </span>
  </Link>
}
