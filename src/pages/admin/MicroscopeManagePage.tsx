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
import styles from './AdminPages.module.css'

type FormValues = {
  id: string
  name: string
  model: string
  categorySlug: string
  imageUrl: string
  shortDescription: string
}

function emptyForm(categorySlug = ''): FormValues {
  return {
    id: makeMicroscopeId(),
    name: '',
    model: '',
    categorySlug,
    imageUrl: '',
    shortDescription: '',
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

  const activeCategories = useMemo(() => categories.filter(isActiveMicroscopeCategory), [categories])
  const firstCategorySlug = activeCategories[0]?.slug ?? ''
  const form = useForm<FormValues>({ defaultValues: emptyForm(firstCategorySlug) })
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = form
  const imageUrlWatch = watch('imageUrl')

  const filteredMicroscopes = useMemo(() => {
    if (categoryFilter === 'all') return microscopes
    return microscopes.filter((item) => item.categorySlug === categoryFilter)
  }, [microscopes, categoryFilter])

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
      const firstActive = categoryList.find(isActiveMicroscopeCategory)?.slug ?? ''
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
        categorySlug,
        imageUrl: values.imageUrl.trim() || undefined,
        shortDescription: values.shortDescription.trim(),
        status: 'active',
      })
      await reload()
      setEditingId(null)
      reset(emptyForm(categorySlug))
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
      categorySlug: microscope.categorySlug,
      imageUrl: microscope.imageUrl ?? '',
      shortDescription: microscope.shortDescription,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteRow(microscope: Microscope) {
    if (!window.confirm(`Xóa kính hiển vi "${microscope.name}"?`)) return
    setBusy(true)
    try {
      await apiDeleteMicroscope(microscope.id)
      await reload()
      if (editingId === microscope.id) {
        setEditingId(null)
        reset(emptyForm(firstCategorySlug))
      }
      showToast('Đã xóa kính hiển vi')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không xóa được kính hiển vi')
    } finally {
      setBusy(false)
    }
  }

  async function uploadImage(file: File) {
    setBusy(true)
    try {
      const url = await apiUploadMicroscopeImage(file)
      setValue('imageUrl', url, { shouldDirty: true, shouldValidate: true })
      showToast('Đã tải ảnh kính hiển vi')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upload ảnh kính hiển vi thất bại')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.stack}>
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>{editingId ? 'Sửa kính hiển vi' : 'Thêm kính hiển vi'}</h2>
            <p className={styles.panelSub}>CRUD riêng cho kính hiển vi, hiện chỉ gồm tên, model, danh mục và mô tả ngắn.</p>
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
                <span className={styles.label}>Ảnh kính hiển vi</span>
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
                <input className={styles.input} placeholder="/uploads/microscope.jpg" {...register('imageUrl')} />
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
            <select className={styles.select} value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">Tất cả danh mục</option>
              {categories.map((category) => (
                <option value={category.slug} key={category.slug}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {loading ? (
          <div className={styles.loadingState}>Đang tải kính hiển vi...</div>
        ) : filteredMicroscopes.length === 0 ? (
          <div className={styles.emptyState}>Chưa có kính hiển vi phù hợp.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tên kính hiển vi</th>
                  <th>Ảnh</th>
                  <th>Model</th>
                  <th>Danh mục</th>
                  <th>Mô tả ngắn</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredMicroscopes.map((microscope) => (
                  <tr key={microscope.id}>
                    <td><div className={styles.productName}>{microscope.name}</div></td>
                    <td>
                      {microscope.imageUrl ? (
                        <img className={styles.thumb} src={microscope.imageUrl} alt="" />
                      ) : (
                        <span className={styles.thumbEmpty} />
                      )}
                    </td>
                    <td>{microscope.model}</td>
                    <td><span className={styles.pill}>{getMicroscopeCategoryLabel(categories, microscope.categorySlug)}</span></td>
                    <td>{microscope.shortDescription}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button className={styles.iconButton} type="button" title="Sửa" onClick={() => editRow(microscope)}>
                          <FiEdit2 aria-hidden />
                        </button>
                        <button className={styles.dangerButton} type="button" title="Xóa" disabled={busy} onClick={() => void deleteRow(microscope)}>
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
