export type InstallationPhoto = {
  url: string
  caption?: string
}

export function normalizeInstallationPhotos(value: unknown): InstallationPhoto[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const photo = item as Partial<InstallationPhoto>
    const url = typeof photo.url === 'string' ? photo.url.trim() : ''
    if (!url) return []
    const caption = typeof photo.caption === 'string' ? photo.caption.trim() : ''
    return [{ url, ...(caption ? { caption } : {}) }]
  })
}

export function installationPhotosMatch(expected: unknown, actual: unknown): boolean {
  const comparable = (value: unknown) => normalizeInstallationPhotos(value).map((photo) => {
    let url = photo.url
    try {
      const parsed = new URL(url)
      if (
        parsed.pathname.startsWith('/uploads') &&
        ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)
      ) {
        url = `${parsed.pathname}${parsed.search}`
      }
    } catch {
      // Relative upload paths are already comparable.
    }
    return { url, caption: photo.caption || '' }
  })
  return JSON.stringify(comparable(expected)) === JSON.stringify(comparable(actual))
}
