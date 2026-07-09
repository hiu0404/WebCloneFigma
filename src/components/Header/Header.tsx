import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  FaChevronDown,
  FaEnvelope,
  FaFacebookF,
  FaLinkedinIn,
  FaPhoneAlt,
  FaSearch,
  FaYoutube,
} from 'react-icons/fa'
import { FigmaImage } from '../FigmaImage'
import { apiGetProducts } from '../../services/productService'
import { apiGetMicroscopes } from '../../services/microscopeService'
import { apiGetForensicProducts } from '../../services/forensicProductService'
import { apiGetPiccProducts } from '../../services/piccProductService'
import { productMainImageUrl } from '../../lib/productImages'
import styles from './Header.module.css'

type SearchForm = { query: string }

type SearchItem = {
  id: string
  title: string
  imageUrl?: string
  updatedAt: number
  target: string
}

const productMenu = [
  { label: 'Giải phẫu bệnh', to: '/EquipmentPage' },
  { label: 'Giám định hình sự', to: '/GiamDinhKhoaHocKyThuatHinhSu' },
  { label: 'Kính hiển vi', to: '/MicroscopePage' },
  { label: 'Vật tư tiêu hao', to: '/vat-tu-tieu-hao' },
  { label: 'Hóa chất', to: '/ChemicalsPage' },
  { label: 'Kháng thể', to: '/AntibodiesPage' },
  { label: 'Hồi sức tích cực', to: '/PICC' },
]

export function Header() {
  const navigate = useNavigate()
  const { register, handleSubmit, watch, reset } = useForm<SearchForm>({
    defaultValues: { query: '' },
  })
  const query = watch('query') ?? ''
  const [allProducts, setAllProducts] = useState<SearchItem[]>([])
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let alive = true
    Promise.all([apiGetProducts(), apiGetMicroscopes(), apiGetForensicProducts(), apiGetPiccProducts()])
      .then(([products, microscopes, forensicProducts, piccProducts]) => {
        if (!alive) return
        setAllProducts([
          ...products
            .filter((item) => (item.status ?? 'active') === 'active')
            .map((item) => ({
              id: `product:${item.id}`,
              title: item.title,
              imageUrl: productMainImageUrl(item),
              updatedAt: item.updatedAt,
              target: `/san-pham-chi-tiet?id=${encodeURIComponent(item.id)}`,
            })),
          ...microscopes
            .filter((item) => (item.status ?? 'active') === 'active')
            .map((item) => ({
              id: `microscope:${item.id}`,
              title: item.name,
              imageUrl: item.imageUrl,
              updatedAt: item.updatedAt,
              target: `/MicroscopePage/${item.categorySlug}`,
            })),
          ...forensicProducts
            .filter((item) => (item.status ?? 'active') === 'active')
            .map((item) => ({
              id: `forensic:${item.id}`,
              title: item.name,
              imageUrl: item.imageUrl,
              updatedAt: item.updatedAt,
              target: `/GiamDinhKhoaHocKyThuatHinhSu/${item.categorySlug}`,
            })),
          ...piccProducts
            .filter((item) => (item.status ?? 'active') === 'active')
            .map((item) => ({
              id: `picc:${item.id}`,
              title: item.name,
              imageUrl: item.imageUrl,
              updatedAt: item.updatedAt,
              target: `/PICC/${item.categorySlug}`,
            })),
        ])
      })
      .catch(() => {
        if (alive) setAllProducts([])
      })
    return () => {
      alive = false
    }
  }, [])

  const trimmed = query.trim().toLowerCase()
  const matched = useMemo(() => {
    if (!trimmed) return []
    return allProducts
      .filter((p) => p.title.toLowerCase().includes(trimmed))
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 6)
  }, [allProducts, trimmed])

  const goDetail = (target: string) => {
    navigate(target)
    setOpen(false)
    setMenuOpen(false)
    reset({ query: '' })
  }

  const onSearch = () => {
    if (matched[0]) goDetail(matched[0].target)
  }

  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <NavLink to="/" className={styles.logo}>
          <FigmaImage src="/assetsFull/logo-trang 3.png" alt="Ecolink" />
        </NavLink>

        <div className={styles.searchWrap}>
          <form className={styles.search} onSubmit={handleSubmit(onSearch)}>
            <input
              {...register('query', { onChange: () => setOpen(true) })}
              onFocus={() => setOpen(true)}
              placeholder="Tìm kiếm sản phẩm, giải pháp..."
              aria-label="Tìm kiếm sản phẩm"
            />
            <button type="submit" aria-label="Tìm kiếm">
              <FaSearch />
            </button>
          </form>
          {open && trimmed ? (
            <div className={styles.searchResultBox}>
              {matched.length ? (
                matched.map((p) => (
                  <button key={p.id} className={styles.searchResultItem} onClick={() => goDetail(p.target)} type="button">
                    {p.imageUrl ? <img src={p.imageUrl} alt="" /> : <span />}
                    <strong>{p.title}</strong>
                  </button>
                ))
              ) : (
                <div className={styles.searchEmpty}>Không tìm thấy sản phẩm phù hợp</div>
              )}
            </div>
          ) : null}
        </div>

        <div className={styles.contactItem}>
          <FaPhoneAlt />
          <span>Hotline 24/7</span>
          <strong>+84 812 119 668</strong>
        </div>

        <div className={styles.contactItem}>
          <FaEnvelope />
          <span>Email</span>
          <strong>info.ecolink@gmail.com</strong>
        </div>

        <button
          className={styles.menuButton}
          type="button"
          aria-label="Mở menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`} aria-label="Điều hướng chính">
        <NavLink to="/">Trang chủ</NavLink>
        <NavLink to="/gioi-thieu">Giới thiệu</NavLink>
        <div className={styles.dropdown}>
          <NavLink to="/EquipmentPage">Sản phẩm <FaChevronDown /></NavLink>
          <div className={styles.dropdownMenu}>
            {productMenu.map((item) => (
              <NavLink key={item.to} to={item.to}>{item.label}</NavLink>
            ))}
          </div>
        </div>
        <div className={styles.dropdown}>
          <NavLink to="/EquipmentPage">Giải pháp <FaChevronDown /></NavLink>
          <div className={styles.dropdownMenu}>
            <NavLink to="/EquipmentPage">Giải phẫu bệnh</NavLink>
            <NavLink to="/GiamDinhADN">ADN</NavLink>
            <NavLink to="/Immunohistochemistry">IHC & ISH</NavLink>
            <NavLink to="/GiamDinhSinhHoc">Sinh học</NavLink>
          </div>
        </div>
        <NavLink to="/SupportService">Dịch vụ hỗ trợ</NavLink>
        <NavLink to="/tin-tuc">Tin tức</NavLink>
        <NavLink to="/ContactPage">Liên hệ</NavLink>

        <div className={styles.socials}>
          <a href="/" aria-label="Facebook"><FaFacebookF /></a>
          <a href="/" aria-label="LinkedIn"><FaLinkedinIn /></a>
          <a href="/" aria-label="YouTube"><FaYoutube /></a>
          <button type="button">VI <FaChevronDown /></button>
        </div>
      </nav>
    </header>
  )
}
