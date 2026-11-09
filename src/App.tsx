import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { FigmaScaledLayout } from './layouts/FigmaScaledLayout'
import { HomePage } from './pages/HomePage'
import { ContactPage } from './pages/ContactPage'
import { AboutPage } from './pages/AboutPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { ProductsOverviewPage } from './pages/ProductsOverviewPage'
import { InstallationsPage } from './pages/InstallationsPage'
import { InstallationDetailPage } from './pages/InstallationDetailPage'
import { AdminInstallationsPage } from './pages/admin/AdminInstallationsPage'
import { EquipmentCatalogPage } from './pages/EquipmentCatalogPage'
import { VatTuTieuHaoPage } from './pages/VatTuTieuHaoPage'
import { ChemicalsPage } from './pages/ChemicalsPage'
import { AntibodiesPage } from './pages/AntibodiesPage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { ProductManagePage } from './pages/admin/ProductManagePage'
import { RequireAdmin } from './pages/admin/RequireAdmin'
import { AdminLayout } from './components/admin/AdminLayout'
import { DashboardPage } from './pages/admin/DashboardPage'
import { CategoryManagePage } from './pages/admin/CategoryManagePage'
import { AdminSecurityPage } from './pages/admin/AdminSecurityPage'
import { AdminSimplePage } from './pages/admin/AdminSimplePage'
import { AdminConsumablesPage } from './pages/admin/AdminConsumablesPage'
import { ConsumableCategoryManagePage } from './pages/admin/ConsumableCategoryManagePage'
import { ChemicalCategoryManagePage } from './pages/admin/ChemicalCategoryManagePage'
import { AntibodyCategoryManagePage } from './pages/admin/AntibodyCategoryManagePage'
import { ForensicCategoryManagePage } from './pages/admin/ForensicCategoryManagePage'
import { ForensicProductManagePage } from './pages/admin/ForensicProductManagePage'
import { PiccCategoryManagePage } from './pages/admin/PiccCategoryManagePage'
import { PiccProductManagePage } from './pages/admin/PiccProductManagePage'
import { MicroscopeCategoryManagePage } from './pages/admin/MicroscopeCategoryManagePage'
import { MicroscopeManagePage } from './pages/admin/MicroscopeManagePage'
import MicroscopePage from './pages/MicroscopePage'
import LaserSlide from './pages/LaserSlide'
import SupportService from './pages/SupportService'
import BrandPage from './pages/BrandPage'
import NewsPage from './pages/NewsPage'
import PICC from './pages/PICC'
import ForensicPage from './pages/ForensicPage'
import { ScrollToTop } from './components/ScrollToTop'
import { EquipmentCategoryManagePage } from './pages/admin/EquipmentCategoryManagePage'
import { AdminBrandsPage } from './pages/admin/AdminBrandsPage'
import { AdminContactMessagesPage } from './pages/admin/AdminContactMessagesPage'
import { OrganizationJsonLd } from './components/OrganizationJsonLd'
import { GoogleAnalytics } from './components/GoogleAnalytics'
import { FloatingHotline } from './components/FloatingHotline'

const legacyCategoryPaths = [
  ['/EquipmentPage', '/giai-phau-benh'],
  ['/GiamDinhKhoaHocKyThuatHinhSu', '/giam-dinh-hinh-su'],
  ['/MicroscopePage', '/kinh-hien-vi'],
  ['/ChemicalsPage', '/hoa-chat'],
  ['/AntibodiesPage', '/khang-the'],
  ['/PICC', '/hoi-suc-tich-cuc'],
  ['/SupportService', '/dich-vu-ho-tro'],
  ['/ContactPage', '/lien-he'],
] as const

