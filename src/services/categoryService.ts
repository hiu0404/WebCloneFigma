import { apiUrl } from '../lib/apiClient'
import {
  cloneCategories,
  DEFAULT_CATEGORIES,
  normalizeCategories,
  type AdminCategory,
  type CategoryInput,
} from '../data/categories'

const LS_CATEGORIES_KEY = 'admin_categories_v1'

class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

function isAuthError(err: unknown) {
  return err instanceof ApiError && (err.status === 401 || err.status === 403)
}

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function readLocalCategories() {
  const saved = safeJsonParse<AdminCategory[]>(localStorage.getItem(LS_CATEGORIES_KEY), [])
  if (Array.isArray(saved) && saved.length > 0) {
    const categories = cloneCategories(saved)
    let changed = false
    const vascular = categories.find((item) => item.slug === 'intensive-care')
    if (vascular?.label === 'Hồi sức tích cực') {
      vascular.label = 'Đường tiếp cận mạch máu'
      changed = true
    }
    for (const defaultCategory of DEFAULT_CATEGORIES) {
      if (!categories.some((item) => item.slug === defaultCategory.slug)) {
        categories.push(cloneCategories([defaultCategory])[0])
        changed = true
      }
    }
    if (changed) writeLocalCategories(categories)
    return normalizeCategories(categories)
  }
  const seeded = cloneCategories(DEFAULT_CATEGORIES)
  localStorage.setItem(LS_CATEGORIES_KEY, JSON.stringify(seeded))
  return seeded
}

function writeLocalCategories(categories: AdminCategory[]) {
  localStorage.setItem(LS_CATEGORIES_KEY, JSON.stringify(normalizeCategories(categories)))
}

function mergeDefaultCategories(categories: AdminCategory[]) {
  const next = cloneCategories(categories.length > 0 ? categories : DEFAULT_CATEGORIES)
  let changed = false
  const vascular = next.find((item) => item.slug === 'intensive-care')
  if (vascular?.label === 'Hồi sức tích cực') {
    vascular.label = 'Đường tiếp cận mạch máu'
    changed = true
  }
  for (const defaultCategory of DEFAULT_CATEGORIES) {
    if (!next.some((item) => item.slug === defaultCategory.slug)) {
      next.push(cloneCategories([defaultCategory])[0])
      changed = true
    }
  }
  return changed ? normalizeCategories(next) : next
}

function findDuplicateSlug(categories: AdminCategory[], slug: string, ignoreId?: string) {
  return categories.some(
    (category) =>
      (category.slug === slug && category.id !== ignoreId) ||
      category.children.some((child) =>
        (child.slug === slug && child.id !== ignoreId)
        || child.children?.some((nested) => nested.slug === slug && nested.id !== ignoreId)),
  )
}

function upsertLocalCategory(input: CategoryInput) {
  const categories = cloneCategories(readLocalCategories())
  const id = input.id || input.slug
  if (findDuplicateSlug(categories, input.slug, id)) {
    throw new Error('Slug danh mục đã tồn tại')
  }

  const previous = categories.flatMap((category) => category.children).find((child) => child.id === id)
  for (const category of categories) {
    category.children = category.children.filter((child) => child.id !== id)
    for (const child of category.children) child.children = (child.children ?? []).filter((nested) => nested.id !== id)
  }

  const parent = categories.find((category) => category.id === input.parentId)
  const group = categories.flatMap((category) => category.children).find((child) => child.id === input.parentId)
  if (input.parentId && !parent && !group) throw new Error('Danh mục cha không hợp lệ')
  if (group && previous?.children?.length) throw new Error('Không thể đưa nhóm có danh mục con vào danh mục cấp ba')
  if (parent) {
    parent.children.push({
      id,
      slug: input.slug,
      label: input.label,
      description: input.description,
      imageUrl: input.imageUrl,
      sortOrder: Number(input.sortOrder) || parent.children.length + 1,
      status: input.status ?? 'active',
      children: previous?.children ?? [],
    })
  } else if (group) {
    group.children ??= []
    group.children.push({
      id, slug: input.slug, label: input.label, description: input.description,
      imageUrl: input.imageUrl, sortOrder: Number(input.sortOrder) || group.children.length + 1,
      status: input.status ?? 'active',
    })
  } else {
    const existingIndex = categories.findIndex((category) => category.id === id)
    const children = existingIndex >= 0 ? categories[existingIndex].children : []
    const next = {
      id,
      slug: input.slug,
      label: input.label,
      description: input.description,
      imageUrl: input.imageUrl,
      sortOrder: Number(input.sortOrder) || existingIndex + 1 || categories.length + 1,
      status: input.status ?? 'active',
      children,
    }
    if (existingIndex >= 0) categories[existingIndex] = next
    else categories.push(next)
  }

  writeLocalCategories(categories)
  return categories
}

function deleteLocalCategory(id: string) {
  const categories = cloneCategories(readLocalCategories())
  const parentIndex = categories.findIndex((category) => category.id === id)
  if (parentIndex >= 0) {
    if (categories[parentIndex].children.length) throw new Error('Hãy xóa các danh mục con trước')
    categories.splice(parentIndex, 1)
  } else {
    for (const category of categories) {
      if (category.children.some((child) => child.id === id && child.children?.length)) throw new Error('Hãy xóa các danh mục con trước')
      category.children = category.children.filter((child) => child.id !== id)
      for (const child of category.children) child.children = (child.children ?? []).filter((nested) => nested.id !== id)
    }
  }
  writeLocalCategories(categories)
  return categories
}

async function readApiError(res: Response, fallback: string) {
  try {
    const body = (await res.json()) as { error?: string }
    if (typeof body?.error === 'string' && body.error.trim()) return body.error
  } catch {
    /* ignore */
  }
  return fallback
}

async function apiErrorFromResponse(res: Response, fallback: string) {
  return new ApiError(await readApiError(res, fallback), res.status)
}

export async function apiGetCategories(): Promise<AdminCategory[]> {
  try {
    const res = await fetch(apiUrl('/api/categories'), { credentials: 'include' })
    if (!res.ok) throw new Error('Không tải được danh mục')
    const data = (await res.json()) as unknown
    return Array.isArray(data) ? mergeDefaultCategories(data as AdminCategory[]) : cloneCategories(DEFAULT_CATEGORIES)
  } catch {
    if (import.meta.env.DEV) return readLocalCategories()
    return cloneCategories(DEFAULT_CATEGORIES)
  }
}

export async function apiUpsertCategory(input: CategoryInput): Promise<AdminCategory[]> {
  try {
    const res = await fetch(apiUrl('/api/categories'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    })
    if (!res.ok) throw await apiErrorFromResponse(res, 'Không lưu được danh mục')
    return (await res.json()) as AdminCategory[]
  } catch (err) {
    if (import.meta.env.DEV && !isAuthError(err)) return upsertLocalCategory(input)
    throw err instanceof Error ? err : new Error('Không lưu được danh mục')
  }
}

export async function apiDeleteCategory(id: string): Promise<AdminCategory[]> {
  try {
    const res = await fetch(apiUrl(`/api/categories/${encodeURIComponent(id)}`), {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!res.ok) throw await apiErrorFromResponse(res, 'Không xóa được danh mục')
    return (await res.json()) as AdminCategory[]
  } catch (err) {
    if (import.meta.env.DEV && !isAuthError(err)) return deleteLocalCategory(id)
    throw err instanceof Error ? err : new Error('Không xóa được danh mục')
  }
}
