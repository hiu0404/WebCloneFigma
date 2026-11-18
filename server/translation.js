import fs from 'node:fs'

const DEFAULT_ENDPOINT = 'https://api.mymemory.translated.net/get'
const MAX_SEGMENT_BYTES = 450

function splitText(text) {
  const segments = []
  let segment = ''
  for (const word of text.trim().match(/\S+\s*/gu) ?? []) {
    if (Buffer.byteLength(segment + word, 'utf8') <= MAX_SEGMENT_BYTES) {
      segment += word
      continue
    }
    if (segment.trim()) segments.push(segment.trim())
    segment = ''
    for (const character of word) {
      if (Buffer.byteLength(segment + character, 'utf8') > MAX_SEGMENT_BYTES) {
        if (segment.trim()) segments.push(segment.trim())
        segment = ''
      }
      segment += character
    }
  }
  if (segment.trim()) segments.push(segment.trim())
  return segments
}

function decodeEntities(value) {
  return value.replace(/&(#(?:x[0-9a-f]+|\d+)|amp|quot|apos|lt|gt);/gi, (entity, code) => {
    const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }
    if (named[code.toLowerCase()]) return named[code.toLowerCase()]
    if (code[0] !== '#') return entity
    const point = code[1]?.toLowerCase() === 'x' ? Number.parseInt(code.slice(2), 16) : Number.parseInt(code.slice(1), 10)
    return Number.isFinite(point) && point >= 0 && point <= 0x10ffff ? String.fromCodePoint(point) : entity
  })
}

export function createTranslationService({ cacheFile, fetchImpl = fetch, endpoint = DEFAULT_ENDPOINT, contactEmail = '' }) {
  let saved = {}
  try { saved = JSON.parse(fs.readFileSync(cacheFile, 'utf8')) } catch { /* first run */ }
  const cache = new Map(Object.entries(saved))
  const pending = new Map()
  let dirty = false

  async function translateSegment(text) {
    const url = new URL(endpoint)
    url.searchParams.set('q', text)
    url.searchParams.set('langpair', 'vi|en')
    if (contactEmail) url.searchParams.set('de', contactEmail)
    const response = await fetchImpl(url, { signal: AbortSignal.timeout(12000) })
    if (!response.ok) throw new Error(`Translation provider returned ${response.status}`)
    const payload = await response.json()
    const translated = payload?.responseData?.translatedText
    if (payload?.responseStatus !== 200 || typeof translated !== 'string' || !translated.trim()) {
      throw new Error('Translation provider did not return a translation')
    }
    return decodeEntities(translated.trim())
  }

  async function translate(text) {
    const source = text.trim()
    if (!source) return ''
    if (cache.has(source)) return cache.get(source)
    if (pending.has(source)) return pending.get(source)
    const request = (async () => {
      const parts = splitText(source)
      const translated = (await Promise.all(parts.map(translateSegment))).join(' ')
      cache.set(source, translated)
      dirty = true
      return translated
    })()
    pending.set(source, request)
    try { return await request } finally { pending.delete(source) }
  }

  function save() {
    if (!dirty) return
    const tempFile = `${cacheFile}.tmp`
    fs.writeFileSync(tempFile, JSON.stringify(Object.fromEntries(cache), null, 2), 'utf8')
    fs.renameSync(tempFile, cacheFile)
    dirty = false
  }

  return { translate, save }
}
