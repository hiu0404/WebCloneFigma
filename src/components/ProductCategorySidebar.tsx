import { Link } from 'react-router-dom'
import styles from './ProductCategorySidebar.module.css'

export type ProductGroupKey =
  | 'equipment'
  | 'forensic-science'
  | 'microscopes'
  | 'consumables'
  | 'chemicals'
  | 'antibodies'
  | 'intensive-care'

const groups: { key: ProductGroupKey; label: string; to: string }[] = [
  { key: 'equipment', label: 'Giải phẫu bệnh', to: '/giai-phau-benh' },
  { key: 'forensic-science', label: 'Giám định hình sự', to: '/giam-dinh-hinh-su' },
  { key: 'microscopes', label: 'Kính hiển vi', to: '/kinh-hien-vi' },
  { key: 'consumables', label: 'Vật tư tiêu hao', to: '/vat-tu-tieu-hao' },
  { key: 'chemicals', label: 'Hóa chất', to: '/hoa-chat' },
  { key: 'antibodies', label: 'Kháng thể', to: '/khang-the' },
  { key: 'intensive-care', label: 'Hồi sức tích cực', to: '/hoi-suc-tich-cuc' },
]

type Props = {
  activeGroup: ProductGroupKey
  selectedSlug: string
  subcategories: { slug: string; label: string; children?: { slug: string; label: string }[] }[]
  subcategoryUrl: (slug: string) => string
  counts?: Map<string, number>
}

export function ProductCategorySidebar({ activeGroup, selectedSlug, subcategories, subcategoryUrl, counts }: Props) {
  return (
    <aside className={styles.sidebar}>
      <nav aria-label="Danh mục sản phẩm">
        <h2>DANH MỤC SẢN PHẨM</h2>
        <ul className={styles.groups}>
          {groups.map((group) => {
            const expanded = group.key === activeGroup
            return (
              <li className={styles.group} key={group.key}>
                <Link
                  className={`${styles.groupLink} ${expanded ? styles.activeGroup : ''}`}
                  to={group.to}
                  aria-current={expanded && selectedSlug === 'all' ? 'page' : undefined}
                  aria-expanded={expanded}
                >
                  <span className={styles.triangle} aria-hidden="true" />
                  <span>{group.label}</span>
                </Link>
                {expanded && subcategories.length > 0 && (
                  <ul className={styles.children}>
                    {subcategories.map((category) => (
                      <li key={category.slug}>
                        <Link
                          className={`${styles.childLink} ${selectedSlug === category.slug || category.children?.some((child) => child.slug === selectedSlug) ? styles.activeChild : ''}`}
                          to={subcategoryUrl(category.slug)}
                          aria-current={selectedSlug === category.slug ? 'page' : undefined}
                        >
                          <span className={styles.circle} aria-hidden="true" />
                          <span>{category.label}{counts ? ` (${counts.get(category.slug) ?? 0})` : ''}</span>
                        </Link>
                        {category.children?.length ? (
                          <ul className={styles.grandchildren}>
                            {category.children.map((child) => (
                              <li key={child.slug}>
                                <Link
                                  className={`${styles.childLink} ${selectedSlug === child.slug ? styles.activeChild : ''}`}
                                  to={subcategoryUrl(child.slug)}
                                  aria-current={selectedSlug === child.slug ? 'page' : undefined}
                                >
                                  <span className={styles.circle} aria-hidden="true" />
                                  <span>{child.label}{counts ? ` (${counts.get(child.slug) ?? 0})` : ''}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
