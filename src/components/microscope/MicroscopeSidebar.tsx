import type { MicroscopeCategory } from '../../data/microscopes'
import styles from '../../pages/MicroscopePage.module.css'

type Props = {
  categories: MicroscopeCategory[]
  selectedSlug: string
  counts: Map<string, number>
  total: number
  onSelect: (slug: string) => void
}

export function MicroscopeSidebar({ categories, selectedSlug, counts, total, onSelect }: Props) {
  return (
    <aside className={styles.sidebar}>
      <h2>DANH MỤC KÍNH HIỂN VI</h2>
      <ul>
        <li>
          <button
            className={`${styles.categoryLink} ${selectedSlug === 'all' ? styles.active : ''}`}
            type="button"
            onClick={() => onSelect('all')}
          >
            <span>›</span>
            Tất cả kính hiển vi ({total})
          </button>
        </li>
        {categories.map((category) => (
          <li key={category.slug}>
            <button
              className={`${styles.categoryLink} ${selectedSlug === category.slug ? styles.active : ''}`}
              type="button"
              onClick={() => onSelect(category.slug)}
            >
              <span>›</span>
              {category.label} ({counts.get(category.slug) ?? 0})
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
