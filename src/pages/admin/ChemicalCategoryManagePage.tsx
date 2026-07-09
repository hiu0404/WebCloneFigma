import { ProductChildCategoryManagePage } from './ProductChildCategoryManagePage'

export function ChemicalCategoryManagePage() {
  return (
    <ProductChildCategoryManagePage
      parentSlug="chemicals"
      title="Danh sách danh mục hóa chất"
      description="CRUD danh mục con riêng cho Hóa chất và kháng thể, dùng chung dữ liệu với trang client và form sản phẩm."
      itemLabel="hóa chất"
    />
  )
}
