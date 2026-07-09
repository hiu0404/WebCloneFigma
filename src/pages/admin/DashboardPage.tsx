import { useEffect, useState } from 'react'
import type { AdminCategory } from '../../data/categories'
import type { Product } from '../../lib/adminStore'
import { apiGetProducts } from '../../services/productService'
import { apiGetCategories } from '../../services/categoryService'
import styles from './AdminPages.module.css'

export function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([apiGetProducts(), apiGetCategories()])
      .then(([productList, categoryList]) => {
        setProducts(productList)
        setCategories(categoryList)
      })
      .finally(() => setLoading(false))
  }, [])

  const active = products.filter((item) => (item.status ?? 'active') === 'active').length
  const draft = products.filter((item) => item.status === 'draft').length
  const consumables = products.filter((item) => (item.parentCategorySlug ?? item.category) === 'consumables').length

  return (
    <div className={styles.stack}>
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Sản phẩm</div>
          <div className={styles.statValue}>{loading ? '-' : products.length}</div>
          <div className={styles.statHint}>Tổng dữ liệu hiện có</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Đang hiển thị</div>
          <div className={styles.statValue}>{loading ? '-' : active}</div>
          <div className={styles.statHint}>Sẵn sàng trên website</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Bản nháp</div>
          <div className={styles.statValue}>{loading ? '-' : draft}</div>
          <div className={styles.statHint}>Cần hoàn thiện nội dung</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Vật tư tiêu hao</div>
          <div className={styles.statValue}>{loading ? '-' : consumables}</div>
          <div className={styles.statHint}>Theo danh mục cha</div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>Tổng quan danh mục</h2>
            <p className={styles.panelSub}>Dữ liệu demo cho trang dashboard admin.</p>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Danh mục cha</th>
                <th>Danh mục con</th>
                <th>Sản phẩm</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.slug}>
                  <td>{category.label}</td>
                  <td>{category.children.length}</td>
                  <td>{products.filter((item) => (item.parentCategorySlug ?? item.category ?? 'equipment') === category.slug).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
