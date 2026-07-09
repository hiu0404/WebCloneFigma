import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiEdit2, FiEye, FiEyeOff, FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi'
import {
  makeMicroscopeSlug,
  type Microscope,
  type MicroscopeCategory,
  type MicroscopeCategoryStatus,
} from '../../data/microscopes'
import {
  apiDeleteMicroscopeCategory,
  apiGetMicroscopeCategories,
  apiUpsertMicroscopeCategory,
} from '../../services/microscopeCategoryService'
import { apiGetMicroscopes } from '../../services/microscopeService'
import styles from './AdminPages.module.css'

type FormValues = {
  id: string
  label: string
  slug: string
  sortOrder: number
  status: MicroscopeCategoryStatus
}

function emptyForm(): FormValues {
  return { id: '', label: '', slug: '', sortOrder: 0, status: 'active' }
}

export function MicroscopeCategoryManagePage() {
  const [categories, setCategories] = useState<MicroscopeCategory[]>([])
  const [microscopes, setMicroscopes] = useState<Microscope[]>([])
  const [editing, setEditing] = useState<MicroscopeCategory | null>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  const form = useForm<FormValues>({ defaultValues: emptyForm() })
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = form
  const labelWatch = watch('label')
  const slugWatch = watch('slug')

  const usedCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const microscope of microscopes) {
      map.set(microscope.categorySlug, (map.get(microscope.categorySlug) ?? 0) + 1)
    }
    return map
  }, [microscopes])

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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reload()
  }, [])

  const onSave = handleSubmit(async (values) => {
    const label = values.label.trim()
    const slug = values.slug.trim() || makeMicroscopeSlug(label)
    if (!label || !slug) return
    setBusy(true)
    try {
      const next = await apiUpsertMicroscopeCategory({
        id: values.id || slug,
        label,
        slug,
        sortOrder: Number(values.sortOrder) || 0,
        status: values.status,
      })
      setCategories(next)
      await reload()
      reset(emptyForm())
      setEditing(null)
      showToast(editing ? 'Đã cập nhật danh mục kính hiển vi' : 'Đã thêm danh mục kính hiển vi')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không lưu được danh mục kính hiển vi')
    } finally {
      setBusy(false)
    }
  })

  function editRow(category: MicroscopeCategory) {
    setEditing(category)
    reset(category)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteRow(category: MicroscopeCategory) {
    const used = usedCounts.get(category.slug) ?? 0
    if (used > 0) {
      showToast(`Không thể xóa vì còn ${used} kính hiển vi thuộc danh mục này`)
      return
    }
    if (!window.confirm(`Xóa danh mục "${category.label}"?`)) return
    setBusy(true)
    try {
      await apiDeleteMicroscopeCategory(category.id)
      await reload()
      showToast('Đã xóa danh mục kính hiển vi')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không xóa được danh mục kính hiển vi')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.stack}>
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>{editing ? 'Sửa danh mục kính hiển vi' : 'Thêm danh mục kính hiển vi'}</h2>
            <p className={styles.panelSub}>Danh mục riêng của module kính hiển vi, không dùng chung danh mục sản phẩm.</p>
          </div>
          <button className={styles.secondaryButton} type="button" onClick={() => { reset(emptyForm()); setEditing(null) }}>
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
                    if (!slugWatch.trim() && labelWatch.trim()) setValue('slug', makeMicroscopeSlug(labelWatch))
                  }}
                />
                {errors.label ? <span className={styles.error}>{errors.label.message}</span> : null}
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Slug *</span>
                <input className={styles.input} {...register('slug', { required: 'Vui lòng nhập slug' })} />
                {errors.slug ? <span className={styles.error}>{errors.slug.message}</span> : null}
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
            </div>
            <div className={styles.actions}>
              <button className={styles.button} type="submit" disabled={busy}>
                <FiPlus aria-hidden />
                {editing ? 'Lưu danh mục' : 'Thêm danh mục'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>Danh sách danh mục kính hiển vi</h2>
            <p className={styles.panelSub}>Danh mục hiển thị sẽ xuất hiện ở sidebar trang client.</p>
          </div>
        </div>
        {loading ? (
          <div className={styles.loadingState}>Đang tải danh mục kính hiển vi...</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Danh mục</th>
                  <th>Slug</th>
                  <th>Thứ tự</th>
                  <th>Trạng thái</th>
                  <th>Kính hiển vi</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td><div className={styles.productName}>{category.label}</div></td>
                    <td>{category.slug}</td>
                    <td>{category.sortOrder}</td>
                    <td>
                      <span className={category.status === 'active' ? styles.statusActive : styles.statusHidden}>
                        {category.status === 'active' ? <FiEye aria-hidden /> : <FiEyeOff aria-hidden />}
                        {category.status === 'active' ? 'Hiển thị' : 'Ẩn'}
                      </span>
                    </td>
                    <td><span className={styles.pill}>{usedCounts.get(category.slug) ?? 0}</span></td>
                    <td>
                      <div className={styles.rowActions}>
                        <button className={styles.iconButton} type="button" title="Sửa" onClick={() => editRow(category)}>
                          <FiEdit2 aria-hidden />
                        </button>
                        <button className={styles.dangerButton} type="button" title="Xóa" disabled={busy} onClick={() => void deleteRow(category)}>
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
