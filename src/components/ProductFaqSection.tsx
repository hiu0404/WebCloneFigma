import { useState, type FormEvent } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import type { Product } from '../lib/adminStore'
import { productUrl } from '../lib/seo'
import { sendContactMessage } from '../services/contactService'
import styles from './ProductFaqSection.module.css'

type Props = { product: Product }
type FaqItem = { question: string; answer: string }

function productFaqs(product: Product): FaqItem[] {
  const faqs: FaqItem[] = []
  const description = (product.description || product.shortDescription || '').trim()
  if (description) faqs.push({ question: `${product.title} dùng để làm gì?`, answer: description })
  if (product.specs?.trim()) faqs.push({
    question: 'Tôi có thể xem thông số kỹ thuật ở đâu?',
    answer: 'Bạn chọn mục “Thông số kỹ thuật” ngay phía trên để xem thông tin của sản phẩm.',
  })
  if (product.brand) faqs.push({
    question: 'Sản phẩm này của hãng nào?',
    answer: `${product.title} thuộc hãng ${product.brand}${product.origin ? `, xuất xứ ${product.origin}` : ''}.`,
  })
  faqs.push({
    question: 'Làm thế nào để yêu cầu báo giá?',
    answer: 'Bạn chọn “Yêu cầu báo giá” ở phần thông tin sản phẩm, điền nhu cầu và thông tin liên hệ. Ecolink sẽ phản hồi trực tiếp.',
  })
  faqs.push({
    question: 'Tôi có thể nhận tài liệu kỹ thuật của sản phẩm không?',
    answer: product.pdfUrl
      ? 'Bạn có thể tải tài liệu bằng nút “Tải tài liệu kỹ thuật” ở phần thông tin sản phẩm.'
      : 'Bạn chọn “Yêu cầu tài liệu” ở phần thông tin sản phẩm để liên hệ Ecolink.',
  })
  faqs.push({
    question: 'Tôi cần tư vấn thêm thì liên hệ bằng cách nào?',
    answer: 'Bạn gửi câu hỏi bằng biểu mẫu bên dưới hoặc gọi hotline 0812 119 668 để được Ecolink tư vấn.',
  })
  return faqs
}

export function ProductFaqSection({ product }: Props) {
  const [formOpen, setFormOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null)
  const faqs = productFaqs(product)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) return
    const form = event.currentTarget
    const fields = new FormData(form)
    const question = String(fields.get('question') || '').trim()
    const itemLink = new URL(productUrl(product), window.location.origin).href
    setSending(true)
    setFeedback(null)
    try {
      await sendContactMessage({
        name: String(fields.get('name') || '').trim(),
        phone: String(fields.get('phone') || '').trim(),
        email: String(fields.get('email') || '').trim(),
        subject: `Câu hỏi sản phẩm: ${product.title}`.slice(0, 160),
        message: `Sản phẩm: ${product.title}\nLiên kết: ${itemLink}\n\nCâu hỏi:\n${question}`,
        website: String(fields.get('website') || ''),
      })
      form.reset()
      setFormOpen(false)
      setFeedback({ kind: 'success', message: 'Câu hỏi đã được gửi. Ecolink sẽ liên hệ để trả lời bạn.' })
    } catch (error) {
      setFeedback({ kind: 'error', message: error instanceof Error ? error.message : 'Không gửi được câu hỏi. Vui lòng thử lại.' })
    } finally {
      setSending(false)
    }
  }

  return <div className={styles.sections}>
    <section className={styles.faq} aria-labelledby="product-faq-title">
      <h2 id="product-faq-title">FAQ – Câu hỏi thường gặp</h2>
      <div className={styles.faqList}>
        {faqs.map((item) => <details className={styles.faqItem} key={item.question}>
          <summary>
            <span className={styles.questionMark} aria-hidden="true">?</span>
            <span className={styles.questionText}>{item.question}</span>
            <FiChevronDown className={styles.chevron} aria-hidden="true" />
          </summary>
          <p>{item.answer}</p>
        </details>)}
      </div>
    </section>

    <section className={styles.questions} aria-labelledby="product-questions-title">
      <div className={styles.questionHeading}>
        <div>
          <span className={styles.eyebrow}>TƯ VẤN CÙNG ECOLINK</span>
          <h2 id="product-questions-title">Hỏi đáp</h2>
        </div>
        <button type="button" className={styles.askButton} aria-expanded={formOpen} aria-controls={formOpen ? 'product-question-form' : undefined} onClick={() => { setFormOpen((open) => !open); setFeedback(null) }}>
          {formOpen ? 'Đóng biểu mẫu' : 'Gửi câu hỏi'}
        </button>
      </div>
      <p className={styles.intro}>Gửi câu hỏi về sản phẩm cho Ecolink. Chúng tôi sẽ phản hồi riêng qua thông tin liên hệ bạn cung cấp.</p>
      {formOpen ? <form id="product-question-form" className={styles.form} onSubmit={(event) => void submit(event)}>
        <div className={styles.formRow}>
          <label>Họ và tên *<input name="name" autoComplete="name" required minLength={2} maxLength={120} /></label>
          <label>Số điện thoại *<input name="phone" type="tel" autoComplete="tel" required maxLength={24} /></label>
          <label>Email<input name="email" type="email" autoComplete="email" maxLength={254} /></label>
        </div>
        <label>Câu hỏi của bạn *<textarea name="question" required minLength={10} maxLength={4000} rows={4} placeholder={`Bạn muốn hỏi gì về ${product.title}?`} /></label>
        <div className={styles.honeypot} aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
        <button type="submit" className={styles.submitButton} disabled={sending}>{sending ? 'Đang gửi...' : 'Gửi câu hỏi'}</button>
      </form> : null}
      {feedback ? <p className={feedback.kind === 'error' ? styles.error : styles.success} role={feedback.kind === 'error' ? 'alert' : 'status'}>{feedback.message}</p> : null}
      {!formOpen && !feedback ? <p className={styles.empty}>Bạn có thể gửi câu hỏi để được Ecolink tư vấn về sản phẩm.</p> : null}
    </section>
  </div>
}
