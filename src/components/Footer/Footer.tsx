import type { CSSProperties } from 'react'
import { NavLink } from 'react-router-dom'
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'
import styles from './Footer.module.css'

type FooterProps = {
  top?: number
}

const quickLinks = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Giới thiệu', to: '/gioi-thieu' },
  { label: 'Sản phẩm', to: '/san-pham' },
  { label: 'Dịch vụ hỗ trợ', to: '/dich-vu-ho-tro' },
  { label: 'Thiết bị đã triển khai', to: '/thiet-bi-da-trien-khai' },
  { label: 'Tin tức', to: '/tin-tuc' },
  { label: 'Liên hệ', to: '/lien-he' },
]

const productLinks = [
  { label: 'Giải phẫu bệnh', to: '/giai-phau-benh' },
  { label: 'Giám định hình sự', to: '/giam-dinh-hinh-su' },
  { label: 'Kính hiển vi', to: '/kinh-hien-vi' },
  { label: 'Vật tư tiêu hao', to: '/vat-tu-tieu-hao' },
  { label: 'Hóa chất', to: '/hoa-chat' },
  { label: 'Kháng thể', to: '/khang-the' },
  { label: 'Hồi sức tích cực', to: '/hoi-suc-tich-cuc' },
]

export function Footer({ top }: FooterProps) {
  const footerStyle =
    typeof top === 'number'
      ? ({ position: 'absolute', left: 0, top, width: '100%' } as CSSProperties)
      : undefined

  return (
    <footer className={styles.footer} style={footerStyle}>
      <div className={styles.inner}>
        <section className={styles.grid}>
          <div className={styles.brand}>
            <NavLink to="/" className={styles.logoLink}>
              <img src="/assetsFull/logo-trang 3.png" alt="Ecolink" />
            </NavLink>
            <p>CUNG CẤP GIẢI PHÁP CÔNG NGHỆ TIÊN TIẾN CHO KHOA HỌC, Y TẾ VÀ AN NINH</p>
            <a href="mailto:info.ecolinkvn@gmail.com"><FaEnvelope />info.ecolinkvn@gmail.com</a>
            <a href="tel:+84812119668"><FaPhoneAlt /> +84 812 119 668</a>
          </div>

          <nav className={styles.column} aria-label="Liên kết nhanh">
            <h3>Liên kết nhanh</h3>
            {quickLinks.map((item) => <NavLink key={item.to} to={item.to}>{item.label}</NavLink>)}
          </nav>

          <nav className={styles.column} aria-label="Danh mục sản phẩm">
            <h3>Danh mục sản phẩm</h3>
            {productLinks.map((item) => <NavLink key={item.to} to={item.to}>{item.label}</NavLink>)}
          </nav>

          <div className={styles.office}>
            <h3>Hà Nội</h3>
            <p><FaMapMarkerAlt />Trụ sở chính: Số 67, Ngõ 281, Phố Đội Cấn, P. Ngọc Hà, TP. Hà Nội.</p>
            <p><FaMapMarkerAlt />Văn phòng: LK9-59, Khu liền kề Tổng cục V, P. Thanh Liệt, TP. Hà Nội.</p>
            <a href="tel:+84812119668"><FaPhoneAlt /> +84 812 119 668</a>
            <a href="mailto:info.ecolinkvn@gmail.com"><FaEnvelope /> info.ecolinkvn@gmail.com</a>
          </div>

          <div className={styles.office}>
            <h3>Hồ Chí Minh</h3>
            <p><FaMapMarkerAlt />Văn phòng TP. HCM: Số 48, đường S7, P. Tây Thạnh, TP. Hồ Chí Minh.</p>
            <a href="tel:+84812119668"><FaPhoneAlt /> +84 812 119 668</a>
            <a href="mailto:info.ecolinkvn@gmail.com"><FaEnvelope /> info.ecolinkvn@gmail.com</a>
          </div>
        </section>

        <div className={styles.bottom}>
          <span>© 2026 Ecolink. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
