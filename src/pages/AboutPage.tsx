import {
  FaAward,
  FaFlask,
  FaGlobeAsia,
  FaHandshake,
  FaHeadset,
  FaLightbulb,
  FaMicroscope,
  FaShieldAlt,
  FaUsers,
} from 'react-icons/fa'
import { Header } from '../components/Header/Header'
import styles from './AboutPage.module.css'

const sectors = [
  {
    icon: <FaShieldAlt />,
    title: 'I. Khối Y tế & Chẩn đoán chuyên sâu',
    lines: [
      ['Sản phẩm', 'Hệ thống trang thiết bị giải phẫu bệnh, tế bào học, vật tư tiêu hao và các giải pháp chẩn đoán hình ảnh, xét nghiệm cao cấp.'],
      ['Đặc tính', 'Độ chính xác tuyệt đối, vận hành tự động, tối ưu hóa hiệu suất lab, đạt các chứng nhận y tế nghiêm ngặt nhất.'],
      ['Thị trường', 'Các bệnh viện trung ương, bệnh viện tuyến tỉnh, trung tâm xét nghiệm và các cơ sở y tế chuyên sâu trên toàn quốc.'],
    ],
  },
  {
    icon: <FaFlask />,
    title: 'II. Khối Giám định & An ninh - Quốc phòng',
    lines: [
      ['Sản phẩm', 'Thiết bị khoa học hình sự, hệ thống phân tích mẫu vật, giám định kỹ thuật cao phục vụ công tác điều tra và an ninh.'],
      ['Đặc tính', 'Công nghệ phân tích dấu vết tối tân, độ bền công nghiệp cao, bảo mật tuyệt đối và đáp ứng hoàn hảo các quy chuẩn pháp lý đặc thù.'],
      ['Thị trường', 'Các viện giám định, cơ quan kỹ thuật hình sự và các đơn vị thuộc khối An ninh, Quốc phòng.'],
    ],
  },
  {
    icon: <FaMicroscope />,
    title: 'III. Khối Giáo dục & Nghiên cứu Khoa học',
    lines: [
      ['Sản phẩm', 'Thiết bị phòng thí nghiệm lý - hóa - sinh, công cụ phân tích cấu trúc vật liệu chuyên sâu và các phần mềm ứng dụng khoa học.'],
      ['Đặc tính', 'Công nghệ cập nhật, tính module hóa linh hoạt, độ bền cao phục vụ tần suất đào tạo và nghiên cứu liên tục.'],
      ['Thị trường', 'Các trường Đại học, Viện nghiên cứu và Trung tâm kiểm nghiệm trọng điểm quốc gia.'],
    ],
  },
]

const values = [
  { icon: <FaAward />, title: 'Chính xác', text: 'Đảm bảo độ chính xác tuyệt đối trong từng sản phẩm và giải pháp.' },
  { icon: <FaHandshake />, title: 'Uy tín', text: 'Xây dựng niềm tin lâu dài dựa trên chất lượng và trách nhiệm.' },
  { icon: <FaLightbulb />, title: 'Đổi mới', text: 'Không ngừng đổi mới công nghệ để mang đến giải pháp tối ưu.' },
  { icon: <FaUsers />, title: 'Đồng hành', text: 'Luôn đồng hành và hỗ trợ khách hàng trong suốt quá trình sử dụng.' },
  { icon: <FaGlobeAsia />, title: 'Phát triển bền vững', text: 'Hướng đến sự phát triển vững cùng cộng đồng và xã hội.' },
]

const partners = [
  { image: '/assetsFull/Lecia.svg', name: 'Leica Microsystems', url: 'https://www.leica-microsystems.com/' },
  { image: '/assetsFull/bio.png', name: 'Bio-Optica', url: 'https://www.bio-optica.it/' },
  { image: '/assetsFull/huron.svg', name: 'Huron Digital Pathology', url: 'https://www.hurontechnologies.com/' },
  { image: '/assetsFull/lupetec.png', name: 'Lupetec', url: 'https://lupetec.com.br/' },
  { image: '/assetsFull/vitro.png', name: 'Vitro', url: 'https://www.vitro.bio/' },
  { image: '/assetsFull/citotest.webp', name: 'Citotest', url: 'https://www.citotest.com/' },
  { image: '/assetsFull/Plan1Health.png', name: 'Plan1Health', url: 'https://www.p1h.it/en/homepage-new-english/' },
]

export function AboutPage() {
  return (
    <div className={styles.page}>
      <Header />

      <section className={styles.hero}>
        <div className={styles.container}>
          <h1>GIỚI THIỆU ECOLINK</h1>
          <p>Ecolink - Đối tác tin cậy cung cấp thiết bị, hóa chất và<br />giải pháp công nghệ hiện đại cho khoa học, y tế và<br />an ninh tại Việt Nam.</p>
          <div className={styles.breadcrumb}>Trang chủ <span>›</span> Giới thiệu</div>
        </div>
      </section>

      <main className={styles.main}>
        <section className={styles.intro}>
          <div className={styles.introCopy}>
            <div className={styles.eyebrow}>VỀ CHÚNG TÔI</div>
            <h2>Chúng tôi tập trung nguồn lực để cung ứng các giải pháp thiết bị toàn diện, đáp ứng tiêu chuẩn khắt khe trong 3 khối ngành mũi nhọn:</h2>
          </div>
          <img className={styles.building} src="/assetsFull/ecolink-building.png" alt="Trụ sở Ecolink" />
        </section>

        <section className={styles.sectors}>
          {sectors.map((sector, index) => (
            <article className={styles.sector} key={sector.title}>
              <div className={styles.sectorVisual}>
                <b>0{index + 1}</b>
                <span>{sector.icon}</span>
              </div>
              <div className={styles.sectorContent}>
                <h3>{sector.title}</h3>
                {sector.lines.map(([label, text]) => <p key={label}><strong>{label}:</strong> {text}</p>)}
              </div>
            </article>
          ))}
        </section>

        <div className={styles.commitment}><FaLightbulb /><p>Ecolink cam kết không ngừng đổi mới và đồng hành bền vững cùng sự phát triển khoa học,<br /><strong> công nghệ và sức khỏe cộng đồng.</strong></p></div>

        <section className={styles.stats}>
          <div><FaAward /><strong>1000+</strong><span>Dự án triển khai</span></div>
          <div><FaUsers /><strong>120+</strong><span>Khách hàng & đối tác</span></div>
          <div><FaHeadset /><strong>24/7</strong><span>Hỗ trợ kỹ thuật</span></div>
          <div><FaShieldAlt /><strong>100%</strong><span>Cam kết chất lượng</span></div>
        </section>

        <section className={styles.values}>
          <h2>GIÁ TRỊ CỐT LÕI</h2>
          <div className={styles.valueGrid}>{values.map((value) => <article key={value.title}><span>{value.icon}</span><h3>{value.title}</h3><p>{value.text}</p></article>)}</div>
        </section>

        <section className={styles.partners}>
          <h2>ĐỐI TÁC TIÊU BIỂU</h2>
          <div className={styles.partnerGrid}>
            {partners.map((partner) => (
              <a href={partner.url} target="_blank" rel="noopener noreferrer" key={partner.name} title={partner.name}>
                <img src={partner.image} alt={partner.name} />
              </a>
            ))}
          </div>
          <a href="/BrandPage">Xem tất cả đối tác <span>→</span></a>
        </section>
      </main>
    </div>
  )
}
