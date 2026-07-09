import { Header } from '../components/Header/Header'
import { FigmaImage } from '../components/FigmaImage'
import styles from './EquipmentPage.module.css'
import { NavLink } from 'react-router-dom';
const items = [
  {
    image: "/assetsFull/banphautich.jpg",
    name: 'Bàn phẫu tích bệnh phẩm',
    // desc: 'TrimmingTech130 là thiết bị hỗ trợ cắt gọn mẫu mô (grossing trimming) tiên tiến, được thiết kế tối ưu cho các phòng giải phẫu bệnh hiện đại. Với cấu trúc chắc chắn, lưỡi dao sắc bén và hệ thống kiểm soát thao tác an toàn, máy giúp nâng cao hiệu quả xử lý mô trước khi đưa vào giai đoạn xử lý tự động.',
  },
  {
    image: "/assetsFull/mayxuly.png",
    name: 'Máy xử lý mô tự động',
    // desc: 'B-PRO450 là dòng máy xử lý mô tự động cao cấp, được thiết kế để đáp ứng nhu cầu xử lý mẫu mô chính xác, an toàn và liên tục trong các phòng xét nghiệm giải phẫu bệnh hiện đại. Với khả năng lập trình linh hoạt, hệ thống kín hoàn toàn và công nghệ tiết kiệm dung môi, B-PRO450 giúp tối ưu hóa quy trình xử lý mô, giảm thiểu rủi ro và nâng cao chất lượng cắt lát sau đó.',
  },
  {
    image: "/assetsFull/mayduc.png",
    name: 'Máy đúc bệnh phẩm',  
    // desc: 'BCP 170 là thiết bị đúc paraffin chuyên dụng, hỗ trợ thao tác nhúng mô sau xử lý nhanh chóng, an toàn và chính xác. Với thiết kế hiện đại, vùng làm việc rộng rãi và khả năng kiểm soát nhiệt độ chính xác, BCP 170 giúp tối ưu quy trình đúc mẫu mô, nâng cao hiệu quả và chất lượng cắt lát trong giải phẫu bệnh.',
  },
  { 
    image: "/assetsFull/maycat.png",
    name: 'Máy cắt tiêu bản giải phẫu bệnh',  
    // desc: 'MRP2016SA là dòng micrôtôm bán tự động chuyên dùng để cắt tiêu bản mô học trong giải phẫu bệnh. Thiết bị nổi bật với độ chính xác cơ học cao, động cơ mạnh mẽ và khả năng vận hành ổn định, giúp tạo ra các lát cắt mỏng đều, bảo toàn cấu trúc mô học, hỗ trợ chẩn đoán bệnh lý chính xác.',
  },
   { 
    image: "/assetsFull/WB1770.jpg",
    name: 'Bể căng mô',  
    // desc: 'MRP2016SA là dòng micrôtôm bán tự động chuyên dùng để cắt tiêu bản mô học trong giải phẫu bệnh. Thiết bị nổi bật với độ chính xác cơ học cao, động cơ mạnh mẽ và khả năng vận hành ổn định, giúp tạo ra các lát cắt mỏng đều, bảo toàn cấu trúc mô học, hỗ trợ chẩn đoán bệnh lý chính xác.',
  },
  { 
    image: "/assetsFull/PC800.jpg",
    name: 'Bể sấy tiêu bản',  
    // desc: 'MRP2016SA là dòng micrôtôm bán tự động chuyên dùng để cắt tiêu bản mô học trong giải phẫu bệnh. Thiết bị nổi bật với độ chính xác cơ học cao, động cơ mạnh mẽ và khả năng vận hành ổn định, giúp tạo ra các lát cắt mỏng đều, bảo toàn cấu trúc mô học, hỗ trợ chẩn đoán bệnh lý chính xác.',
  },
  {
    image: "/assetsFull/Aus240.png",
    name: 'Máy nhuộm tiêu bản tự động',
    // desc: 'Máy nhuộm tự động AUS240 Plus là thiết bị chuyên dùng trong lĩnh vực giải phẫu bệnh và tế bào học, giúp tự động hóa quy trình nhuộm lam kính với độ chính xác và ổn định cao. Máy hỗ trợ nhiều phương pháp nhuộm như H&E, PAP và các nhuộm đặc biệt, đáp ứng nhu cầu vận hành tại các phòng xét nghiệm hiện đại.',
  },
  {    
    image: "/assetsFull/maydancvr909.jpg",
    name: 'Máy dán lam kính tự động',
    // desc: 'Máy dán lam tự động CVR909 Plus là thiết bị chuyên dùng trong lĩnh vực giải phẫu bệnh và tế bào học, giúp tự động dán lamen lên lam kính sau quá trình nhuộm, đảm bảo tiêu bản hoàn thiện đồng đều, thẩm mỹ và hạn chế bọt khí. Thiết bị hỗ trợ tối ưu hóa quy trình làm việc, giảm thao tác thủ công và nâng cao hiệu suất phòng xét nghiệm.',
  },
  {
    image: "/assetsFull/mayquet3.png",
    name: 'Máy quét tiêu bản tự động',
    // desc: 'Máy quét tiêu bản kỹ thuật số của Huron Digital Pathology là thiết bị dùng để số hóa lam kính giải phẫu bệnh với độ phân giải cao, hỗ trợ lưu trữ, chia sẻ và phân tích hình ảnh tiêu bản trên nền tảng kỹ thuật số. Thiết bị giúp tối ưu quy trình chẩn đoán, hội chẩn từ xa và đào tạo trong lĩnh vực giải phẫu bệnh hiện đại.',
  },
  {
     image: "/assetsFull/UC600.webp",
    name: 'Máy in mã vạch cassette',
    // desc: 'Máy quét tiêu bản kỹ thuật số của Huron Digital Pathology là thiết bị dùng để số hóa lam kính giải phẫu bệnh với độ phân giải cao, hỗ trợ lưu trữ, chia sẻ và phân tích hình ảnh tiêu bản trên nền tảng kỹ thuật số. Thiết bị giúp tối ưu quy trình chẩn đoán, hội chẩn từ xa và đào tạo trong lĩnh vực giải phẫu bệnh hiện đại.',
  },
  {
    image: "/assetsFull/US100.webp",
    name: 'Máy in mã vạch lam kính',
    // desc: 'Máy quét tiêu bản kỹ thuật số của Huron Digital Pathology là thiết bị dùng để số hóa lam kính giải phẫu bệnh với độ phân giải cao, hỗ trợ lưu trữ, chia sẻ và phân tích hình ảnh tiêu bản trên nền tảng kỹ thuật số. Thiết bị giúp tối ưu quy trình chẩn đoán, hội chẩn từ xa và đào tạo trong lĩnh vực giải phẫu bệnh hiện đại.',
  },
]

