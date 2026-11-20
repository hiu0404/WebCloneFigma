import { apiUrl } from '../lib/apiClient'
import type { NewsArticle, NewsInput } from '../data/news'

async function json<T>(res: Response, fallback: string): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null) as { error?: string } | null
    throw new Error(body?.error || fallback)
  }
  return res.json() as Promise<T>
}

export async function apiGetNews(): Promise<NewsArticle[]> {
  return json(await fetch(apiUrl('/api/news')), 'Không tải được tin tức')
}

export async function apiGetNewsArticle(slug: string): Promise<NewsArticle> {
  return json(await fetch(apiUrl(`/api/news/${encodeURIComponent(slug)}`)), 'Không tìm thấy bài viết')
}

export async function apiGetAdminNews(): Promise<NewsArticle[]> {
  return json(await fetch(apiUrl('/api/admin/news'), { credentials: 'include' }), 'Không tải được danh sách bài viết')
}

export async function apiSaveNews(input: NewsInput, id?: string): Promise<NewsArticle> {
  return json(await fetch(apiUrl(id ? `/api/admin/news/${encodeURIComponent(id)}` : '/api/admin/news'), {
    method: id ? 'PUT' : 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  }), 'Không lưu được bài viết')
}

export async function apiDeleteNews(id: string): Promise<void> {
  await json(await fetch(apiUrl(`/api/admin/news/${encodeURIComponent(id)}`), {
    method: 'DELETE', credentials: 'include',
  }), 'Không xóa được bài viết')
}

export async function apiUploadNewsImage(file: File): Promise<string> {
  const body = new FormData()
  body.append('file', file)
  const result = await json<{ url: string }>(await fetch(apiUrl('/api/upload'), {
    method: 'POST', credentials: 'include', body,
  }), 'Không tải được ảnh')
  if (!result.url) throw new Error('Máy chủ không trả về đường dẫn ảnh')
  return result.url
}
