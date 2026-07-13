import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiEdit2, FiEye, FiEyeOff, FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi'
import {
  getProductChildCategorySlug,
  getProductParentCategorySlug,
  makeSlug,
  type AdminCategory,
} from '../../data/categories'
import type { Product } from '../../lib/adminStore'
import { apiDeleteCategory, apiGetCategories, apiUpsertCategory } from '../../services/categoryService'
import { apiGetProducts, apiUploadImage, apiUpsertProduct } from '../../services/productService'
import styles from './AdminPages.module.css'

type CategoryFormValues = {
  id: string
  label: string
  slug: string
  parentId: string
  description: string
  imageUrl: string
  sortOrder: number
  status: 'active' | 'hidden'
}

type CategoryFilter = 'all' | 'parent' | 'child' | 'active' | 'hidden'

type CategoryRow = {
  id: string
  label: string
  slug: string
  parentId: string
  parentSlug: string
  parentLabel: string
  type: 'parent' | 'child'
  description?: string
  imageUrl?: string
  sortOrder: number
  status: 'active' | 'hidden'
  childrenCount: number
}

function emptyForm(): CategoryFormValues {
  return {
    id: '',
    label: '',
    slug: '',
    parentId: '',
    description: '',
    imageUrl: '',
    sortOrder: 0,
    status: 'active',
  }
}

function flattenCategories(categories: AdminCategory[]): CategoryRow[] {
  return categories.flatMap((category) => [
    {
      id: category.id,
      label: category.label,
      slug: category.slug,
      parentId: '',
      parentSlug: category.slug,
      parentLabel: '',
      type: 'parent' as const,
      description: category.description,
      imageUrl: category.imageUrl,
      sortOrder: category.sortOrder ?? 0,
      status: (category.status === 'hidden' ? 'hidden' : 'active') as CategoryRow['status'],
      childrenCount: category.children.length,
    },
    ...category.children.map((child) => ({
      id: child.id,
      label: child.label,
      slug: child.slug,
      parentId: category.id,
      parentSlug: category.slug,
      parentLabel: category.label,
      type: 'child' as const,
      description: child.description,
      imageUrl: child.imageUrl,
      sortOrder: child.sortOrder ?? 0,
      status: (child.status === 'hidden' ? 'hidden' : 'active') as CategoryRow['status'],
      childrenCount: 0,
    })),
  ])
}

function productUsesRow(product: Product, row: CategoryRow) {
  const parentSlug = getProductParentCategorySlug(product)
  if (row.type === 'parent') return parentSlug === row.slug
  return parentSlug === row.parentSlug && getProductChildCategorySlug(product) === row.slug
}

function previewUrl(parentSlug: string, slug: string, parentId: string) {
  if (slug === 'consumables') return '/vat-tu-tieu-hao'
  if (parentSlug === 'consumables' || parentId) return `/vat-tu-tieu-hao/${slug || ':slug'}`
  return '/EquipmentPage'
}

