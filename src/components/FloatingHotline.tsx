import { FaPhoneAlt } from 'react-icons/fa'
import { useLocation } from 'react-router-dom'
import styles from './FloatingHotline.module.css'

export function FloatingHotline() {
  const { pathname } = useLocation()
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return null

  return (
    <a className={styles.hotline} href="tel:+84812119668" aria-label="Gọi Ecolink để tư vấn sản phẩm: 0812 119 668">
      <span className={styles.callGraphic} aria-hidden="true">
        <span className={styles.outerRing} />
        <span className={styles.innerRing} />
        <span className={styles.icon}><FaPhoneAlt /></span>
      </span>
      <span className={styles.label}>Tư vấn sản phẩm: <strong>0812 119 668</strong></span>
    </a>
  )
}
