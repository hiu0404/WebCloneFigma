import cors from 'cors'
import crypto from 'node:crypto'
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import multer from 'multer'
import {
  decryptString,
  encryptString,
  fingerprintTotpSecret,
  generateRecoveryCodes,
  generateTotpSecret,
  hashRecoveryCodes,
  normalizeRecoveryCode,
  verifyHash,
  verifyTotpCode,
} from './admin-security.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const dataDir = path.join(root, 'server', 'data')
const dataExampleDir = path.join(root, 'server', 'data-example')
const uploadsDir = path.join(root, 'public', 'uploads')
const productUploadsDir = path.join(uploadsDir, 'products')
const productsFile = path.join(dataDir, 'products.json')
const categoriesFile = path.join(dataDir, 'categories.json')
const microscopeCategoriesFile = path.join(dataDir, 'microscope-categories.json')
const microscopesFile = path.join(dataDir, 'microscopes.json')
const forensicProductsFile = path.join(dataDir, 'forensic-products.json')
const piccProductsFile = path.join(dataDir, 'picc-products.json')
const brandsFile = path.join(dataDir, 'brands.json')
const adminAuthFile = path.join(dataDir, 'admin-auth.json')
const adminRateLimitFile = path.join(dataDir, 'admin-rate-limit.json')
const adminAuditLogFile = path.join(dataDir, 'admin-auth.log')
const distDir = path.join(root, 'dist')

