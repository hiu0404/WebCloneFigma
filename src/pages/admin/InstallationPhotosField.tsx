import { useState } from 'react'
import { FiArrowDown, FiArrowUp, FiTrash2 } from 'react-icons/fi'
import type { InstallationPhoto } from '../../lib/installationPhotos'
import styles from './InstallationPhotosField.module.css'

type Props = {
  value: InstallationPhoto[]
  onChange: (photos: InstallationPhoto[]) => void
  uploadImage: (file: File) => Promise<string>
  onBusyChange: (busy: boolean) => void
  disabled?: boolean
}

export function InstallationPhotosField({ value, onChange, uploadImage, onBusyChange, disabled }: Props) {
  const [urlDraft, setUrlDraft] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const photos = Array.isArray(value) ? value.filter((photo) => Boolean(photo?.url)) : []

  async function addFiles(files: File[]) {
    if (!files.length) return
    setError('')
    setUploading(true)
    onBusyChange(true)
    const urls: string[] = []
    try {
      for (const file of files) urls.push(await uploadImage(file))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tải được ảnh. Vui lòng thử lại.')
    } finally {
      if (urls.length) {
        const existing = new Set(photos.map((photo) => photo.url))
        onChange([...photos, ...urls.filter((url) => !existing.has(url)).map((url) => ({ url }))])
      }
      setUploading(false)
      onBusyChange(false)
    }
  }

  function addUrl() {
    const url = urlDraft.trim()
    if (!/^https?:\/\//iu.test(url) && !url.startsWith('/')) {
      setError('Vui lòng nhập URL http(s) hoặc đường dẫn bắt đầu bằng /.')
      return
    }
    if (photos.some((photo) => photo.url === url)) {
      setError('Ảnh này đã có trong danh sách.')
      return
    }
    onChange([...photos, { url }])
    setUrlDraft('')
    setError('')
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...photos]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    const current = next[index]
    next[index] = next[target]
    next[target] = current
    onChange(next)
  }

  return <section className={styles.field} aria-label="Hình ảnh lắp đặt thực tế">
    <div className={styles.heading}>
      <strong>Hình ảnh lắp đặt thực tế</strong>
      <span>Tải ảnh nhân sự lắp đặt thiết bị. Có thể thêm chú thích cho từng ảnh.</span>
    </div>
    <input className={styles.input} type="file" accept="image/*" multiple disabled={disabled || uploading} onChange={(event) => {
      const files = Array.from(event.target.files ?? [])
      event.target.value = ''
      void addFiles(files)
    }} />
    <div className={styles.addUrl}>
      <input className={styles.input} value={urlDraft} onChange={(event) => setUrlDraft(event.target.value)} placeholder="Hoặc dán URL ảnh lắp đặt" disabled={disabled || uploading} />
      <button className={styles.addButton} type="button" onClick={addUrl} disabled={disabled || uploading || !urlDraft.trim()}>Thêm URL</button>
    </div>
    {uploading ? <span className={styles.hint}>Đang tải ảnh lên...</span> : null}
    {error ? <span className={styles.error} role="alert">{error}</span> : null}
    {photos.length ? <div className={styles.list}>{photos.map((photo, index) => <div className={styles.item} key={`${photo.url}-${index}`}>
      <img src={photo.url} alt={`Ảnh lắp đặt ${index + 1}`} />
      <div className={styles.itemContent}>
        <label htmlFor={`installation-caption-${index}`}>Chú thích ảnh {index + 1}</label>
        <input id={`installation-caption-${index}`} className={styles.input} value={photo.caption ?? ''} maxLength={200} placeholder="Ví dụ: Lắp đặt tại phòng xét nghiệm" onChange={(event) => onChange(photos.map((item, position) => position === index ? { ...item, caption: event.target.value } : item))} disabled={disabled || uploading} />
        <span className={styles.url}>{photo.url}</span>
      </div>
      <div className={styles.itemActions}>
        <button type="button" aria-label={`Đưa ảnh ${index + 1} lên trước`} disabled={disabled || uploading || index === 0} onClick={() => move(index, -1)}><FiArrowUp /></button>
        <button type="button" aria-label={`Đưa ảnh ${index + 1} xuống sau`} disabled={disabled || uploading || index === photos.length - 1} onClick={() => move(index, 1)}><FiArrowDown /></button>
        <button type="button" aria-label={`Xóa ảnh ${index + 1}`} disabled={disabled || uploading} onClick={() => onChange(photos.filter((_, position) => position !== index))}><FiTrash2 /></button>
      </div>
    </div>)}</div> : <span className={styles.hint}>Chưa có ảnh lắp đặt. Mục này sẽ không hiển thị trên trang sản phẩm.</span>}
    <div className={styles.saveRow}>
      <span className={styles.hint}>Sau khi thêm ảnh hoặc sửa chú thích, hãy lưu sản phẩm để ảnh hiển thị trên trang chi tiết.</span>
      <button className={styles.addButton} type="submit" disabled={disabled || uploading}>Lưu sản phẩm và ảnh</button>
    </div>
  </section>
}