function LegacyCategoryRedirect({ from, to }: { from: string; to: string }) {
  const { pathname } = useLocation()
  return <Navigate to={`${to}${pathname.slice(from.length)}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <OrganizationJsonLd />
      <ScrollToTop />
      <GoogleAnalytics />
      <FloatingHotline />
      <Routes>
        <Route element={<FigmaScaledLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/gioi-thieu" element={<AboutPage />} />
          <Route path="/dich-vu-ho-tro" element={<SupportService />} />
          <Route path="/BrandPage" element={<BrandPage />} />
          <Route path="/tin-tuc" element={<NewsPage />} />
          <Route path="/san-pham" element={<ProductsOverviewPage />} />
          <Route path="/thiet-bi-da-trien-khai" element={<InstallationsPage />} />
          <Route path="/thiet-bi-da-trien-khai/:slug" element={<InstallationDetailPage />} />
          <Route path="/giai-phau-benh" element={<EquipmentCatalogPage />} />
          <Route path="/giai-phau-benh/:categorySlug" element={<EquipmentCatalogPage />} />
          <Route path="/san-pham-chi-tiet" element={<ProductDetailPage />} />
          <Route path="/san-pham/:slug" element={<ProductDetailPage />} />
          <Route path="/vat-tu-tieu-hao" element={<VatTuTieuHaoPage />} />
          <Route path="/vat-tu-tieu-hao/:categorySlug" element={<VatTuTieuHaoPage />} />
          <Route path="/hoa-chat" element={<ChemicalsPage />} />
          <Route path="/hoa-chat/:categorySlug" element={<ChemicalsPage />} />
          <Route path="/khang-the" element={<AntibodiesPage />} />
          <Route path="/khang-the/:categorySlug" element={<AntibodiesPage />} />
          <Route path="/lien-he" element={<ContactPage />} />
          <Route path="/kinh-hien-vi" element={<MicroscopePage />} />
          <Route path="/kinh-hien-vi/:categorySlug" element={<MicroscopePage />} />
          <Route path="/kinh-hien-vi/:categorySlug/:subcategorySlug" element={<MicroscopePage />} />
          <Route path="/LaserSlide" element={<LaserSlide />} />
          <Route path="/hoi-suc-tich-cuc" element={<PICC />} />
          <Route path="/hoi-suc-tich-cuc/:categorySlug" element={<PICC />} />
          <Route path="/giam-dinh-hinh-su" element={<ForensicPage />} />
          <Route path="/giam-dinh-hinh-su/:categorySlug" element={<ForensicPage />} />
          {legacyCategoryPaths.flatMap(([from, to]) => [
            <Route key={from} path={from} element={<Navigate to={to} replace />} />,
            <Route key={`${from}/*`} path={`${from}/*`} element={<LegacyCategoryRedirect from={from} to={to} />} />,
          ])}
          <Route path="/Trimmingtech" element={<Navigate to="/giai-phau-benh/trimmingtech" replace />} />
          <Route path="/TissueProcessing" element={<Navigate to="/giai-phau-benh/tissue-processing" replace />} />
          <Route path="/Scaning" element={<Navigate to="/giai-phau-benh/scaning" replace />} />
          <Route path="/LaserCassette" element={<Navigate to="/giai-phau-benh/laser-cassette" replace />} />
          <Route path="/Immunohistochemistry" element={<Navigate to="/giai-phau-benh/immunohistochemistry" replace />} />
          <Route path="/DyeingMachine" element={<Navigate to="/giai-phau-benh/dyeing-machine" replace />} />
          <Route path="/CuttingMachine" element={<Navigate to="/giai-phau-benh/cutting-machine" replace />} />
          <Route path="/Casting" element={<Navigate to="/giai-phau-benh/casting" replace />} />
          <Route path="/DryingTable" element={<Navigate to="/giai-phau-benh/drying-table" replace />} />
          <Route path="/TissueTension" element={<Navigate to="/giai-phau-benh/tissue-tension" replace />} />
          <Route path="/LaminatingMachine" element={<Navigate to="/giai-phau-benh/laminating-machine" replace />} />
          <Route path="/GiamDinhTruyenThongCoHocSungDan" element={<Navigate to="/giam-dinh-hinh-su/giam-dinh-truyen-thong-co-hoc-sung-dan" replace />} />
          <Route path="/GiamDinhTaiLieuChuVietTienTem" element={<Navigate to="/giam-dinh-hinh-su/giam-dinh-tai-lieu-chu-viet-tien-tem" replace />} />
          <Route path="/GiamDinhSinhHoc" element={<Navigate to="/giam-dinh-hinh-su/giam-dinh-sinh-hoc" replace />} />
          <Route path="/GiamDinhADN" element={<Navigate to="/giam-dinh-hinh-su/giam-dinh-adn" replace />} />
        </Route>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductManagePage />} />
            <Route path="installations" element={<AdminInstallationsPage />} />
            <Route path="contact-messages" element={<AdminContactMessagesPage />} />
            <Route path="equipment-categories" element={<EquipmentCategoryManagePage />} />
            <Route path="products/PICC" element={<PiccProductManagePage />} />
            <Route path="categories" element={<CategoryManagePage />} />
            <Route path="consumables" element={<ConsumableCategoryManagePage />} />
            <Route path="consumables/overview" element={<AdminConsumablesPage />} />
            <Route path="consumable-categories" element={<ConsumableCategoryManagePage />} />
            <Route path="chemical-categories" element={<ChemicalCategoryManagePage />} />
            <Route path="antibody-categories" element={<AntibodyCategoryManagePage />} />
            <Route path="forensic-categories" element={<ForensicCategoryManagePage />} />
            <Route path="forensic-products" element={<ForensicProductManagePage />} />
            <Route path="picc-categories" element={<PiccCategoryManagePage />} />
            <Route path="picc-products" element={<PiccProductManagePage />} />
            <Route path="microscope-categories" element={<MicroscopeCategoryManagePage />} />
            <Route path="microscopes" element={<MicroscopeManagePage />} />
            <Route path="news" element={<AdminSimplePage title="Tin tức" description="Khu vực quản lý tin tức sẽ dùng chung layout admin." />} />
            <Route path="brands" element={<AdminBrandsPage />} />
            <Route path="security" element={<AdminSecurityPage />} />
            <Route path="settings" element={<AdminSimplePage title="Cài đặt" description="Khu vực cấu hình hệ thống admin." />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
