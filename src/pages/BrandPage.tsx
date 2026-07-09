import { Header } from "../components/Header/Header";
import { FigmaImage } from "../components/FigmaImage";
import styles from "./BrandPage.module.css";

const brands = [
  {
    image: "/assetsFull/Lecia.svg",
    name: "Leica-microsystems",
    country: "Germany",
    url: "https://www.leica-microsystems.com/",
    desc: "Kính hiển vi, giải pháp hình ảnh khoa học, thiết bị giải phẫu bệnh và pháp y.",
  },
  {
    image: "/assetsFull/bio.png",
    name: "Bio-Optica",
    country: "Italy",
    url: "https://www.bio-optica.it/",
    desc: "Thiết bị và hóa chất chuyên dụng cho phòng xét nghiệm và giải phẫu bệnh.",
  },
  {
    image: "/assetsFull/huron.svg",
    name: "Huron Digital Pathology",
    country: "Canada",
    url: "https://www.hurontechnologies.com/",
    desc: "Giải pháp scan lam kính và số hóa tiêu bản giải phẫu bệnh.",
  },
  {
    image: "/assetsFull/lupetec.png",
    name: "Lupetec",
    country: "Germany",
    url: "https://lupetec.com.br/",
    desc: "Thiết bị phòng thí nghiệm và giải pháp xử lý mô hiện đại.",
  },
  {
    image: "/assetsFull/vitro.png",
    name: "Vitro",
    country: "Spain",
    url: "https://www.vitro.bio/",
    desc: "Hệ thống nhuộm tiêu bản tự động và thiết bị xét nghiệm giải phẫu bệnh.",
  },
  {
    image: "/assetsFull/citotest.webp",
    name: "Citotest",
    country: "China",
    url: "https://www.citotest.com/",
    desc: "Vật tư tiêu hao, lam kính và thiết bị phục vụ phòng xét nghiệm.",
  },
  {
    image: "/assetsFull/Plan1Health.png",
    name: "Plan1Health",
    country: "Italy",
    url: "https://www.p1h.it/en/homepage-new-english/",
    desc: "Giải pháp đường truyền tĩnh mạch, PICC, buồng tiêm truyền cấy dưới da và vật tư can thiệp mạch máu.",
  },
];

export default function BrandPage() {
  return (
    <div className={styles.page}>
      <Header />

      <FigmaImage
        className={styles.hero}
        src="/assetsFull/testimonial.png"
        alt=""
        ariaHidden
        width={1920}
        height={461}
      />

      <div className={styles.heroTitle}>
        <div>Hãng đại diện</div>
        <div className={styles.heroTitleSmall}>Trang chủ / Hãng đại diện</div>
      </div>

      <section className={styles.introSection}>
        <span className={styles.subTitle}>ĐỐI TÁC CHIẾN LƯỢC</span>

        <h2>Các thương hiệu hàng đầu thế giới</h2>

        <p>
          Ecolink tự hào là đối tác và đại diện phân phối của nhiều thương hiệu
          uy tín quốc tế trong lĩnh vực giải phẫu bệnh, xét nghiệm y học và
          thiết bị khoa học công nghệ.
        </p>
      </section>

      <section className={styles.brandSection}>
        <div className={styles.brandGrid}>
          {brands.map((brand, index) => (
            <div className={styles.brandCard} key={index}>
              <div className={styles.brandImageWrapper}>
                <img src={brand.image} alt={brand.name} className={styles.brandImage} />
              </div>

              <div className={styles.brandContent}>
                <span className={styles.country}>{brand.country}</span>
                <h3>{brand.name}</h3>
                <p>{brand.desc}</p>
                <a className={styles.viewBtn} href={brand.url} target="_blank" rel="noopener noreferrer">
                  Xem chi tiết
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.partnerBanner}>
        <div className={styles.partnerOverlay}></div>

        <div className={styles.partnerContent}>
          <h2>Hợp tác cùng những thương hiệu toàn cầu</h2>
          <p>Cam kết mang đến công nghệ tiên tiến và giải pháp tối ưu cho khách hàng.</p>
          <button className={styles.contactBtn}>Liên hệ hợp tác</button>
        </div>
      </section>
    </div>
  );
}
