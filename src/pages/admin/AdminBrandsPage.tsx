import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiEdit2, FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi'
import { makeBrandId, type Brand, type BrandInput } from '../../data/brands'
import { apiDeleteBrand, apiGetBrands, apiUpsertBrand } from '../../services/brandService'
import { apiUploadImage } from '../../services/productService'
import styles from './AdminPages.module.css'

type FormValues = {
  id: string
  name: string
  country: string
  url: string
  description: string
  imageUrl: string
  featured: boolean
  status: 'active' | 'hidden'
  sortOrder: number | ''
}

function emptyForm(): FormValues {
  return {
    id: makeBrandId(),
    name: '',
    country: '',
    url: '',
    description: '',
    imageUrl: '',
    featured: false,
    status: 'active',
    sortOrder: '',
  }
}

export function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<FormValues>({ defaultValues: emptyForm() })
  const imageUrl = watch('imageUrl')

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  async function reload() {
    setLoading(true)
    try {
      setBrands(await apiGetBrands())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reload()
  }, [])

  const save = handleSubmit(async (values) => {
    setBusy(true)
    try {
      const input: BrandInput = {
        id: values.id,
        name: values.name.trim(),
        country: values.country.trim(),
        url: values.url.trim(),
        description: values.description.trim(),
        imageUrl: values.imageUrl.trim() || undefined,
        featured: values.featured,
        status: values.status,
        sortOrder: Number(values.sortOrder) || undefined,
      }
      await apiUpsertBrand(input)
      await reload()
      showToast(editingId ? 'Đã cập nhật hãng' : 'Đã thêm hãng')
      setEditingId(null)
      reset(emptyForm())
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không lưu được hãng')
    } finally {
      setBusy(false)
    }
  })

  function edit(brand: Brand) {
    setEditingId(brand.id)
    reset({
      id: brand.id,
      name: brand.name,
      country: brand.country,
      url: brand.url,
      description: brand.description,
      imageUrl: brand.imageUrl ?? '',
      featured: brand.featured,
      status: brand.status,
      sortOrder: brand.sortOrder ?? '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function remove(brand: Brand) {
    if (!window.confirm(`Xóa hãng "${brand.name}"?`)) return
    setBusy(true)
    try {
      await apiDeleteBrand(brand.id)
      await reload()
      if (editingId === brand.id) {
        setEditingId(null)
        reset(emptyForm())
      }
      showToast('Đã xóa hãng')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không xóa được hãng')
    } finally {
      setBusy(false)
    }
  }

  async function upload(file: File) {
    setBusy(true)
    try {
      setValue('imageUrl', await apiUploadImage(file), { shouldDirty: true })
      showToast('Đã tải logo')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không tải được logo')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.stack}>
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>{editingId ? 'Sửa hãng' : 'Thêm hãng'}</h2>
            <p className={styles.panelSub}>Tích “Đối tác hàng đầu” để hãng xuất hiện trên homepage.</p>
          </div>
          <button className={styles.secondaryButton} type="button" onClick={() => { setEditingId(null); reset(emptyForm()) }}>
            <FiRefreshCw /> Làm mới
          </button>
        </div>
        <div className={styles.panelBody}>
          <form onSubmit={(event) => void save(event)}>
            <div className={styles.formGrid}>
              <input type="hidden" {...register('id')} />
              <label className={styles.field}>
                <span className={styles.label}>Tên hãng *</span>
                <input className={styles.input} {...register('name', { required: 'Vui lòng nhập tên hãng' })} />
                {errors.name ? <span className={styles.error}>{errors.name.message}</span> : null}
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Quốc gia</span>
                <input className={styles.input} {...register('country')} />
              </label>
              <label className={`${styles.field} ${styles.full}`}>
                <span className={styles.label}>Website</span>
                <input className={styles.input} type="url" placeholder="https://..." {...register('url')} />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Logo</span>
                <input className={styles.input} type="file" accept="image/*" onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void upload(file)
                  event.target.value = ''
                }} />
                <input className={styles.input} placeholder="/assetsFull/logo.png" {...register('imageUrl')} />
                {imageUrl ? <div className={styles.imagePreview}><img src={imageUrl} alt="" /><span className={styles.muted}>{imageUrl}</span></div> : null}
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Thứ tự hiển thị</span>
                <input className={styles.input} type="number" min="1" {...register('sortOrder', { valueAsNumber: true })} />
              </label>
              <label className={`${styles.field} ${styles.full}`}>
                <span className={styles.label}>Mô tả</span>
                <textarea className={styles.textarea} {...register('description')} />
              </label>
              <label className={styles.switchRow}>
                <input className={styles.checkbox} type="checkbox" {...register('featured')} />
                <span className={styles.label}>Hiển thị trong “Đối tác hàng đầu” ở homepage</span>
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Trạng thái</span>
                <select className={styles.select} {...register('status')}>
                  <option value="active">Hiển thị</option>
                  <option value="hidden">Ẩn</option>
                </select>
              </label>
            </div>
            <div className={styles.actions}>
              <button className={styles.button} type="submit" disabled={busy}>
                <FiPlus /> {editingId ? 'Lưu thay đổi' : 'Thêm hãng'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div><h2 className={styles.panelTitle}>Danh sách hãng</h2><p className={styles.panelSub}>{brands.length} hãng</p></div>
        </div>
        {loading ? <div className={styles.loadingState}>Đang tải...</div> : brands.length === 0 ? (
          <div className={styles.emptyState}>Chưa có hãng nào.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Logo</th><th>Tên hãng</th><th>Quốc gia</th><th>Homepage</th><th>Trạng thái</th><th>Thứ tự</th><th>Thao tác</th></tr></thead>
              <tbody>{brands.map((brand) => (
                <tr key={brand.id}>
                  <td>{brand.imageUrl ? <img className={styles.thumb} src={brand.imageUrl} alt="" /> : <span className={styles.thumbEmpty} />}</td>
                  <td><div className={styles.productName}>{brand.name}</div></td>
                  <td>{brand.country}</td>
                  <td>{brand.featured ? 'Có' : 'Không'}</td>
                  <td>{brand.status === 'active' ? 'Hiển thị' : 'Ẩn'}</td>
                  <td>{brand.sortOrder ?? ''}</td>
                  <td><div className={styles.rowActions}>
                    <button className={styles.iconButton} type="button" title="Sửa" onClick={() => edit(brand)}><FiEdit2 /></button>
                    <button className={styles.dangerButton} type="button" title="Xóa" disabled={busy} onClick={() => void remove(brand)}><FiTrash2 /></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
      {toast ? <div className={styles.toast}>{toast}</div> : null}
    </div>
  )
}
