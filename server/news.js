import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

export class NewsError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.status = status
  }
}

export function newsSlug(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100)
}

function text(value, max) {
  return String(value ?? '').trim().slice(0, max)
}

function safeUrl(value) {
  const url = text(value, 2000)
  if (!url) return ''
  if (url.startsWith('/') && !url.startsWith('//')) return url
  if (/^https:\/\//i.test(url)) return url
  throw new NewsError('Liên kết phải bắt đầu bằng / hoặc https://')
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
}

function sortNews(items) {
  return [...items].sort((a, b) =>
    String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')) ||
    Number(b.createdAt || 0) - Number(a.createdAt || 0))
}

export function createNewsStore(filePath) {
  function read() {
    try {
      const items = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      return sortNews(Array.isArray(items) ? items.filter((item) => item?.id && item?.slug) : [])
    } catch {
      return []
    }
  }

  function write(items) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`
    fs.writeFileSync(tmp, `${JSON.stringify(items, null, 2)}\n`, 'utf-8')
    fs.renameSync(tmp, filePath)
  }

  function save(raw, id = null) {
    const items = read()
    const index = id ? items.findIndex((item) => item.id === id) : -1
    if (id && index < 0) throw new NewsError('Không tìm thấy bài viết', 404)
    const previous = index >= 0 ? items[index] : null
    const title = text(raw?.title, 180)
    const category = text(raw?.category, 80)
    const excerpt = text(raw?.excerpt, 600)
    const content = text(raw?.content, 50000)
    const slug = newsSlug(raw?.slug || title)
    const status = raw?.status === 'published' ? 'published' : 'draft'
    const publishedAt = text(raw?.publishedAt, 10) || new Date().toISOString().slice(0, 10)
    if (!title || !category || !excerpt || !slug) throw new NewsError('Cần nhập tiêu đề, danh mục và mô tả ngắn')
    if (!validDate(publishedAt)) throw new NewsError('Ngày đăng không hợp lệ')
    const linkUrl = safeUrl(raw?.linkUrl)
    if (status === 'published' && !content && !linkUrl) throw new NewsError('Bài đăng cần nội dung hoặc liên kết ngoài')
    if (items.some((item) => item.slug === slug && item.id !== id)) throw new NewsError('Đường dẫn bài viết đã tồn tại', 409)
    const now = Date.now()
    const saved = {
      id: previous?.id || crypto.randomUUID(),
      slug, title, category, excerpt, content,
      imageUrl: safeUrl(raw?.imageUrl),
      sourceUrl: safeUrl(raw?.sourceUrl),
      relatedProductUrl: safeUrl(raw?.relatedProductUrl),
      linkUrl, status, publishedAt,
      featured: Boolean(raw?.featured),
      createdAt: previous?.createdAt || now,
      updatedAt: now,
    }
    if (index >= 0) items[index] = saved
    else items.push(saved)
    write(sortNews(items))
    return saved
  }

  function remove(id) {
    const items = read()
    if (!items.some((item) => item.id === id)) throw new NewsError('Không tìm thấy bài viết', 404)
    write(items.filter((item) => item.id !== id))
  }

  return {
    list: read,
    published: () => read().filter((item) => item.status === 'published'),
    findPublished: (slug) => read().find((item) => item.slug === slug && item.status === 'published') || null,
    save,
    remove,
  }
}
