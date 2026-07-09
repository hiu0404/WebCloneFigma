import { apiUrl } from './apiClient'

export type AdminSession = {
  email: string
  expiresAt: number
  recoveryCodesRemaining?: number
}

export type AdminSecurityStatus = {
  email: string
  jwtTtlSeconds: number
  recoveryCodesRemaining: number
  totpUpdatedAt: number | null
  pendingTotpReset: boolean
}

export type TotpResetStart = {
  manualKey: string
  expiresAt: number
}

export type TotpResetConfirm = {
  recoveryCodes: string[]
  recoveryCodesRemaining: number
}

type LoginStartResponse = {
  challengeId: string
  expiresInSeconds: number
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

export async function startAdminLogin(email: string, password: string): Promise<LoginStartResponse> {
  const res = await fetch(apiUrl('/api/admin/login/start'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(await readApiError(res, 'Dang nhap khong thanh cong'))
  return (await res.json()) as LoginStartResponse
}

export async function completeAdminLogin(challengeId: string, code: string): Promise<AdminSession> {
  const res = await fetch(apiUrl('/api/admin/login/totp'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ challengeId, code }),
  })
  if (!res.ok) throw new Error(await readApiError(res, 'Ma Google Authenticator khong dung'))
  return (await res.json()) as AdminSession
}

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const res = await fetch(apiUrl('/api/admin/me'), { credentials: 'include' })
    if (!res.ok) return null
    return (await res.json()) as AdminSession
  } catch {
    return null
  }
}

export async function logoutAdminSession(): Promise<void> {
  await fetch(apiUrl('/api/admin/logout'), {
    method: 'POST',
    credentials: 'include',
  })
}

export async function getAdminSecurityStatus(): Promise<AdminSecurityStatus> {
  const res = await fetch(apiUrl('/api/admin/security'), { credentials: 'include' })
  if (!res.ok) throw new Error(await readApiError(res, 'Khong tai duoc trang thai bao mat'))
  return (await res.json()) as AdminSecurityStatus
}

export async function startTotpReset(): Promise<TotpResetStart> {
  const res = await fetch(apiUrl('/api/admin/totp/reset/start'), {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) throw new Error(await readApiError(res, 'Khong tao duoc khoa thiet lap moi'))
  return (await res.json()) as TotpResetStart
}

export async function confirmTotpReset(code: string): Promise<TotpResetConfirm> {
  const res = await fetch(apiUrl('/api/admin/totp/reset/confirm'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ code }),
  })
  if (!res.ok) throw new Error(await readApiError(res, 'Ma Google Authenticator khong dung'))
  return (await res.json()) as TotpResetConfirm
}

export async function cancelTotpReset(): Promise<void> {
  const res = await fetch(apiUrl('/api/admin/totp/reset/cancel'), {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) throw new Error(await readApiError(res, 'Khong huy duoc reset'))
}
