import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiEdit2, FiEye, FiEyeOff, FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi'
import {
  getProductChildCategorySlug,
  getProductParentCategorySlug,
  makeSlug,
  type AdminCategory,
  type AdminCategoryChild,
} from '../../data/categories'
import type { Product } from '../../lib/adminStore'
import { apiDeleteCategory, apiGetCategories, apiUpsertCategory } from '../../services/categoryService'
import { apiGetForensicProducts } from '../../services/forensicProductService'
import { apiGetPiccProducts } from '../../services/piccProductService'
import { apiGetProducts, apiUploadImage } from '../../services/productService'
import styles from './AdminPages.module.css'

type FormValues = {
  id: string
  label: string
  slug: string
  sortOrder: number
  status: 'active' | 'hidden'
  imageUrl: string
  parentId: string
}

type Props = {
  parentSlug: 'equipment' | 'consumables' | 'chemicals' | 'antibodies' | 'forensic-science' | 'intensive-care'
  title: string
  description: string
  itemLabel: string
  allowNested?: boolean
}

function emptyForm(): FormValues {
  return { id: '', label: '', slug: '', sortOrder: 0, status: 'active', imageUrl: '', parentId: '' }
}

function childStatus(child: AdminCategoryChild): 'active' | 'hidden' {
  return child.status === 'hidden' ? 'hidden' : 'active'
}

