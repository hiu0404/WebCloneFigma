import { useEffect, useMemo, useState } from 'react'
import { FiEdit2, FiPlus, FiRefreshCw } from 'react-icons/fi'
import { apiGetProducts } from '../../services/productService'
import { apiGetMicroscopes } from '../../services/microscopeService'
import { apiGetForensicProducts } from '../../services/forensicProductService'
import { apiGetPiccProducts } from '../../services/piccProductService'
import { apiGetAdminInstallations, apiSaveInstallation, apiUploadInstallationImage } from '../../services/installationService'
import type { InstallationInput, InstallationRecord } from '../../data/installations'
import type { ProductKind } from '../../lib/seo'
import pageStyles from './AdminPages.module.css'
import styles from './AdminInstallationsPage.module.css'

type ProductChoice = { type: ProductKind; id: string; name: string; model: string }

const groupLabels: Record<ProductKind, string> = {
  product: 'Sản phẩm thiết bị / vật tư', microscope: 'Kính hiển vi', forensic: 'Giám định hình sự', picc: 'Hồi sức tích cực',
}

function emptyForm(): InstallationInput {
  return { id: '', title: '', summary: '', productType: 'product', productId: '', imageUrls: [], status: 'draft', sortOrder: undefined, privacyReviewed: false }
}

