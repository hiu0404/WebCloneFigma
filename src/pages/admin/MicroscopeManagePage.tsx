import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiEdit2, FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi'
import {
  getMicroscopeCategoryLabel,
  isActiveMicroscopeCategory,
  makeMicroscopeId,
  type Microscope,
  type MicroscopeCategory,
} from '../../data/microscopes'
import { apiGetMicroscopeCategories } from '../../services/microscopeCategoryService'
import {
  apiDeleteMicroscope,
  apiGetMicroscopes,
  apiUploadMicroscopeImage,
  apiUpsertMicroscope,
} from '../../services/microscopeService'
import { sanitizeAdminImageUrls, sanitizeAdminMainImageUrl } from '../../lib/adminImages'
import { productUrl } from '../../lib/seo'
import styles from './AdminPages.module.css'

const PAGE_SIZE = 8

type FormValues = {
  id: string
  name: string
  model: string
  brand: string
  categorySlug: string
  imageUrl: string
  imageUrls: string[]
  shortDescription: string
  description: string
  specs: string
  pdfUrl: string
  youtubeUrl: string
  slug: string
  seoTitle: string
  seoDescription: string
  status: Microscope['status']
  sortOrder: number | ''
}

function emptyForm(categorySlug = ''): FormValues {
  return {
    id: makeMicroscopeId(),
    name: '',
    model: '',
    brand: '',
    categorySlug,
    imageUrl: '',
    imageUrls: [],
    shortDescription: '',
    description: '',
    specs: '',
    pdfUrl: '',
    youtubeUrl: '',
    slug: '',
    seoTitle: '',
    seoDescription: '',
    status: 'active',
    sortOrder: '',
  }
}

