import { AdminSecurityPanel } from './AdminSecurityPanel'
import styles from './AdminPages.module.css'

export function AdminSecurityPage() {
  return (
    <div className={styles.stack}>
      <AdminSecurityPanel />
    </div>
  )
}