export function AdminInstallationsPage() {
  const [items, setItems] = useState<InstallationRecord[]>([])
  const [products, setProducts] = useState<ProductChoice[]>([])
  const [form, setForm] = useState<InstallationInput>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [listError, setListError] = useState('')
  const [productError, setProductError] = useState('')
  const [notice, setNotice] = useState('')

  const productNames = useMemo(() => new Map(products.map((item) => [`${item.type}:${item.id}`, item.name])), [products])

  async function reload() {
    setLoading(true)
    setError('')
    try {
      const [records, main, microscopes, forensic, picc] = await Promise.allSettled([
        apiGetAdminInstallations(), apiGetProducts(), apiGetMicroscopes(), apiGetForensicProducts(), apiGetPiccProducts(),
      ])
      setListError(records.status === 'rejected'
        ? (records.reason instanceof Error ? records.reason.message : 'Không tải được danh sách công trình')
        : '')
      if (records.status === 'fulfilled') setItems(records.value)

      const choices: ProductChoice[] = [
        ...(main.status === 'fulfilled' ? main.value.map((item) => ({ type: 'product' as const, id: item.id, name: item.title, model: item.sku || item.model || '' })) : []),
        ...(microscopes.status === 'fulfilled' ? microscopes.value.map((item) => ({ type: 'microscope' as const, id: item.id, name: item.name, model: item.model || '' })) : []),
        ...(forensic.status === 'fulfilled' ? forensic.value.map((item) => ({ type: 'forensic' as const, id: item.id, name: item.name, model: item.model || '' })) : []),
        ...(picc.status === 'fulfilled' ? picc.value.map((item) => ({ type: 'picc' as const, id: item.id, name: item.name, model: item.model || '' })) : []),
      ]
      setProducts(choices)
      setProductError(choices.length ? '' : 'Không tải được sản phẩm để chọn. Hãy kiểm tra API sản phẩm rồi tải lại trang.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void reload() }, [])

  function edit(item: InstallationRecord) {
    setForm({ ...item, privacyReviewed: false })
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return
    if (!form.privacyReviewed) {
      setError('Hãy kiểm tra và xác nhận ảnh đã ẩn thông tin đơn vị trước khi upload.')
      return
    }
    if (form.imageUrls.length + files.length > 8) {
      setError('Mỗi công trình tối đa 8 ảnh.')
      return
    }
    setBusy(true)
    setError('')
    try {
      for (const file of Array.from(files)) {
        const url = await apiUploadInstallationImage(file)
        setForm((current) => ({ ...current, imageUrls: [...current.imageUrls, url] }))
      }
      setNotice('Ảnh đã tải lên. Hãy lưu công trình để liên kết ảnh với bài đăng.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không tải được ảnh')
    } finally {
      setBusy(false)
    }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!form.title.trim() || !form.productId) return setError('Nhập tiêu đề và chọn sản phẩm đã lắp đặt.')
    if (form.status === 'published' && (!form.imageUrls.length || !form.privacyReviewed)) {
      return setError('Cần có ảnh và xác nhận kiểm tra thông tin nhận diện trước khi xuất bản.')
    }
    setBusy(true)
    try {
      await apiSaveInstallation({ ...form, title: form.title.trim(), summary: form.summary.trim() })
      await reload()
      setForm(emptyForm())
      setNotice('Đã lưu công trình.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không lưu được công trình')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={pageStyles.stack}>
      <section className={pageStyles.panel}>
        <div className={pageStyles.panelHeader}>
          <div>
            <h2 className={pageStyles.panelTitle}>{form.id ? 'Sửa công trình' : 'Thêm thiết bị đã triển khai'}</h2>
            <p className={pageStyles.panelSub}>Chỉ đăng ảnh lắp đặt thật đã được phép công bố. Không nhập tên hoặc địa chỉ đơn vị vào tiêu đề, mô tả hay ảnh.</p>
          </div>
          <button className={pageStyles.secondaryButton} type="button" onClick={() => { setForm(emptyForm()); setError(''); setNotice('') }}><FiPlus aria-hidden />Tạo mới</button>
        </div>
        <div className={pageStyles.panelBody}>
          <form onSubmit={(event) => void save(event)}>
            {listError && <p className={styles.error} role="alert">{listError}</p>}
            <div className={pageStyles.formGrid}>
              <label className={pageStyles.field}>
                <span className={pageStyles.label}>Sản phẩm đã lắp đặt *</span>
                <select className={pageStyles.select} value={form.productId ? `${form.productType}:${form.productId}` : ''} onChange={(event) => {
                  const selected = products.find((item) => `${item.type}:${item.id}` === event.target.value)
                  if (selected) setForm((current) => ({ ...current, productType: selected.type, productId: selected.id, title: current.title || selected.name }))
                }} required>
                  <option value="">Chọn sản phẩm có trong hệ thống</option>
                  {(Object.keys(groupLabels) as ProductKind[]).map((type) => (
                    <optgroup label={groupLabels[type]} key={type}>
                      {products.filter((item) => item.type === type).map((item) => <option key={item.id} value={`${type}:${item.id}`}>{item.name}{item.model ? ` — ${item.model}` : ''}</option>)}
                    </optgroup>
                  ))}
                </select>
                {productError && !loading && <span className={styles.error} role="alert">{productError}</span>}
              </label>
              <label className={pageStyles.field}>
                <span className={pageStyles.label}>Tiêu đề công khai *</span>
                <input className={pageStyles.input} value={form.title} maxLength={180} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
              </label>
              <label className={pageStyles.field}>
                <span className={pageStyles.label}>Mã hoặc tên đơn vị nội bộ (không công khai)</span>
                <input className={pageStyles.input} value={form.internalReference || ''} maxLength={200} onChange={(event) => setForm((current) => ({ ...current, internalReference: event.target.value }))} />
              </label>
              <label className={`${pageStyles.field} ${pageStyles.full}`}>
                <span className={pageStyles.label}>Mô tả công việc đã thực hiện (tùy chọn)</span>
                <textarea className={pageStyles.textarea} rows={3} maxLength={1200} value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} placeholder="Chỉ ghi thông tin đã xác nhận; không nêu tên hoặc vị trí đơn vị." />
              </label>
              <label className={pageStyles.field}>
                <span className={pageStyles.label}>Trạng thái</span>
                <select className={pageStyles.select} value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as InstallationInput['status'] }))}>
                  <option value="draft">Bản nháp (không hiện ngoài web)</option>
                  <option value="published">Công khai</option>
                </select>
              </label>
              <label className={pageStyles.field}>
                <span className={pageStyles.label}>Thứ tự hiển thị</span>
                <input className={pageStyles.input} type="number" min="1" value={form.sortOrder ?? ''} onChange={(event) => setForm((current) => ({ ...current, sortOrder: Number(event.target.value) || undefined }))} />
              </label>
            </div>

            <label className={styles.privacyCheck}>
              <input type="checkbox" checked={form.privacyReviewed} onChange={(event) => setForm((current) => ({ ...current, privacyReviewed: event.target.checked }))} />
              <span>Tôi xác nhận ảnh được phép công bố và đã kiểm tra biển tên, logo, người, màn hình, nhãn, mã QR và hình phản chiếu. Hệ thống chuyển ảnh sang WebP để bỏ metadata, nhưng không tự che chi tiết nhận diện trong ảnh.</span>
            </label>
            <div className={styles.uploadRow}>
              <label className={pageStyles.field}>
                <span className={pageStyles.label}>Ảnh lắp đặt thực tế (tối đa 8)</span>
                <input className={pageStyles.input} type="file" accept="image/*" multiple disabled={busy || !form.privacyReviewed} onChange={(event) => { void upload(event.target.files); event.target.value = '' }} />
              </label>
              <p>Ảnh bản nháp được lưu riêng, chỉ mở công khai sau khi xuất bản. Vẫn cần che thông tin nhận diện trước khi chọn file.</p>
            </div>
            {form.imageUrls.length > 0 && <div className={styles.imageList}>
              {form.imageUrls.map((url, index) => <div className={styles.imageItem} key={url}>
                <img src={url} alt={`Ảnh công trình ${index + 1}`} />
                <button type="button" onClick={() => setForm((current) => ({ ...current, imageUrls: current.imageUrls.filter((image) => image !== url) }))}>Bỏ khỏi bài đăng</button>
              </div>)}
            </div>}
            {error && <p className={styles.error} role="alert">{error}</p>}
            {notice && <p className={styles.notice} role="status">{notice}</p>}
            <button className={pageStyles.button} type="submit" disabled={busy || loading}>{busy ? 'Đang xử lý...' : 'Lưu công trình'}</button>
          </form>
        </div>
      </section>

      <section className={pageStyles.panel}>
        <div className={pageStyles.panelHeader}>
          <div><h2 className={pageStyles.panelTitle}>Danh sách công trình</h2><p className={pageStyles.panelSub}>{items.length} công trình; bản nháp không hiện trên website.</p></div>
          <button className={pageStyles.secondaryButton} type="button" onClick={() => void reload()}><FiRefreshCw aria-hidden />Tải lại</button>
        </div>
        {loading ? <p className={styles.empty}>Đang tải...</p> : items.length ? <div className={styles.records}>
          {items.map((item) => <article className={styles.record} key={item.id}>
            {item.imageUrls[0] && <img src={item.imageUrls[0]} alt="" loading="lazy" />}
            <div><strong>{item.title}</strong><p>{productNames.get(`${item.productType}:${item.productId}`) || 'Sản phẩm không còn trong hệ thống'}</p><span>{item.internalReference ? `${item.internalReference} · ` : ''}{item.status === 'published' ? 'Công khai' : 'Bản nháp'} · {item.imageUrls.length} ảnh</span></div>
            <button className={pageStyles.secondaryButton} type="button" onClick={() => edit(item)}><FiEdit2 aria-hidden />Sửa</button>
          </article>)}
        </div> : !listError && <p className={styles.empty}>Chưa có công trình. Hãy thêm từ biểu mẫu phía trên.</p>}
      </section>
    </div>
  )
}