export function CategoryManagePage() {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [editingRow, setEditingRow] = useState<CategoryRow | null>(null)
  const [viewingRow, setViewingRow] = useState<CategoryRow | null>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<CategoryFilter>('all')
  const form = useForm<CategoryFormValues>({ defaultValues: emptyForm() })
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = form
  const labelWatch = watch('label')
  const slugWatch = watch('slug')
  const parentIdWatch = watch('parentId')
  const imageUrlWatch = watch('imageUrl')
  const selectedParent = categories.find((category) => category.id === parentIdWatch)
  const urlPreview = previewUrl(selectedParent?.slug ?? slugWatch, slugWatch, parentIdWatch)

  const rows = useMemo(() => flattenCategories(categories), [categories])
  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return rows.filter((row) => {
      const text = `${row.label} ${row.slug} ${row.parentLabel} ${row.description ?? ''}`.toLowerCase()
      const matchSearch = !keyword || text.includes(keyword)
      const matchFilter =
        filter === 'all' ||
        (filter === 'parent' && row.type === 'parent') ||
        (filter === 'child' && row.type === 'child') ||
        (filter === 'active' && row.status === 'active') ||
        (filter === 'hidden' && row.status === 'hidden')
      return matchSearch && matchFilter
    })
  }, [rows, search, filter])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  async function reload() {
    setLoading(true)
    try {
      const [categoryList, productList] = await Promise.all([apiGetCategories(), apiGetProducts()])
      setCategories(categoryList)
      setProducts(productList)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reload()
  }, [])

  async function migrateLinkedProducts(previous: CategoryRow, next: CategoryFormValues) {
    const nextParent = categories.find((category) => category.id === next.parentId)
    const nextParentSlug = nextParent?.slug || next.slug
    const changedParent = previous.type === 'parent' && previous.slug !== next.slug
    const changedChild =
      previous.type === 'child' && (previous.slug !== next.slug || previous.parentId !== next.parentId)
    if (!changedParent && !changedChild) return

    const list = await apiGetProducts()
    const updates = list.filter((product) => productUsesRow(product, previous)).map((product) => {
      if (previous.type === 'parent') {
        return { ...product, category: next.slug, parentCategorySlug: next.slug }
      }
      return {
        ...product,
        category: nextParentSlug,
        parentCategorySlug: nextParentSlug,
        categoryId: next.slug,
        categorySlug: next.slug,
        consumableGroup: nextParentSlug === 'consumables' ? next.slug : product.consumableGroup,
        chemicalGroup: nextParentSlug === 'chemicals' ? next.slug : product.chemicalGroup,
      }
    })
    for (const product of updates) await apiUpsertProduct(product)
  }

  const onSave = handleSubmit(async (values) => {
    const label = values.label.trim()
    const slug = values.slug.trim() || makeSlug(label)
    if (!label || !slug) return

    setBusy(true)
    try {
      const payload = {
        id: values.id || slug,
        label,
        slug,
        parentId: values.parentId || undefined,
        description: values.description.trim() || undefined,
        imageUrl: values.imageUrl.trim() || undefined,
        sortOrder: Number(values.sortOrder) || 0,
        status: values.status,
        previousSlug: editingRow?.slug,
        previousParentId: editingRow?.parentId,
      }
      const nextCategories = await apiUpsertCategory(payload)
      if (editingRow) await migrateLinkedProducts(editingRow, { ...values, slug })
      setCategories(nextCategories)
      await reload()
      reset(emptyForm())
      setEditingRow(null)
      showToast(editingRow ? 'Đã cập nhật danh mục' : 'Đã thêm danh mục')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không lưu được danh mục')
    } finally {
      setBusy(false)
    }
  })

  async function deleteRow(row: CategoryRow) {
    const usedCount = products.filter((product) => productUsesRow(product, row)).length
    if (row.type === 'parent' && row.childrenCount > 0) {
      showToast('Không thể xóa danh mục cha khi vẫn còn danh mục con. Hãy chuyển danh mục con trước.')
      return
    }
    if (usedCount > 0) {
      showToast(`Không thể xóa vì còn ${usedCount} sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước.`)
      return
    }
    if (!window.confirm(`Xóa danh mục "${row.label}"?`)) return
    setBusy(true)
    try {
      await apiDeleteCategory(row.id)
      await reload()
      showToast('Đã xóa danh mục')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không xóa được danh mục')
    } finally {
      setBusy(false)
    }
  }

  function editRow(row: CategoryRow) {
    setEditingRow(row)
    reset({
      id: row.id,
      label: row.label,
      slug: row.slug,
      parentId: row.parentId,
      description: row.description ?? '',
      imageUrl: row.imageUrl ?? '',
      sortOrder: row.sortOrder,
      status: row.status,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function parentOption(category: AdminCategory): AdminCategory | null {
    if (!editingRow || editingRow.type !== 'parent') return category
    return category.id === editingRow.id ? null : category
  }

  const viewingProducts = viewingRow ? products.filter((product) => productUsesRow(product, viewingRow)) : []

  return (
    <div className={styles.stack}>
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>{editingRow ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
            <p className={styles.panelSub}>Danh mục dùng chung cho form sản phẩm và trang ngoài website.</p>
          </div>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={() => {
              reset(emptyForm())
              setEditingRow(null)
            }}
          >
            <FiRefreshCw aria-hidden />
            Làm mới
          </button>
        </div>

        <div className={styles.panelBody}>
          <form onSubmit={(event) => void onSave(event)}>
            <div className={styles.formGrid}>
              <input type="hidden" {...register('id')} />
              <label className={styles.field}>
                <span className={styles.label}>Tên danh mục *</span>
                <input
                  className={styles.input}
                  {...register('label', { required: 'Vui lòng nhập tên danh mục' })}
                  onBlur={() => {
                    if (!slugWatch.trim() && labelWatch.trim()) setValue('slug', makeSlug(labelWatch))
                  }}
                />
                {errors.label ? <span className={styles.error}>{errors.label.message}</span> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Slug *</span>
                <input className={styles.input} {...register('slug', { required: 'Vui lòng nhập slug danh mục' })} />
                {errors.slug ? <span className={styles.error}>{errors.slug.message}</span> : null}
                <span className={styles.muted}>Preview URL: {urlPreview}</span>
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Danh mục cha</span>
                <select className={styles.select} {...register('parentId')}>
                  <option value="">Là danh mục cha</option>
                  {categories.map(parentOption).filter(Boolean).map((category) => {
                    const item = category as AdminCategory
                    return (
                      <option value={item.id} key={item.id}>
                        {item.label}
                      </option>
                    )
                  })}
                </select>
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Thứ tự hiển thị</span>
                <input className={styles.input} type="number" min={0} step={1} {...register('sortOrder', { valueAsNumber: true })} />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Trạng thái</span>
                <select className={styles.select} {...register('status')}>
                  <option value="active">Hiển thị</option>
                  <option value="hidden">Ẩn</option>
                </select>
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Ảnh đại diện hoặc icon</span>
                <input className={styles.input} placeholder="/uploads/icon.png" {...register('imageUrl')} />
                <input
                  className={styles.input}
                  type="file"
                  accept="image/*"
                  onChange={async (event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    setBusy(true)
                    try {
                      const url = await apiUploadImage(file)
                      setValue('imageUrl', url)
                      showToast('Đã tải ảnh danh mục')
                    } catch (err) {
                      showToast(err instanceof Error ? err.message : 'Upload ảnh thất bại')
                    } finally {
                      setBusy(false)
                      event.target.value = ''
                    }
                  }}
                />
                {imageUrlWatch ? (
                  <div className={styles.imagePreview}>
                    <img src={imageUrlWatch} alt="" />
                    <span className={styles.muted}>{imageUrlWatch}</span>
                  </div>
                ) : null}
              </label>

              <label className={`${styles.field} ${styles.full}`}>
                <span className={styles.label}>Mô tả ngắn</span>
                <textarea className={styles.textarea} rows={3} {...register('description')} />
              </label>
            </div>

            <div className={styles.actions}>
              <button className={styles.button} type="submit" disabled={busy}>
                <FiPlus aria-hidden />
                {editingRow ? 'Lưu danh mục' : 'Thêm danh mục'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>Danh sách danh mục</h2>
            <p className={styles.panelSub}>Dạng cây cha/con. Danh mục ẩn không hiển thị ngoài website.</p>
          </div>
        </div>

        <div className={styles.panelBody}>
          <div className={styles.toolbar}>
            <input
              className={styles.input}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm tên, slug, mô tả"
            />
            <select className={styles.select} value={filter} onChange={(event) => setFilter(event.target.value as CategoryFilter)}>
              <option value="all">Tất cả</option>
              <option value="parent">Danh mục cha</option>
              <option value="child">Danh mục con</option>
              <option value="active">Đang hiển thị</option>
              <option value="hidden">Đang ẩn</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingState}>Đang tải danh mục...</div>
        ) : filteredRows.length === 0 ? (
          <div className={styles.emptyState}>Không có danh mục phù hợp.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Danh mục</th>
                  <th>Slug</th>
                  <th>Thứ tự</th>
                  <th>Trạng thái</th>
                  <th>Sản phẩm đang dùng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const usedCount = products.filter((product) => productUsesRow(product, row)).length
                  return (
                    <tr key={row.id}>
                      <td>
                        <div className={styles.productCell}>
                          {row.imageUrl ? <img className={styles.thumb} src={row.imageUrl} alt="" /> : <span className={styles.thumbEmpty} />}
                          <div>
                            <div className={styles.productName}>{row.type === 'child' ? `↳ ${row.label}` : row.label}</div>
                            <div className={styles.muted}>
                              {row.type === 'child' ? row.parentLabel : `${row.childrenCount} danh mục con`}
                              {row.description ? ` · ${row.description}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{row.slug}</td>
                      <td>{row.sortOrder}</td>
                      <td>
                        <span className={row.status === 'active' ? styles.statusActive : styles.statusHidden}>
                          {row.status === 'active' ? <FiEye aria-hidden /> : <FiEyeOff aria-hidden />}
                          {row.status === 'active' ? 'Hiển thị' : 'Ẩn'}
                        </span>
                      </td>
                      <td>
                        <button className={styles.secondaryButton} type="button" onClick={() => setViewingRow(row)}>
                          {usedCount} sản phẩm
                        </button>
                      </td>
                      <td>
                        <div className={styles.rowActions}>
                          <button className={styles.iconButton} type="button" title="Sửa" onClick={() => editRow(row)}>
                            <FiEdit2 aria-hidden />
                          </button>
                          <button
                            className={styles.dangerButton}
                            type="button"
                            title="Xóa"
                            disabled={busy}
                            onClick={() => void deleteRow(row)}
                          >
                            <FiTrash2 aria-hidden />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {viewingRow ? (
        <div className={styles.modalBackdrop} role="presentation">
          <div className={styles.modal} role="dialog" aria-modal="true">
            <h2 className={styles.modalTitle}>Sản phẩm thuộc "{viewingRow.label}"</h2>
            {viewingProducts.length > 0 ? (
              <div className={styles.stack} style={{ marginTop: 12 }}>
                {viewingProducts.map((product) => (
                  <div key={product.id} className={styles.productName}>{product.title}</div>
                ))}
              </div>
            ) : (
              <p className={styles.modalText}>Chưa có sản phẩm nào dùng danh mục này.</p>
            )}
            <div className={styles.actions}>
              <button className={styles.secondaryButton} type="button" onClick={() => setViewingRow(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? <div className={styles.toast}>{toast}</div> : null}
    </div>
  )
}
