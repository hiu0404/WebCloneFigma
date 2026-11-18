import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isCategoryVisible, visibleChildCategories, type AdminCategory } from '../data/categories'
import { isActiveMicroscopeCategory, microscopeCategoryUrl, type MicroscopeCategory } from '../data/microscopes'
import { apiGetCategories } from '../services/categoryService'
import { apiGetMicroscopeCategories } from '../services/microscopeCategoryService'
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
  { key: 'intensive-care', label: 'Đường tiếp cận mạch máu', to: '/hoi-suc-tich-cuc' },
]

type Props = {
  activeGroup: ProductGroupKey
  selectedSlug: string
  subcategories: { slug: string; label: string; children?: { slug: string; label: string }[] }[]
  subcategoryUrl: (slug: string) => string
  counts?: Map<string, number>
  categories?: AdminCategory[]
  microscopeCategories?: MicroscopeCategory[]
}

export function ProductCategorySidebar({ activeGroup, selectedSlug, subcategories, subcategoryUrl, counts, categories, microscopeCategories }: Props) {
  const [openGroup, setOpenGroup] = useState<ProductGroupKey | null>(null)
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [loadedCategories, setLoadedCategories] = useState<AdminCategory[]>([])
  const [loadedMicroscopeCategories, setLoadedMicroscopeCategories] = useState<MicroscopeCategory[]>([])

  useEffect(() => {
    if (categories) return
    let alive = true
    void apiGetCategories().then((items) => { if (alive) setLoadedCategories(items) })
    return () => { alive = false }
  }, [categories])

  useEffect(() => {
    if (microscopeCategories) return
    let alive = true
    void apiGetMicroscopeCategories().then((items) => { if (alive) setLoadedMicroscopeCategories(items) })
    return () => { alive = false }
  }, [microscopeCategories])

  const allCategories = categories ?? loadedCategories
  const allMicroscopeCategories = microscopeCategories ?? loadedMicroscopeCategories
  const visibleMicroscopes = allMicroscopeCategories.filter((category) =>
    isActiveMicroscopeCategory(category)
    && (!category.parentSlug || allMicroscopeCategories.some((parent) => parent.slug === category.parentSlug && isActiveMicroscopeCategory(parent))))

  function groupSubcategories(group: ProductGroupKey) {
    if (group === activeGroup) return subcategories
    if (group === 'microscopes') return visibleMicroscopes
      .filter((category) => !category.parentSlug)
      .map((category) => ({ ...category, children: visibleMicroscopes.filter((child) => child.parentSlug === category.slug) }))
    if (!allCategories.some((category) => category.slug === group && isCategoryVisible(category))) return []
    return visibleChildCategories(allCategories, group)
  }

  function categoryUrl(group: { key: ProductGroupKey; to: string }, slug: string) {
    if (group.key === activeGroup) return subcategoryUrl(slug)
    if (group.key === 'microscopes') return microscopeCategoryUrl(allMicroscopeCategories.find((item) => item.slug === slug) ?? { slug })
    return `${group.to}/${encodeURIComponent(slug)}`
  }

  return (
    <aside className={styles.sidebar}>
      <nav aria-label="Danh mục sản phẩm">
        <h2>DANH MỤC SẢN PHẨM</h2>
        <ul className={styles.groups}>
          {groups.map((group) => {
            const expanded = openGroup === group.key
            const groupCategories = groupSubcategories(group.key)
            const groupCounts = group.key === activeGroup ? counts : undefined
            const submenuId = `product-group-${group.key}`
            return (
              <li
                className={`${styles.group} ${expanded ? styles.groupOpen : ''}`}
                key={group.key}
                onPointerEnter={(event) => { if (event.pointerType === 'mouse') setOpenGroup(group.key) }}
                onPointerLeave={(event) => { if (event.pointerType === 'mouse') setOpenGroup(null) }}
                onFocusCapture={(event) => { if (event.target instanceof HTMLAnchorElement) setOpenGroup(group.key) }}
                onBlurCapture={(event) => {
                  const nextTarget = event.relatedTarget
                  if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) setOpenGroup(null)
                }}
              >
                <div className={styles.groupRow}>
                  <Link
                    className={`${styles.groupLink} ${group.key === activeGroup ? styles.activeGroup : ''}`}
                    to={group.to}
                    aria-current={group.key === activeGroup && selectedSlug === 'all' ? 'page' : undefined}
                    aria-expanded={expanded}
                    aria-controls={submenuId}
                  >
                    <span className={styles.triangle} aria-hidden="true" />
                    <span>{group.label}</span>
                  </Link>
                  {groupCategories.length > 0 ? (
                    <button
                      className={styles.expandButton}
                      type="button"
                      aria-label={`${expanded ? 'Thu gọn' : 'Hiển thị'} danh mục con của ${group.label}`}
                      aria-expanded={expanded}
                      aria-controls={submenuId}
                      onClick={(event) => setOpenGroup(event.detail > 0 && window.matchMedia('(hover: hover) and (pointer: fine)').matches ? group.key : expanded ? null : group.key)}
                    >
                      <span aria-hidden="true">▾</span>
                    </button>
                  ) : null}
                </div>
                {groupCategories.length > 0 && (
                  <ul className={styles.children} id={submenuId} hidden={!expanded}>
                    {groupCategories.map((category) => {
                      const hasChildren = Boolean(category.children?.length)
                      const selectedInside = group.key === activeGroup && (category.children?.some((child) => child.slug === selectedSlug) ?? false)
                      const isOpen = hasChildren && (openCategory === category.slug || (openCategory === null && selectedInside))
                      const listId = `product-subcategories-${activeGroup}-${category.slug}`
                      return (
                        <li
                          className={styles.childItem}
                          key={category.slug}
                          onPointerEnter={(event) => { if (hasChildren && event.pointerType === 'mouse') setOpenCategory(category.slug) }}
                          onPointerLeave={(event) => { if (hasChildren && event.pointerType === 'mouse') setOpenCategory(null) }}
                          onFocusCapture={(event) => { if (hasChildren && event.target instanceof HTMLAnchorElement) setOpenCategory(category.slug) }}
                          onBlurCapture={(event) => {
                            const nextTarget = event.relatedTarget
                            if (hasChildren && (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget))) setOpenCategory(null)
                          }}
                        >
                          <div className={styles.childRow}>
                            <Link
                              className={`${styles.childLink} ${group.key === activeGroup && (selectedSlug === category.slug || selectedInside) ? styles.activeChild : ''}`}
                              to={categoryUrl(group, category.slug)}
                              aria-current={group.key === activeGroup && selectedSlug === category.slug ? 'page' : undefined}
                            >
                              <span>{category.label}{groupCounts ? ` (${groupCounts.get(category.slug) ?? 0})` : ''}</span>
                            </Link>
                            {hasChildren ? (
                              <button
                                className={styles.expandButton}
                                type="button"
                                aria-label={`${isOpen ? 'Thu gọn' : 'Hiển thị'} danh mục con của ${category.label}`}
                                aria-expanded={isOpen}
                                aria-controls={listId}
                                onClick={(event) => setOpenCategory(event.detail > 0 && window.matchMedia('(hover: hover) and (pointer: fine)').matches ? category.slug : isOpen ? '' : category.slug)}
                              >
                                <span aria-hidden="true">▾</span>
                              </button>
                            ) : null}
                          </div>
                          {hasChildren ? (
                            <ul className={styles.grandchildren} id={listId} hidden={!isOpen}>
                              {category.children?.map((child) => (
                                <li key={child.slug}>
                                  <Link
                                    className={`${styles.childLink} ${group.key === activeGroup && selectedSlug === child.slug ? styles.activeChild : ''}`}
                                    to={categoryUrl(group, child.slug)}
                                    aria-current={group.key === activeGroup && selectedSlug === child.slug ? 'page' : undefined}
                                  >
                                    <span>{child.label}{groupCounts ? ` (${groupCounts.get(child.slug) ?? 0})` : ''}</span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      )
                    })}
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