export function ProductChildCategoryManagePage({ parentSlug, title, description, itemLabel, allowNested = false }: Props) {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [editing, setEditing] = useState<AdminCategoryChild | null>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  const form = useForm<FormValues>({ defaultValues: emptyForm() })
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = form
  const labelWatch = watch('label')
  const slugWatch = watch('slug')
  const imageUrlWatch = watch('imageUrl')
  const parentIdWatch = watch('parentId')

  const parent = useMemo(() => categories.find((item) => item.slug === parentSlug), [categories, parentSlug])
  const children = useMemo(() => parent?.children ?? [], [parent])
  const selectedParent = children.find((child) => child.id === parentIdWatch)
  const rows = allowNested ? children.flatMap((child) => [{ child, group: null }, ...(child.children ?? []).map((nested) => ({ child: nested, group: child }))]) : children.map((child) => ({ child, group: null }))

  const usedCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const product of products) {
      if (getProductParentCategorySlug(product) !== parentSlug) continue
      const childSlug = getProductChildCategorySlug(product)
      map.set(childSlug, (map.get(childSlug) ?? 0) + 1)
    }
    if (allowNested) {
      for (const child of children) {
        for (const nested of child.children ?? []) map.set(child.slug, (map.get(child.slug) ?? 0) + (map.get(nested.slug) ?? 0))
      }
    }
    return map
  }, [products, parentSlug, allowNested, children])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const [categoryList, productList] = await Promise.all([apiGetCategories(), apiGetProducts()])
      const forensicProducts = parentSlug === 'forensic-science' ? await apiGetForensicProducts() : []
      const piccProducts = parentSlug === 'intensive-care' ? await apiGetPiccProducts() : []
      setCategories(categoryList)
      setProducts(
        parentSlug === 'forensic-science'
          ? forensicProducts.map((item) => ({
              id: item.id,
              title: item.name,
              category: parentSlug,
              parentCategorySlug: parentSlug,
              categorySlug: item.categorySlug,
              status: item.status,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            }))
          : parentSlug === 'intensive-care'
            ? piccProducts.map((item) => ({
                id: item.id,
                title: item.name,
                category: parentSlug,
                parentCategorySlug: parentSlug,
                categorySlug: item.categorySlug,
                status: item.status,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
              }))
          : productList,
      )
    } finally {
      setLoading(false)
    }
  }, [parentSlug])

  useEffect(() => {
    void reload()
  }, [reload])

  const onSave = handleSubmit(async (values) => {
    const label = values.label.trim()
    const slug = values.slug.trim() || makeSlug(label)
    if (!label || !slug || !parent) return

    setBusy(true)
    try {
      await apiUpsertCategory({
        id: values.id || slug,
        label,
        slug,
        parentId: allowNested ? values.parentId || parent.id : parent.id,
        imageUrl: values.imageUrl.trim() || undefined,
        sortOrder: Number(values.sortOrder) || 0,
        status: values.status,
      })
      await reload()
      reset(emptyForm())
      setEditing(null)
      showToast(editing ? `Đã cập nhật danh mục ${itemLabel}` : `Đã thêm danh mục ${itemLabel}`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : `Không lưu được danh mục ${itemLabel}`)
    } finally {
      setBusy(false)
    }
  })

  function editRow(child: AdminCategoryChild, group?: AdminCategoryChild | null) {
    setEditing(child)
    reset({
      id: child.id,
      label: child.label,
      slug: child.slug,
      sortOrder: child.sortOrder ?? 0,
      status: childStatus(child),
      imageUrl: child.imageUrl ?? '',
      parentId: group?.id ?? parent?.id ?? '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function startChild(group: AdminCategoryChild) {
    setEditing(null)
    reset({ ...emptyForm(), parentId: group.id })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteRow(child: AdminCategoryChild) {
    if (child.children?.length) {
      showToast('Hãy chuyển hoặc xóa các danh mục con trước')
      return
    }
    const used = usedCounts.get(child.slug) ?? 0
    if (used > 0) {
      showToast(`Không thể xóa vì còn ${used} sản phẩm thuộc danh mục này`)
      return
    }
    if (!window.confirm(`Xóa danh mục "${child.label}"?`)) return
    setBusy(true)
    try {
      await apiDeleteCategory(child.id)
      await reload()
      showToast(`Đã xóa danh mục ${itemLabel}`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : `Không xóa được danh mục ${itemLabel}`)
    } finally {
      setBusy(false)
    }
  }

  async function uploadImage(file: File) {
    setBusy(true)
    try {
      const url = await apiUploadImage(file)
      setValue('imageUrl', url, { shouldDirty: true })
      showToast('Đã tải ảnh danh mục')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không tải được ảnh danh mục')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.stack}>
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>{editing ? `Sửa danh mục ${itemLabel}` : selectedParent ? `Thêm danh mục con cho ${selectedParent.label}` : `Thêm danh mục ${itemLabel}`}</h2>
            <p className={styles.panelSub}>{description}</p>
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
              {allowNested && parent ? (
                <label className={styles.field}>
                  <span className={styles.label}>Danh mục cha</span>
                  <select className={styles.select} {...register('parentId')}>
                    <option value={parent.id}>{parent.label}</option>
                    {children.filter((child) => child.id !== editing?.id).map((child) => <option value={child.id} key={child.id}>{child.label}</option>)}
                  </select>
                </label>
              ) : null}
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
              {allowNested ? (
                <label className={styles.field}>
                  <span className={styles.label}>Ảnh danh mục</span>
                  <input className={styles.input} type="file" accept="image/*" onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void uploadImage(file)
                    event.target.value = ''
                  }} />
                  <input className={styles.input} placeholder="/uploads/danh-muc.jpg" {...register('imageUrl')} />
                  {imageUrlWatch ? <div className={styles.imagePreview}><img src={imageUrlWatch} alt="" /><span className={styles.muted}>{imageUrlWatch}</span></div> : <span className={styles.muted}>Chưa chọn ảnh</span>}
                </label>
              ) : null}
            </div>
            <div className={styles.actions}>
              <button className={styles.button} type="submit" disabled={busy || !parent}>
                <FiPlus aria-hidden />
                {editing ? 'Lưu danh mục' : 'Thêm danh mục'}
              </button>
              {!parent ? <span className={styles.error}>Không tìm thấy danh mục cha {parentSlug}.</span> : null}
            </div>
          </form>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>{title}</h2>
            <p className={styles.panelSub}>Danh mục hiển thị sẽ xuất hiện ở sidebar trang client và dropdown sản phẩm.</p>
          </div>
        </div>
        {allowNested && !loading && children.length > 0 ? (
          <div className={styles.categoryParentGrid}>
            {children.map((group) => (
              <div className={styles.categoryParentCard} key={group.id}>
                {group.imageUrl ? <img src={group.imageUrl} alt="" /> : <span className={styles.categoryParentImage} aria-hidden="true" />}
                <div className={styles.categoryParentInfo}>
                  <strong>{group.label}</strong>
                  <span>{group.children?.length ?? 0} danh mục con</span>
                  <button className={styles.secondaryButton} type="button" disabled={busy} onClick={() => startChild(group)}>
                    <FiPlus aria-hidden /> Thêm danh mục con
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {loading ? (
          <div className={styles.loadingState}>Đang tải danh mục...</div>
        ) : children.length === 0 ? (
          <div className={styles.emptyState}>Chưa có danh mục con.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Danh mục</th>
                  {allowNested ? <th>Ảnh</th> : null}
                  <th>Slug</th>
                  <th>Thứ tự</th>
                  <th>Trạng thái</th>
                  <th>Sản phẩm</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ child, group }) => (
                  <tr key={child.id}>
                    <td><div className={styles.productName}>{group ? `↳ ${child.label}` : child.label}</div></td>
                    {allowNested ? <td>{child.imageUrl ? <img className={styles.thumb} src={child.imageUrl} alt="" /> : <span className={styles.thumbEmpty} />}</td> : null}
                    <td>{child.slug}</td>
                    <td>{child.sortOrder ?? 0}</td>
                    <td>
                      <span className={childStatus(child) === 'active' ? styles.statusActive : styles.statusHidden}>
                        {childStatus(child) === 'active' ? <FiEye aria-hidden /> : <FiEyeOff aria-hidden />}
                        {childStatus(child) === 'active' ? 'Hiển thị' : 'Ẩn'}
                      </span>
                    </td>
                    <td><span className={styles.pill}>{usedCounts.get(child.slug) ?? 0}</span></td>
                    <td>
                      <div className={styles.rowActions}>
                        <button className={styles.iconButton} type="button" title="Sửa" onClick={() => editRow(child, group)}>
                          <FiEdit2 aria-hidden />
                        </button>
                        <button className={styles.dangerButton} type="button" title="Xóa" disabled={busy} onClick={() => void deleteRow(child)}>
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
