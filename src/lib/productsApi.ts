import type { Product } from './adminStore'
import { deleteProduct, getProducts, normalizeLegacyProduct, sortProductsByDisplayOrder, upsertProduct } from './adminStore'
import { apiBase, apiUrl } from './apiClient'

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

async function apiErrorFromResponse(res: Response, fallback: string) {
  let msg = fallback
  try {
    const body = (await res.json()) as { error?: string }
    if (typeof body?.error === 'string' && body.error.trim()) msg = body.error
  } catch {
    /* ignore */
  }
  return new ApiError(msg, res.status)
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Failed to read image file'))
    }
    reader.onerror = () => reject(new Error('Failed to read image file'))
    reader.readAsDataURL(file)
  })
}

export async function apiGetProducts(): Promise<Product[]> {
  try {
    const res = await fetch(apiUrl('/api/products'), { credentials: 'include' })
    if (!res.ok) throw new Error('Failed to load products')
    const data = (await res.json()) as unknown
    return Array.isArray(data) ? sortProductsByDisplayOrder((data as Product[]).map(normalizeLegacyProduct)) : []
  } catch {
    if (import.meta.env.DEV) return getProducts()
    return []
  }
}

export async function apiUpsertProduct(p: Omit<Product, 'createdAt' | 'updatedAt'>): Promise<Product> {
  const payload = normalizeLegacyProduct(p)
  try {
    const res = await fetch(apiUrl('/api/products'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw await apiErrorFromResponse(res, 'Failed to save product')
    return normalizeLegacyProduct((await res.json()) as Product)
  } catch (err) {
    if (import.meta.env.DEV && !isAuthError(err)) return upsertProduct(p)
    throw err instanceof Error ? err : new Error('Failed to save product')
  }
}

export async function apiDeleteProduct(id: string): Promise<void> {
  try {
    const res = await fetch(apiUrl(`/api/products/${encodeURIComponent(id)}`), {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!res.ok) throw await apiErrorFromResponse(res, 'Failed to delete product')
  } catch (err) {
    if (import.meta.env.DEV && !isAuthError(err)) {
      deleteProduct(id)
      return
    }
    throw err instanceof Error ? err : new Error('Failed to delete product')
  }
}

export async function apiUploadImage(file: File): Promise<string> {
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(apiUrl('/api/upload'), { method: 'POST', credentials: 'include', body: fd })
    if (!res.ok) throw await apiErrorFromResponse(res, 'Upload failed')
    const data = (await res.json()) as { url?: string }
    if (!data.url) throw new Error('Upload missing url')
    const u = data.url
    if (u.startsWith('http://') || u.startsWith('https://')) return u
    return u.startsWith('/') ? `${apiBase()}${u}` : `${apiBase()}/${u}`
  } catch (err) {
    if (import.meta.env.DEV && !isAuthError(err)) return fileToDataUrl(file)
    throw err instanceof Error ? err : new Error('Upload failed')
  }
}
