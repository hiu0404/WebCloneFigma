import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FaArrowRight,
  FaAward,
  FaChartLine,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaDna,
  FaFlask,
  FaFingerprint,
  FaHeadset,
  FaMicroscope,
  FaShieldAlt,
  FaUsers,
} from 'react-icons/fa'
import { GiScales } from 'react-icons/gi'
import { FigmaImage } from '../components/FigmaImage'
import { Header } from '../components/Header/Header'
import styles from './HomePage.module.css'
import { apiGetBrands } from '../services/brandService'

const categories = [
  { title: 'Giải phẫu bệnh', image: '/assetsFull/GPBBANER.webp', to: '/EquipmentPage' },
  { title: 'Giám định vi thể / pháp y', image: '/assetsFull/BANERPHAPY.jpg', to: '/GiamDinhKhoaHocKyThuatHinhSu' },
  { title: 'Khoa học hình sự', image: '/assetsFull/criminal.jpg', to: '/GiamDinhKhoaHocKyThuatHinhSu' },
  { title: 'Giám định sinh học', image: '/assetsFull/GDSHC.jpg', to: '/GiamDinhSinhHoc' },
  { title: 'Giám định ADN', image: '/assetsFull/ADNBANER.jpg', to: '/GiamDinhADN' },
]

const solutions = [
  {
    icon: FaFlask,
    title: 'Giải pháp Giải phẫu bệnh',
    text: 'Hệ thống đồng bộ xử lý mô, nhuộm, kính hiển vi đến số hóa bệnh phẩm.',
    to: '/EquipmentPage',
  },
  {
    icon: FaFingerprint,
    title: 'Giải pháp Pháp y',
    text: 'Trang thiết bị hiện đại phục vụ giám định vi thể, dấu vết và phân tích vật chứng.',
    to: '/GiamDinhKhoaHocKyThuatHinhSu',
  },
  {
    icon: FaDna,
    title: 'Giải pháp ADN',
    text: 'Giải pháp toàn diện cho tách chiết, khuếch đại và phân tích ADN trong nghiên cứu.',
    to: '/GiamDinhADN',
  },
  {
    icon: GiScales,
    title: 'Giải pháp IHC & ISH',
    text: 'Hệ thống nhuộm hóa mô miễn dịch và lai tại chỗ chất lượng cao.',
    to: '/Immunohistochemistry',
  },
]

const products = [
  {
    id: 'vitrostainer-42',
    name: 'Máy nhuộm hóa mô miễn dịch tự động (công suất 42 slide)',
    model: 'VitroStainer 42',
    manufacturer: 'Vitro S.A',
    image: '/assetsFull/VT42.gif',
  },
  {
    name: 'Máy in cassette tự động (600 cassette)',
    model: 'UC-600',
    id: 'uc-600',
    manufacturer: 'Citotest',
    image: '/assetsFull/UC600.webp',
  },
  {
    name: 'Máy in lam kính tự động (100 lam kính)',
    model: 'US-100',
    id: 'us-100',
    manufacturer: 'Citotest',
    image: '/assetsFull/US100.webp',
  },
  {
    name: 'Máy quét tiêu bản tự động (200 slide/giờ)',
    model: 'VX504',
    id: 'vx504',
    manufacturer: 'Huron',
    image: '/assetsFull/VX504.webp',
  },
  {
    name: 'Máy quét tiêu bản tự động (360 slide/giờ)',
    model: 'HT540',
    id: 'ht540',
    manufacturer: 'Huron',
    image: '/assetsFull/HT540.webp',
  },
]

const stats = [
  { icon: FaUsers, value: '120+', label: 'Khách hàng & đối tác' },
  { icon: FaMicroscope, value: '300+', label: 'Thiết bị đã triển khai' },
  { icon: FaClock, value: '24/7', label: 'Hỗ trợ kỹ thuật' },
  { icon: FaShieldAlt, value: 'ISO', label: 'Đạt chuẩn quốc tế' },
  { icon: FaAward, value: '100%', label: 'Cam kết chất lượng' },
]

const news = [
  {
    category: 'Tin tức',
    title: 'P16 + Ki-67 Nhuộm miễn dịch đa kênh',
    image: '/assetsFull/tintuc1.png',
    to: 'https://bio-optica.it/it/news/detail/1149',
  },
  {
    category: 'Tin tức',
    title: 'p16 INK4a [BC42] Kháng thể đơn dòng chuột',
    image: '/assetsFull/tintuc2.png',
    to: 'https://bio-optica.it/it/news/detail/1147',
  },
  {
    category: 'Sản phẩm',
    title: 'Bộ sản phẩm hai màu: hãy thử ngay bộ nhuộm tự động GIEMSA mới.',
    image: '/assetsFull/tintuc4.png',
    to: 'https://bio-optica.it/it/news/detail/917',
  },
]

