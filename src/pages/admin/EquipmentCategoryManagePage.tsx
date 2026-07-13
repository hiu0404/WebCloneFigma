import { ProductChildCategoryManagePage } from './ProductChildCategoryManagePage'

export function EquipmentCategoryManagePage() {
  return (
    <ProductChildCategoryManagePage
      parentSlug="equipment"
      title="Danh mục sản phẩm thiết bị"
      description="CRUD danh mục cho các trang thiết bị; dữ liệu dùng chung giữa admin và website bên ngoài."
      itemLabel="thiết bị"
    />
  )
}
