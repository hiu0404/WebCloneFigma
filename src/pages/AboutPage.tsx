import { Header } from "../components/Header/Header";
import { FigmaImage } from "../components/FigmaImage";
import styles from "./AboutPage.module.css";

const sectors = [
  {
    title: "I. Khối Y tế & Chẩn đoán chuyên sâu",
    items: [
      "Sản phẩm: Hệ thống trang thiết bị giải phẫu bệnh, tế bào học, vật tư tiêu hao và các giải pháp chẩn đoán hình ảnh, xét nghiệm cao cấp.",
      "Đặc tính: Độ chính xác tuyệt đối, vận hành tự động, tối ưu hóa hiệu suất lab, đạt các chứng nhận y tế nghiêm ngặt nhất.",
      "Thị trường: Các bệnh viện trung ương, bệnh viện tuyến tỉnh, trung tâm xét nghiệm và các cơ sở y tế chuyên sâu trên toàn quốc.",
    ],
  },
  {
    title: "II. Khối Giám định & An ninh - Quốc phòng",
    items: [
      "Sản phẩm: Thiết bị khoa học hình sự, hệ thống phân tích mẫu vật, giám định kỹ thuật cao phục vụ công tác điều tra và an ninh.",
      "Đặc tính: Công nghệ phân tích dấu vết tối tân, độ bền công nghiệp cao, bảo mật tuyệt đối và đáp ứng hoàn hảo các quy chuẩn pháp lý đặc thù.",
      "Thị trường: Các viện giám định, cơ quan kỹ thuật hình sự và các đơn vị thuộc khối An ninh, Quốc phòng.",
    ],
  },
  {
    title: "III. Khối Giáo dục & Nghiên cứu Khoa học",
    items: [
      "Sản phẩm: Thiết bị phòng thí nghiệm lý - hóa - sinh, công cụ phân tích cấu trúc vật liệu chuyên sâu và các phần mềm ứng dụng khoa học.",
      "Đặc tính: Công nghệ cập nhật, tính module hóa linh hoạt, độ bền cao phục vụ tần suất đào tạo và nghiên cứu liên tục.",
      "Thị trường: Các trường Đại học, Viện nghiên cứu và Trung tâm kiểm nghiệm trọng điểm quốc gia.",
    ],
  },
];

const reasons = [
  "Ecolink cam kết không ngừng đổi mới và đồng hành bền vững cùng sự phát triển khoa học, công nghệ và sức khỏe cộng đồng.",
];

const coreValues = [
  {
    title: "Chuyên nghiệp",
    desc: "Đội ngũ kỹ thuật giàu kinh nghiệm, tư vấn giải pháp chính xác.",
  },
  {
    title: "Tận tâm",
    desc: "Luôn đồng hành cùng khách hàng trong suốt quá trình vận hành.",
  },
  {
    title: "Hiệu quả",
    desc: "Mang đến giải pháp tối ưu chi phí và hiệu quả lâu dài.",
  },
];

export function AboutPage() {
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
        <div>Giới thiệu</div>
        <div className={styles.heroTitleSmall}>Trang chủ / Giới thiệu</div>
      </div>

      <div className={styles.title}>Giới thiệu</div>

      <section className={styles.aboutSection}>
        <div className={styles.aboutLeft}>
          <span className={styles.subTitle}>VỀ CHÚNG TÔI</span>

          <h2>
            Chúng tôi tập trung nguồn lực để cung ứng các giải pháp thiết bị toàn diện, đáp ứng tiêu chuẩn khắt khe trong 3 khối ngành mũi nhọn:
          </h2>

          <div className={styles.sectorList}>
            {sectors.map((sector, index) => (
              <article className={styles.sectorItem} key={sector.title}>
                <div className={styles.sectorNumber}>0{index + 1}</div>
                <div>
                  <h3>{sector.title}</h3>
                  <ul>
                    {sector.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.reasonBox}>
            <ul>
              {reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.statsSection}>
        <div className={styles.statCard}>
          <h3>100+</h3>
          <p>Dự án triển khai</p>
        </div>

        <div className={styles.statCard}>
          <h3>100+</h3>
          <p>Khách hàng & đối tác</p>
        </div>

        <div className={styles.statCard}>
          <h3>24/7</h3>
          <p>Hỗ trợ kỹ thuật</p>
        </div>

        <div className={styles.statCard}>
          <h3>100%</h3>
          <p>Cam kết chất lượng</p>
        </div>
      </section>

      <section className={styles.valuesSection}>
        <div className={styles.sectionTitle}>Giá trị cốt lõi</div>

        <div className={styles.valuesGrid}>
          {coreValues.map((item, index) => (
            <div className={styles.valueCard} key={item.title}>
              <div className={styles.valueNumber}>0{index + 1}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
