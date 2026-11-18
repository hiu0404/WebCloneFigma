import { ProductChildCategoryManagePage } from './ProductChildCategoryManagePage'

export function PiccCategoryManagePage() {
  return (
    <ProductChildCategoryManagePage
      parentSlug="intensive-care"
      title="Danh sách danh mục đường tiếp cận mạch máu"
      description="Thêm ảnh và danh mục con cho từng nhóm đường tiếp cận mạch máu."
      itemLabel="đường tiếp cận mạch máu"
      allowNested
    />
  )
}
