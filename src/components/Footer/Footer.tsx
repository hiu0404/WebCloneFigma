import type { CSSProperties } from 'react'
import { NavLink } from 'react-router-dom'
import { FaEnvelope, FaFacebookF, FaLinkedinIn, FaMapMarkerAlt, FaPhoneAlt, FaYoutube } from 'react-icons/fa'
import styles from './Footer.module.css'

type FooterProps = {
  top?: number
}

const quickLinks = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Giới thiệu', to: '/gioi-thieu' },
  { label: 'Sản phẩm', to: '/san-pham' },
  { label: 'Giải pháp', to: '/EquipmentPage' },
  { label: 'Dịch vụ hỗ trợ', to: '/SupportService' },
  { label: 'Tin tức', to: '/tin-tuc' },
  { label: 'Liên hệ', to: '/ContactPage' },
]

const productLinks = [
  { label: 'Giải phẫu bệnh', to: '/EquipmentPage' },
  { label: 'Giám định vi thể / Pháp y', to: '/GiamDinhKhoaHocKyThuatHinhSu' },
  { label: 'Khoa học hình sự', to: '/GiamDinhKhoaHocKyThuatHinhSu' },
  { label: 'Giám định sinh học', to: '/GiamDinhSinhHoc' },
  { label: 'Giám định ADN', to: '/GiamDinhADN' },
  { label: 'Vật tư - Hóa chất - Kháng thể', to: '/vat-tu-tieu-hao' },
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
            <div className={styles.socials}>
              <a href="/" aria-label="Facebook"><FaFacebookF /></a>
              <a href="/" aria-label="LinkedIn"><FaLinkedinIn /></a>
              <a href="/" aria-label="YouTube"><FaYoutube /></a>
            </div>
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
            <p><FaMapMarkerAlt />Văn phòng: TP. HCM: Số 48, đường S7, P. Tây Thạnh, TP. Hồ Chí Minh.</p>
            <a href="tel:+84812119668"><FaPhoneAlt /> +84 812 119 668</a>
            <a href="mailto:info.ecolinkvn@gmail.com"><FaEnvelope /> info.ecolinkvn@gmail.com</a>
          </div>
        </section>

        <div className={styles.bottom}>
          <span>© 2026 Ecolink. All rights reserved.</span>
          <div>
            <NavLink to="/">Chính sách bảo mật</NavLink>
            <NavLink to="/">Điều khoản sử dụng</NavLink>
          </div>
        </div>
      </div>
    </footer>
  )
}
