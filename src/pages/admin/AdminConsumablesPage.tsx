import { useEffect, useMemo, useState } from 'react'
import { getProductChildCategorySlug, type AdminCategory } from '../../data/categories'
import type { Product } from '../../lib/adminStore'
import { apiGetCategories } from '../../services/categoryService'
import { apiGetProducts } from '../../services/productService'
import styles from './AdminPages.module.css'

export function AdminConsumablesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([apiGetCategories(), apiGetProducts()])
      .then(([categoryList, productList]) => {
        setCategories(categoryList)
        setProducts(productList.filter((product) => (product.parentCategorySlug ?? product.category) === 'consumables'))
      })
      .finally(() => setLoading(false))
  }, [])

  const consumables = useMemo(() => categories.find((item) => item.slug === 'consumables'), [categories])

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Vật tư tiêu hao</h2>
          <p className={styles.panelSub}>
            Màn hình tham chiếu danh mục và số lượng sản phẩm. Thêm/sửa/xóa sản phẩm nằm ở Quản lý sản phẩm.
          </p>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingState}>Đang tải dữ liệu...</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Danh mục con</th>
                <th>Slug</th>
                <th>Số sản phẩm</th>
              </tr>
            </thead>
            <tbody>
              {(consumables?.children ?? []).map((child) => (
                <tr key={child.id}>
                  <td>{child.label}</td>
                  <td>{child.slug}</td>
                  <td>{products.filter((product) => getProductChildCategorySlug(product) === child.slug).length}</td>
                </tr>
              ))}
              {!consumables?.children.length ? (
                <tr>
                  <td colSpan={3}>
                    <div className={styles.emptyState}>Chưa có danh mục con cho Vật tư tiêu hao.</div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
