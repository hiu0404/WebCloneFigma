import { ProductChildCategoryManagePage } from './ProductChildCategoryManagePage'

export function AntibodyCategoryManagePage() {
  return (
    <ProductChildCategoryManagePage
      parentSlug="antibodies"
      title="Danh sách danh mục kháng thể"
      description="CRUD danh mục con riêng cho Kháng thể, dùng chung dữ liệu với trang client và form sản phẩm."
      itemLabel="kháng thể"
    />
  )
}
