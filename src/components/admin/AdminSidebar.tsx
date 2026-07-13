import { NavLink, useNavigate } from 'react-router-dom'
import {
  FiBox,
  FiFileText,
  FiGrid,
  FiLayers,
  FiLogOut,
  FiPackage,
  FiSearch,
  FiSettings,
  FiShield,
} from 'react-icons/fi'
import { logoutAdminSession } from '../../lib/adminAuthApi'
import styles from './AdminLayout.module.css'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/products', label: 'Quản lý sản phẩm', icon: FiPackage },
  { to: '/admin/equipment-categories', label: 'Danh mục sản phẩm thiết bị', icon: FiBox },
  { to: '/admin/categories', label: 'Quản lý danh mục', icon: FiLayers },
  { to: '/admin/consumables', label: 'Danh mục vật tư tiêu hao', icon: FiBox },
  { to: '/admin/chemical-categories', label: 'Danh mục hóa chất', icon: FiLayers },
  { to: '/admin/antibody-categories', label: 'Danh mục kháng thể', icon: FiLayers },
  { to: '/admin/forensic-categories', label: 'Danh mục giám định hình sự', icon: FiLayers },
  { to: '/admin/forensic-products', label: 'Quản lý giám định hình sự', icon: FiSearch },
  { to: '/admin/picc-categories', label: 'Danh mục hồi sức tích cực', icon: FiLayers },
  { to: '/admin/picc-products', label: 'Quản lý hồi sức tích cực', icon: FiSearch },
  { to: '/admin/microscope-categories', label: 'Danh mục kính hiển vi', icon: FiLayers },
  { to: '/admin/microscopes', label: 'Quản lý kính hiển vi', icon: FiSearch },
  { to: '/admin/news', label: 'Tin tức', icon: FiFileText },
  { to: '/admin/security', label: 'Bảo mật admin', icon: FiShield },
  { to: '/admin/settings', label: 'Cài đặt', icon: FiSettings },
]

export function AdminSidebar() {
  const navigate = useNavigate()

  async function handleLogout() {
    await logoutAdminSession()
    navigate('/admin/login', { replace: true })
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandMark}>A</div>
        <div className={styles.brandName}>Admin Console</div>
        <div className={styles.brandSub}>Quản trị sản phẩm</div>
      </div>

      <nav className={styles.nav} aria-label="Admin">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              <Icon aria-hidden />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <button className={styles.logoutButton} type="button" onClick={() => void handleLogout()}>
        <FiLogOut aria-hidden />
        <span>Đăng xuất</span>
      </button>
    </aside>
  )
}
