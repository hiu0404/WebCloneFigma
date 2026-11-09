import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import type { Product } from '../lib/adminStore'
import { productUrl } from '../lib/seo'
import { sendContactMessage } from '../services/contactService'
import styles from './QuoteRequestModal.module.css'

type Props = {
  product: Product
  onClose: () => void
}

export function QuoteRequestModal({ product, onClose }: Props) {
  const nameRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    nameRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled):not([tabindex="-1"]), textarea:not(:disabled), a[href]'))
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    const form = event.currentTarget
    const values = new FormData(form)
    const productPath = productUrl(product)
    const productLink = new URL(productPath, window.location.origin).href
    const customerMessage = String(values.get('message') || '').trim()
    setSubmitting(true)
    setFeedback(null)
    try {
      await sendContactMessage({
        name: String(values.get('name') || '').trim(),
        phone: String(values.get('phone') || '').trim(),
        email: String(values.get('email') || '').trim(),
        subject: `Yêu cầu báo giá: ${product.title}`.slice(0, 160),
        message: `Sản phẩm: ${product.title}\n${product.model || product.sku ? `Model: ${product.model || product.sku}\n` : ''}Mã sản phẩm: ${product.id}\nLiên kết: ${productLink}\nEmail: ${String(values.get('email') || '').trim()}\n\nNội dung yêu cầu:\n${customerMessage}`,
        website: String(values.get('website') || ''),
      })
      form.reset()
      setFeedback({ kind: 'success', text: 'Yêu cầu báo giá đã được gửi. Ecolink sẽ liên hệ lại với bạn.' })
    } catch (error) {
      setFeedback({ kind: 'error', text: error instanceof Error ? error.message : 'Không gửi được yêu cầu. Vui lòng thử lại.' })
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="quote-title">
        <div className={styles.heading}>
          <h2 id="quote-title">Yêu cầu báo giá</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Đóng biểu mẫu báo giá">×</button>
        </div>
        <div className={styles.content}>
          <p className={styles.productName}>Sản phẩm: <strong>{product.title}</strong></p>
          <p className={styles.intro}>Vui lòng để lại thông tin để Ecolink tư vấn và gửi báo giá. Liên hệ nhanh: <a href="tel:+84812119668">0812 119 668</a>.</p>
          <form onSubmit={(event) => void submit(event)}>
            <label>Họ và tên *<input ref={nameRef} name="name" autoComplete="name" required minLength={2} maxLength={120} /></label>
            <label>Số điện thoại *<input name="phone" type="tel" autoComplete="tel" required maxLength={24} /></label>
            <label>Email *<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
            <label>Nội dung yêu cầu *<textarea name="message" required minLength={10} maxLength={4000} rows={5} placeholder="Cho Ecolink biết nhu cầu của bạn" /></label>
            <div className={styles.honeypot} aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
            {feedback && <p className={feedback.kind === 'error' ? styles.error : styles.success} role={feedback.kind === 'error' ? 'alert' : 'status'}>{feedback.text}</p>}
            <button className={styles.submit} type="submit" disabled={submitting}>{submitting ? 'Đang gửi...' : 'Gửi yêu cầu báo giá'}</button>
          </form>
        </div>
      </section>
    </div>, document.body,
  )
}
