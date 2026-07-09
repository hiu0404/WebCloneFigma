import { apiUrl } from '../lib/apiClient'
import { normalizeForensicProducts, type ForensicProduct, type ForensicProductInput } from '../data/forensicProducts'

const LS_KEY = 'admin_forensic_products_v1'

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function readLocal() {
  return normalizeForensicProducts(safeJsonParse<ForensicProduct[]>(localStorage.getItem(LS_KEY), []))
}

function writeLocal(products: ForensicProduct[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(normalizeForensicProducts(products)))
}

function upsertLocal(input: ForensicProductInput) {
  const now = Date.now()
  const list = readLocal()
  const index = list.findIndex((item) => item.id === input.id)
  if (index >= 0) {
    const updated = { ...list[index], ...input, status: input.status ?? 'active', updatedAt: now }
    list[index] = updated
    writeLocal(list)
    return updated
  }
  const created = { ...input, status: input.status ?? 'active', createdAt: now, updatedAt: now }
  writeLocal([...list, created])
  return created
}

function deleteLocal(id: string) {
  writeLocal(readLocal().filter((item) => item.id !== id))
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

export async function apiGetForensicProducts(): Promise<ForensicProduct[]> {
  try {
    const res = await fetch(apiUrl('/api/forensic-products'), { credentials: 'include' })
    if (!res.ok) throw new Error('Không tải được sản phẩm giám định hình sự')
    const data = (await res.json()) as ForensicProduct[]
    return normalizeForensicProducts(Array.isArray(data) ? data : [])
  } catch {
    if (import.meta.env.DEV) return readLocal()
    return []
  }
}

export async function apiUpsertForensicProduct(input: ForensicProductInput): Promise<ForensicProduct> {
  try {
    const res = await fetch(apiUrl('/api/forensic-products'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    })
    if (!res.ok) throw new Error(await readApiError(res, 'Không lưu được sản phẩm giám định hình sự'))
    return (await res.json()) as ForensicProduct
  } catch (err) {
    if (import.meta.env.DEV) return upsertLocal(input)
    throw err instanceof Error ? err : new Error('Không lưu được sản phẩm giám định hình sự')
  }
}

export async function apiDeleteForensicProduct(id: string): Promise<void> {
  try {
    const res = await fetch(apiUrl(`/api/forensic-products/${encodeURIComponent(id)}`), {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!res.ok) throw new Error(await readApiError(res, 'Không xóa được sản phẩm giám định hình sự'))
  } catch (err) {
    if (import.meta.env.DEV) {
      deleteLocal(id)
      return
    }
    throw err instanceof Error ? err : new Error('Không xóa được sản phẩm giám định hình sự')
  }
}

export async function apiUploadForensicProductImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(apiUrl('/api/upload'), {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  if (!res.ok) throw new Error(await readApiError(res, 'Upload ảnh sản phẩm giám định hình sự thất bại'))
  const data = (await res.json()) as { url?: string }
  if (!data.url) throw new Error('Upload ảnh sản phẩm giám định hình sự thất bại')
  return data.url
}
