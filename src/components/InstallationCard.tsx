import { Link } from 'react-router-dom'
import { installationUrl, type PublicInstallation } from '../data/installations'
import styles from '../pages/InstallationsPage.module.css'

export function InstallationCard({ item }: { item: PublicInstallation }) {
  return <Link className={styles.card} to={installationUrl(item)}>
    <span className={styles.cardImage}><img src={item.imageUrls[0]} alt={`Hình ảnh lắp đặt ${item.product.name}`} loading="lazy" /></span>
    <span className={styles.cardBody}>
      <span className={styles.cardCategory}>{item.product.category || 'Thiết bị'}</span>
      <strong>{item.title}</strong>
      {item.product.model && <span className={styles.cardModel}>Model: {item.product.model}</span>}
      <span className={styles.cardAction}>Xem hình ảnh →</span>
    </span>
  </Link>
}
