import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = path.resolve(import.meta.dirname, '..')
const dataDir = path.join(root, 'server', 'data')
const uploadsDir = path.join(root, 'public', 'uploads')
const backupRoot = process.env.ECOLINK_BACKUP_DIR
const files = ['products.json', 'microscopes.json', 'forensic-products.json', 'picc-products.json', 'categories.json', 'admin-auth.json']

function slugify(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}
function read(file) { return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')) }
function countUploads(dir) {
  if (!fs.existsSync(dir)) return 0
  return fs.readdirSync(dir, { withFileTypes: true }).reduce((total, item) => total + (item.isDirectory() ? countUploads(path.join(dir, item.name)) : 1), 0)
}
function counts() {
  return Object.fromEntries([...files.filter((file) => file !== 'admin-auth.json').map((file) => [file, Array.isArray(read(file)) ? read(file).length : 1]), ['uploads', countUploads(uploadsDir)]])
}
function writeAtomic(file, value) {
  const target = path.join(dataDir, file); const tmp = `${target}.${process.pid}.tmp`
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`); fs.renameSync(tmp, target)
}

if (!backupRoot) throw new Error('ECOLINK_BACKUP_DIR must point outside this repository')
const resolvedBackup = path.resolve(backupRoot)
if (resolvedBackup.startsWith(root + path.sep) || resolvedBackup === root) throw new Error('Backup directory must be outside repository')
fs.mkdirSync(resolvedBackup, { recursive: true })
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const backupDir = path.join(resolvedBackup, `seo-migration-${stamp}`)
const before = counts()
try {
  fs.mkdirSync(backupDir)
  for (const file of files) fs.copyFileSync(path.join(dataDir, file), path.join(backupDir, file))
  if (fs.existsSync(uploadsDir)) fs.cpSync(uploadsDir, path.join(backupDir, 'uploads'), { recursive: true, errorOnExist: true })
  fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify({ createdAt: new Date().toISOString(), before }, null, 2))
} catch (error) {
  throw new Error(`Backup failed; migration was not started: ${error.message}`)
}

const groups = [
  ['products.json', (item) => item.title], ['microscopes.json', (item) => item.name],
  ['forensic-products.json', (item) => item.name], ['picc-products.json', (item) => item.name],
]
const seen = new Map(); const existingDuplicates = []; const generatedDuplicates = []
const prepared = new Map()
for (const [file, nameOf] of groups) {
  const list = read(file)
  const next = list.map((item) => ({ ...item }))
  for (const item of next) {
    const existing = String(item.slug || '').trim()
    let slug = existing || slugify(nameOf(item)) || `san-pham-${item.id}`
    if (seen.has(slug)) {
      if (existing) existingDuplicates.push({ slug, first: seen.get(slug), duplicate: { file, id: item.id } })
      else { slug = `${slug}-${String(item.id).slice(0, 8)}`; generatedDuplicates.push({ file, id: item.id, slug }) }
    }
    seen.set(slug, { file, id: item.id })
    if (!existing) item.slug = slug
  }
  prepared.set(file, next)
}
if (existingDuplicates.length) {
  fs.writeFileSync(path.join(backupDir, 'duplicate-slugs.json'), JSON.stringify(existingDuplicates, null, 2))
  throw new Error(`Existing duplicate slugs found; migration was not started. See ${path.join(backupDir, 'duplicate-slugs.json')}`)
}
for (const [file, value] of prepared) writeAtomic(file, value)
const after = counts()
if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Record/file count changed after migration; restore backup before continuing')
const result = { backupDir, before, after, generatedDuplicates }
fs.writeFileSync(path.join(backupDir, 'migration-result.json'), JSON.stringify(result, null, 2))
console.log(JSON.stringify(result, null, 2))