export function EquipmentPage() {
  return (
        <div className={styles.page}>
            <Header />

            {/* HERO */}
            <div className={styles.heroWrapper}>
                <FigmaImage
                    className={styles.hero}
                    src="/assetsFull/page-banner-dna.png"
                    alt=""
                    ariaHidden
                    width={1920}
                    height={461}
                />

                <div className={styles.heroOverlay}></div>

                <div className={styles.heroTitle}>
                    <h1>Sản phẩm</h1>
                    <p>Trang chủ / Sản phẩm</p>
                </div>
            </div>

            {/* CONTENT */}
            <div className={styles.container}>
                <section className={styles.benefitBar}>
                    <div className={styles.benefitItem}>
                        <span aria-hidden>&#9678;</span>
                        <div><strong>Chất lượng quốc tế</strong><small>Đạt tiêu chuẩn</small></div>
                    </div>
                    <div className={styles.benefitItem}>
                        <span aria-hidden>&#9673;</span>
                        <div><strong>Công nghệ tiên tiến</strong><small>Hiệu quả vượt trội</small></div>
                    </div>
                    <div className={styles.benefitItem}>
                        <span aria-hidden>&#9881;</span>
                        <div><strong>Đa dạng sản phẩm</strong><small>Đáp ứng mọi nhu cầu</small></div>
                    </div>
                    <div className={styles.benefitItem}>
                        <span aria-hidden>&#9742;</span>
                        <div><strong>Hỗ trợ kỹ thuật 24/7</strong><small>Đồng hành cùng bạn</small></div>
                    </div>
                </section>

                <div className={styles.categorypage}>
                    {/* SIDEBAR */}
                    <div className={styles.sidebar}>
                    <NavLink to="/EquipmentPage" className={styles.dmsp}><h2>DANH MỤC SẢN PHẨM</h2></NavLink>
                        <ul>
                            <li>
                                <NavLink
                                    to="/Trimmingtech"
                                    className={styles.categoryLink}
                                >
                                    <span>›</span>
                                    Bàn phẫu tích bệnh phẩm
                                </NavLink>
                            </li>

                            <li>
                                <NavLink
                                    to="/TissueProcessing"
                                    className={styles.categoryLink}
                                >
                                    <span>›</span>
                                    Máy xử lý mô bệnh phẩm
                                </NavLink>
                            </li>

                            <li>
                                <NavLink
                                    to="/Casting"
                                    className={styles.categoryLink}
                                >
                                    <span>›</span>
                                    Máy đúc mô bệnh phẩm
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/CuttingMachine"
                                    className={styles.categoryLink}
                                >
                                    <span>›</span>
                                    Máy cắt bệnh phẩm
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/TissueTension"
                                    className={styles.categoryLink}
                                >
                                    <span>›</span>
                                    Bể căng mô
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/DryingTable"
                                    className={styles.categoryLink}
                                >
                                    <span>›</span>
                                    Bàn sấy tiêu bản
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/DyeingMachine"
                                    className={styles.categoryLink}
                                >
                                    <span>›</span>
                                    Máy nhuộm tiêu bản HE
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/Immunohistochemistry"
                                    className={styles.categoryLink}
                                >
                                    <span>›</span>
                                    Máy nhuộm hóa mô miễn dịch
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/LaminatingMachine"
                                    className={styles.categoryLink}
                                >
                                    <span>›</span>
                                    Máy dán lamen tự động
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/Scaning"
                                    className={styles.categoryLink}
                                >
                                    <span>›</span>
                                    Máy quét tiêu bản kỹ thuật số
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/LaserCassette"
                                    className={styles.categoryLink}
                                >
                                    <span>›</span>
                                    Máy in mã vạch cassette
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/LaserSlide"
                                    className={styles.categoryLink}
                                >
                                    <span>›</span>
                                    Máy in mã vạch lam kính
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* PRODUCT GRID */}
                    <div className={styles.productgrid}>
                        {items.map((product, index) => (
                            <div
                                className={styles.productcard}
                                key={index}
                            >
                                <img
                                    src={product.image}
                                    alt={product.name}
                                />

                                <div className={styles.productcardContent}>
                                    <p className={styles.productcardContentp}>{product.name}</p>
                                </div>
                                {/* <div className={styles.productcardContent}>
                                    <p>{product.desc}</p>
                                </div> */}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}


