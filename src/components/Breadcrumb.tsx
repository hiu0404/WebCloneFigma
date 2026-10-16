import { Link } from 'react-router-dom'
import styles from './Breadcrumb.module.css'

export type BreadcrumbItem = { label: string; to?: string }

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return <nav className={styles.breadcrumb} aria-label="Breadcrumb">
    <ol>{items.map((item, index) => <li key={`${item.label}-${index}`}>
      {item.to && index < items.length - 1 ? <Link to={item.to}>{item.label}</Link> : <span aria-current={index === items.length - 1 ? 'page' : undefined}>{item.label}</span>}
    </li>)}</ol>
  </nav>
}
