import styles from './AdminPages.module.css'

type AdminSimplePageProps = {
  title: string
  description: string
}

export function AdminSimplePage({ title, description }: AdminSimplePageProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>{title}</h2>
          <p className={styles.panelSub}>{description}</p>
        </div>
      </div>
      <div className={styles.emptyState}>Chưa có dữ liệu quản trị cho mục này.</div>
    </section>
  )
}
