const API_PORT = Number(import.meta.env.VITE_API_PORT) || 5175

function envReferencesLoopback(base: string): boolean {
  return /\blocalhost\b|127\.0\.0\.1|\[::1\]/i.test(base)
}

function pageIsPublicOrigin(): boolean {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return h !== 'localhost' && h !== '127.0.0.1' && h !== '[::1]'
}

function resolveApiBase(): string {
  // Dev: same-origin paths -> Vite proxies /api and /uploads.
  if (import.meta.env.DEV) return ''

  const raw = import.meta.env.VITE_API_BASE as string | undefined
  if (raw !== undefined) {
    const trimmed = String(raw).trim()
    if (trimmed === '' || trimmed === '/' || trimmed === '.') return ''
    const fromEnv = trimmed.replace(/\/$/, '')
    if (fromEnv && !(pageIsPublicOrigin() && envReferencesLoopback(fromEnv))) return fromEnv
  }

  // Production default: relative /api and /uploads behind the same reverse proxy.
  if (typeof window !== 'undefined') return ''

  return `http://localhost:${API_PORT}`
}

let cachedBase: string | null = null

export function apiBase(): string {
  if (cachedBase == null) cachedBase = resolveApiBase()
  return cachedBase
}

export function apiUrl(path: string) {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${apiBase()}${p}`
}
