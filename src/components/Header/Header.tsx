import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import {
  FaChevronDown,
  FaEnvelope,
  FaPhoneAlt,
  FaSearch,
} from 'react-icons/fa'
import { FigmaImage } from '../FigmaImage'
import { apiGetProducts } from '../../services/productService'
import { productUrl } from '../../lib/seo'
import { apiGetMicroscopes } from '../../services/microscopeService'
import { apiGetForensicProducts } from '../../services/forensicProductService'
import { apiGetPiccProducts } from '../../services/piccProductService'
import { apiGetBrands } from '../../services/brandService'
import type { Brand } from '../../data/brands'
import { productMainImageUrl } from '../../lib/productImages'
import styles from './Header.module.css'
import { useLanguage } from '../../i18n/language'

type SearchForm = { query: string }

type SearchItem = {
  id: string
  title: string
  searchText: string
  imageUrl?: string
  updatedAt: number
  target: string
}

const productMenu = [
  { label: 'Giải phẫu bệnh', to: '/giai-phau-benh' },
  { label: 'Giám định hình sự', to: '/giam-dinh-hinh-su' },
  { label: 'Kính hiển vi', to: '/kinh-hien-vi' },
  { label: 'Vật tư tiêu hao', to: '/vat-tu-tieu-hao' },
  { label: 'Hóa chất', to: '/hoa-chat' },
  { label: 'Kháng thể', to: '/khang-the' },
  { label: 'Đường tiếp cận mạch máu', to: '/hoi-suc-tich-cuc' },
]

export function Header() {
  const { language, setLanguage } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const { register, handleSubmit, control, reset } = useForm<SearchForm>({
    defaultValues: { query: '' },
  })
  const query = useWatch({ control, name: 'query' }) ?? ''
  const [allProducts, setAllProducts] = useState<SearchItem[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const routeKey = `${location.pathname}${location.search}`
  const [openForRoute, setOpenForRoute] = useState<string | null>(null)
  const [menuOpenForRoute, setMenuOpenForRoute] = useState<string | null>(null)
  const open = openForRoute === routeKey
  const menuOpen = menuOpenForRoute === routeKey

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
              searchText: [item.title, item.brand, item.sku, item.categoryLabel].filter(Boolean).join(' ').toLowerCase(),
              imageUrl: productMainImageUrl(item),
              updatedAt: item.updatedAt,
              target: productUrl(item),
            })),
          ...microscopes
            .filter((item) => (item.status ?? 'active') === 'active')
            .map((item) => ({
              id: `microscope:${item.id}`,
              title: item.name,
              searchText: [item.name, item.model, item.brand].filter(Boolean).join(' ').toLowerCase(),
              imageUrl: item.imageUrl,
              updatedAt: item.updatedAt,
              target: productUrl(item, 'microscope'),
            })),
          ...forensicProducts
            .filter((item) => (item.status ?? 'active') === 'active')
            .map((item) => ({
              id: `forensic:${item.id}`,
              title: item.name,
              searchText: item.name.toLowerCase(),
              imageUrl: item.imageUrl,
              updatedAt: item.updatedAt,
              target: productUrl(item, 'forensic'),
            })),
          ...piccProducts
            .filter((item) => (item.status ?? 'active') === 'active')
            .map((item) => ({
              id: `picc:${item.id}`,
              title: item.name,
              searchText: item.name.toLowerCase(),
              imageUrl: item.imageUrl,
              updatedAt: item.updatedAt,
              target: productUrl(item, 'picc'),
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

  useEffect(() => {
    let alive = true
    apiGetBrands().then((items) => {
      if (alive) setBrands(items.filter((item) => item.status === 'active'))
    })
    return () => { alive = false }
  }, [])

  const trimmed = query.trim().toLowerCase()
  const matched = useMemo(() => {
    if (!trimmed) return []
    return allProducts
      .filter((p) => p.searchText.includes(trimmed))
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 6)
  }, [allProducts, trimmed])

  const goDetail = (target: string) => {
    navigate(target)
    setOpenForRoute(null)
    setMenuOpenForRoute(null)
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

        <div className={styles.searchWrap} onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setOpenForRoute(null)
        }}>
          <form className={styles.search} onSubmit={handleSubmit(onSearch)}>
            <input
              {...register('query', { onChange: () => setOpenForRoute(routeKey) })}
              onFocus={() => setOpenForRoute(routeKey)}
              placeholder="Tìm kiếm sản phẩm, model, hãng..."
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
          <strong>info.ecolinkvn@gmail.com</strong>
        </div>

        <div className={styles.languageSwitcher} role="group" aria-label="Language / Ngôn ngữ" data-no-translate>
          <button type="button" className={language === 'vi' ? styles.languageActive : ''} aria-label="Tiếng Việt" aria-pressed={language === 'vi'} onClick={() => setLanguage('vi')}>VI</button>
          <span aria-hidden="true">/</span>
          <button type="button" className={language === 'en' ? styles.languageActive : ''} aria-label="English" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button>
        </div>

        <button
          className={styles.menuButton}
          type="button"
          aria-label="Mở menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpenForRoute((value) => value === routeKey ? null : routeKey)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav
        className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}
        aria-label="Điều hướng chính"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest('a')) setMenuOpenForRoute(null)
        }}
      >
        <NavLink to="/">Trang chủ</NavLink>
        <NavLink to="/gioi-thieu">Giới thiệu</NavLink>
        <div className={styles.dropdown}>
          <NavLink to="/san-pham">Sản phẩm <FaChevronDown /></NavLink>
          <div className={styles.dropdownMenu}>
            {productMenu.map((item) => (
              <NavLink key={item.to} to={item.to}>{item.label}</NavLink>
            ))}
          </div>
        </div>
        <div className={styles.dropdown}>
          <NavLink to="/hang-dai-dien">Hãng đại diện <FaChevronDown /></NavLink>
          {brands.length > 0 && (
            <div className={`${styles.dropdownMenu} ${styles.brandDropdownMenu}`}>
              {brands.map((brand) => (
                <NavLink key={brand.id} to={`/hang-dai-dien#brand-${encodeURIComponent(brand.id)}`}>
                  {brand.name}
                </NavLink>
              ))}
            </div>
          )}
        </div>
        <div className={styles.dropdown}>
          <div className={styles.dropdownMenu}>
            <NavLink to="/giai-phau-benh">Giải phẫu bệnh</NavLink>
            <NavLink to="/GiamDinhADN">ADN</NavLink>
            <NavLink to="/Immunohistochemistry">IHC & ISH</NavLink>
            <NavLink to="/GiamDinhSinhHoc">Sinh học</NavLink>
          </div>
        </div>
        <NavLink to="/dich-vu-ho-tro">Dịch vụ hỗ trợ</NavLink>
        <NavLink to="/tin-tuc">Tin tức</NavLink>
        <NavLink to="/lien-he">Liên hệ</NavLink>

      </nav>
    </header>
  )
}
