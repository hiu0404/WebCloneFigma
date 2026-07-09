import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const devEnv = { ...process.env, NODE_ENV: 'development' }

const npmCli = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const server = spawn(process.execPath, [path.join(root, 'server', 'index.js')], {
  cwd: root,
  stdio: 'inherit',
  env: devEnv,
})

const client = spawn(npmCli, ['run', 'dev:client'], {
  cwd: root,
  stdio: 'inherit',
  env: devEnv,
  shell: process.platform === 'win32',
})

const children = [server, client]
let stopping = false

function killAll(sig) {
  for (const c of children) {
    if (c.exitCode != null || c.signalCode != null) continue
    try {
      c.kill(sig)
    } catch {
      /* ignore */
    }
  }
}

function shutdownFromSignal(code) {
  if (stopping) return
  stopping = true
  killAll('SIGTERM')
  setTimeout(() => process.exit(code), 50)
}

process.on('SIGINT', () => shutdownFromSignal(130))
process.on('SIGTERM', () => shutdownFromSignal(143))

function onChildExit(code, signal) {
  if (stopping) return
  stopping = true
  killAll('SIGTERM')
  const exitCode =
    typeof code === 'number' ? code : signal ? 1 : 1
  setTimeout(() => process.exit(exitCode), 50)
}

server.on('exit', (code, signal) => onChildExit(code, signal))
client.on('exit', (code, signal) => onChildExit(code, signal))
