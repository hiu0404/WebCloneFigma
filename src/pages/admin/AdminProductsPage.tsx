import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { FiEdit2, FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi'
import { getCategoryLabel, getChildCategoryLabel, isCategoryVisible, type AdminCategory } from '../../data/categories'
import { newId, normalizeLegacyProduct, type Product } from '../../lib/adminStore'
import { apiDeleteProduct, apiGetProducts, apiUploadImage, apiUpsertProduct } from '../../services/productService'
import { apiGetCategories } from '../../services/categoryService'
import { sanitizeAdminImageUrls, sanitizeAdminMainImageUrl } from '../../lib/adminImages'
import { productMainImageUrl } from '../../lib/productImages'
import styles from './AdminPages.module.css'

type Draft = Omit<Product, 'createdAt' | 'updatedAt'>

type AdminProductFormValues = {
  id: string
  title: string
  category: string
  categorySlug: string
  imageUrl: string
  imageUrls: string[]
  shortDescription: string
  price: string
  sku: string
  brand: string
  origin: string
  description: string
  specs: string
  pdfUrl: string
  youtubeUrl: string
  status: NonNullable<Product['status']>
  featured: boolean
  sortOrder: number | ''
}

const LS_ADMIN_DRAFT_KEY = 'admin_product_draft_v1'
const LS_ADMIN_KEEP_KEY = 'admin_keep_values_v1'
const PAGE_SIZE = 8
const EXCLUDED_PRODUCT_CATEGORY_SLUGS = new Set(['forensic-science', 'intensive-care'])

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function emptyForm(): AdminProductFormValues {
  return {
    id: newId(),
    title: '',
    category: 'equipment',
    categorySlug: '',
    imageUrl: '',
    imageUrls: [],
    shortDescription: '',
    price: '',
    sku: '',
    brand: '',
    origin: '',
    description: '',
    specs: '',
    pdfUrl: '',
    youtubeUrl: '',
    status: 'active',
    featured: false,
    sortOrder: '',
  }
}

function buildInitialFormDefaults(): AdminProductFormValues {
  const saved = safeJsonParse<Partial<AdminProductFormValues>>(localStorage.getItem(LS_ADMIN_DRAFT_KEY), {})
  return {
    ...emptyForm(),
    category: saved.category ?? 'equipment',
    categorySlug: saved.categorySlug ?? '',
    price: saved.price ?? '',
    brand: saved.brand ?? '',
    origin: saved.origin ?? '',
    status: saved.status ?? 'active',
    sortOrder: saved.sortOrder ?? '',
  }
}

function toFormValues(product: Product): AdminProductFormValues {
  const normalized = normalizeLegacyProduct(product)
  return {
    id: normalized.id,
    title: normalized.title,
    category: normalized.parentCategorySlug ?? normalized.category ?? 'equipment',
    categorySlug: normalized.categorySlug ?? '',
    imageUrl: sanitizeAdminMainImageUrl(normalized.imageUrl),
    imageUrls: sanitizeAdminImageUrls(normalized.imageUrls),
    shortDescription: normalized.shortDescription ?? '',
    price: normalized.price ?? '',
    sku: normalized.sku ?? '',
    brand: normalized.brand ?? '',
    origin: normalized.origin ?? '',
    description: normalized.description ?? '',
    specs: normalized.specs ?? '',
    pdfUrl: normalized.pdfUrl ?? '',
    youtubeUrl: normalized.youtubeUrl ?? '',
    status: normalized.status ?? 'active',
    featured: Boolean(normalized.featured),
    sortOrder: normalized.sortOrder ?? '',
  }
}

function statusLabel(status?: Product['status']) {
  if (status === 'draft') return 'Bản nháp'
  if (status === 'hidden') return 'Ẩn'
  return 'Đang hiển thị'
}

function statusClass(status?: Product['status']) {
  if (status === 'draft') return styles.statusDraft
  if (status === 'hidden') return styles.statusHidden
  return styles.statusActive
}

export function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [keepValues, setKeepValues] = useState(() => localStorage.getItem(LS_ADMIN_KEEP_KEY) !== '0')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | NonNullable<Product['status']>>('all')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [toast, setToast] = useState('')
  const [galleryUrlDraft, setGalleryUrlDraft] = useState('')

  const defaultValues = useMemo(() => buildInitialFormDefaults(), [])
  const form = useForm<AdminProductFormValues>({
    defaultValues,
  })
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = form

  const selectedCategory = useWatch({ control: form.control, name: 'category' })
  const selectedCategorySlug = useWatch({ control: form.control, name: 'categorySlug' })
  const persistPrice = useWatch({ control: form.control, name: 'price' })
  const persistBrand = useWatch({ control: form.control, name: 'brand' })
  const persistOrigin = useWatch({ control: form.control, name: 'origin' })
  const persistStatus = useWatch({ control: form.control, name: 'status' })
  const persistSortOrder = useWatch({ control: form.control, name: 'sortOrder' })
  const imageUrlWatch = useWatch({ control: form.control, name: 'imageUrl' })
  const imageUrlsWatch = useWatch({ control: form.control, name: 'imageUrls' })

  const selectedParent = useMemo(
    () => categories.find((item) => item.slug === selectedCategory),
    [categories, selectedCategory],
  )
  const activeParentCategories = useMemo(
    () => categories.filter((item) => isCategoryVisible(item) && !EXCLUDED_PRODUCT_CATEGORY_SLUGS.has(item.slug)),
    [categories],
  )
  const activeChildCategories = useMemo(
    () => (selectedParent?.children ?? []).filter(isCategoryVisible),
    [selectedParent],
  )

  async function reload() {
    setLoading(true)
    try {
      const [list, categoryList] = await Promise.all([apiGetProducts(), apiGetCategories()])
      setItems(list.map(normalizeLegacyProduct))
      setCategories(categoryList)
    } finally {
      setLoading(false)
    }
  }

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  useEffect(() => {
    void reload()
  }, [])

  useEffect(() => {
    const hasChildren = activeChildCategories.length > 0
    const selectedChildIsValid = activeChildCategories.some((item) => item.slug === selectedCategorySlug)

    if (hasChildren && !selectedChildIsValid) {
      setValue('categorySlug', activeChildCategories[0].slug, { shouldDirty: true, shouldValidate: true })
      return
    }

    if (!hasChildren && selectedCategorySlug) {
      setValue('categorySlug', '', { shouldDirty: true, shouldValidate: true })
    }
  }, [activeChildCategories, selectedCategorySlug, setValue])

  useEffect(() => {
    if (editingId != null) return
    const toSave: Partial<Draft> = {
      category: selectedCategory,
      parentCategorySlug: selectedCategory,
      categorySlug: selectedCategorySlug || undefined,
      price: persistPrice,
      brand: persistBrand,
      origin: persistOrigin,
      status: persistStatus,
      sortOrder: Number(persistSortOrder) || undefined,
    }
    localStorage.setItem(LS_ADMIN_DRAFT_KEY, JSON.stringify(toSave))
  }, [selectedCategory, selectedCategorySlug, persistPrice, persistBrand, persistOrigin, persistStatus, persistSortOrder, editingId])

  useEffect(() => {
    localStorage.setItem(LS_ADMIN_KEEP_KEY, keepValues ? '1' : '0')
  }, [keepValues])

  useEffect(() => {
    setPage(1)
  }, [search, categoryFilter, statusFilter])

  const isEditing = editingId != null
  const normalizedItems = useMemo(() => items.map(normalizeLegacyProduct), [items])
  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return normalizedItems.filter((product) => {
      const parent = product.parentCategorySlug ?? product.category ?? 'equipment'
      const text = `${product.title} ${product.sku ?? ''} ${product.brand ?? ''}`.toLowerCase()
      const matchesSearch = !keyword || text.includes(keyword)
      const matchesCategory = categoryFilter === 'all' || parent === categoryFilter
      const matchesStatus = statusFilter === 'all' || (product.status ?? 'active') === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [normalizedItems, search, categoryFilter, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))
  const visibleItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const stats = useMemo(() => {
    const consumables = normalizedItems.filter((item) => (item.parentCategorySlug ?? item.category) === 'consumables').length
    const active = normalizedItems.filter((item) => (item.status ?? 'active') === 'active').length
    const featured = normalizedItems.filter((item) => item.featured).length
    return { total: normalizedItems.length, consumables, active, featured }
  }, [normalizedItems])

  const onSave = handleSubmit(async (values) => {
    const title = values.title.trim()
    if (!title) return
    const parentCategorySlug = values.category
    const childSlug = values.categorySlug.trim()
    if (activeChildCategories.length > 0 && !childSlug) {
      showToast('Vui lòng chọn danh mục con')
      return
    }

    setBusy(true)
    try {
      const cleanedUrls = sanitizeAdminImageUrls(values.imageUrls ?? [])
      const draftSubmit: Omit<Draft, 'createdAt' | 'updatedAt'> = normalizeLegacyProduct({
        id: values.id,
        title,
        category: parentCategorySlug,
        parentCategorySlug,
        categoryId: childSlug || undefined,
        categorySlug: childSlug || undefined,
        consumableGroup: parentCategorySlug === 'consumables' ? childSlug || undefined : undefined,
        chemicalGroup: parentCategorySlug === 'chemicals' ? childSlug || undefined : undefined,
        imageUrl: sanitizeAdminMainImageUrl(values.imageUrl.trim()) || undefined,
        imageUrls: cleanedUrls.length > 0 ? cleanedUrls : undefined,
        shortDescription: values.shortDescription.trim() || undefined,
        price: values.price.trim() || undefined,
        sku: values.sku.trim() || undefined,
        brand: values.brand.trim() || undefined,
        origin: values.origin.trim() || undefined,
        description: values.description.trim() || undefined,
        specs: values.specs.trim() || undefined,
        pdfUrl: values.pdfUrl.trim() || undefined,
        youtubeUrl: values.youtubeUrl.trim() || undefined,
        status: values.status,
        featured: values.featured,
        sortOrder: Number(values.sortOrder) || undefined,
      })

      await apiUpsertProduct(draftSubmit)
      await reload()
      setEditingId(null)
      showToast(isEditing ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm')
      if (keepValues) {
        reset({
          ...emptyForm(),
          category: parentCategorySlug,
          categorySlug: childSlug,
          price: values.price,
          brand: values.brand,
          origin: values.origin,
          status: values.status,
          sortOrder: values.sortOrder,
        })
      } else {
        reset(emptyForm())
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không lưu được sản phẩm')
    } finally {
      setBusy(false)
    }
  })

  async function uploadOne(file: File, field: 'imageUrl' | 'pdfUrl') {
    setBusy(true)
    try {
      const url = await apiUploadImage(file)
      setValue(field, url, { shouldDirty: true, shouldValidate: true })
      showToast('Tải file thành công')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upload thất bại')
    } finally {
      setBusy(false)
    }
  }

  function addGalleryImageUrl() {
    const cleanedUrl = sanitizeAdminMainImageUrl(galleryUrlDraft)
    if (!cleanedUrl) {
      showToast('URL anh khong hop le')
      return
    }

    const currentUrls = sanitizeAdminImageUrls(getValues('imageUrls') ?? [])
    if (currentUrls.includes(cleanedUrl)) {
      showToast('URL anh nay da co trong gallery')
      return
    }

    setValue('imageUrls', [...currentUrls, cleanedUrl], { shouldDirty: true, shouldValidate: true })
    setGalleryUrlDraft('')
    showToast('Da them URL anh vao gallery')
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setBusy(true)
    try {
      await apiDeleteProduct(deleteTarget.id)
      await reload()
      if (editingId === deleteTarget.id) {
        setEditingId(null)
        reset(emptyForm())
      }
      showToast('Đã xóa sản phẩm')
      setDeleteTarget(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không xóa được sản phẩm')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.stack}>
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Tổng sản phẩm</div>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statHint}>Tất cả danh mục</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Đang hiển thị</div>
          <div className={styles.statValue}>{stats.active}</div>
          <div className={styles.statHint}>Trạng thái active</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Vật tư tiêu hao</div>
          <div className={styles.statValue}>{stats.consumables}</div>
          <div className={styles.statHint}>Theo danh mục cha</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Nổi bật</div>
          <div className={styles.statValue}>{stats.featured}</div>
          <div className={styles.statHint}>Được ghim trên web</div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>{isEditing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
            <p className={styles.panelSub}>Form dùng React Hook Form và lưu qua API CRUD hiện tại.</p>
          </div>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={() => {
              setEditingId(null)
              reset(emptyForm())
            }}
          >
            <FiRefreshCw aria-hidden />
            Làm mới
          </button>
        </div>

        <div className={styles.panelBody}>
          <form onSubmit={(event) => void onSave(event)}>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span className={styles.label}>Tên sản phẩm *</span>
                <input className={styles.input} {...register('title', { required: 'Vui lòng nhập tên sản phẩm' })} />
                {errors.title ? <span className={styles.error}>{errors.title.message}</span> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Danh mục cha *</span>
                <select
                  className={styles.select}
                  {...register('category', { required: 'Vui lòng chọn danh mục cha' })}
                  onChange={(event) => {
                    const nextCategory = event.target.value
                    const nextParent = categories.find((item) => item.slug === nextCategory)
                    const nextChild = (nextParent?.children ?? []).find(isCategoryVisible)?.slug ?? ''
                    setValue('category', nextCategory, { shouldDirty: true, shouldValidate: true })
                    setValue('categorySlug', nextChild, { shouldDirty: true, shouldValidate: true })
                  }}
                >
                  {activeParentCategories.map((item) => (
                    <option value={item.slug} key={item.slug}>
                      {item.label}
                    </option>
                  ))}
                </select>
                {errors.category ? <span className={styles.error}>{errors.category.message}</span> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Danh mục con</span>
                <select
                  className={styles.select}
                  {...register('categorySlug', {
                    validate: (value) =>
                      !activeChildCategories.length || Boolean(value) || 'Vui lòng chọn danh mục con',
                  })}
                  value={selectedCategorySlug ?? ''}
                  onChange={(event) => {
                    setValue('categorySlug', event.target.value, { shouldDirty: true, shouldValidate: true })
                  }}
                  disabled={!activeChildCategories.length}
                >
                  <option value="">Chọn danh mục con</option>
                  {activeChildCategories.map((item) => (
                    <option value={item.slug} key={item.slug}>
                      {item.label}
                    </option>
                  ))}
                </select>
                {errors.categorySlug ? <span className={styles.error}>{errors.categorySlug.message}</span> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Thương hiệu</span>
                <input className={styles.input} {...register('brand')} />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Hình ảnh *</span>
                <input
                  className={styles.input}
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void uploadOne(file, 'imageUrl')
                    event.target.value = ''
                  }}
                />
                <input
                  className={styles.input}
                  type="url"
                  placeholder="Hoac dan URL anh ngoai: https://..."
                  {...register('imageUrl', {
                    required: 'Vui long chon hoac nhap URL hinh anh san pham',
                    validate: (value) =>
                      Boolean(sanitizeAdminMainImageUrl(value)) || 'URL hinh anh khong hop le',
                  })}
                />
                {imageUrlWatch ? (
                  <div className={styles.imagePreview}>
                    <img src={imageUrlWatch} alt="" />
                    <span className={styles.muted}>{imageUrlWatch}</span>
                  </div>
                ) : (
                  <span className={styles.muted}>Chưa chọn ảnh chính</span>
                )}
                {errors.imageUrl ? <span className={styles.error}>{errors.imageUrl.message}</span> : null}
              </label>

              <div className={styles.field}>
                <span className={styles.label}>Gallery ảnh</span>
                <input
                  className={styles.input}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={async (event) => {
                    const files = Array.from(event.target.files ?? []) as File[]
                    if (!files.length) return
                    setBusy(true)
                    try {
                      const urls: string[] = []
                      for (const file of files) urls.push(await apiUploadImage(file))
                      setValue('imageUrls', [...(getValues('imageUrls') ?? []), ...urls], {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                      showToast('Đã thêm ảnh vào gallery')
                    } catch (err) {
                      showToast(err instanceof Error ? err.message : 'Upload gallery thất bại')
                    } finally {
                      setBusy(false)
                      event.target.value = ''
                    }
                  }}
                />
                <input
                  className={styles.input}
                  type="url"
                  placeholder="Hoac dan URL anh phu roi bam them"
                  value={galleryUrlDraft}
                  onChange={(event) => setGalleryUrlDraft(event.target.value)}
                />
                <button className={styles.secondaryButton} type="button" onClick={addGalleryImageUrl} disabled={!galleryUrlDraft.trim()}>
                  Them URL anh phu
                </button>
                <span className={styles.muted}>
                  {imageUrlsWatch?.length ? `Đang có ${imageUrlsWatch.length} ảnh phụ` : 'Chưa có ảnh phụ'}
                </span>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>Mã sản phẩm</span>
                <input className={styles.input} {...register('sku')} />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Xuất xứ</span>
                <input className={styles.input} {...register('origin')} />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Giá</span>
                <input className={styles.input} {...register('price')} />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Tài liệu PDF</span>
                <input
                  className={styles.input}
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void uploadOne(file, 'pdfUrl')
                    event.target.value = ''
                  }}
                />
                <input className={styles.input} placeholder="Hoặc nhập URL PDF" {...register('pdfUrl')} />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Video YouTube</span>
                <input className={styles.input} placeholder="https://www.youtube.com/watch?v=..." {...register('youtubeUrl')} />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Trạng thái</span>
                <select className={styles.select} {...register('status')}>
                  <option value="active">Đang hiển thị</option>
                  <option value="draft">Bản nháp</option>
                  <option value="hidden">Ẩn</option>
                </select>
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Nổi bật</span>
                <span className={styles.switchRow}>
                  <input className={styles.checkbox} type="checkbox" {...register('featured')} />
                  <span className={styles.muted}>Đánh dấu sản phẩm nổi bật</span>
                </span>
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Thứ tự hiển thị</span>
                <input className={styles.input} type="number" min={1} step={1} {...register('sortOrder', { valueAsNumber: true })} />
                <span className={styles.muted}>Nhập 1, 2, 3... Sản phẩm chưa nhập sẽ nằm cuối danh sách.</span>
              </label>

              <label className={`${styles.field} ${styles.full}`}>
                <span className={styles.label}>Mô tả ngắn *</span>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  {...register('shortDescription', { required: 'Vui lòng nhập mô tả ngắn' })}
                />
                {errors.shortDescription ? <span className={styles.error}>{errors.shortDescription.message}</span> : null}
              </label>

              <label className={`${styles.field} ${styles.full}`}>
                <span className={styles.label}>Mô tả chi tiết</span>
                <textarea className={styles.textarea} rows={5} {...register('description')} />
              </label>

              <label className={`${styles.field} ${styles.full}`}>
                <span className={styles.label}>Thông số kỹ thuật</span>
                <textarea className={styles.textarea} rows={5} {...register('specs')} />
              </label>
            </div>

            <div className={styles.actions}>
              <button className={styles.button} type="submit" disabled={busy}>
                <FiPlus aria-hidden />
                {busy ? 'Đang xử lý...' : isEditing ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
              </button>
              <label className={styles.switchRow}>
                <input
                  className={styles.checkbox}
                  type="checkbox"
                  checked={keepValues}
                  onChange={(event) => setKeepValues(event.target.checked)}
                />
                <span className={styles.muted}>Giữ danh mục, giá, hãng, xuất xứ sau khi thêm</span>
              </label>
            </div>
          </form>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>Danh sách sản phẩm</h2>
            <p className={styles.panelSub}>
              Hiển thị {filteredItems.length}/{items.length} sản phẩm theo bộ lọc hiện tại.
            </p>
          </div>
        </div>

        <div className={styles.panelBody}>
          <div className={styles.toolbar}>
            <input
              className={styles.input}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên, SKU, thương hiệu"
            />
            <select
              className={styles.select}
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as typeof categoryFilter)}
            >
              <option value="all">Tất cả danh mục</option>
              {categories.filter((item) => !EXCLUDED_PRODUCT_CATEGORY_SLUGS.has(item.slug)).map((item) => (
                <option value={item.slug} key={item.slug}>
                  {item.label}
                </option>
              ))}
            </select>
            <select
              className={styles.select}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hiển thị</option>
              <option value="draft">Bản nháp</option>
              <option value="hidden">Ẩn</option>
            </select>
            <button className={styles.secondaryButton} type="button" onClick={() => void reload()}>
              <FiRefreshCw aria-hidden />
              Tải lại
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingState}>Đang tải danh sách sản phẩm...</div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.emptyState}>Không có sản phẩm phù hợp bộ lọc.</div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Danh mục cha</th>
                    <th>Danh mục con</th>
                    <th>Trạng thái</th>
                    <th>Thứ tự</th>
                    <th>Giá</th>
                    <th>SKU</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map((product) => {
                    const parent = product.parentCategorySlug ?? product.category ?? 'equipment'
                    const thumb = productMainImageUrl(product)
                    return (
                      <tr key={product.id}>
                        <td>
                          <div className={styles.productCell}>
                            {thumb ? <img className={styles.thumb} src={thumb} alt="" /> : <span className={styles.thumbEmpty} />}
                            <div>
                              <div className={styles.productName}>{product.title}</div>
                              <div className={styles.muted}>{product.brand ?? 'Chưa có thương hiệu'}</div>
                            </div>
                          </div>
                        </td>
                        <td>{getCategoryLabel(categories, parent)}</td>
                        <td>
                          <span className={styles.pill}>
                            {product.categorySlug ? getChildCategoryLabel(categories, parent, product.categorySlug) : 'Không có'}
                          </span>
                        </td>
                        <td>
                          <span className={statusClass(product.status)}>{statusLabel(product.status)}</span>
                        </td>
                        <td>{product.sortOrder ?? ''}</td>
                        <td>{product.price ?? ''}</td>
                        <td>{product.sku ?? ''}</td>
                        <td>
                          <div className={styles.rowActions}>
                            <button
                              className={styles.iconButton}
                              type="button"
                              title="Sửa"
                              onClick={() => {
                                setEditingId(product.id)
                                reset(toFormValues(product))
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}
                            >
                              <FiEdit2 aria-hidden />
                            </button>
                            <button
                              className={styles.dangerButton}
                              type="button"
                              title="Xóa"
                              disabled={busy}
                              onClick={() => setDeleteTarget(product)}
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

            <div className={styles.pagination}>
              <span className={styles.muted}>
                Trang {page}/{pageCount}
              </span>
              <div className={styles.rowActions}>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  Trước
                </button>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  disabled={page >= pageCount}
                  onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                >
                  Sau
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {deleteTarget ? (
        <div className={styles.modalBackdrop} role="presentation">
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="delete-title">
            <h2 className={styles.modalTitle} id="delete-title">Xóa sản phẩm?</h2>
            <p className={styles.modalText}>
              Sản phẩm "{deleteTarget.title}" sẽ bị xóa khỏi danh sách. Thao tác này dùng API xóa hiện tại.
            </p>
            <div className={styles.actions}>
              <button className={styles.dangerButton} type="button" disabled={busy} onClick={() => void confirmDelete()}>
                Xóa sản phẩm
              </button>
              <button className={styles.secondaryButton} type="button" onClick={() => setDeleteTarget(null)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? <div className={styles.toast}>{toast}</div> : null}
    </div>
  )
}
