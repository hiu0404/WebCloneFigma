import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { FigmaScaledLayout } from './layouts/FigmaScaledLayout'
import { HomePage } from './pages/HomePage'
import { ContactPage } from './pages/ContactPage'
import { AboutPage } from './pages/AboutPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
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
export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<FigmaScaledLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/gioi-thieu" element={<AboutPage />} />
          <Route path="/SupportService" element={<SupportService />} />
          <Route path="/BrandPage" element={<BrandPage />} />
          <Route path="/tin-tuc" element={<NewsPage />} />
          <Route path="/san-pham" element={<Navigate to="/EquipmentPage" replace />} />
          <Route path="/EquipmentPage" element={<EquipmentCatalogPage />} />
          <Route path="/san-pham-chi-tiet" element={<ProductDetailPage />} />
          <Route path="/vat-tu-tieu-hao" element={<VatTuTieuHaoPage />} />
          <Route path="/vat-tu-tieu-hao/:categorySlug" element={<VatTuTieuHaoPage />} />
          <Route path="/ChemicalsPage" element={<ChemicalsPage />} />
          <Route path="/ChemicalsPage/:categorySlug" element={<ChemicalsPage />} />
          <Route path="/AntibodiesPage" element={<AntibodiesPage />} />
          <Route path="/AntibodiesPage/:categorySlug" element={<AntibodiesPage />} />
          <Route path="/ContactPage" element={<ContactPage />} />
          <Route path="/MicroscopePage" element={<MicroscopePage />} />
          <Route path="/MicroscopePage/:categorySlug" element={<MicroscopePage />} />
          <Route path="/Trimmingtech" element={<EquipmentCatalogPage categorySlug="trimmingtech" />} />
          <Route path="/TissueProcessing" element={<EquipmentCatalogPage categorySlug="tissue-processing" />} />
          <Route path="/Scaning" element={<EquipmentCatalogPage categorySlug="scaning" />} />
          <Route path="/LaserCassette" element={<EquipmentCatalogPage categorySlug="laser-cassette" />} />
          <Route path="/LaserSlide" element={<LaserSlide />} />
          <Route path="/Immunohistochemistry" element={<EquipmentCatalogPage categorySlug="immunohistochemistry" />} />
          <Route path="/DyeingMachine" element={<EquipmentCatalogPage categorySlug="dyeing-machine" />} />
          <Route path="/CuttingMachine" element={<EquipmentCatalogPage categorySlug="cutting-machine" />} />
          <Route path="/Casting" element={<EquipmentCatalogPage categorySlug="casting" />} />
          <Route path="/DryingTable" element={<EquipmentCatalogPage categorySlug="drying-table" />} />
          <Route path="/TissueTension" element={<EquipmentCatalogPage categorySlug="tissue-tension" />} />
          <Route path="/LaminatingMachine" element={<EquipmentCatalogPage categorySlug="laminating-machine" />} />
          <Route path="/PICC" element={<PICC />} />
          <Route path="/PICC/:categorySlug" element={<PICC />} />
          <Route path="/GiamDinhKhoaHocKyThuatHinhSu" element={<ForensicPage />} />
          <Route path="/GiamDinhKhoaHocKyThuatHinhSu/:categorySlug" element={<ForensicPage />} />
          <Route path="/GiamDinhTruyenThongCoHocSungDan" element={<ForensicPage categoryKey="traditional" />} />
          <Route path="/GiamDinhTaiLieuChuVietTienTem" element={<ForensicPage categoryKey="documents" />} />
          <Route path="/GiamDinhSinhHoc" element={<ForensicPage categoryKey="biology" />} />
          <Route path="/GiamDinhADN" element={<ForensicPage categoryKey="dna" />} />
        </Route>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductManagePage />} />
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
            <Route path="security" element={<AdminSecurityPage />} />
            <Route path="settings" element={<AdminSimplePage title="Cài đặt" description="Khu vực cấu hình hệ thống admin." />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
