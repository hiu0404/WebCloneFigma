import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, test } from 'node:test'
import { createNewsStore, NewsError, newsSlug } from './news.js'

const directories = []
afterEach(() => {
  for (const dir of directories.splice(0)) fs.rmSync(dir, { recursive: true, force: true })
})

function store() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ecolink-news-'))
  directories.push(dir)
  return createNewsStore(path.join(dir, 'news.json'))
}

const article = {
  title: 'Máy xử lý mô tự động', category: 'Thiết bị',
  excerpt: 'Thông tin về thiết bị.', content: 'Nội dung bài viết.',
  publishedAt: '2026-11-21', status: 'draft',
}

test('drafts stay out of public news until published', () => {
  const news = store()
  const draft = news.save(article)
  assert.equal(draft.slug, 'may-xu-ly-mo-tu-dong')
  assert.equal(news.list().length, 1)
  assert.equal(news.published().length, 0)
  assert.equal(news.findPublished(draft.slug), null)

  const published = news.save({ ...draft, status: 'published' }, draft.id)
  assert.equal(news.findPublished(published.slug)?.id, draft.id)
  assert.equal(news.published().length, 1)
  news.remove(draft.id)
  assert.equal(news.list().length, 0)
})

test('slugs stay unique and reject unsafe or incomplete publications', () => {
  const news = store()
  news.save(article)
  assert.throws(() => news.save({ ...article, title: 'Máy xử lý mô tự động' }), (error) => error instanceof NewsError && error.status === 409)
  assert.throws(() => news.save({ ...article, title: 'Thiết bị mới', sourceUrl: 'javascript:alert(1)' }), /Liên kết/)
  assert.throws(() => news.save({ ...article, title: 'Thiết bị mới', content: '', status: 'published' }), /nội dung/)
  assert.equal(newsSlug('Đường tiếp cận mạch máu'), 'duong-tiep-can-mach-mau')
})

test('seeded articles have unique links and the three new posts', () => {
  const items = JSON.parse(fs.readFileSync(new URL('./data-example/news.json', import.meta.url), 'utf-8'))
  assert.equal(items.length, 9)
  assert.equal(new Set(items.map((item) => item.slug)).size, items.length)
  assert.equal(items.filter((item) => item.featured && item.status === 'published').length, 3)
  assert.ok(items.every((item) => item.title && item.excerpt && item.publishedAt))
})
