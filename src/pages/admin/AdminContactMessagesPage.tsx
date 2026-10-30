import { useEffect, useState } from 'react'
import { getContactMessages, markContactMessageRead, type ContactMessage } from '../../services/contactService'
import pageStyles from './AdminPages.module.css'
import styles from './AdminContactMessagesPage.module.css'

function displayDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('vi-VN')
}

export function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getContactMessages()
      .then((items) => { if (active) setMessages(items) })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Không thể tải yêu cầu liên hệ.') })
      .finally(() => { if (active) setLoading(false) })
    const interval = window.setInterval(() => {
      getContactMessages()
        .then((items) => { if (active) setMessages(items) })
        .catch(() => { /* Keep the current list until the next refresh. */ })
    }, 30_000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [])

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      setMessages(await getContactMessages())
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể tải yêu cầu liên hệ.')
    } finally {
      setLoading(false)
    }
  }

  async function markRead(id: string) {
    setUpdatingId(id)
    setError('')
    try {
      const updated = await markContactMessageRead(id)
      setMessages((current) => current.map((item) => item.id === id ? updated : item))
      window.dispatchEvent(new Event('admin-contact-updated'))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể đánh dấu đã đọc.')
    } finally {
      setUpdatingId(null)
    }
  }

  const unread = messages.filter((item) => !item.readAt).length

  return (
    <section className={pageStyles.panel}>
      <div className={pageStyles.panelHeader}>
        <div>
          <h2 className={pageStyles.panelTitle}>Yêu cầu liên hệ</h2>
          <p className={pageStyles.panelSub}>{loading ? 'Đang tải...' : `${unread} chưa đọc · ${messages.length} yêu cầu`}</p>
        </div>
        <button className={pageStyles.secondaryButton} type="button" onClick={() => void refresh()} disabled={loading}>Làm mới</button>
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}
      {!loading && messages.length === 0 && !error && <p className={styles.empty}>Chưa có yêu cầu liên hệ nào.</p>}

      <div className={styles.list}>
        {messages.map((item) => (
          <article className={`${styles.message} ${!item.readAt ? styles.unread : ''}`} key={item.id}>
            <div className={styles.messageHeader}>
              <div>
                <div className={styles.subject}>{item.subject}</div>
                <div className={styles.meta}>{item.name} · <a href={`tel:${item.phone.replace(/[^\d+]/g, '')}`}>{item.phone}</a> · <time dateTime={item.createdAt}>{displayDate(item.createdAt)}</time></div>
              </div>
              <span className={`${styles.badge} ${item.readAt ? styles.badgeRead : ''}`}>{item.readAt ? 'Đã đọc' : 'Mới'}</span>
            </div>
            <p className={styles.body}>{item.message}</p>
            {!item.readAt && (
              <button className={pageStyles.secondaryButton} type="button" onClick={() => void markRead(item.id)} disabled={updatingId === item.id}>
                {updatingId === item.id ? 'Đang lưu...' : 'Đánh dấu đã đọc'}
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
