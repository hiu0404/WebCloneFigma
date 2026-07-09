import { ProductChildCategoryManagePage } from './ProductChildCategoryManagePage'

export function ConsumableCategoryManagePage() {
  return (
    <ProductChildCategoryManagePage
      parentSlug="consumables"
      title="Danh sách danh mục vật tư tiêu hao"
      description="CRUD danh mục con riêng cho Vật tư tiêu hao, dùng chung dữ liệu với trang client và form sản phẩm."
      itemLabel="vật tư tiêu hao"
    />
  )
}
