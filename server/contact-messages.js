import crypto from 'node:crypto'
import fs from 'node:fs'

const MAX_NAME = 120
const MAX_PHONE = 24
const MAX_SUBJECT = 160
const MAX_MESSAGE = 5000

export function validateContactMessage(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Dữ liệu liên hệ không hợp lệ.' }
  }

  const fields = ['name', 'phone', 'subject', 'message']
  if (fields.some((field) => typeof body[field] !== 'string')) {
    return { error: 'Vui lòng nhập đầy đủ thông tin liên hệ.' }
  }

  const name = body.name.trim()
  const phone = body.phone.trim()
  const subject = body.subject.trim()
  const message = body.message.trim()

  if (name.length < 2 || name.length > MAX_NAME) return { error: 'Họ và tên phải từ 2 đến 120 ký tự.' }
  if (subject.length < 2 || subject.length > MAX_SUBJECT) return { error: 'Tiêu đề phải từ 2 đến 160 ký tự.' }
  if (message.length < 10 || message.length > MAX_MESSAGE) return { error: 'Nội dung phải từ 10 đến 5000 ký tự.' }
  if (phone.length > MAX_PHONE || !/^[+()\d.\s-]+$/.test(phone)) return { error: 'Số điện thoại không hợp lệ.' }
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 9 || digits.length > 15) return { error: 'Số điện thoại không hợp lệ.' }

  return { value: { name, phone, subject, message } }
}

export function createContactMessageStore(filePath) {
  function read() {
    if (!fs.existsSync(filePath)) return []
    const messages = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    if (!Array.isArray(messages)) throw new Error('Contact messages file is not an array')
    return messages
  }

  function write(messages) {
    const temporaryPath = `${filePath}.${process.pid}.${crypto.randomUUID()}.tmp`
    try {
      fs.writeFileSync(temporaryPath, `${JSON.stringify(messages, null, 2)}\n`, { encoding: 'utf-8', flag: 'wx', mode: 0o600 })
      fs.renameSync(temporaryPath, filePath)
    } catch (error) {
      if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath)
      throw error
    }
  }

  return {
    list() {
      return read().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    },
    unreadCount() {
      return read().filter((message) => !message.readAt).length
    },
    add(value) {
      const messages = read()
      const record = {
        id: crypto.randomUUID(),
        ...value,
        createdAt: new Date().toISOString(),
        readAt: null,
      }
      messages.push(record)
      write(messages)
      return record
    },
    markRead(id) {
      const messages = read()
      const record = messages.find((message) => message.id === id)
      if (!record) return null
      if (!record.readAt) {
        record.readAt = new Date().toISOString()
        write(messages)
      }
      return record
    },
  }
}
