import { apiUrl } from '../lib/apiClient'
import { normalizeMicroscopes, type Microscope, type MicroscopeInput } from '../data/microscopes'

const LS_KEY = 'admin_microscopes_v1'

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function readLocal() {
  return normalizeMicroscopes(safeJsonParse<Microscope[]>(localStorage.getItem(LS_KEY), []))
}

function writeLocal(microscopes: Microscope[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(normalizeMicroscopes(microscopes)))
}

function upsertLocal(input: MicroscopeInput) {
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
  writeLocal([created, ...list])
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

export async function apiGetMicroscopes(): Promise<Microscope[]> {
  try {
    const res = await fetch(apiUrl('/api/microscopes'), { credentials: 'include' })
    if (!res.ok) throw new Error('Không tải được kính hiển vi')
    const data = (await res.json()) as Microscope[]
    return normalizeMicroscopes(Array.isArray(data) ? data : [])
  } catch {
    if (import.meta.env.DEV) return readLocal()
    return []
  }
}

export async function apiUpsertMicroscope(input: MicroscopeInput): Promise<Microscope> {
  try {
    const res = await fetch(apiUrl('/api/microscopes'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    })
    if (!res.ok) throw new Error(await readApiError(res, 'Không lưu được kính hiển vi'))
    return (await res.json()) as Microscope
  } catch (err) {
    if (import.meta.env.DEV) return upsertLocal(input)
    throw err instanceof Error ? err : new Error('Không lưu được kính hiển vi')
  }
}

export async function apiDeleteMicroscope(id: string): Promise<void> {
  try {
    const res = await fetch(apiUrl(`/api/microscopes/${encodeURIComponent(id)}`), {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!res.ok) throw new Error(await readApiError(res, 'Không xóa được kính hiển vi'))
  } catch (err) {
    if (import.meta.env.DEV) {
      deleteLocal(id)
      return
    }
    throw err instanceof Error ? err : new Error('Không xóa được kính hiển vi')
  }
}

export async function apiUploadMicroscopeImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(apiUrl('/api/upload'), {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  if (!res.ok) throw new Error(await readApiError(res, 'Upload ảnh kính hiển vi thất bại'))
  const data = (await res.json()) as { url?: string }
  if (!data.url) throw new Error('Upload ảnh kính hiển vi thất bại')
  return data.url
}
