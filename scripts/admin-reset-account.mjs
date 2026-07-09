import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { fileURLToPath } from 'node:url'
import {
  encryptString,
  fingerprintTotpSecret,
  generateRecoveryCodes,
  generateTotpSecret,
  hashRecoveryCodes,
  hashSecret,
} from '../server/admin-security.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const dataDir = path.join(root, 'server', 'data')
const envFile = path.join(root, '.env.local')
const adminAuthFile = path.join(dataDir, 'admin-auth.json')
const adminRateLimitFile = path.join(dataDir, 'admin-rate-limit.json')
const adminAuditLogFile = path.join(dataDir, 'admin-auth.log')
const pipedAnswers = input.isTTY ? null : fs.readFileSync(0, 'utf-8').split(/\r?\n/)

function upsertEnv(raw, updates) {
  const used = new Set()
  const lines = raw ? raw.split(/\r?\n/) : []
  const next = lines.map((line) => {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=/)
    if (!match || !(match[1] in updates)) return line
    used.add(match[1])
    return `${match[1]}=${updates[match[1]]}`
  })

  for (const [key, value] of Object.entries(updates)) {
    if (!used.has(key)) next.push(`${key}=${value}`)
  }
  return `${next.filter((line, index, arr) => line !== '' || index < arr.length - 1).join('\n')}\n`
}

function writePrivateFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf-8')
  try {
    fs.chmodSync(filePath, 0o600)
  } catch {
    /* Windows may ignore POSIX chmod. */
  }
}

function takePipedAnswer(question, hidden = false) {
  if (!pipedAnswers) return null
  output.write(question)
  const value = pipedAnswers.shift() ?? ''
  output.write(hidden ? '********\n' : `${value}\n`)
  return value
}

function promptText(question, rl) {
  const piped = takePipedAnswer(question)
  if (piped !== null) return Promise.resolve(piped)
  return rl.question(question)
}

function promptHidden(question) {
  const piped = takePipedAnswer(question, true)
  if (piped !== null) return Promise.resolve(piped)

  if (!input.isTTY || !output.isTTY || typeof input.setRawMode !== 'function') {
    const rl = readline.createInterface({ input, output })
    return rl.question(question).finally(() => rl.close())
  }

  return new Promise((resolve) => {
    let value = ''
    output.write(question)
    input.setRawMode(true)
    input.resume()
    input.setEncoding('utf8')

    function done() {
      input.setRawMode(false)
      input.off('data', onData)
      output.write('\n')
      resolve(value)
    }

    function onData(char) {
      if (char === '\u0003') process.exit(130)
      if (char === '\r' || char === '\n' || char === '\u0004') return done()
      if (char === '\u007f' || char === '\b') {
        if (value.length > 0) {
          value = value.slice(0, -1)
          output.write('\b \b')
        }
        return
      }
      value += char
      output.write('*')
    }

    input.on('data', onData)
  })
}

function appendLocalAudit(email, totpSecret) {
  const entry = {
    ts: new Date().toISOString(),
    event: 'admin_account_reset_local',
    outcome: 'success',
    emailHash: crypto.createHash('sha256').update(email).digest('hex').slice(0, 32),
    secretFingerprint: fingerprintTotpSecret(totpSecret),
  }
  fs.appendFileSync(adminAuditLogFile, `${JSON.stringify(entry)}\n`, 'utf-8')
}

fs.mkdirSync(dataDir, { recursive: true })

const rawEnv = fs.existsSync(envFile) ? fs.readFileSync(envFile, 'utf-8') : ''
const encryptionKey = crypto.randomBytes(32).toString('base64url')
const jwtSecret = crypto.randomBytes(48).toString('base64url')

const rl = pipedAnswers ? null : readline.createInterface({ input, output })

try {
  console.log('This will replace the current admin account, Google Authenticator secret, recovery codes, and JWT secret.')
  const confirm = (await promptText('Type RESET to continue: ', rl)).trim()
  if (confirm !== 'RESET') {
    console.log('Reset cancelled.')
    rl?.close()
    process.exit(0)
  }

  const email = (await promptText('New admin email: ', rl)).trim().toLowerCase()
  rl?.close()

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    console.error('Email is invalid.')
    process.exit(1)
  }

  const password = String(await promptHidden('New admin password: '))
  const passwordConfirm = String(await promptHidden('Confirm new password: '))
  if (!password || password.length < 6) {
    console.error('Password must be at least 12 characters.')
    process.exit(1)
  }
  if (password !== passwordConfirm) {
    console.error('Passwords do not match.')
    process.exit(1)
  }

  const now = Date.now()
  const totpSecret = generateTotpSecret()
  const recoveryCodes = generateRecoveryCodes(10)
  const existingCreatedAt = (() => {
    try {
      const parsed = JSON.parse(fs.readFileSync(adminAuthFile, 'utf-8'))
      return typeof parsed?.createdAt === 'number' ? parsed.createdAt : now
    } catch {
      return now
    }
  })()

  const db = {
    version: 2,
    email,
    passwordHash: hashSecret(password),
    totp: {
      encryptedSecret: encryptString(totpSecret, encryptionKey),
      updatedAt: now,
      resetByLocalScriptAt: now,
    },
    recoveryCodes: hashRecoveryCodes(recoveryCodes),
    pendingTotpReset: null,
    createdAt: existingCreatedAt,
    updatedAt: now,
  }

  writePrivateFile(adminAuthFile, `${JSON.stringify(db, null, 2)}\n`)
  writePrivateFile(
    envFile,
    upsertEnv(rawEnv, {
      ADMIN_SECRET_ENCRYPTION_KEY: encryptionKey,
      ADMIN_JWT_SECRET: jwtSecret,
      ADMIN_JWT_TTL_SECONDS: '43200',
      ADMIN_LOGIN_MAX_FAILURES: '5',
      ADMIN_LOGIN_WINDOW_MINUTES: '15',
      ADMIN_LOGIN_LOCK_MINUTES: '15',
    }),
  )

  if (fs.existsSync(adminRateLimitFile)) fs.unlinkSync(adminRateLimitFile)
  appendLocalAudit(email, totpSecret)

  console.log('\nAdmin account reset complete.')
  console.log('Only one admin account is now stored in server/data/admin-auth.json')
  console.log('\nManual setup key for Google Authenticator:')
  console.log(totpSecret)
  console.log('\nRecovery codes - shown once. Store them offline:')
  for (const code of recoveryCodes) console.log(`  ${code}`)
  console.log('\nRestart the API/dev server before logging in.')
} catch (err) {
  rl?.close()
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
}