const partners = [
  { image: '/assetsFull/Lecia.svg', name: 'Leica Microsystems', url: 'https://www.leica-microsystems.com/' },
  { image: '/assetsFull/image 1.png', name: 'Rapid Labs', url: 'https://www.rapidlabs.co.uk/' },
  { image: '/assetsFull/bio.png', name: 'Bio-Optica', url: 'https://www.bio-optica.it/' },
  { image: '/assetsFull/lupetec.png', name: 'Lupetec', url: 'https://lupetec.com.br/' },
  { image: '/assetsFull/citotest.webp', name: 'Citotest', url: 'https://www.citotest.com/' },
  { image: '/assetsFull/logo HR 1.png', name: 'Huron Digital Pathology', url: 'https://www.hurontechnologies.com/' },
  { image: '/assetsFull/Plan1Health.png', name: 'Plan1Health', url: 'https://www.p1h.it/en/homepage-new-english/' },
]

const heroSlides = [
  {
    label: 'Huron VXS04 Digital Slide Scanner',
    image: '/assetsFull/VX504.webp',
  },
  {
    label: 'Thermo Scientific Lab Vision 360',
    image: '/assetsFull/HT540.webp',
  },
]

export function HomePage() {
  const [activeHero, setActiveHero] = useState(0)
  const [homepagePartners, setHomepagePartners] = useState(partners)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveHero((current) => (current + 1) % heroSlides.length)
    }, 5200)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let alive = true
    apiGetBrands().then((items) => {
      if (!alive) return
      setHomepagePartners(
        items
          .filter((item) => item.status === 'active' && item.featured)
          .map((item) => ({ image: item.imageUrl ?? '', name: item.name, url: item.url })),
      )
    })
    return () => { alive = false }
  }, [])

  return (
    <div className={styles.page}>
      <Header />

      <main>
        <section className={styles.hero} aria-label="Giải pháp công nghệ Ecolink">
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <span>ECOLINK - Điểm tựa của sự chính xác và tin cậy</span>
              <h1>ECOLINK - Giải pháp công nghệ tiên tiến cho khoa học, y tế và an ninh</h1>
              <p>
                Công ty Cổ phần Đầu tư và Phát triển ECOLINK (ECOLINK I&D JSC) là đơn vị uy
                tín hàng đầu tại Việt Nam chuyên nhập khẩu, phân phối và chuyển giao công nghệ
                các thiết bị phân tích khoa học, chẩn đoán y tế và giám định chuyên dụng.
              </p>
              <p>
                Với định hướng chiến lược lấy "Chất lượng quốc tế - Giải pháp chuyên sâu" làm
                kim chỉ nam, ECOLINK tự hào là cầu nối tin cậy giữa các nhà sản xuất thiết bị
                công nghệ đỉnh cao trên thế giới với các cơ quan, tổ chức và doanh nghiệp tại
                thị trường Việt Nam.
              </p>
              <div className={styles.heroActions}>
                <Link className={styles.primaryAction} to="/EquipmentPage">
                  Khám phá sản phẩm <FaArrowRight />
                </Link>
                <Link className={styles.secondaryAction} to="/ContactPage">
                  Tư vấn giải pháp <FaArrowRight />
                </Link>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.hexPattern} />
              <div className={styles.devicePodium} />
              {heroSlides.map((slide, index) => (
                <FigmaImage
                  className={`${styles.heroMachine} ${styles.heroMachineSlide} ${
                    index === activeHero ? styles.heroMachineSlideActive : ''
                  }`}
                  src={slide.image}
                  alt=""
                  ariaHidden
                  key={slide.label}
                />
              ))}
            </div>
          </div>

          <div className={styles.heroDots} aria-label="Chọn banner">
            {heroSlides.map((slide, index) => (
              <button
                className={index === activeHero ? styles.heroDotActive : ''}
                type="button"
                aria-label={`Thiết bị ${index + 1}: ${slide.label}`}
                aria-pressed={index === activeHero}
                onClick={() => setActiveHero(index)}
                key={slide.label}
              />
            ))}
          </div>
        </section>

        <section className={styles.benefits} aria-label="Lợi ích">
          <div><FaMicroscope /><span>Công nghệ tiên tiến</span></div>
          <div><FaAward /><span>Đạt chuẩn quốc tế</span></div>
          <div><FaHeadset /><span>Hỗ trợ kỹ thuật 24/7</span></div>
          <div><FaChartLine /><span>Tối ưu hiệu quả vận hành</span></div>
          <div><FaShieldAlt /><span>Giải pháp toàn diện & linh hoạt</span></div>
        </section>

        <section className={styles.section}>
          <h2>Danh mục sản phẩm</h2>
          <div className={styles.titleMark} />
          <div className={styles.categoryGrid}>
            {categories.map((item) => (
              <Link key={item.title} to={item.to} className={styles.categoryCard}>
                <FigmaImage src={item.image} alt="" ariaHidden />
                <strong>{item.title}</strong>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.blockHeader}>
            <h2>Giải pháp cho từng lĩnh vực</h2>
          </div>
          <div className={styles.solutionGrid}>
            {solutions.map((item) => {
              const Icon = item.icon
              return (
                <article className={styles.solutionCard} key={item.title}>
                  <Icon />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                    <Link to={item.to}>Xem thêm <FaArrowRight /></Link>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.blockHeader}>
            <h2>Sản phẩm nổi bật</h2>
            <Link to="/EquipmentPage">Xem tất cả <FaArrowRight /></Link>
          </div>
          <div className={styles.productShell}>
            <button className={`${styles.sliderButton} ${styles.sliderPrev}`} type="button" aria-label="Trước">
              <FaChevronLeft />
            </button>
            <div className={styles.productGrid}>
              {products.map((item) => (
                <article className={styles.productCard} key={item.name}>
                  <div className={styles.productImage}>
                    <FigmaImage src={item.image} alt="" ariaHidden />
                  </div>
                  <div className={styles.productInfo}>
                    <h3>{item.name}</h3>
                    <dl className={styles.productMeta}>
                      <div><dt>Model:</dt><dd>{item.model}</dd></div>
                      <div><dt>Hãng sx:</dt><dd>{item.manufacturer}</dd></div>
                    </dl>
                    <Link
                      className={styles.productDetailLink}
                      to={`/san-pham-chi-tiet?id=${encodeURIComponent(item.id)}`}
                    >
                      Chi tiết <FaArrowRight />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            <button className={`${styles.sliderButton} ${styles.sliderNext}`} type="button" aria-label="Sau">
              <FaChevronRight />
            </button>
          </div>
        </section>

        <section className={styles.statsBand}>
          {stats.map((item) => {
            const Icon = item.icon
            return (
              <div className={styles.statItem} key={item.label}>
                <Icon />
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            )
          })}
        </section>

        <section className={styles.bottomContent}>
          <div className={styles.newsBlock}>
            <div className={styles.blockHeader}>
              <h2>Tin tức & sự kiện</h2>
              <Link to="/tin-tuc">Xem tất cả <FaArrowRight /></Link>
            </div>
            <div className={styles.newsGrid}>
              {news.map((item) => (
                <article className={styles.newsCard} key={item.title}>
                  <FigmaImage src={item.image} alt="" ariaHidden />
                  <div>
                    <span>{item.category}</span>
                    <h3>{item.title}</h3>
                    <a href={item.to} target="_blank" rel="noreferrer">Đọc thêm <FaArrowRight /></a>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className={styles.partnerBlock}>
            <div className={styles.blockHeader}>
              <h2>Đối tác hàng đầu</h2>
            </div>
            <div className={styles.partnerGrid}>
              {homepagePartners.map((partner) => (
                <a
                  className={styles.partnerCard}
                  href={partner.url}
                  key={partner.name}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={partner.name}
                >
                  <FigmaImage src={partner.image} alt={partner.name} />
                </a>
              ))}
              <Link to="/BrandPage" className={styles.morePartner}>Xem thêm <FaArrowRight /></Link>
            </div>
          </div>
        </section>

        <section className={styles.ctaStrip}>
          <div>
            <FaHeadset />
            <span>Bạn cần tư vấn giải pháp phù hợp?</span>
            <small>Đội ngũ chuyên gia của Ecolink luôn sẵn sàng đồng hành cùng bạn.</small>
          </div>
          <Link to="/ContactPage">Liên hệ ngay</Link>
          <a href="tel:+84812119668">+84 812 119 668</a>
        </section>
      </main>
    </div>
  )
}
