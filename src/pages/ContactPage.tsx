import { useState, type FormEvent } from 'react'
import { Header } from '../components/Header/Header'
import { FigmaImage } from '../components/FigmaImage'
import { sendContactMessage } from '../services/contactService'
import styles from './ContactPage.module.css'

function PhoneIcon() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" aria-hidden="true">
      <path
        d="M19.3 7.5h7.2c1.2 0 2.2.9 2.4 2.1l1 6.3c.2 1.1-.4 2.2-1.4 2.7l-3.7 1.9c2.4 5.5 6.8 9.9 12.3 12.3l1.9-3.7c.5-1 1.6-1.6 2.7-1.4l6.3 1c1.2.2 2.1 1.2 2.1 2.4v7.2c0 1.4-1.1 2.5-2.5 2.5C29.8 42.1 17.9 30.2 16.8 10c0-1.4 1.1-2.5 2.5-2.5Z"
        fill="#187093"
      />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" aria-hidden="true">
      <path
        d="M10 18c0-2.2 1.8-4 4-4h32c2.2 0 4 1.8 4 4v24c0 2.2-1.8 4-4 4H14c-2.2 0-4-1.8-4-4V18Zm4 0 16 12 16-12H14Zm32 24V22L30.9 33.6c-.5.4-1.2.4-1.7 0L14 22v20h32Z"
        fill="#187093"
      />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" aria-hidden="true">
      <path
        d="M14 48V12c0-1.1.9-2 2-2h20c1.1 0 2 .9 2 2v36h6V24c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v24h-6v-4H20v4H14Zm10-30h4v4h-4v-4Zm0 8h4v4h-4v-4Zm0 8h4v4h-4v-4Zm10-16h4v4h-4v-4Zm0 8h4v4h-4v-4Zm0 8h4v4h-4v-4Z"
        fill="#187093"
      />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" aria-hidden="true">
      <path
        d="M30 54s16-14.7 16-30c0-8.8-7.2-16-16-16S14 15.2 14 24c0 15.3 16 30 16 30Zm0-23a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z"
        fill="#187093"
      />
    </svg>
  )
}

const contactItems = [
  {
    icon: <PhoneIcon />,
    title: 'Số điện thoại',
    text: 'Tổng đài chăm sóc khách; tư vấn dịch vụ',
    linkText: '+84 812.119.668',
    href: 'tel:+84812119668',
  },
  {
    icon: <EmailIcon />,
    title: 'E - mail',
    text: 'Công ty cổ phần đầu tư và phát triển Ecolink',
    linkText: 'info.ecolinkvn@gmail.com',
    href: 'mailto:info.ecolinkvn@gmail.com',
  },
  {
    icon: <BuildingIcon />,
    title: 'Trụ sở Hà Nội',
    text: 'Số 67, Ngõ 281, Phố Đội Cấn, P. Liễu Giai, Q. Ba Đình, TP. Hà Nội',
    linkText: 'Xem trên Google Maps',
    href: '#',
  },
  {
    icon: <LocationIcon />,
    title: 'Chi nhánh HCM',
    text: 'Số 2, đường S3, P. Tây Thạnh, Q. Tân Phú, TP. Hồ Chí Minh',
    linkText: 'Xem trên Google Maps',
    href: '#',
  },
]

export function ContactPage() {
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    const form = event.currentTarget
    const values = new FormData(form)
    setSubmitting(true)
    setFeedback(null)
    try {
      await sendContactMessage({
        name: String(values.get('name') ?? '').trim(),
        phone: String(values.get('phone') ?? '').trim(),
        subject: String(values.get('subject') ?? '').trim(),
        message: String(values.get('message') ?? '').trim(),
        website: String(values.get('website') ?? ''),
      })
      form.reset()
      setFeedback({ type: 'success', text: 'Yêu cầu của bạn đã được gửi. Ecolink sẽ liên hệ lại sớm.' })
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : 'Không thể gửi yêu cầu. Vui lòng thử lại.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <Header />

      <FigmaImage
        className={styles.hero}
        src="/assetsFull/page-banner-dna.png"
        alt=""
        ariaHidden
        width={1920}
        height={461}
      />

      <div className={styles.heroTitle}>
        <div>Liên hệ</div>
        <div className={styles.heroTitleSmall}>Trang chủ / Liên hệ</div>
      </div>

      <section className={styles.infoSection}>
        <div className={styles.infoGrid}>
          {contactItems.map((item) => (
            <article className={styles.infoCard} key={item.title}>
              <div className={styles.infoIcon}>{item.icon}</div>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
              <a href={item.href}>{item.linkText}</a>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.consultSection}>
        <div className={styles.consultHeader}>
          <h2>Yêu cầu tư vấn</h2>
          <p>Bạn hãy nhập thông tin và gửi tin nhắn cho chúng tôi để được tư vấn miễn phí</p>
        </div>

        <form className={styles.consultForm} onSubmit={(event) => void handleSubmit(event)}>
          <div className={styles.inputRow}>
            <input className={styles.input} name="name" aria-label="Họ và tên" placeholder="Họ và tên" autoComplete="name" required minLength={2} maxLength={120} />
            <input className={styles.input} name="phone" type="tel" aria-label="Số điện thoại" placeholder="Số điện thoại" autoComplete="tel" required maxLength={24} />
            <input className={styles.input} name="subject" aria-label="Tiêu đề" placeholder="Tiêu đề" required minLength={2} maxLength={160} />
          </div>
          <textarea className={styles.textarea} name="message" aria-label="Nội dung cần tư vấn" placeholder="Nội dung cần tư vấn" required minLength={10} maxLength={5000} />
          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor="contact-website">Website</label>
            <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <button className={styles.submitBtn} type="submit" disabled={submitting}>{submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}</button>
          {feedback && (
            <p className={`${styles.formFeedback} ${feedback.type === 'error' ? styles.formFeedbackError : ''}`} role={feedback.type === 'error' ? 'alert' : 'status'}>
              {feedback.text}
            </p>
          )}
        </form>
      </section>

      <FigmaImage className={styles.map} src="/assetsFull/image.png" alt="" ariaHidden />
    </div>
  )
}
