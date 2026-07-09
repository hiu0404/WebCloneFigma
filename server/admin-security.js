import crypto from 'node:crypto'

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const RECOVERY_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const SCRYPT_N = 16384
const SCRYPT_R = 8
const SCRYPT_P = 1
const SCRYPT_KEY_LEN = 64

export function base32Encode(buffer) {
  let bits = 0
  let value = 0
  let out = ''
  for (const byte of buffer) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  return out
}

export function decodeBase32(secret) {
  const clean = String(secret).toUpperCase().replace(/[^A-Z2-7]/g, '')
  let bits = 0
  let value = 0
  const bytes = []
  for (const char of clean) {
    const idx = BASE32_ALPHABET.indexOf(char)
    if (idx < 0) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }
  return Buffer.from(bytes)
}

export function generateTotpSecret() {
  return base32Encode(crypto.randomBytes(20))
}

export function fingerprintTotpSecret(secret) {
  return crypto.createHash('sha256').update(`totp-secret:${secret}`).digest('hex').slice(0, 16)
}

export function hashSecret(value) {
  const salt = crypto.randomBytes(16)
  const hash = crypto.scryptSync(String(value), salt, SCRYPT_KEY_LEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: 64 * 1024 * 1024,
  })
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString('base64url')}$${hash.toString('base64url')}`
}

export function verifyHash(value, storedHash) {
  try {
    const parts = String(storedHash).split('$')
    if (parts[0] !== 'scrypt' || parts.length !== 6) return false
    const n = Number(parts[1])
    const r = Number(parts[2])
    const p = Number(parts[3])
    const salt = Buffer.from(parts[4], 'base64url')
    const expected = Buffer.from(parts[5], 'base64url')
    if (!n || !r || !p || expected.length < 32) return false
    const actual = crypto.scryptSync(String(value), salt, expected.length, {
      N: n,
      r,
      p,
      maxmem: 64 * 1024 * 1024,
    })
    return crypto.timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}

function encryptionKeyFromEnv(value) {
  const raw = String(value ?? '').trim()
  if (!raw) throw new Error('Missing ADMIN_SECRET_ENCRYPTION_KEY')

  const decoded = Buffer.from(raw, 'base64url')
  if (decoded.length === 32) return decoded

  const hex = Buffer.from(raw, 'hex')
  if (hex.length === 32) return hex

  throw new Error('ADMIN_SECRET_ENCRYPTION_KEY must be 32 bytes base64url or hex')
}

export function encryptString(plaintext, keyValue) {
  const key = encryptionKeyFromEnv(keyValue)
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return {
    v: 1,
    alg: 'aes-256-gcm',
    iv: iv.toString('base64url'),
    tag: tag.toString('base64url'),
    ciphertext: ciphertext.toString('base64url'),
  }
}

export function decryptString(payload, keyValue) {
  if (!payload || payload.alg !== 'aes-256-gcm') throw new Error('Unsupported encrypted payload')
  const key = encryptionKeyFromEnv(keyValue)
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(payload.iv, 'base64url'))
  decipher.setAuthTag(Buffer.from(payload.tag, 'base64url'))
  return Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, 'base64url')),
    decipher.final(),
  ]).toString('utf8')
}

function randomRecoveryPart(length) {
  let out = ''
  for (let i = 0; i < length; i += 1) {
    out += RECOVERY_ALPHABET[crypto.randomInt(RECOVERY_ALPHABET.length)]
  }
  return out
}

export function normalizeRecoveryCode(value) {
  return String(value ?? '').toUpperCase().replace(/[^A-Z2-9]/g, '')
}

export function generateRecoveryCodes(count = 10) {
  const codes = new Set()
  while (codes.size < count) {
    codes.add(`${randomRecoveryPart(4)}-${randomRecoveryPart(4)}-${randomRecoveryPart(4)}`)
  }
  return [...codes]
}

export function hashRecoveryCodes(codes) {
  const now = Date.now()
  return codes.map((code) => ({
    id: crypto.randomBytes(8).toString('base64url'),
    hash: hashSecret(normalizeRecoveryCode(code)),
    createdAt: now,
    usedAt: null,
  }))
}

export function verifyTotpCode(secret, code, nowMs = Date.now()) {
  const clean = String(code ?? '').replace(/\s+/g, '')
  if (!/^\d{6}$/.test(clean)) return false
  const counter = Math.floor(nowMs / 30_000)
  for (let offset = -1; offset <= 1; offset += 1) {
    if (safeEqualString(hotp(secret, counter + offset), clean)) return true
  }
  return false
}

function hotp(secret, counter) {
  const key = decodeBase32(secret)
  const msg = Buffer.alloc(8)
  msg.writeUInt32BE(Math.floor(counter / 0x100000000), 0)
  msg.writeUInt32BE(counter >>> 0, 4)
  const digest = crypto.createHmac('sha1', key).update(msg).digest()
  const offset = digest[digest.length - 1] & 0xf
  const code =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff)
  return String(code % 1_000_000).padStart(6, '0')
}

export function safeEqualString(a, b) {
  const left = Buffer.from(String(a))
  const right = Buffer.from(String(b))
  if (left.length !== right.length) return false
  return crypto.timingSafeEqual(left, right)
}
