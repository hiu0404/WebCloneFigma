import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { after, test } from 'node:test'
import { createContactMessageStore, validateContactMessage } from './contact-messages.js'

const temporaryDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ecolink-contact-test-'))
const filePath = path.join(temporaryDir, 'contact-messages.json')

after(() => fs.rmSync(temporaryDir, { recursive: true, force: true }))

const validMessage = {
  name: 'Nguyễn Văn A',
  phone: '+84 912 345 678',
  subject: 'Tư vấn sản phẩm',
  message: 'Tôi muốn được tư vấn về sản phẩm này.',
}

test('validates required contact fields and phone number', () => {
  assert.deepEqual(validateContactMessage(validMessage).value, validMessage)
  assert.ok(validateContactMessage({ ...validMessage, name: '' }).error)
  assert.ok(validateContactMessage({ ...validMessage, phone: 'abc' }).error)
  assert.ok(validateContactMessage({ ...validMessage, message: 'ngắn' }).error)
  assert.ok(validateContactMessage({ ...validMessage, subject: 'a'.repeat(161) }).error)
})

test('stores new requests and marks them read without changing other records', () => {
  const store = createContactMessageStore(filePath)
  assert.deepEqual(store.list(), [])
  assert.equal(fs.existsSync(filePath), false)

  const first = store.add(validMessage)
  const second = store.add({ ...validMessage, subject: 'Yêu cầu thứ hai' })
  assert.equal(store.list().length, 2)
  assert.equal(store.unreadCount(), 2)
  assert.equal(store.list()[0].id, second.id)
  assert.equal(store.markRead('missing'), null)

  const updated = store.markRead(first.id)
  assert.ok(updated.readAt)
  assert.equal(store.unreadCount(), 1)
  assert.equal(store.list().find((item) => item.id === second.id)?.readAt, null)
})

test('does not overwrite a malformed contact file', () => {
  fs.writeFileSync(filePath, '{invalid json', 'utf-8')
  const store = createContactMessageStore(filePath)
  assert.throws(() => store.add(validMessage))
  assert.equal(fs.readFileSync(filePath, 'utf-8'), '{invalid json')
})
