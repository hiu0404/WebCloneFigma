import { apiUrl } from '../lib/apiClient'
import type { InstallationInput, InstallationRecord, PublicInstallation } from '../data/installations'
import type { ProductKind } from '../lib/seo'

async function responseError(response: Response, fallback: string) {
  try {
    const body = await response.json() as { error?: string }
    return body.error || fallback
  } catch {
    return fallback
  }
}

export async function apiGetInstallations(productType?: ProductKind, productId?: string): Promise<PublicInstallation[]> {
  const query = productType && productId ? `?productType=${encodeURIComponent(productType)}&productId=${encodeURIComponent(productId)}` : ''
  const response = await fetch(apiUrl(`/api/installations${query}`))
  if (!response.ok) throw new Error(await responseError(response, 'Không tải được công trình'))
  return await response.json() as PublicInstallation[]
}

export async function apiGetInstallation(slug: string): Promise<PublicInstallation> {
  const response = await fetch(apiUrl(`/api/installations/${encodeURIComponent(slug)}`))
  if (!response.ok) throw new Error(await responseError(response, 'Không tìm thấy công trình'))
  return await response.json() as PublicInstallation
}

export async function apiGetAdminInstallations(): Promise<InstallationRecord[]> {
  const response = await fetch(apiUrl('/api/admin/installations'), { credentials: 'include' })
  if (response.status === 404) throw new Error('Server chưa có API công trình. Cần cập nhật backend Express để xem và lưu dữ liệu.')
  if (!response.ok) throw new Error(await responseError(response, 'Không tải được danh sách công trình'))
  return await response.json() as InstallationRecord[]
}

export async function apiSaveInstallation(input: InstallationInput): Promise<InstallationRecord> {
  const response = await fetch(apiUrl('/api/admin/installations'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  })
  if (response.status === 404) throw new Error('Server chưa có API công trình. Cần cập nhật backend Express để lưu dữ liệu.')
  if (!response.ok) throw new Error(await responseError(response, 'Không lưu được công trình'))
  return await response.json() as InstallationRecord
}

async function preparePublicImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.size > 20 * 1024 * 1024) {
    throw new Error('Chọn file ảnh tối đa 20 MB')
  }
  const bitmap = await createImageBitmap(file)
  try {
    const ratio = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio))
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Trình duyệt không xử lý được ảnh')
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.84))
    if (!blob || blob.type !== 'image/webp') throw new Error('Trình duyệt không hỗ trợ xuất ảnh WebP')
    return new File([blob], 'installation.webp', { type: 'image/webp' })
  } finally {
    bitmap.close()
  }
}

export async function apiUploadInstallationImage(file: File): Promise<string> {
  const prepared = await preparePublicImage(file)
  const body = new FormData()
  body.append('file', prepared)
  body.append('privacyReviewed', 'true')
  const response = await fetch(apiUrl('/api/admin/installations/upload-image'), {
    method: 'POST', credentials: 'include', body,
  })
  if (response.status === 404) throw new Error('Server chưa có API ảnh công trình. Cần cập nhật backend Express để tải ảnh.')
  if (!response.ok) throw new Error(await responseError(response, 'Không tải ảnh lên được'))
  const result = await response.json() as { url: string }
  return result.url
}
