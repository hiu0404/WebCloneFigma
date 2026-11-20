export type NewsStatus = 'draft' | 'published'

export type NewsArticle = {
  id: string
  slug: string
  title: string
  category: string
  excerpt: string
  content: string
  imageUrl: string
  sourceUrl: string
  relatedProductUrl: string
  linkUrl: string
  status: NewsStatus
  publishedAt: string
  featured: boolean
  createdAt: number
  updatedAt: number
}

export type NewsInput = Pick<NewsArticle,
  'slug' | 'title' | 'category' | 'excerpt' | 'content' | 'imageUrl' |
  'sourceUrl' | 'relatedProductUrl' | 'linkUrl' | 'status' | 'publishedAt' | 'featured'
>

export function newsHref(article: NewsArticle): string {
  return article.linkUrl || `/tin-tuc/${article.slug}`
}

export function newsDate(date: string): string {
  const [year, month, day] = date.split('-')
  return year && month && day ? `${day}/${month}/${year}` : date
}
