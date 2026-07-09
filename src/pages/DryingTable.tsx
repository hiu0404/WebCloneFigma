import { NavLink } from 'react-router-dom';
import styles from './DryingTable.module.css'
import { FigmaImage } from '../components/FigmaImage';
import { Header } from '../components/Header/Header';
const products = [
    {
        image: "/assetsFull/PC800.jpg",
        title: "Model: PC800",
        desc: "Bàn sấy tiêu bản",
        Hang: "Hãng SX: Bio-optica"
    },
];
const DryingTable = () => {
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
                    <h1>Bàn sấy tiêu bản</h1>
                    <p>Trang chủ / Bàn sấy tiêu bản</p>
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
                        {products.map((product, index) => (
                            <div
                                className={styles.productcard}
                                key={index}
                            >
                                <img
                                    src={product.image}
                                    alt={product.title}
                                />

                                 <div className={styles.productcardContent}>
                                    <h3>{product.title}</h3>
                                    <span>{product.Hang}</span>
                                    <p>{product.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DryingTable
