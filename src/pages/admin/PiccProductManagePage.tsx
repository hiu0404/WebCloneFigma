import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiEdit2, FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi'
import {
  getChildCategoryLabel,
  visibleChildCategories,
  type AdminCategory,
} from '../../data/categories'
import {
  makePiccProductId,
  type PiccProduct,
} from '../../data/piccProducts'
import { apiGetCategories } from '../../services/categoryService'
import {
  apiDeletePiccProduct,
  apiGetPiccProducts,
  apiUploadPiccProductImage,
  apiUpsertPiccProduct,
} from '../../services/piccProductService'
import styles from './AdminPages.module.css'

const PARENT_SLUG = 'intensive-care'

type FormValues = {
  id: string
  name: string
  model: string
  categorySlug: string
  imageUrl: string
  shortDescription: string
  specs: string
  sortOrder: number | ''
}

function emptyForm(categorySlug = ''): FormValues {
  return {
    id: makePiccProductId(),
    name: '',
    model: '',
    categorySlug,
    imageUrl: '',
    shortDescription: '',
    specs: '',
    sortOrder: '',
  }
}

export function PiccProductManagePage() {
  const [products, setProducts] = useState<PiccProduct[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const activeCategories = useMemo(() => visibleChildCategories(categories, PARENT_SLUG), [categories])
  const firstCategorySlug = activeCategories[0]?.slug ?? ''
  const form = useForm<FormValues>({ defaultValues: emptyForm(firstCategorySlug) })
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = form
  const imageUrlWatch = watch('imageUrl')

  const filteredProducts = useMemo(() => {
    if (categoryFilter === 'all') return products
    return products.filter((item) => item.categorySlug === categoryFilter)
  }, [products, categoryFilter])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  async function reload() {
    setLoading(true)
    try {
      const [categoryList, productList] = await Promise.all([apiGetCategories(), apiGetPiccProducts()])
      const activeSlugs = new Set(visibleChildCategories(categoryList, PARENT_SLUG).map((item) => item.slug))
      setCategories(categoryList)
      setProducts(productList.filter((item) => activeSlugs.has(item.categorySlug) || item.status === 'hidden'))
      const firstActive = visibleChildCategories(categoryList, PARENT_SLUG)[0]?.slug ?? ''
      if (!editingId) reset(emptyForm(firstActive))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSave = handleSubmit(async (values) => {
    const name = values.name.trim()
    const categorySlug = values.categorySlug.trim()
    if (!name || !categorySlug) return
    setBusy(true)
    try {
      await apiUpsertPiccProduct({
        id: values.id,
        name,
        model: values.model.trim(),
        categorySlug,
        imageUrl: values.imageUrl.trim() || undefined,
        shortDescription: values.shortDescription.trim(),
        specs: values.specs.trim() || undefined,
        sortOrder: Number(values.sortOrder) || undefined,
        status: 'active',
      })
      await reload()
      setEditingId(null)
      reset(emptyForm(categorySlug))
      showToast(editingId ? 'Đã cập nhật sản phẩm hồi sức tích cực' : 'Đã thêm sản phẩm hồi sức tích cực')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không lưu được sản phẩm hồi sức tích cực')
    } finally {
      setBusy(false)
    }
  })

  function editRow(product: PiccProduct) {
    setEditingId(product.id)
    reset({
      id: product.id,
      name: product.name,
      model: product.model,
      categorySlug: product.categorySlug,
      imageUrl: product.imageUrl ?? '',
      shortDescription: product.shortDescription,
      specs: product.specs ?? '',
      sortOrder: product.sortOrder ?? '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteRow(product: PiccProduct) {
    if (!window.confirm(`Xóa sản phẩm "${product.name}"?`)) return
    setBusy(true)
    try {
      await apiDeletePiccProduct(product.id)
      await reload()
      if (editingId === product.id) {
        setEditingId(null)
        reset(emptyForm(firstCategorySlug))
      }
      showToast('Đã xóa sản phẩm hồi sức tích cực')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không xóa được sản phẩm hồi sức tích cực')
    } finally {
      setBusy(false)
    }
  }

  async function uploadImage(file: File) {
    setBusy(true)
    try {
      const url = await apiUploadPiccProductImage(file)
      setValue('imageUrl', url, { shouldDirty: true, shouldValidate: true })
      showToast('Đã tải ảnh sản phẩm hồi sức tích cực')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upload ảnh sản phẩm hồi sức tích cực thất bại')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.stack}>
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>{editingId ? 'Sửa sản phẩm hồi sức tích cực' : 'Thêm sản phẩm hồi sức tích cực'}</h2>
            <p className={styles.panelSub}>CRUD riêng cho sản phẩm Hồi sức tích cực, không dùng chung form sản phẩm tổng.</p>
          </div>
          <button className={styles.secondaryButton} type="button" onClick={() => { setEditingId(null); reset(emptyForm(firstCategorySlug)) }}>
            <FiRefreshCw aria-hidden />
            Làm mới
          </button>
        </div>
        <div className={styles.panelBody}>
          <form onSubmit={(event) => void onSave(event)}>
            <div className={styles.formGrid}>
              <input type="hidden" {...register('id')} />
              <label className={styles.field}>
                <span className={styles.label}>Tên sản phẩm *</span>
                <input className={styles.input} {...register('name', { required: 'Vui lòng nhập tên sản phẩm' })} />
                {errors.name ? <span className={styles.error}>{errors.name.message}</span> : null}
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Model</span>
                <input className={styles.input} {...register('model')} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Danh mục *</span>
                <select className={styles.select} {...register('categorySlug', { required: 'Vui lòng chọn danh mục' })}>
                  <option value="">Chọn danh mục</option>
                  {activeCategories.map((category) => (
                    <option value={category.slug} key={category.slug}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.categorySlug ? <span className={styles.error}>{errors.categorySlug.message}</span> : null}
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Ảnh sản phẩm</span>
                <input
                  className={styles.input}
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void uploadImage(file)
                    event.target.value = ''
                  }}
                />
                <input className={styles.input} placeholder="/uploads/picc-product.jpg" {...register('imageUrl')} />
                {imageUrlWatch ? (
                  <div className={styles.imagePreview}>
                    <img src={imageUrlWatch} alt="" />
                    <span className={styles.muted}>{imageUrlWatch}</span>
                  </div>
                ) : (
                  <span className={styles.muted}>Chưa chọn ảnh</span>
                )}
              </label>
              <label className={`${styles.field} ${styles.full}`}>
                <span className={styles.label}>Mô tả ngắn</span>
                <textarea className={styles.textarea} rows={3} {...register('shortDescription')} />
              </label>
              <label className={`${styles.field} ${styles.full}`}>
                <span className={styles.label}>Thông số kỹ thuật</span>
                <textarea className={styles.textarea} rows={5} {...register('specs')} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Thứ tự hiển thị</span>
                <input className={styles.input} type="number" min={1} step={1} {...register('sortOrder', { valueAsNumber: true })} />
                <span className={styles.muted}>Nhập 1, 2, 3... Sản phẩm chưa nhập sẽ nằm cuối danh sách.</span>
              </label>
            </div>
            <div className={styles.actions}>
              <button className={styles.button} type="submit" disabled={busy || activeCategories.length === 0}>
                <FiPlus aria-hidden />
                {editingId ? 'Lưu sản phẩm' : 'Thêm sản phẩm'}
              </button>
              {activeCategories.length === 0 ? <span className={styles.error}>Cần tạo danh mục hồi sức tích cực hiển thị trước.</span> : null}
            </div>
          </form>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>Danh sách sản phẩm hồi sức tích cực</h2>
            <p className={styles.panelSub}>Hiển thị {filteredProducts.length}/{products.length} sản phẩm.</p>
          </div>
        </div>
        <div className={styles.panelBody}>
          <div className={styles.toolbar}>
            <select className={styles.select} value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">Tất cả danh mục</option>
              {visibleChildCategories(categories, PARENT_SLUG).map((category) => (
                <option value={category.slug} key={category.slug}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {loading ? (
          <div className={styles.loadingState}>Đang tải sản phẩm hồi sức tích cực...</div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>Chưa có sản phẩm hồi sức tích cực phù hợp.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tên sản phẩm</th>
                  <th>Ảnh</th>
                  <th>Model</th>
                  <th>Danh mục</th>
                  <th>Thứ tự</th>
                  <th>Mô tả ngắn</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td><div className={styles.productName}>{product.name}</div></td>
                    <td>
                      {product.imageUrl ? (
                        <img className={styles.thumb} src={product.imageUrl} alt="" />
                      ) : (
                        <span className={styles.thumbEmpty} />
                      )}
                    </td>
                    <td>{product.model}</td>
                    <td><span className={styles.pill}>{getChildCategoryLabel(categories, PARENT_SLUG, product.categorySlug)}</span></td>
                    <td>{product.sortOrder ?? ''}</td>
                    <td>{product.shortDescription}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button className={styles.iconButton} type="button" title="Sửa" onClick={() => editRow(product)}>
                          <FiEdit2 aria-hidden />
                        </button>
                        <button className={styles.dangerButton} type="button" title="Xóa" disabled={busy} onClick={() => void deleteRow(product)}>
                          <FiTrash2 aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {toast ? <div className={styles.toast}>{toast}</div> : null}
    </div>
  )
}