const runtimeJsonFiles = [
  'products.json',
  'categories.json',
  'microscope-categories.json',
  'microscopes.json',
  'forensic-products.json',
  'picc-products.json',
  'brands.json',
]

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  const raw = fs.readFileSync(filePath, 'utf-8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

function ensureRuntimeJsonFile(fileName) {
  const runtimeFile = path.join(dataDir, fileName)
  if (fs.existsSync(runtimeFile)) return

  const exampleFile = path.join(dataExampleDir, fileName)
  if (fs.existsSync(exampleFile)) {
    fs.copyFileSync(exampleFile, runtimeFile)
    return
  }

  fs.writeFileSync(runtimeFile, '[]\n', 'utf-8')
}

loadEnvFile(path.join(root, '.env.local'))
loadEnvFile(path.join(root, '.env'))

const configuredCorsOrigins = String(process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean)
const devCorsOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i

function corsOrigin(origin, cb) {
  if (!origin) return cb(null, true)
  if (configuredCorsOrigins.length > 0) return cb(null, configuredCorsOrigins.includes(origin))
  return cb(null, devCorsOriginPattern.test(origin))
}

const app = express()
app.set('trust proxy', 1)
app.use(cors({ origin: corsOrigin, credentials: true }))
app.use(express.json({ limit: '2mb' }))

fs.mkdirSync(dataDir, { recursive: true })
fs.mkdirSync(uploadsDir, { recursive: true })
fs.mkdirSync(productUploadsDir, { recursive: true })
for (const fileName of runtimeJsonFiles) ensureRuntimeJsonFile(fileName)

const AUTH_COOKIE_NAME = 'admin_token'
const ADMIN_SECRET_ENCRYPTION_KEY = String(process.env.ADMIN_SECRET_ENCRYPTION_KEY ?? '').trim()
const ADMIN_JWT_SECRET = String(process.env.ADMIN_JWT_SECRET ?? '').trim()
const ADMIN_JWT_TTL_SECONDS = Math.min(
  Math.max(Number(process.env.ADMIN_JWT_TTL_SECONDS) || 12 * 60 * 60, 5 * 60),
  7 * 24 * 60 * 60,
)
const LOGIN_CHALLENGE_TTL_MS = 5 * 60 * 1000
const TOTP_RESET_TTL_MS = 10 * 60 * 1000
const LOGIN_MAX_FAILURES = Math.min(Math.max(Number(process.env.ADMIN_LOGIN_MAX_FAILURES) || 5, 3), 20)
const LOGIN_WINDOW_MS =
  Math.min(Math.max(Number(process.env.ADMIN_LOGIN_WINDOW_MINUTES) || 15, 1), 24 * 60) * 60 * 1000
const LOGIN_LOCK_MS = Math.min(Math.max(Number(process.env.ADMIN_LOGIN_LOCK_MINUTES) || 15, 1), 24 * 60) * 60 * 1000
const loginChallenges = new Map()

function adminAuthConfigured() {
  const record = readAdminAuthRecord()
  return Boolean(
    ADMIN_JWT_SECRET &&
      ADMIN_SECRET_ENCRYPTION_KEY &&
      record?.email &&
      record?.passwordHash &&
      record?.totp?.encryptedSecret,
  )
}

function base64UrlJson(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function safeEqualString(a, b) {
  const left = Buffer.from(String(a))
  const right = Buffer.from(String(b))
  if (left.length !== right.length) return false
  return crypto.timingSafeEqual(left, right)
}

function signAdminToken(email) {
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    sub: 'admin',
    email,
    iat: now,
    exp: now + ADMIN_JWT_TTL_SECONDS,
  }
  const data = `${base64UrlJson({ alg: 'HS256', typ: 'JWT' })}.${base64UrlJson(payload)}`
  const signature = crypto.createHmac('sha256', ADMIN_JWT_SECRET).update(data).digest('base64url')
  return { token: `${data}.${signature}`, payload }
}

function verifyAdminToken(token) {
  try {
    const parts = String(token ?? '').split('.')
    if (parts.length !== 3 || !ADMIN_JWT_SECRET) return null
    const record = readAdminAuthRecord()
    if (!record?.email) return null
    const data = `${parts[0]}.${parts[1]}`
    const expected = crypto.createHmac('sha256', ADMIN_JWT_SECRET).update(data).digest('base64url')
    if (!safeEqualString(expected, parts[2])) return null
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'))
    const now = Math.floor(Date.now() / 1000)
    if (payload?.sub !== 'admin' || payload?.email !== record.email || Number(payload?.exp) <= now) return null
    return payload
  } catch {
    return null
  }
}

function parseCookies(req) {
  const header = req.headers.cookie
  const out = {}
  if (!header) return out
  for (const pair of header.split(';')) {
    const idx = pair.indexOf('=')
    if (idx < 0) continue
    const key = pair.slice(0, idx).trim()
    const value = pair.slice(idx + 1).trim()
    out[key] = decodeURIComponent(value)
  }
  return out
}

function shouldUseSecureCookie(req) {
  return process.env.ADMIN_COOKIE_SECURE === '1' || req.secure || req.get('x-forwarded-proto') === 'https'
}

function setAdminCookie(req, res, token, maxAgeSeconds) {
  const attrs = [
    `Max-Age=${maxAgeSeconds}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
  ]
  if (shouldUseSecureCookie(req)) attrs.push('Secure')
  res.setHeader('Set-Cookie', `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; ${attrs.join('; ')}`)
}

function clearAdminCookie(req, res) {
  const attrs = ['Max-Age=0', 'Path=/', 'HttpOnly', 'SameSite=Strict']
  if (shouldUseSecureCookie(req)) attrs.push('Secure')
  res.setHeader('Set-Cookie', `${AUTH_COOKIE_NAME}=; ${attrs.join('; ')}`)
}

function readAdminSession(req) {
  const cookies = parseCookies(req)
  const payload = verifyAdminToken(cookies[AUTH_COOKIE_NAME])
  if (!payload) return null
  return { email: payload.email, expiresAt: Number(payload.exp) * 1000 }
}

function requireAdminApi(req, res, next) {
  if (!adminAuthConfigured()) return res.status(503).json({ error: 'Admin auth is not configured' })
  const session = readAdminSession(req)
  if (!session) return res.status(401).json({ error: 'Admin login required' })
  req.admin = session
  return next()
}

function readJsonFile(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return fallback
  }
}

function writeJsonFileAtomic(filePath, value) {
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, 'utf-8')
  fs.renameSync(tmp, filePath)
}

function readAdminAuthRecord() {
  const record = readJsonFile(adminAuthFile, null)
  if (!record || typeof record !== 'object' || record.version !== 2) return null
  return record
}

function writeAdminAuthRecord(record) {
  writeJsonFileAtomic(adminAuthFile, { ...record, updatedAt: Date.now() })
}

function remainingRecoveryCodes(record) {
  return Array.isArray(record?.recoveryCodes)
    ? record.recoveryCodes.filter((item) => !item?.usedAt).length
    : 0
}

function decryptTotpSecret(record) {
  return decryptString(record.totp.encryptedSecret, ADMIN_SECRET_ENCRYPTION_KEY)
}

function totpSecretFingerprint(record) {
  try {
    const secret = decryptTotpSecret(record)
    return fingerprintTotpSecret(secret)
  } catch {
    return 'unavailable'
  }
}

function hashForLog(value) {
  return crypto
    .createHmac('sha256', ADMIN_JWT_SECRET || 'admin-auth-log')
    .update(String(value ?? ''))
    .digest('hex')
    .slice(0, 32)
}

function clientIp(req) {
  return req.ip || req.socket.remoteAddress || 'unknown'
}

function auditAdminAuth(req, event, outcome, fields = {}) {
  const entry = {
    ts: new Date().toISOString(),
    event,
    outcome,
    ipHash: req ? hashForLog(clientIp(req)) : 'system',
    userAgent: req ? String(req.get('user-agent') ?? '').slice(0, 240) : 'server',
    ...fields,
  }
  delete entry.password
  delete entry.code
  delete entry.secret
  try {
    fs.appendFileSync(adminAuditLogFile, `${JSON.stringify(entry)}\n`, 'utf-8')
  } catch {
    /* logging must not break auth flow */
  }
}

function readRateLimitState() {
  const state = readJsonFile(adminRateLimitFile, { items: {} })
  if (!state || typeof state !== 'object' || typeof state.items !== 'object') return { items: {} }
  return state
}

function writeRateLimitState(state) {
  writeJsonFileAtomic(adminRateLimitFile, state)
}

function loginAttemptKeys(req, email, record) {
  const keys = [`ip:${hashForLog(clientIp(req))}`]
  if (record?.email && String(email ?? '').trim().toLowerCase() === record.email) {
    keys.push(`account:${hashForLog(record.email)}`)
  }
  return keys
}

function getLock(keys) {
  const now = Date.now()
  const state = readRateLimitState()
  let changed = false
  for (const [key, item] of Object.entries(state.items)) {
    if (!item?.lockUntil || item.lockUntil <= now) {
      if (!item?.resetAt || item.resetAt <= now) {
        delete state.items[key]
        changed = true
      }
    }
  }

  let locked = null
  for (const key of keys) {
    const item = state.items[key]
    if (item?.lockUntil && item.lockUntil > now) {
      locked = item
      break
    }
  }
  if (changed) writeRateLimitState(state)
  return locked
}

function recordFailedLogin(keys) {
  const now = Date.now()
  const state = readRateLimitState()
  for (const key of keys) {
    const item = state.items[key] ?? { count: 0, resetAt: now + LOGIN_WINDOW_MS, lockUntil: 0 }
    if (item.resetAt <= now && (!item.lockUntil || item.lockUntil <= now)) {
      item.count = 0
      item.resetAt = now + LOGIN_WINDOW_MS
      item.lockUntil = 0
    }
    item.count += 1
    if (item.count >= LOGIN_MAX_FAILURES) item.lockUntil = now + LOGIN_LOCK_MS
    state.items[key] = item
  }
  writeRateLimitState(state)
}

function recordSuccessfulLogin(keys) {
  const state = readRateLimitState()
  for (const key of keys) delete state.items[key]
  writeRateLimitState(state)
}

function verifySecondFactor(record, code) {
  const raw = String(code ?? '').trim()
  const secret = decryptTotpSecret(record)
  if (verifyTotpCode(secret, raw)) {
    return { ok: true, type: 'totp', secretFingerprint: totpSecretFingerprint(record) }
  }

  const normalized = normalizeRecoveryCode(raw)
  if (normalized.length >= 8 && Array.isArray(record.recoveryCodes)) {
    for (const item of record.recoveryCodes) {
      if (item?.usedAt || !item?.hash) continue
      if (verifyHash(normalized, item.hash)) {
        item.usedAt = Date.now()
        return { ok: true, type: 'recovery_code', recoveryCodeId: item.id, secretFingerprint: totpSecretFingerprint(record) }
      }
    }
  }

  return { ok: false }
}

function verifyPendingTotpReset(record, code) {
  if (!record?.pendingTotpReset?.encryptedSecret) return false
  const secret = decryptString(record.pendingTotpReset.encryptedSecret, ADMIN_SECRET_ENCRYPTION_KEY)
  return verifyTotpCode(secret, code)
}

function totpSetupPayload(secret, expiresAt) {
  return {
    manualKey: secret,
    expiresAt,
  }
}

function cleanupChallenges() {
  const now = Date.now()
  for (const [id, item] of loginChallenges.entries()) {
    if (item.expiresAt <= now) loginChallenges.delete(id)
  }
}

function logAdminAuthStartup() {
  const record = readAdminAuthRecord()
  if (!record) {
    console.warn('Admin auth DB not found. Run npm run admin:setup or npm run admin:reset-account.')
    return
  }
  const fingerprint = totpSecretFingerprint(record)
  console.log(`Admin TOTP secret fingerprint: ${fingerprint}`)
  auditAdminAuth(null, 'totp_secret_loaded', fingerprint === 'unavailable' ? 'failure' : 'success', {
    source: 'server_start',
    emailHash: hashForLog(record.email),
    secretFingerprint: fingerprint,
    totpUpdatedAt: record.totp?.updatedAt ?? null,
  })
}

function readProducts() {
  try {
    const raw = fs.readFileSync(productsFile, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeProducts(list) {
  fs.writeFileSync(productsFile, JSON.stringify(list, null, 2), 'utf-8')
}

function normalizeBrands(list) {
  return (Array.isArray(list) ? list : [])
    .map((brand, index) => ({
      ...brand,
      id: String(brand.id || '').trim(),
      name: String(brand.name || '').trim(),
      country: String(brand.country || '').trim(),
      url: String(brand.url || '').trim(),
      description: String(brand.description || '').trim(),
      imageUrl: normalizeUploadRef(String(brand.imageUrl || '').trim()),
      featured: Boolean(brand.featured),
      status: brand.status === 'hidden' ? 'hidden' : 'active',
      sortOrder: normalizeDisplayOrder(brand.sortOrder) ?? index + 1,
    }))
    .filter((brand) => brand.id && brand.name)
    .sort(compareDisplayOrder)
}

function readBrands() {
  return normalizeBrands(readJsonFile(brandsFile, []))
}

function writeBrands(list) {
  writeJsonFileAtomic(brandsFile, normalizeBrands(list))
}

const defaultMicroscopeCategories = [
  { id: 'light-microscopes', slug: 'light-microscopes', label: 'K\u00ednh hi\u1ec3n vi quang h\u1ecdc', sortOrder: 1, status: 'active' },
  { id: 'digital-microscopes', slug: 'digital-microscopes', label: 'K\u00ednh hi\u1ec3n vi k\u1ef9 thu\u1eadt s\u1ed1', sortOrder: 2, status: 'active' },
]

function normalizeMicroscopeCategory(category, index = 0) {
  const slug = String(category?.slug || category?.id || '').trim()
  const label = String(category?.label || category?.name || slug).trim()
  return {
    id: String(category?.id || slug).trim(),
    slug,
    label,
    sortOrder: Number.isFinite(Number(category?.sortOrder)) ? Number(category.sortOrder) : index + 1,
    status: category?.status === 'hidden' ? 'hidden' : 'active',
  }
}

function normalizeMicroscopeCategories(categories) {
  return (Array.isArray(categories) ? categories : [])
    .map(normalizeMicroscopeCategory)
    .filter((item) => item.id && item.slug && item.label)
    .sort(sortCategoryNodes)
}

function readMicroscopeCategories() {
  const parsed = readJsonFile(microscopeCategoriesFile, [])
  if (Array.isArray(parsed) && parsed.length > 0) return normalizeMicroscopeCategories(parsed)
  const seeded = normalizeMicroscopeCategories(defaultMicroscopeCategories)
  writeMicroscopeCategories(seeded)
  return seeded
}

function writeMicroscopeCategories(list) {
  writeJsonFileAtomic(microscopeCategoriesFile, normalizeMicroscopeCategories(list))
}

function readMicroscopes() {
  return readJsonFile(microscopesFile, [])
    .filter((item) => item && typeof item === 'object')
    .map(normalizeMicroscope)
    .filter((item) => item.id && item.name)
    .sort(compareDisplayOrder)
}

function writeMicroscopes(list) {
  writeJsonFileAtomic(microscopesFile, list.map(normalizeMicroscope).filter((item) => item.id && item.name))
}

function normalizeMicroscope(item) {
  const now = Date.now()
  return {
    id: String(item?.id || '').trim(),
    name: String(item?.name || '').trim(),
    model: String(item?.model || '').trim(),
    categorySlug: String(item?.categorySlug || '').trim(),
    imageUrl: normalizeUploadRef(String(item?.imageUrl || '').trim()) || undefined,
    shortDescription: String(item?.shortDescription || '').trim(),
    status: item?.status === 'hidden' ? 'hidden' : 'active',
    sortOrder: normalizeDisplayOrder(item?.sortOrder),
    createdAt: Number(item?.createdAt) || now,
    updatedAt: Number(item?.updatedAt) || now,
  }
}

function readForensicProducts() {
  return readJsonFile(forensicProductsFile, [])
    .filter((item) => item && typeof item === 'object')
    .map(normalizeForensicProduct)
    .filter((item) => item.id && item.name)
    .sort(compareDisplayOrder)
}

function writeForensicProducts(list) {
  writeJsonFileAtomic(forensicProductsFile, list.map(normalizeForensicProduct).filter((item) => item.id && item.name))
}

function normalizeForensicProduct(item) {
  const now = Date.now()
  return {
    id: String(item?.id || '').trim(),
    name: String(item?.name || '').trim(),
    model: String(item?.model || '').trim(),
    categorySlug: String(item?.categorySlug || '').trim(),
    imageUrl: normalizeUploadRef(String(item?.imageUrl || '').trim()) || undefined,
    shortDescription: String(item?.shortDescription || '').trim(),
    specs: String(item?.specs || '').trim() || undefined,
    status: item?.status === 'hidden' ? 'hidden' : 'active',
    sortOrder: normalizeDisplayOrder(item?.sortOrder),
    createdAt: Number(item?.createdAt) || now,
    updatedAt: Number(item?.updatedAt) || now,
  }
}

function readPiccProducts() {
  return readJsonFile(piccProductsFile, [])
    .filter((item) => item && typeof item === 'object')
    .map(normalizePiccProduct)
    .filter((item) => item.id && item.name)
    .sort(compareDisplayOrder)
}

function writePiccProducts(list) {
  writeJsonFileAtomic(piccProductsFile, list.map(normalizePiccProduct).filter((item) => item.id && item.name))
}

function normalizePiccProduct(item) {
  const now = Date.now()
  return {
    id: String(item?.id || '').trim(),
    name: String(item?.name || '').trim(),
    model: String(item?.model || '').trim(),
    categorySlug: String(item?.categorySlug || '').trim(),
    imageUrl: normalizeUploadRef(String(item?.imageUrl || '').trim()) || undefined,
    shortDescription: String(item?.shortDescription || '').trim(),
    specs: String(item?.specs || '').trim() || undefined,
    status: item?.status === 'hidden' ? 'hidden' : 'active',
    sortOrder: normalizeDisplayOrder(item?.sortOrder),
    createdAt: Number(item?.createdAt) || now,
    updatedAt: Number(item?.updatedAt) || now,
  }
}

const defaultCategories = [
  {
    id: 'equipment', slug: 'equipment', label: 'S\u1ea3n ph\u1ea9m thi\u1ebft b\u1ecb', sortOrder: 1, status: 'active',
    children: [
      { id: 'trimmingtech', slug: 'trimmingtech', label: 'B\u00e0n ph\u1eabu t\u00edch b\u1ec7nh ph\u1ea9m', sortOrder: 1, status: 'active' },
      { id: 'tissue-processing', slug: 'tissue-processing', label: 'M\u00e1y x\u1eed l\u00fd m\u00f4 b\u1ec7nh ph\u1ea9m', sortOrder: 2, status: 'active' },
      { id: 'casting', slug: 'casting', label: 'M\u00e1y \u0111\u00fac m\u00f4 b\u1ec7nh ph\u1ea9m', sortOrder: 3, status: 'active' },
      { id: 'cutting-machine', slug: 'cutting-machine', label: 'M\u00e1y c\u1eaft b\u1ec7nh ph\u1ea9m', sortOrder: 4, status: 'active' },
      { id: 'tissue-tension', slug: 'tissue-tension', label: 'B\u1ec3 c\u0103ng m\u00f4', sortOrder: 5, status: 'active' },
      { id: 'drying-table', slug: 'drying-table', label: 'B\u00e0n s\u1ea5y ti\u00eau b\u1ea3n', sortOrder: 6, status: 'active' },
      { id: 'dyeing-machine', slug: 'dyeing-machine', label: 'M\u00e1y nhu\u1ed9m ti\u00eau b\u1ea3n HE', sortOrder: 7, status: 'active' },
      { id: 'immunohistochemistry', slug: 'immunohistochemistry', label: 'M\u00e1y nhu\u1ed9m h\u00f3a m\u00f4 mi\u1ec5n d\u1ecbch', sortOrder: 8, status: 'active' },
      { id: 'laminating-machine', slug: 'laminating-machine', label: 'M\u00e1y d\u00e1n lamen t\u1ef1 \u0111\u1ed9ng', sortOrder: 9, status: 'active' },
      { id: 'scaning', slug: 'scaning', label: 'M\u00e1y qu\u00e9t ti\u00eau b\u1ea3n k\u1ef9 thu\u1eadt s\u1ed1', sortOrder: 10, status: 'active' },
      { id: 'laser-cassette', slug: 'laser-cassette', label: 'M\u00e1y in m\u00e3 v\u1ea1ch cassette', sortOrder: 11, status: 'active' },
    ],
  },
  {
    id: 'consumables',
    slug: 'consumables',
    label: 'V\u1eadt t\u01b0 ti\u00eau hao',
    sortOrder: 2,
    status: 'active',
    children: [
      { id: 'lam-kinh', slug: 'lam-kinh', label: 'Lam k\u00ednh', sortOrder: 1, status: 'active' },
      { id: 'lamen-phu-tieu-ban', slug: 'lamen-phu-tieu-ban', label: 'Lamen ph\u1ee7 ti\u00eau b\u1ea3n', sortOrder: 2, status: 'active' },
      { id: 'cassette', slug: 'cassette', label: 'Cassette', sortOrder: 3, status: 'active' },
      { id: 'luoi-dao-cat-benh-pham', slug: 'luoi-dao-cat-benh-pham', label: 'L\u01b0\u1ee1i dao c\u1eaft b\u1ec7nh ph\u1ea9m', sortOrder: 4, status: 'active' },
      { id: 'nen-hat-tinh-khiet', slug: 'nen-hat-tinh-khiet', label: 'N\u1ebfn h\u1ea1t tinh khi\u1ebft', sortOrder: 5, status: 'active' },
      { id: 'khuon-duc-inox', slug: 'khuon-duc-inox', label: 'Khu\u00f4n \u0111\u00fac inox', sortOrder: 6, status: 'active' },
    ],
  },
  {
    id: 'chemicals',
    slug: 'chemicals',
    label: 'H\u00f3a ch\u1ea5t',
    sortOrder: 3,
    status: 'active',
    children: [
      { id: 'nhuom-thuong-quy', slug: 'nhuom-thuong-quy', label: 'Nhu\u1ed9m th\u01b0\u1eddng quy', sortOrder: 1, status: 'active' },
      { id: 'nhuom-hoa-mo-mien-dich', slug: 'nhuom-hoa-mo-mien-dich', label: 'Nhu\u1ed9m h\u00f3a m\u00f4 mi\u1ec5n d\u1ecbch', sortOrder: 2, status: 'active' },
      { id: 'nhuom-dac-biet', slug: 'nhuom-dac-biet', label: 'Nhu\u1ed9m \u0111\u1eb7c bi\u1ec7t', sortOrder: 3, status: 'active' },
    ],
  },
  {
    id: 'antibodies',
    slug: 'antibodies',
    label: 'Kh\u00e1ng th\u1ec3',
    sortOrder: 4,
    status: 'active',
    children: [
      { id: 'khang-the-vitro', slug: 'khang-the-vitro', label: 'Kh\u00e1ng th\u1ec3 Vitro', sortOrder: 1, status: 'active' },
      { id: 'quartett', slug: 'quartett', label: 'Quartett', sortOrder: 2, status: 'active' },
    ],
  },
  {
    id: 'forensic-science',
    slug: 'forensic-science',
    label: 'Gi\u00e1m \u0111\u1ecbnh, khoa h\u1ecdc, k\u1ef9 thu\u1eadt, h\u00ecnh s\u1ef1',
    sortOrder: 5,
    status: 'active',
    children: [
      {
        id: 'giam-dinh-truyen-thong-co-hoc-sung-dan',
        slug: 'giam-dinh-truyen-thong-co-hoc-sung-dan',
        label: 'Truy\u1ec1n th\u1ed1ng, c\u01a1 h\u1ecdc, s\u00fang \u0111\u1ea1n',
        sortOrder: 1,
        status: 'active',
      },
      {
        id: 'giam-dinh-tai-lieu-chu-viet-tien-tem',
        slug: 'giam-dinh-tai-lieu-chu-viet-tien-tem',
        label: 'T\u00e0i li\u1ec7u, ch\u1eef vi\u1ebft, ti\u1ec1n, tem',
        sortOrder: 2,
        status: 'active',
      },
      { id: 'giam-dinh-sinh-hoc', slug: 'giam-dinh-sinh-hoc', label: 'Sinh h\u1ecdc', sortOrder: 3, status: 'active' },
      { id: 'giam-dinh-adn', slug: 'giam-dinh-adn', label: 'ADN', sortOrder: 4, status: 'active' },
    ],
  },
  {
    id: 'intensive-care',
    slug: 'intensive-care',
    label: 'H\u1ed3i s\u1ee9c t\u00edch c\u1ef1c',
    sortOrder: 6,
    status: 'active',
    children: [
      { id: 'picc-3f-1n', slug: 'picc-3f-1n', label: '(PICC) LO\u1ea0I 3F 1 n\u00f2ng', sortOrder: 1, status: 'active' },
      { id: 'picc-4f-1n', slug: 'picc-4f-1n', label: '(PICC) LO\u1ea0I 4F 1 n\u00f2ng', sortOrder: 2, status: 'active' },
      { id: 'picc-5fr-1n', slug: 'picc-5fr-1n', label: '(PICC) LO\u1ea0I 5F 1 n\u00f2ng', sortOrder: 3, status: 'active' },
      { id: 'picc-5fr-2n', slug: 'picc-5fr-2n', label: '(PICC) LO\u1ea0I 5F 2 n\u00f2ng', sortOrder: 4, status: 'active' },
      { id: 'picc-6f-3n', slug: 'picc-6f-3n', label: '(PICC) LO\u1ea0I 6F 3 n\u00f2ng', sortOrder: 5, status: 'active' },
    ],
  },
]

function sortCategoryNodes(a, b) {
  return (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) || String(a.label).localeCompare(String(b.label), 'vi')
}

function normalizeCategories(categories) {
  return categories
    .map((item, index) => ({
      ...item,
      sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : index + 1,
      status: item.status === 'hidden' ? 'hidden' : 'active',
      children: Array.isArray(item.children)
        ? item.children
            .map((child, childIndex) => ({
              ...child,
              sortOrder: Number.isFinite(Number(child.sortOrder)) ? Number(child.sortOrder) : childIndex + 1,
              status: child.status === 'hidden' ? 'hidden' : 'active',
            }))
            .sort(sortCategoryNodes)
        : [],
    }))
    .sort(sortCategoryNodes)
}

function cloneCategories(categories) {
  return normalizeCategories(categories).map((item) => ({
    ...item,
    children: Array.isArray(item.children) ? item.children.map((child) => ({ ...child })) : [],
  }))
}

function readCategories() {
  const parsed = readJsonFile(categoriesFile, [])
  if (Array.isArray(parsed) && parsed.length > 0) {
    const categories = cloneCategories(parsed)
    let changed = false
    const equipment = categories.find((item) => item.slug === 'equipment')
    const defaultEquipment = defaultCategories.find((item) => item.slug === 'equipment')
    if (equipment && defaultEquipment && !equipment.equipmentCategoriesInitialized) {
      if (equipment.children.length === 0) {
        equipment.children = defaultEquipment.children.map((child) => ({ ...child }))
      }
      equipment.equipmentCategoriesInitialized = true
      changed = true
    }
    for (const defaultCategory of defaultCategories) {
      if (!categories.some((item) => item.slug === defaultCategory.slug)) {
        categories.push({ ...defaultCategory, children: defaultCategory.children.map((child) => ({ ...child })) })
        changed = true
      }
    }
    if (changed) writeCategories(categories)
    return cloneCategories(categories)
  }
  const seeded = cloneCategories(defaultCategories)
  writeCategories(seeded)
  return seeded
}

function writeCategories(list) {
  writeJsonFileAtomic(categoriesFile, normalizeCategories(list))
}

function categorySlugExists(categories, slug, ignoreId) {
  return categories.some(
    (category) =>
      (category.slug === slug && category.id !== ignoreId) ||
      category.children.some((child) => child.slug === slug && child.id !== ignoreId),
  )
}

function findCategoryNode(categories, id) {
  for (const category of categories) {
    if (category.id === id) return { type: 'parent', category }
    const child = category.children.find((item) => item.id === id)
    if (child) return { type: 'child', parent: category, category: child }
  }
  return null
}

function productUsesCategory(product, node, parentSlug) {
  const normalized = normalizeProductCategoryFields(product)
  if (node.type === 'parent') return normalized.parentCategorySlug === node.category.slug
  return normalized.parentCategorySlug === parentSlug && normalized.categorySlug === node.category.slug
}

function migrateProductsForCategoryChange({ oldParentSlug, newParentSlug, oldChildSlug, newChildSlug }) {
  const list = readProducts().map((item) => {
    const product = normalizeProductCategoryFields(item)
    if (oldChildSlug) {
      if (product.parentCategorySlug === oldParentSlug && product.categorySlug === oldChildSlug) {
        return normalizeProductCategoryFields({
          ...product,
          category: newParentSlug,
          parentCategorySlug: newParentSlug,
          categoryId: newChildSlug,
          categorySlug: newChildSlug,
          consumableGroup: newParentSlug === 'consumables' ? newChildSlug : product.consumableGroup,
          chemicalGroup: newParentSlug === 'chemicals' ? newChildSlug : product.chemicalGroup,
        })
      }
      return product
    }
    if (product.parentCategorySlug === oldParentSlug) {
      return normalizeProductCategoryFields({
        ...product,
        category: newParentSlug,
        parentCategorySlug: newParentSlug,
      })
    }
    return product
  })
  writeProducts(list)
}

/** Dev URLs like http://localhost:5175/uploads/x break on VPS; serve as /uploads/x for any host. */
function normalizeUploadRef(url) {
  if (typeof url !== 'string') return url
  if (!/^https?:\/\//i.test(url)) return url
  try {
    const u = new URL(url)
    if (
      u.pathname.startsWith('/uploads') &&
      (u.hostname === 'localhost' || u.hostname === '127.0.0.1' || u.hostname === '[::1]')
    ) {
      return `${u.pathname}${u.search || ''}`
    }
  } catch {
    /* ignore */
  }
  return url
}

function normalizeProductImages(p) {
  if (!p || typeof p !== 'object') return p
  const next = { ...p }
  if (typeof next.imageUrl === 'string') next.imageUrl = normalizeUploadRef(next.imageUrl)
  if (Array.isArray(next.imageUrls)) next.imageUrls = next.imageUrls.map(normalizeUploadRef)
  return next
}

function normalizeDisplayOrder(value) {
  const order = Number(value)
  return Number.isFinite(order) && order > 0 ? order : undefined
}

function compareDisplayOrder(a, b) {
  const left = normalizeDisplayOrder(a?.sortOrder)
  const right = normalizeDisplayOrder(b?.sortOrder)
  if (left != null && right != null && left !== right) return left - right
  if (left != null && right == null) return -1
  if (left == null && right != null) return 1
  return (Number(a?.createdAt) || Number(a?.updatedAt) || 0) - (Number(b?.createdAt) || Number(b?.updatedAt) || 0)
}

function normalizeProductCategoryFields(p) {
  if (!p || typeof p !== 'object') return p
  const parentCategorySlug = p.parentCategorySlug || p.category || 'equipment'
  const categorySlug =
    p.categorySlug ||
    p.categoryId ||
    (parentCategorySlug === 'consumables'
      ? p.consumableGroup
      : parentCategorySlug === 'chemicals'
        ? p.chemicalGroup
        : undefined)
  return {
    ...p,
    category: parentCategorySlug,
    parentCategorySlug,
    categoryId: p.categoryId || categorySlug,
    categorySlug,
    consumableGroup: parentCategorySlug === 'consumables' ? categorySlug : p.consumableGroup,
    chemicalGroup: parentCategorySlug === 'chemicals' ? categorySlug : p.chemicalGroup,
    status: p.status || 'active',
    featured: Boolean(p.featured),
    sortOrder: normalizeDisplayOrder(p.sortOrder),
  }
}

app.post('/api/admin/login/start', (req, res) => {
  if (!adminAuthConfigured()) {
    auditAdminAuth(req, 'login_failure', 'failure', { reason: 'auth_not_configured' })
    return res.status(503).json({ error: 'Admin auth is not configured. Run npm run admin:setup first.' })
  }

  const record = readAdminAuthRecord()
  const email = String(req.body?.email ?? '').trim().toLowerCase()
  const password = String(req.body?.password ?? '')
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

  const keys = loginAttemptKeys(req, email, record)
  const locked = getLock(keys)
  if (locked) {
    auditAdminAuth(req, 'login_failure', 'failure', { reason: 'rate_limited', emailHash: hashForLog(email) })
    return res.status(429).json({
      error: 'Too many failed logins. Please try again later.',
      retryAfterSeconds: Math.ceil((locked.lockUntil - Date.now()) / 1000),
    })
  }

  const passwordOk = verifyHash(password, record.passwordHash)
  const valid = email === record.email && passwordOk
  if (!valid) {
    recordFailedLogin(keys)
    auditAdminAuth(req, 'login_failure', 'failure', { reason: 'invalid_credentials', emailHash: hashForLog(email) })
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  cleanupChallenges()
  const challengeId = crypto.randomBytes(32).toString('base64url')
  loginChallenges.set(challengeId, {
    email: record.email,
    attemptKeys: keys,
    expiresAt: Date.now() + LOGIN_CHALLENGE_TTL_MS,
    failures: 0,
    secretFingerprint: totpSecretFingerprint(record),
  })
  auditAdminAuth(req, 'login_challenge_issued', 'success', {
    emailHash: hashForLog(record.email),
    secretFingerprint: totpSecretFingerprint(record),
  })
  return res.json({ ok: true, challengeId, expiresInSeconds: Math.floor(LOGIN_CHALLENGE_TTL_MS / 1000) })
})

app.post('/api/admin/login/totp', (req, res) => {
  if (!adminAuthConfigured()) {
    auditAdminAuth(req, 'login_failure', 'failure', { reason: 'auth_not_configured' })
    return res.status(503).json({ error: 'Admin auth is not configured. Run npm run admin:setup first.' })
  }

  const record = readAdminAuthRecord()
  cleanupChallenges()
  const challengeId = String(req.body?.challengeId ?? '')
  const code = String(req.body?.code ?? '')
  const challenge = loginChallenges.get(challengeId)
  if (!challenge) {
    auditAdminAuth(req, 'login_failure', 'failure', { reason: 'expired_challenge' })
    return res.status(401).json({ error: 'Login challenge expired. Please sign in again.' })
  }

  const keys = challenge.attemptKeys ?? loginAttemptKeys(req, challenge.email, record)
  const locked = getLock(keys)
  if (locked) {
    loginChallenges.delete(challengeId)
    auditAdminAuth(req, 'login_failure', 'failure', { reason: 'rate_limited', emailHash: hashForLog(record.email) })
    return res.status(429).json({
      error: 'Too many failed logins. Please try again later.',
      retryAfterSeconds: Math.ceil((locked.lockUntil - Date.now()) / 1000),
    })
  }

  let secondFactor
  try {
    secondFactor = verifySecondFactor(record, code)
  } catch {
    auditAdminAuth(req, 'login_failure', 'failure', {
      reason: 'second_factor_unavailable',
      secretFingerprint: totpSecretFingerprint(record),
    })
    return res.status(500).json({ error: 'Second factor is unavailable' })
  }

  if (!secondFactor.ok) {
    challenge.failures += 1
    recordFailedLogin(keys)
    if (challenge.failures >= LOGIN_MAX_FAILURES) loginChallenges.delete(challengeId)
    auditAdminAuth(req, 'login_failure', 'failure', {
      reason: 'invalid_second_factor',
      emailHash: hashForLog(record.email),
      challengeSecretFingerprint: challenge.secretFingerprint ?? null,
      currentSecretFingerprint: totpSecretFingerprint(record),
    })
    return res.status(401).json({ error: 'Invalid authenticator or recovery code' })
  }

  if (secondFactor.type === 'recovery_code') writeAdminAuthRecord(record)
  recordSuccessfulLogin(keys)
  loginChallenges.delete(challengeId)
  const { token, payload } = signAdminToken(record.email)
  setAdminCookie(req, res, token, ADMIN_JWT_TTL_SECONDS)
  auditAdminAuth(req, 'login_success', 'success', {
    method: secondFactor.type,
    emailHash: hashForLog(record.email),
    secretFingerprint: secondFactor.secretFingerprint,
  })
  return res.json({
    ok: true,
    email: payload.email,
    expiresAt: payload.exp * 1000,
    recoveryCodesRemaining: remainingRecoveryCodes(record),
  })
})

app.get('/api/admin/me', (req, res) => {
  if (!adminAuthConfigured()) return res.status(503).json({ error: 'Admin auth is not configured' })
  const session = readAdminSession(req)
  if (!session) return res.status(401).json({ error: 'Admin login required' })
  return res.json({ ok: true, ...session })
})

app.post('/api/admin/logout', (req, res) => {
  const session = readAdminSession(req)
  const record = readAdminAuthRecord()
  clearAdminCookie(req, res)
  auditAdminAuth(req, 'logout', 'success', {
    ...(session ? { emailHash: hashForLog(session.email) } : {}),
    secretFingerprint: record ? totpSecretFingerprint(record) : null,
  })
  return res.json({ ok: true })
})

app.get('/api/admin/security', requireAdminApi, (req, res) => {
  const record = readAdminAuthRecord()
  const pending = record?.pendingTotpReset?.expiresAt > Date.now()
  return res.json({
    ok: true,
    email: record.email,
    jwtTtlSeconds: ADMIN_JWT_TTL_SECONDS,
    recoveryCodesRemaining: remainingRecoveryCodes(record),
    totpUpdatedAt: record.totp?.updatedAt ?? null,
    pendingTotpReset: Boolean(pending),
  })
})

app.post('/api/admin/totp/reset/start', requireAdminApi, (req, res) => {
  const record = readAdminAuthRecord()
  const now = Date.now()
  if (record.pendingTotpReset?.expiresAt > now) {
    auditAdminAuth(req, 'totp_reset_start', 'failure', { reason: 'pending_reset_exists' })
    return res.status(409).json({ error: 'A Google Authenticator reset is already pending. Confirm or cancel it first.' })
  }

  const secret = generateTotpSecret()
  const expiresAt = now + TOTP_RESET_TTL_MS
  record.pendingTotpReset = {
    encryptedSecret: encryptString(secret, ADMIN_SECRET_ENCRYPTION_KEY),
    createdAt: now,
    expiresAt,
    manualKeyIssuedAt: now,
  }
  writeAdminAuthRecord(record)
  auditAdminAuth(req, 'totp_reset_start', 'success', { emailHash: hashForLog(record.email) })
  auditAdminAuth(req, 'totp_secret_pending_reset_created', 'success', {
    emailHash: hashForLog(record.email),
    currentSecretFingerprint: totpSecretFingerprint(record),
    pendingSecretFingerprint: fingerprintTotpSecret(secret),
  })
  return res.json({ ok: true, ...totpSetupPayload(secret, expiresAt) })
})

app.post('/api/admin/totp/reset/confirm', requireAdminApi, (req, res) => {
  const record = readAdminAuthRecord()
  const now = Date.now()
  const keys = loginAttemptKeys(req, record.email, record)
  const locked = getLock(keys)
  if (locked) {
    auditAdminAuth(req, 'totp_reset_confirm', 'failure', { reason: 'rate_limited' })
    return res.status(429).json({
      error: 'Too many failed attempts. Please try again later.',
      retryAfterSeconds: Math.ceil((locked.lockUntil - now) / 1000),
    })
  }

  if (!record.pendingTotpReset?.encryptedSecret || record.pendingTotpReset.expiresAt <= now) {
    record.pendingTotpReset = null
    writeAdminAuthRecord(record)
    auditAdminAuth(req, 'totp_reset_confirm', 'failure', { reason: 'expired_or_missing_reset' })
    return res.status(400).json({ error: 'Google Authenticator reset expired. Start again.' })
  }

  if (!verifyPendingTotpReset(record, String(req.body?.code ?? ''))) {
    recordFailedLogin(keys)
    auditAdminAuth(req, 'totp_reset_confirm', 'failure', { reason: 'invalid_totp' })
    return res.status(401).json({ error: 'Invalid Google Authenticator code' })
  }

  const recoveryCodes = generateRecoveryCodes(10)
  const oldSecretFingerprint = totpSecretFingerprint(record)
  record.totp = {
    encryptedSecret: record.pendingTotpReset.encryptedSecret,
    updatedAt: now,
    lastResetAt: now,
  }
  record.recoveryCodes = hashRecoveryCodes(recoveryCodes)
  record.pendingTotpReset = null
  writeAdminAuthRecord(record)
  recordSuccessfulLogin(keys)
  auditAdminAuth(req, 'totp_reset_confirm', 'success', {
    emailHash: hashForLog(record.email),
    oldSecretFingerprint,
    newSecretFingerprint: totpSecretFingerprint(record),
  })
  return res.json({ ok: true, recoveryCodes, recoveryCodesRemaining: recoveryCodes.length })
})

app.post('/api/admin/totp/reset/cancel', requireAdminApi, (req, res) => {
  const record = readAdminAuthRecord()
  const secretFingerprint = totpSecretFingerprint(record)
  record.pendingTotpReset = null
  writeAdminAuthRecord(record)
  auditAdminAuth(req, 'totp_reset_cancel', 'success', {
    emailHash: hashForLog(record.email),
    secretFingerprint,
  })
  return res.json({ ok: true })
})

app.use('/uploads', express.static(uploadsDir))

app.get('/api/categories', (_req, res) => {
  res.json(readCategories())
})

app.post('/api/categories', requireAdminApi, (req, res) => {
  const id = String(req.body?.id || req.body?.slug || '').trim()
  const slug = String(req.body?.slug || '').trim()
  const label = String(req.body?.label || '').trim()
  const description = String(req.body?.description || '').trim()
  const imageUrl = String(req.body?.imageUrl || '').trim()
  const sortOrder = Number.isFinite(Number(req.body?.sortOrder)) ? Number(req.body.sortOrder) : undefined
  const status = req.body?.status === 'hidden' ? 'hidden' : 'active'
  const parentId = String(req.body?.parentId || '').trim()
  if (!slug || !label) return res.status(400).json({ error: 'Missing category slug/label' })

  const categories = readCategories()
  const categoryId = id || slug
  if (categorySlugExists(categories, slug, categoryId)) {
    return res.status(409).json({ error: 'Slug danh mục đã tồn tại' })
  }

  const previous = findCategoryNode(categories, categoryId)
  for (const category of categories) {
    category.children = category.children.filter((child) => child.id !== categoryId)
  }

  const parent = parentId ? categories.find((category) => category.id === parentId) : null
  if (parent) {
    parent.children.push({ id: categoryId, slug, label, description, imageUrl, sortOrder, status })
  } else {
    const existingIndex = categories.findIndex((category) => category.id === categoryId)
    const children = previous?.type === 'parent' ? previous.category.children : []
    const next = { id: categoryId, slug, label, description, imageUrl, sortOrder, status, children }
    if (existingIndex >= 0) categories[existingIndex] = next
    else categories.push(next)
  }

  writeCategories(categories)

  if (previous) {
    if (previous.type === 'parent' && previous.category.slug !== slug) {
      migrateProductsForCategoryChange({
        oldParentSlug: previous.category.slug,
        newParentSlug: slug,
      })
    }
    if (previous.type === 'child' && (previous.category.slug !== slug || previous.parent.id !== parentId)) {
      migrateProductsForCategoryChange({
        oldParentSlug: previous.parent.slug,
        newParentSlug: parent?.slug || previous.parent.slug,
        oldChildSlug: previous.category.slug,
        newChildSlug: slug,
      })
    }
  }

  res.json(readCategories())
})

app.delete('/api/categories/:id', requireAdminApi, (req, res) => {
  const id = req.params.id
  const categories = readCategories()
  const node = findCategoryNode(categories, id)
  if (!node) return res.status(404).json({ error: 'Không tìm thấy danh mục' })
  if (node.type === 'parent' && node.category.children.length > 0) {
    return res.status(409).json({ error: 'Không thể xóa danh mục cha khi vẫn còn danh mục con. Hãy chuyển hoặc xóa danh mục con trước.' })
  }

  const parentSlug = node.type === 'child' ? node.parent.slug : node.category.slug
  const used = readProducts().some((product) => productUsesCategory(product, node, parentSlug))
  if (used) {
    return res.status(409).json({ error: 'Không thể xóa danh mục khi vẫn còn sản phẩm thuộc danh mục này' })
  }

  if (node.type === 'parent') {
    const index = categories.findIndex((category) => category.id === id)
    categories.splice(index, 1)
  } else {
    node.parent.children = node.parent.children.filter((child) => child.id !== id)
  }
  writeCategories(categories)
  res.json(readCategories())
})

app.get('/api/products', (_req, res) => {
  res.json(readProducts().map(normalizeProductCategoryFields).map(normalizeProductImages).sort(compareDisplayOrder))
})

app.post('/api/products', requireAdminApi, (req, res) => {
  const now = Date.now()
  const {
    id,
    title,
    category,
    parentCategorySlug,
    categoryId,
    categorySlug,
    consumableGroup,
    chemicalGroup,
    imageUrl,
    imageUrls,
    shortDescription,
    price,
    sku,
    brand,
    origin,
    description,
    specs,
    pdfUrl,
    youtubeUrl,
    status,
    featured,
    sortOrder,
  } = req.body ?? {}
  if (!id || !title) return res.status(400).json({ error: 'Missing id/title' })

  const normalizedImageUrls = Array.isArray(imageUrls) ? imageUrls.filter((x) => typeof x === 'string') : undefined
  const normalizedCategory = typeof category === 'string' ? category.trim() : undefined
  const normalizedParentCategorySlug =
    typeof parentCategorySlug === 'string' ? parentCategorySlug.trim() : normalizedCategory
  const normalizedCategorySlug = typeof categorySlug === 'string' ? categorySlug.trim() : undefined
  const normalizedCategoryId = typeof categoryId === 'string' ? categoryId.trim() : undefined
  const normalizedConsumableGroup = typeof consumableGroup === 'string' ? consumableGroup.trim() : undefined
  const normalizedChemicalGroup = typeof chemicalGroup === 'string' ? chemicalGroup.trim() : undefined
  const normalizedStatus = status === 'draft' || status === 'hidden' ? status : 'active'
  const categoryPayload = normalizeProductCategoryFields({
    category: normalizedParentCategorySlug,
    parentCategorySlug: normalizedParentCategorySlug,
    categoryId: normalizedCategoryId,
    categorySlug: normalizedCategorySlug,
    consumableGroup: normalizedConsumableGroup,
    chemicalGroup: normalizedChemicalGroup,
  })

  const list = readProducts()
  const idx = list.findIndex((p) => p.id === id)
  if (idx >= 0) {
    const updated = {
      ...list[idx],
      id,
      title,
      ...categoryPayload,
      imageUrl,
      imageUrls: normalizedImageUrls,
      shortDescription,
      price,
      sku,
      brand,
      origin,
      description,
      specs,
      pdfUrl,
      youtubeUrl,
      status: normalizedStatus,
      featured: Boolean(featured),
      sortOrder: normalizeDisplayOrder(sortOrder),
      updatedAt: now,
    }
    list[idx] = updated
    writeProducts(list)
    return res.json(normalizeProductImages(updated))
  }

  const created = {
    id,
    title,
    ...categoryPayload,
    imageUrl,
    imageUrls: normalizedImageUrls,
    shortDescription,
    price,
    sku,
    brand,
    origin,
    description,
    specs,
    pdfUrl,
    youtubeUrl,
    status: normalizedStatus,
    featured: Boolean(featured),
    sortOrder: normalizeDisplayOrder(sortOrder),
    createdAt: now,
    updatedAt: now,
  }
  writeProducts([...list, created])
  return res.json(normalizeProductImages(created))
})

app.delete('/api/products/:id', requireAdminApi, (req, res) => {
  const id = req.params.id
  const next = readProducts().filter((p) => p.id !== id)
  writeProducts(next)
  res.json({ ok: true })
})

app.get('/api/brands', (_req, res) => {
  res.json(readBrands())
})

app.post('/api/brands', requireAdminApi, (req, res) => {
  const now = Date.now()
  const id = String(req.body?.id || '').trim()
  const name = String(req.body?.name || '').trim()
  if (!id || !name) return res.status(400).json({ error: 'Thiếu mã hoặc tên hãng' })

  const input = {
    id,
    name,
    country: String(req.body?.country || '').trim(),
    url: String(req.body?.url || '').trim(),
    description: String(req.body?.description || '').trim(),
    imageUrl: normalizeUploadRef(String(req.body?.imageUrl || '').trim()),
    featured: Boolean(req.body?.featured),
    status: req.body?.status === 'hidden' ? 'hidden' : 'active',
    sortOrder: normalizeDisplayOrder(req.body?.sortOrder),
  }
  const brands = readBrands()
  const index = brands.findIndex((brand) => brand.id === id)
  const saved = index >= 0
    ? { ...brands[index], ...input, updatedAt: now }
    : { ...input, createdAt: now, updatedAt: now }
  if (index >= 0) brands[index] = saved
  else brands.push(saved)
  writeBrands(brands)
  res.json(saved)
})

app.delete('/api/brands/:id', requireAdminApi, (req, res) => {
  const id = String(req.params.id || '')
  const brands = readBrands()
  if (!brands.some((brand) => brand.id === id)) return res.status(404).json({ error: 'Không tìm thấy hãng' })
  writeBrands(brands.filter((brand) => brand.id !== id))
  res.json({ ok: true })
})

app.get('/api/microscope-categories', (_req, res) => {
  res.json(readMicroscopeCategories())
})

app.post('/api/microscope-categories', requireAdminApi, (req, res) => {
  const id = String(req.body?.id || req.body?.slug || '').trim()
  const slug = String(req.body?.slug || '').trim()
  const label = String(req.body?.label || '').trim()
  const sortOrder = Number.isFinite(Number(req.body?.sortOrder)) ? Number(req.body.sortOrder) : undefined
  const status = req.body?.status === 'hidden' ? 'hidden' : 'active'
  if (!slug || !label) return res.status(400).json({ error: 'Missing microscope category slug/label' })

  const categories = readMicroscopeCategories()
  const categoryId = id || slug
  const duplicate = categories.some((item) => item.slug === slug && item.id !== categoryId)
  if (duplicate) return res.status(409).json({ error: 'Slug danh mục kính hiển vi đã tồn tại' })

  const previous = categories.find((item) => item.id === categoryId)
  const nextCategory = { id: categoryId, slug, label, sortOrder, status }
  const index = categories.findIndex((item) => item.id === categoryId)
  if (index >= 0) categories[index] = nextCategory
  else categories.push(nextCategory)
  writeMicroscopeCategories(categories)

  if (previous && previous.slug !== slug) {
    const nextMicroscopes = readMicroscopes().map((item) =>
      item.categorySlug === previous.slug ? { ...item, categorySlug: slug, updatedAt: Date.now() } : item,
    )
    writeMicroscopes(nextMicroscopes)
  }

  res.json(readMicroscopeCategories())
})

app.delete('/api/microscope-categories/:id', requireAdminApi, (req, res) => {
  const id = req.params.id
  const categories = readMicroscopeCategories()
  const category = categories.find((item) => item.id === id)
  if (!category) return res.status(404).json({ error: 'Không tìm thấy danh mục kính hiển vi' })
  const used = readMicroscopes().some((item) => item.categorySlug === category.slug)
  if (used) return res.status(409).json({ error: 'Không thể xóa danh mục khi vẫn còn kính hiển vi thuộc danh mục này' })
  writeMicroscopeCategories(categories.filter((item) => item.id !== id))
  res.json(readMicroscopeCategories())
})

app.get('/api/microscopes', (_req, res) => {
  res.json(readMicroscopes())
})

app.post('/api/microscopes', requireAdminApi, (req, res) => {
  const now = Date.now()
  const id = String(req.body?.id || '').trim()
  const name = String(req.body?.name || '').trim()
  const model = String(req.body?.model || '').trim()
  const categorySlug = String(req.body?.categorySlug || '').trim()
  const imageUrl = normalizeUploadRef(String(req.body?.imageUrl || '').trim()) || undefined
  const shortDescription = String(req.body?.shortDescription || '').trim()
  const status = req.body?.status === 'hidden' ? 'hidden' : 'active'
  const sortOrder = normalizeDisplayOrder(req.body?.sortOrder)
  if (!id || !name) return res.status(400).json({ error: 'Missing microscope id/name' })
  if (!categorySlug) return res.status(400).json({ error: 'Missing microscope category' })

  const categoryExists = readMicroscopeCategories().some((item) => item.slug === categorySlug)
  if (!categoryExists) return res.status(400).json({ error: 'Danh mục kính hiển vi không hợp lệ' })

  const list = readMicroscopes()
  const index = list.findIndex((item) => item.id === id)
  const base = {
    id,
    name,
    model,
    categorySlug,
    imageUrl,
    shortDescription,
    status,
    sortOrder,
    updatedAt: now,
  }
  if (index >= 0) {
    const updated = { ...list[index], ...base, createdAt: list[index].createdAt || now }
    list[index] = updated
    writeMicroscopes(list)
    return res.json(updated)
  }

  const created = { ...base, createdAt: now }
  writeMicroscopes([...list, created])
  res.json(created)
})

app.delete('/api/microscopes/:id', requireAdminApi, (req, res) => {
  const id = req.params.id
  writeMicroscopes(readMicroscopes().filter((item) => item.id !== id))
  res.json({ ok: true })
})

app.get('/api/forensic-products', (_req, res) => {
  res.json(readForensicProducts())
})

app.post('/api/forensic-products', requireAdminApi, (req, res) => {
  const now = Date.now()
  const id = String(req.body?.id || '').trim()
  const name = String(req.body?.name || '').trim()
  const model = String(req.body?.model || '').trim()
  const categorySlug = String(req.body?.categorySlug || '').trim()
  const imageUrl = normalizeUploadRef(String(req.body?.imageUrl || '').trim()) || undefined
  const shortDescription = String(req.body?.shortDescription || '').trim()
  const specs = String(req.body?.specs || '').trim() || undefined
  const status = req.body?.status === 'hidden' ? 'hidden' : 'active'
  const sortOrder = normalizeDisplayOrder(req.body?.sortOrder)
  if (!id || !name) return res.status(400).json({ error: 'Missing forensic product id/name' })
  if (!categorySlug) return res.status(400).json({ error: 'Missing forensic product category' })

  const forensicCategory = readCategories().find((item) => item.slug === 'forensic-science')
  const categoryExists = forensicCategory?.children.some((item) => item.slug === categorySlug)
  if (!categoryExists) return res.status(400).json({ error: 'Danh mục giám định hình sự không hợp lệ' })

  const list = readForensicProducts()
  const index = list.findIndex((item) => item.id === id)
  const base = {
    id,
    name,
    model,
    categorySlug,
    imageUrl,
    shortDescription,
    specs,
    status,
    sortOrder,
    updatedAt: now,
  }
  if (index >= 0) {
    const updated = { ...list[index], ...base, createdAt: list[index].createdAt || now }
    list[index] = updated
    writeForensicProducts(list)
    return res.json(updated)
  }

  const created = { ...base, createdAt: now }
  writeForensicProducts([...list, created])
  res.json(created)
})

app.delete('/api/forensic-products/:id', requireAdminApi, (req, res) => {
  const id = req.params.id
  writeForensicProducts(readForensicProducts().filter((item) => item.id !== id))
  res.json({ ok: true })
})

app.get('/api/picc-products', (_req, res) => {
  res.json(readPiccProducts())
})

app.post('/api/picc-products', requireAdminApi, (req, res) => {
  const now = Date.now()
  const id = String(req.body?.id || '').trim()
  const name = String(req.body?.name || '').trim()
  const model = String(req.body?.model || '').trim()
  const categorySlug = String(req.body?.categorySlug || '').trim()
  const imageUrl = normalizeUploadRef(String(req.body?.imageUrl || '').trim()) || undefined
  const shortDescription = String(req.body?.shortDescription || '').trim()
  const specs = String(req.body?.specs || '').trim() || undefined
  const status = req.body?.status === 'hidden' ? 'hidden' : 'active'
  const sortOrder = normalizeDisplayOrder(req.body?.sortOrder)
  if (!id || !name) return res.status(400).json({ error: 'Missing PICC product id/name' })
  if (!categorySlug) return res.status(400).json({ error: 'Missing PICC product category' })

  const piccCategory = readCategories().find((item) => item.slug === 'intensive-care')
  const categoryExists = piccCategory?.children.some((item) => item.slug === categorySlug)
  if (!categoryExists) return res.status(400).json({ error: 'Danh mục hồi sức tích cực không hợp lệ' })

  const list = readPiccProducts()
  const index = list.findIndex((item) => item.id === id)
  const base = {
    id,
    name,
    model,
    categorySlug,
    imageUrl,
    shortDescription,
    specs,
    status,
    sortOrder,
    updatedAt: now,
  }
  if (index >= 0) {
    const updated = { ...list[index], ...base, createdAt: list[index].createdAt || now }
    list[index] = updated
    writePiccProducts(list)
    return res.json(updated)
  }

  const created = { ...base, createdAt: now }
  writePiccProducts([...list, created])
  res.json(created)
})

app.delete('/api/picc-products/:id', requireAdminApi, (req, res) => {
  const id = req.params.id
  writePiccProducts(readPiccProducts().filter((item) => item.id !== id))
  res.json({ ok: true })
})

const uploadMaxMb = Math.min(Math.max(Number(process.env.UPLOAD_MAX_MB) || 50, 1), 200)
const uploadMaxBytes = uploadMaxMb * 1024 * 1024

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, `${Date.now()}_${safe}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: uploadMaxBytes },
})

const productImageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, productUploadsDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, `${Date.now()}_${safe}`)
  },
})
const productImageUpload = multer({
  storage: productImageStorage,
  limits: { fileSize: uploadMaxBytes },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true)
    cb(new Error('Chỉ chấp nhận file hình ảnh'))
  },
})

app.post('/api/products/upload-image', requireAdminApi, (req, res, next) => {
  productImageUpload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: `File quá lớn (tối đa ${uploadMaxMb} MB)`, code: err.code })
      }
      return res.status(400).json({ error: err.message || 'Upload ảnh thất bại' })
    }
    if (!req.file) return res.status(400).json({ error: 'Không có file ảnh' })
    return res.json({ url: `/uploads/products/${req.file.filename}` })
  })
})

app.post('/api/upload', requireAdminApi, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            error: `File too large (max ${uploadMaxMb} MB)`,
            code: err.code,
          })
        }
        return res.status(400).json({ error: err.message, code: err.code })
      }
      return next(err)
    }
    if (!req.file) return res.status(400).json({ error: 'No file' })
    res.json({ url: `/uploads/${req.file.filename}` })
  })
})

const isProd = process.env.NODE_ENV === 'production'
if (isProd && fs.existsSync(path.join(distDir, 'index.html'))) {
  app.use(express.static(distDir, { index: false }))
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next()
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next()
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

const port = Number(process.env.API_PORT) || 5175
app.listen(port, '0.0.0.0', () => {
  console.log(`API server running on http://0.0.0.0:${port}`)
  logAdminAuthStartup()
  if (isProd && fs.existsSync(path.join(distDir, 'index.html'))) {
    console.log('Serving SPA from dist/')
  }
})