export function MicroscopeManagePage() {
  const [microscopes, setMicroscopes] = useState<Microscope[]>([])
  const [categories, setCategories] = useState<MicroscopeCategory[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | Microscope['status']>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<Microscope | null>(null)
  const [galleryUrlDraft, setGalleryUrlDraft] = useState('')

  const activeCategories = useMemo(() => categories.filter((category) =>
    isActiveMicroscopeCategory(category) &&
    (!category.parentSlug || categories.some((parent) => parent.slug === category.parentSlug && isActiveMicroscopeCategory(parent))),
  ), [categories])
  const firstCategorySlug = activeCategories[0]?.slug ?? ''
  const form = useForm<FormValues>({ defaultValues: emptyForm(firstCategorySlug) })
  const { register, handleSubmit, reset, setValue, watch, getValues, formState: { errors } } = form
  const imageUrlWatch = watch('imageUrl')
  const imageUrlsWatch = watch('imageUrls')

  const filteredMicroscopes = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return microscopes.filter((item) =>
      (categoryFilter === 'all' || item.categorySlug === categoryFilter || categories.some((category) => category.slug === item.categorySlug && category.parentSlug === categoryFilter)) &&
      (statusFilter === 'all' || item.status === statusFilter) &&
      (!keyword || `${item.name} ${item.model} ${item.brand ?? ''}`.toLowerCase().includes(keyword)),
    )
  }, [microscopes, categories, categoryFilter, statusFilter, search])
  const pageCount = Math.max(1, Math.ceil(filteredMicroscopes.length / PAGE_SIZE))
  const visiblePage = Math.min(page, pageCount)
  const visibleMicroscopes = filteredMicroscopes.slice((visiblePage - 1) * PAGE_SIZE, visiblePage * PAGE_SIZE)
  const activeCount = microscopes.filter((item) => item.status === 'active').length

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  async function reload() {
    setLoading(true)
    try {
      const [categoryList, microscopeList] = await Promise.all([apiGetMicroscopeCategories(), apiGetMicroscopes()])
      setCategories(categoryList)
      setMicroscopes(microscopeList)
      const firstActive = categoryList.find((category) => isActiveMicroscopeCategory(category) && !category.parentSlug)?.slug ?? ''
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
      await apiUpsertMicroscope({
        id: values.id,
        name,
        model: values.model.trim(),
        brand: values.brand.trim() || undefined,
        categorySlug,
        imageUrl: sanitizeAdminMainImageUrl(values.imageUrl) || undefined,
        imageUrls: sanitizeAdminImageUrls(values.imageUrls),
        shortDescription: values.shortDescription.trim(),
        description: values.description.trim() || undefined,
        specs: values.specs.trim() || undefined,
        pdfUrl: values.pdfUrl.trim() || undefined,
        youtubeUrl: values.youtubeUrl.trim() || undefined,
        slug: values.slug.trim() || undefined,
        seoTitle: values.seoTitle.trim() || undefined,
        seoDescription: values.seoDescription.trim() || undefined,
        sortOrder: Number(values.sortOrder) || undefined,
        status: values.status,
      })
      await reload()
      setEditingId(null)
      reset(emptyForm(categorySlug))
      setGalleryUrlDraft('')
      showToast(editingId ? 'Đã cập nhật kính hiển vi' : 'Đã thêm kính hiển vi')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không lưu được kính hiển vi')
    } finally {
      setBusy(false)
    }
  })

  function editRow(microscope: Microscope) {
    setEditingId(microscope.id)
    reset({
      id: microscope.id,
      name: microscope.name,
      model: microscope.model,
      brand: microscope.brand ?? '',
      categorySlug: microscope.categorySlug,
      imageUrl: microscope.imageUrl ?? '',
      imageUrls: microscope.imageUrls ?? [],
      shortDescription: microscope.shortDescription,
      description: microscope.description ?? '',
      specs: microscope.specs ?? '',
      pdfUrl: microscope.pdfUrl ?? '',
      youtubeUrl: microscope.youtubeUrl ?? '',
      slug: microscope.slug ?? '',
      seoTitle: microscope.seoTitle ?? '',
      seoDescription: microscope.seoDescription ?? '',
      status: microscope.status,
      sortOrder: microscope.sortOrder ?? '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteRow(microscope: Microscope) {
    setBusy(true)
    try {
      await apiDeleteMicroscope(microscope.id)
      await reload()
      if (editingId === microscope.id) {
        setEditingId(null)
        reset(emptyForm(firstCategorySlug))
      }
      showToast('Đã xóa kính hiển vi')
      setDeleteTarget(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không xóa được kính hiển vi')
    } finally {
      setBusy(false)
    }
  }

  async function uploadFile(file: File, field: 'imageUrl' | 'pdfUrl') {
    setBusy(true)
    try {
      const url = await apiUploadMicroscopeImage(file)
      setValue(field, url, { shouldDirty: true, shouldValidate: true })
      showToast('Đã tải file lên')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Tải file thất bại')
    } finally {
      setBusy(false)
    }
  }

  function addGalleryImageUrl() {
    const url = sanitizeAdminMainImageUrl(galleryUrlDraft)
    if (!url) return showToast('URL ảnh không hợp lệ')
    const existing = sanitizeAdminImageUrls(getValues('imageUrls'))
    if (existing.includes(url)) return showToast('Ảnh đã có trong gallery')
    setValue('imageUrls', [...existing, url], { shouldDirty: true })
    setGalleryUrlDraft('')
  }

  return (
    <div className={styles.stack}>
      <section className={styles.statsGrid}>
        <div className={styles.statCard}><div className={styles.statLabel}>Tổng kính hiển vi</div><div className={styles.statValue}>{microscopes.length}</div><div className={styles.statHint}>Tất cả danh mục</div></div>
        <div className={styles.statCard}><div className={styles.statLabel}>Đang hiển thị</div><div className={styles.statValue}>{activeCount}</div><div className={styles.statHint}>Trạng thái active</div></div>
        <div className={styles.statCard}><div className={styles.statLabel}>Đang ẩn</div><div className={styles.statValue}>{microscopes.length - activeCount}</div><div className={styles.statHint}>Chưa hiển thị công khai</div></div>
        <div className={styles.statCard}><div className={styles.statLabel}>Danh mục</div><div className={styles.statValue}>{activeCategories.length}</div><div className={styles.statHint}>Danh mục đang hoạt động</div></div>
      </section>
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>{editingId ? 'Sửa kính hiển vi' : 'Thêm kính hiển vi'}</h2>
            <p className={styles.panelSub}>Quản lý nội dung, hình ảnh, trạng thái và SEO của kính hiển vi.</p>
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
                <span className={styles.label}>Tên kính hiển vi *</span>
                <input className={styles.input} {...register('name', { required: 'Vui lòng nhập tên kính hiển vi' })} />
                {errors.name ? <span className={styles.error}>{errors.name.message}</span> : null}
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Model</span>
                <input className={styles.input} {...register('model')} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Hãng sản xuất</span>
                <input className={styles.input} {...register('brand')} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Danh mục *</span>
                <select className={styles.select} {...register('categorySlug', { required: 'Vui lòng chọn danh mục' })}>
                  <option value="">Chọn danh mục</option>
                  {activeCategories.filter((category) => !category.parentSlug).map((category) => (
                    <optgroup label={category.label} key={category.slug}>
                      <option value={category.slug}>{category.label} (chưa phân vào danh mục con)</option>
                      {activeCategories.filter((child) => child.parentSlug === category.slug).map((child) => (
                        <option value={child.slug} key={child.slug}>{child.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {errors.categorySlug ? <span className={styles.error}>{errors.categorySlug.message}</span> : null}
              </label>
              <div className={styles.field}>
                <span className={styles.label}>Ảnh kính hiển vi</span>
                <input
                  className={styles.input}
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void uploadFile(file, 'imageUrl')
                    event.target.value = ''
                  }}
                />
                <input className={styles.input} placeholder="Hoặc nhập URL ảnh" {...register('imageUrl', { validate: (value) => !value || Boolean(sanitizeAdminMainImageUrl(value)) || 'URL ảnh không hợp lệ' })} />
                {errors.imageUrl ? <span className={styles.error}>{errors.imageUrl.message}</span> : null}
                {imageUrlWatch ? (
                  <div className={styles.imagePreview}>
                    <img src={imageUrlWatch} alt="Ảnh xem trước kính hiển vi" />
                    <span className={styles.muted}>{imageUrlWatch}</span>
                  </div>
                ) : (
                  <span className={styles.muted}>Chưa chọn ảnh</span>
                )}
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Gallery ảnh</span>
                <input className={styles.input} type="file" accept="image/*" multiple onChange={async (event) => {
                  const files = Array.from(event.target.files ?? [])
                  if (!files.length) return
                  setBusy(true)
                  try {
                    const urls: string[] = []
                    for (const file of files) urls.push(await apiUploadMicroscopeImage(file))
                    setValue('imageUrls', [...(getValues('imageUrls') ?? []), ...urls], { shouldDirty: true })
                    showToast('Đã thêm ảnh vào gallery')
                  } catch (err) {
                    showToast(err instanceof Error ? err.message : 'Tải ảnh thất bại')
                  } finally {
                    setBusy(false)
                    event.target.value = ''
                  }
                }} />
                <input className={styles.input} value={galleryUrlDraft} onChange={(event) => setGalleryUrlDraft(event.target.value)} placeholder="Hoặc nhập URL ảnh phụ" />
                <button className={styles.secondaryButton} type="button" disabled={!galleryUrlDraft.trim()} onClick={addGalleryImageUrl}>Thêm URL ảnh phụ</button>
                {imageUrlsWatch?.length ? <span className={styles.muted}>Đang có {imageUrlsWatch.length} ảnh phụ</span> : <span className={styles.muted}>Chưa có ảnh phụ</span>}
              </div>
              <label className={styles.field}>
                <span className={styles.label}>Trạng thái</span>
                <select className={styles.select} {...register('status')}>
                  <option value="active">Đang hiển thị</option>
                  <option value="hidden">Ẩn</option>
                </select>
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Slug SEO</span>
                <input className={styles.input} placeholder="Tự tạo từ tên nếu để trống" {...register('slug')} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>SEO Title</span>
                <input className={styles.input} placeholder="Tự tạo: Tên kính hiển vi | Ecolink" {...register('seoTitle')} />
              </label>
              <label className={`${styles.field} ${styles.full}`}>
                <span className={styles.label}>SEO Description</span>
                <textarea className={styles.textarea} rows={3} placeholder="Tự tạo từ mô tả nếu để trống" {...register('seoDescription')} />
              </label>
              <label className={`${styles.field} ${styles.full}`}>
                <span className={styles.label}>Mô tả ngắn</span>
                <textarea className={styles.textarea} rows={3} {...register('shortDescription')} />
              </label>
              <label className={`${styles.field} ${styles.full}`}>
                <span className={styles.label}>Mô tả chi tiết</span>
                <textarea className={styles.textarea} rows={5} {...register('description')} />
              </label>
              <label className={`${styles.field} ${styles.full}`}>
                <span className={styles.label}>Thông số kỹ thuật</span>
                <textarea className={styles.textarea} rows={5} {...register('specs')} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Tài liệu PDF</span>
                <input className={styles.input} type="file" accept="application/pdf" onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void uploadFile(file, 'pdfUrl')
                  event.target.value = ''
                }} />
                <input className={styles.input} placeholder="Hoặc nhập URL PDF" {...register('pdfUrl')} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Video YouTube</span>
                <input className={styles.input} placeholder="https://www.youtube.com/watch?v=..." {...register('youtubeUrl')} />
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
                {editingId ? 'Lưu kính hiển vi' : 'Thêm kính hiển vi'}
              </button>
              {activeCategories.length === 0 ? <span className={styles.error}>Cần tạo danh mục hiển thị trước.</span> : null}
            </div>
          </form>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>Danh sách kính hiển vi</h2>
            <p className={styles.panelSub}>Hiển thị {filteredMicroscopes.length}/{microscopes.length} kính hiển vi.</p>
          </div>
        </div>
        <div className={styles.panelBody}>
          <div className={styles.toolbar}>
            <input className={styles.input} value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Tìm theo tên, model, hãng" />
            <select className={styles.select} value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setPage(1) }}>
              <option value="all">Tất cả danh mục</option>
              {categories.map((category) => (
                <option value={category.slug} key={category.slug}>
                  {category.parentSlug ? '↳ ' : ''}{category.label}
                </option>
              ))}
            </select>
            <select className={styles.select} value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as typeof statusFilter); setPage(1) }}>
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hiển thị</option>
              <option value="hidden">Ẩn</option>
            </select>
            <button className={styles.secondaryButton} type="button" onClick={() => void reload()}><FiRefreshCw aria-hidden />Tải lại</button>
          </div>
        </div>
        {loading ? (
          <div className={styles.loadingState}>Đang tải kính hiển vi...</div>
        ) : filteredMicroscopes.length === 0 ? (
          <div className={styles.emptyState}>Chưa có kính hiển vi phù hợp.</div>
        ) : (
          <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Kính hiển vi</th>
                  <th>Model</th>
                  <th>Hãng sản xuất</th>
                  <th>Danh mục</th>
                  <th>Trạng thái</th>
                  <th>Thứ tự</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {visibleMicroscopes.map((microscope) => (
                  <tr key={microscope.id}>
                    <td>
                      <div className={styles.productCell}>
                        {microscope.imageUrl ? <img className={styles.thumb} src={microscope.imageUrl} alt="" /> : <span className={styles.thumbEmpty} />}
                        <div><div className={styles.productName}>{microscope.name}</div>{microscope.status === 'active' ? <a href={productUrl(microscope, 'microscope')} target="_blank" rel="noreferrer">Xem trang sản phẩm</a> : null}</div>
                      </div>
                    </td>
                    <td>{microscope.model}</td>
                    <td>{microscope.brand || 'Đang cập nhật'}</td>
                    <td><span className={styles.pill}>{getMicroscopeCategoryLabel(categories, microscope.categorySlug)}</span></td>
                    <td><span className={`${styles.pill} ${microscope.status === 'active' ? styles.statusActive : styles.statusHidden}`}>{microscope.status === 'active' ? 'Đang hiển thị' : 'Ẩn'}</span></td>
                    <td>{microscope.sortOrder ?? ''}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button className={styles.iconButton} type="button" title="Sửa" onClick={() => editRow(microscope)}>
                          <FiEdit2 aria-hidden />
                        </button>
                        <button className={styles.dangerButton} type="button" title="Xóa" disabled={busy} onClick={() => setDeleteTarget(microscope)}>
                          <FiTrash2 aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.pagination}>
            <span className={styles.muted}>Trang {visiblePage}/{pageCount}</span>
            <div className={styles.rowActions}>
              <button className={styles.secondaryButton} type="button" disabled={visiblePage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Trước</button>
              <button className={styles.secondaryButton} type="button" disabled={visiblePage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Sau</button>
            </div>
          </div>
          </>
        )}
      </section>

      {deleteTarget ? (
        <div className={styles.modalBackdrop} role="presentation">
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="microscope-delete-title">
            <h2 className={styles.modalTitle} id="microscope-delete-title">Xóa kính hiển vi?</h2>
            <p className={styles.modalText}>Kính hiển vi "{deleteTarget.name}" sẽ bị xóa khỏi danh sách.</p>
            <div className={styles.actions}>
              <button className={styles.dangerButton} type="button" disabled={busy} onClick={() => void deleteRow(deleteTarget)}>Xóa kính hiển vi</button>
              <button className={styles.secondaryButton} type="button" onClick={() => setDeleteTarget(null)}>Hủy</button>
            </div>
          </div>
        </div>
      ) : null}
      {toast ? <div className={styles.toast}>{toast}</div> : null}
    </div>
  )
}
