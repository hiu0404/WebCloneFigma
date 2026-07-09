import { Header } from "../components/Header/Header";
import { FigmaImage } from "../components/FigmaImage";
import styles from "./SupportService.module.css";

const services = [
  {
    title: "Tư vấn giải pháp",
    desc: "Tư vấn thiết bị và giải pháp phù hợp cho từng mô hình phòng xét nghiệm.",
    icon: "01",
  },
  {
    title: "Lắp đặt & vận hành",
    desc: "Đội ngũ kỹ thuật hỗ trợ lắp đặt, cấu hình và hướng dẫn sử dụng tận nơi.",
    icon: "02",
  },
  {
    title: "Bảo trì thiết bị",
    desc: "Dịch vụ bảo trì định kỳ giúp hệ thống vận hành ổn định và bền bỉ.",
    icon: "03",
  },
  {
    title: "Hỗ trợ kỹ thuật 24/7",
    desc: "Tiếp nhận và xử lý nhanh các sự cố kỹ thuật trong quá trình sử dụng.",
    icon: "04",
  },
];

export default function Dichvuhotro() {
  return (
    <div className={styles.page}>
      <Header />

      <FigmaImage
        className={styles.hero}
        src="/assetsFull/page-banner-dna.png"
        alt=""
        ariaHidden
        width={1920}
        height={461}
      />

      <div className={styles.heroTitle}>
        <div>Dịch vụ hỗ trợ</div>
        <div className={styles.heroTitleSmall}>Trang chủ / Dịch vụ hỗ trợ</div>
      </div>

      <section className={styles.introSection}>
        <div className={styles.introLeft}>
          <span className={styles.subTitle}>GIẢI PHÁP TOÀN DIỆN</span>

          <h2>TẠI SAO CHỌN ECOLINK?</h2>

          <ul className={styles.introList}>
            <li>
              <strong>Sản phẩm chính hãng 100%:</strong> Cam kết cung cấp thiết bị từ các thương hiệu toàn cầu, đầy đủ chứng nhận xuất xứ (CO) và chất lượng (CQ).
            </li>
            <li>
              <strong>Đội ngũ chuyên gia kỹ thuật:</strong> Đội ngũ kỹ sư, chuyên viên được đào tạo chính hãng từ nhà sản xuất, am hiểu sâu sắc quy trình vận hành và sẵn sàng hỗ trợ kỹ thuật 24/7.
            </li>
            <li>
              <strong>Dịch vụ trọn gói:</strong> Tư vấn giải pháp tối ưu theo ngân sách, cung ứng thiết bị, lắp đặt, hiệu chuẩn và chuyển giao công nghệ bài bản.
            </li>
          </ul>

          <p className={styles.introClosing}>
            ECOLINK cam kết không ngừng đổi mới và đồng hành bền vững cùng sự phát triển khoa học, công nghệ và sức khỏe cộng đồng tại Việt Nam.
          </p>
          <button className={styles.contactBtn}>Liên hệ ngay</button>
        </div>

        <div className={styles.introRight}>
          <FigmaImage className={styles.introImage} src="/assetsFull/ks.jpg" alt="" ariaHidden />
        </div>
      </section>

      <section className={styles.serviceSection}>
        <div className={styles.sectionTitle}>Dịch vụ của chúng tôi</div>

        <div className={styles.serviceGrid}>
          {services.map((item, index) => (
            <div className={styles.serviceCard} key={index}>
              <div className={styles.serviceIcon}>{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.supportBanner}>
        <div className={styles.bannerOverlay}></div>

        <div className={styles.bannerContent}>
          <h2>Hỗ trợ kỹ thuật chuyên sâu 24/7</h2>
          <p>Đội ngũ kỹ sư luôn sẵn sàng hỗ trợ nhanh chóng và hiệu quả.</p>
          <button className={styles.bannerBtn}>Yêu cầu hỗ trợ</button>
        </div>
      </section>
    </div>
  );
}
