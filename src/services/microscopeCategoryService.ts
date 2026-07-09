import { apiUrl } from '../lib/apiClient'
import {
  DEFAULT_MICROSCOPE_CATEGORIES,
  normalizeMicroscopeCategories,
  type MicroscopeCategory,
  type MicroscopeCategoryInput,
} from '../data/microscopes'

const LS_KEY = 'admin_microscope_categories_v1'

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function readLocal() {
  const saved = safeJsonParse<MicroscopeCategory[]>(localStorage.getItem(LS_KEY), [])
  if (Array.isArray(saved) && saved.length > 0) return normalizeMicroscopeCategories(saved)
  const seeded = normalizeMicroscopeCategories(DEFAULT_MICROSCOPE_CATEGORIES)
  localStorage.setItem(LS_KEY, JSON.stringify(seeded))
  return seeded
}

function writeLocal(categories: MicroscopeCategory[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(normalizeMicroscopeCategories(categories)))
}

function upsertLocal(input: MicroscopeCategoryInput) {
  const categories = readLocal()
  const id = input.id || input.slug
  if (categories.some((item) => item.slug === input.slug && item.id !== id)) {
    throw new Error('Slug danh mục kính hiển vi đã tồn tại')
  }
  const next = {
    id,
    label: input.label,
    slug: input.slug,
    sortOrder: Number(input.sortOrder) || categories.length + 1,
    status: input.status ?? 'active',
  }
  const index = categories.findIndex((item) => item.id === id)
  if (index >= 0) categories[index] = next
  else categories.push(next)
  writeLocal(categories)
  return readLocal()
}

function deleteLocal(id: string) {
  const next = readLocal().filter((item) => item.id !== id)
  writeLocal(next)
  return readLocal()
}

async function readApiError(res: Response, fallback: string) {
  try {
    const body = (await res.json()) as { error?: string }
    if (body?.error) return body.error
  } catch {
    /* ignore */
  }
  return fallback
}

export async function apiGetMicroscopeCategories(): Promise<MicroscopeCategory[]> {
  try {
    const res = await fetch(apiUrl('/api/microscope-categories'), { credentials: 'include' })
    if (!res.ok) throw new Error('Không tải được danh mục kính hiển vi')
    const data = (await res.json()) as MicroscopeCategory[]
    return normalizeMicroscopeCategories(Array.isArray(data) ? data : DEFAULT_MICROSCOPE_CATEGORIES)
  } catch {
    if (import.meta.env.DEV) return readLocal()
    return normalizeMicroscopeCategories(DEFAULT_MICROSCOPE_CATEGORIES)
  }
}

export async function apiUpsertMicroscopeCategory(input: MicroscopeCategoryInput): Promise<MicroscopeCategory[]> {
  try {
    const res = await fetch(apiUrl('/api/microscope-categories'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    })
    if (!res.ok) throw new Error(await readApiError(res, 'Không lưu được danh mục kính hiển vi'))
    return normalizeMicroscopeCategories((await res.json()) as MicroscopeCategory[])
  } catch (err) {
    if (import.meta.env.DEV) return upsertLocal(input)
    throw err instanceof Error ? err : new Error('Không lưu được danh mục kính hiển vi')
  }
}

export async function apiDeleteMicroscopeCategory(id: string): Promise<MicroscopeCategory[]> {
  try {
    const res = await fetch(apiUrl(`/api/microscope-categories/${encodeURIComponent(id)}`), {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!res.ok) throw new Error(await readApiError(res, 'Không xóa được danh mục kính hiển vi'))
    return normalizeMicroscopeCategories((await res.json()) as MicroscopeCategory[])
  } catch (err) {
    if (import.meta.env.DEV) return deleteLocal(id)
    throw err instanceof Error ? err : new Error('Không xóa được danh mục kính hiển vi')
  }
}
