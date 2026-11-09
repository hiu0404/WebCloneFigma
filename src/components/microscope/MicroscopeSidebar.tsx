import type { MicroscopeCategory } from '../../data/microscopes'
import { Link } from 'react-router-dom'
import styles from '../../pages/ConsumablesPage.module.css'

type Props = {
  categories: MicroscopeCategory[]
  selectedSlug: string
  counts: Map<string, number>
  total: number
}

export function MicroscopeSidebar({ categories, selectedSlug, counts, total }: Props) {
  return (
    <aside className={styles.sidebar}>
      <h2>DANH MỤC KÍNH HIỂN VI</h2>
      <ul>
        <li>
          <Link
            className={`${styles.categoryLink} ${selectedSlug === 'all' ? styles.active : ''}`}
            to="/kinh-hien-vi"
          >
            <span>›</span>
            Tất cả kính hiển vi ({total})
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              className={`${styles.categoryLink} ${selectedSlug === category.slug ? styles.active : ''}`}
              to={`/kinh-hien-vi/${category.slug}`}
            >
              <span>›</span>
              {category.label} ({counts.get(category.slug) ?? 0})
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
