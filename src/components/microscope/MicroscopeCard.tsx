import type { Microscope } from '../../data/microscopes'
import styles from '../../pages/MicroscopePage.module.css'

type Props = {
  microscope: Microscope
  categoryLabel: string
}

export function MicroscopeCard({ microscope, categoryLabel }: Props) {
  return (
    <article className={styles.productcard}>
      {microscope.imageUrl ? (
        <img src={microscope.imageUrl} alt={microscope.name} />
      ) : (
        <div className={styles.cardPlaceholder} aria-hidden>
          <span>{microscope.model || microscope.name.slice(0, 2)}</span>
        </div>
      )}
      <div className={styles.productcardContent}>
        <span className={styles.categoryPill}>{categoryLabel}</span>
        <h3>{microscope.name}</h3>
        {microscope.model ? <p className={styles.modelText}>Model: {microscope.model}</p> : null}
        <p>{microscope.shortDescription || 'Chưa có mô tả ngắn.'}</p>
      </div>
    </article>
  )
}
