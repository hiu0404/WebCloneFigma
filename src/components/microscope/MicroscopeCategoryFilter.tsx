import type { MicroscopeCategory } from '../../data/microscopes'
import styles from '../../pages/MicroscopePage.module.css'

type Props = {
  categories: MicroscopeCategory[]
  selectedSlug: string
  onSelect: (slug: string) => void
}

export function MicroscopeCategoryFilter({ categories, selectedSlug, onSelect }: Props) {
  return (
    <div className={styles.categoryFilter} aria-label="Lọc danh mục kính hiển vi">
      <button
        className={selectedSlug === 'all' ? styles.filterActive : ''}
        type="button"
        onClick={() => onSelect('all')}
      >
        Tất cả
      </button>
      {categories.map((category) => (
        <button
          className={selectedSlug === category.slug ? styles.filterActive : ''}
          type="button"
          key={category.slug}
          onClick={() => onSelect(category.slug)}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}
