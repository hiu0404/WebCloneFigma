import { AdminContent } from './AdminContent'
import { AdminHeader } from './AdminHeader'
import { AdminSidebar } from './AdminSidebar'
import styles from './AdminLayout.module.css'

export function AdminLayout() {
  return (
    <div className={styles.layout}>
      <AdminSidebar />
      <div className={styles.main}>
        <AdminHeader />
        <AdminContent />
      </div>
    </div>
  )
}
