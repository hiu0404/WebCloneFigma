import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { FiSearch } from 'react-icons/fi'
import styles from './AdminLayout.module.css'

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/products': 'Quản lý sản phẩm',
  '/admin/equipment-categories': 'Danh mục sản phẩm thiết bị',
  '/admin/categories': 'Quản lý danh mục',
  '/admin/consumables': 'Vật tư tiêu hao',
  '/admin/chemical-categories': 'Danh mục hóa chất',
  '/admin/antibody-categories': 'Danh mục kháng thể',
  '/admin/microscope-categories': 'Danh mục kính hiển vi',
  '/admin/microscopes': 'Quản lý kính hiển vi',
  '/admin/news': 'Tin tức',
  '/admin/brands': 'Quản lý hãng đại diện',
  '/admin/security': 'Bảo mật admin',
  '/admin/settings': 'Cài đặt',
}

export function AdminHeader() {
  const location = useLocation()
  const title = useMemo(() => pageTitles[location.pathname] ?? 'Admin', [location.pathname])

  return (
    <header className={styles.header}>
      <div>
        <div className={styles.crumbs}>
          <span>Admin</span>
          <span>/</span>
          <span>{title}</span>
        </div>
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.headerRight}>
        <div className={styles.searchBox} aria-hidden>
          <FiSearch />
          <span>Tìm trong admin</span>
        </div>
        <div className={styles.adminBadge}>
          <span className={styles.avatar}>AD</span>
          <span>Admin</span>
        </div>
      </div>
    </header>
  )
}
