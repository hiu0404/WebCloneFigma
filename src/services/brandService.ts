import { apiUrl } from '../lib/apiClient'
import { sortBrands, type Brand, type BrandInput } from '../data/brands'

const LS_KEY = 'admin_brands_v1'

function readLocal(): Brand[] {
  try {
    const data = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') as unknown
    return sortBrands(Array.isArray(data) ? data as Brand[] : [])
  } catch {
    return []
  }
}

function writeLocal(brands: Brand[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(sortBrands(brands)))
}

async function responseError(res: Response, fallback: string) {
  try {
    const body = await res.json() as { error?: string }
    return body.error || fallback
  } catch {
    return fallback
  }
}

export async function apiGetBrands(): Promise<Brand[]> {
  try {
    const res = await fetch(apiUrl('/api/brands'), { credentials: 'include' })
    if (!res.ok) throw new Error('Không tải được danh sách hãng')
    const data = await res.json() as unknown
    return sortBrands(Array.isArray(data) ? data as Brand[] : [])
  } catch {
    return import.meta.env.DEV ? readLocal() : []
  }
}

export async function apiUpsertBrand(input: BrandInput): Promise<Brand> {
  try {
    const res = await fetch(apiUrl('/api/brands'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    })
    if (!res.ok) throw new Error(await responseError(res, 'Không lưu được hãng'))
    return await res.json() as Brand
  } catch (error) {
    if (!import.meta.env.DEV) throw error
    const now = Date.now()
    const brands = readLocal()
    const index = brands.findIndex((brand) => brand.id === input.id)
    const saved: Brand = {
      ...input,
      createdAt: index >= 0 ? brands[index].createdAt : now,
      updatedAt: now,
    }
    if (index >= 0) brands[index] = saved
    else brands.push(saved)
    writeLocal(brands)
    return saved
  }
}

export async function apiDeleteBrand(id: string): Promise<void> {
  try {
    const res = await fetch(apiUrl(`/api/brands/${encodeURIComponent(id)}`), {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!res.ok) throw new Error(await responseError(res, 'Không xóa được hãng'))
  } catch (error) {
    if (!import.meta.env.DEV) throw error
    writeLocal(readLocal().filter((brand) => brand.id !== id))
  }
}
