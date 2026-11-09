import { apiUrl } from '../lib/apiClient'

export type ContactInput = {
  name: string
  phone: string
  email?: string
  subject: string
  message: string
  website?: string
}

export type ContactMessage = Omit<ContactInput, 'website'> & {
  id: string
  createdAt: string
  readAt: string | null
}

async function apiError(response: Response, fallback: string): Promise<Error> {
  try {
    const body = (await response.json()) as { error?: string }
    if (body.error) return new Error(body.error)
  } catch {
    // The server might return a non-JSON error page.
  }
  return new Error(fallback)
}

export async function sendContactMessage(input: ContactInput): Promise<void> {
  const response = await fetch(apiUrl('/api/contact-messages'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) throw await apiError(response, 'Không thể gửi yêu cầu. Vui lòng thử lại.')
}

export async function getUnreadContactCount(): Promise<number> {
  const response = await fetch(apiUrl('/api/admin/contact-messages/unread-count'), {
    credentials: 'include',
    cache: 'no-store',
  })
  if (!response.ok) throw await apiError(response, 'Không thể tải số thông báo mới.')
  const body = (await response.json()) as { unread: number }
  return body.unread
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const response = await fetch(apiUrl('/api/admin/contact-messages'), {
    credentials: 'include',
    cache: 'no-store',
  })
  if (!response.ok) throw await apiError(response, 'Không thể tải yêu cầu liên hệ.')
  return (await response.json()) as ContactMessage[]
}

export async function markContactMessageRead(id: string): Promise<ContactMessage> {
  const response = await fetch(apiUrl(`/api/admin/contact-messages/${encodeURIComponent(id)}/read`), {
    method: 'PATCH',
    credentials: 'include',
  })
  if (!response.ok) throw await apiError(response, 'Không thể đánh dấu đã đọc.')
  return (await response.json()) as ContactMessage
}
