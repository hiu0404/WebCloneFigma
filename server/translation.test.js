import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { createTranslationService } from './translation.js'

test('translation keeps requests below provider byte limit and reuses saved translations', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ecolink-translation-'))
  const cacheFile = path.join(directory, 'translations.json')
  const requests = []
  const fetchImpl = async (url) => {
    const text = url.searchParams.get('q')
    requests.push(text)
    assert.ok(Buffer.byteLength(text, 'utf8') <= 500)
    assert.equal(url.searchParams.get('langpair'), 'vi|en')
    return { ok: true, json: async () => ({ responseStatus: 200, responseData: { translatedText: `EN ${text}` } }) }
  }

  try {
    const service = createTranslationService({ cacheFile, fetchImpl })
    const source = 'Thiết bị y tế '.repeat(80)
    const [first, concurrent] = await Promise.all([service.translate(source), service.translate(source)])
    assert.equal(first, concurrent)
    assert.ok(requests.length > 1)
    service.save()
    const requestCount = requests.length
    const saved = createTranslationService({ cacheFile, fetchImpl })
    assert.equal(await saved.translate(source), first)
    assert.equal(requests.length, requestCount)
  } finally {
    if (fs.existsSync(cacheFile)) fs.unlinkSync(cacheFile)
    fs.rmdirSync(directory)
  }
})
