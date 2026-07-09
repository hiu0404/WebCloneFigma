import { Outlet } from 'react-router-dom'
import styles from './AdminLayout.module.css'

export function AdminContent() {
  return (
    <main className={styles.content}>
      <Outlet />
    </main>
  )
}
