import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apply } from '../lib/index.js'

const home = await mkdtemp(join(tmpdir(), 'dsh-menu-test-'))
const previousHome = process.env.DSH_HOME
process.env.DSH_HOME = home
const routes = new Map()
const archived = []
const live = new Set()
let bucket
const ctx = {
  root: {}, webStartup: { trustedHosts: [] },
  sessions: { get(id) { return live.has(id) ? {} : undefined } },
  sessionPersistence: {
    async stat(id) { try { await stat(join(bucket, id)); return {} } catch { return undefined } },
    async open() { return { async close() {} } },
  },
  workspaceRegistry: {
    archivedSessionIds: archived,
    async archiveSession(id) { if (!archived.includes(id)) archived.push(id) },
    async unarchiveSession(id) { const i = archived.indexOf(id); if (i >= 0) archived.splice(i, 1) },
    async unpinSession() {}, list() { return [] },
  },
  webServer: { register(route) { routes.set(route.path, route.handler); return () => routes.delete(route.path) } },
  effect(fn) { return fn() },
}
async function request(path, body) {
  let status, result
  const req = { method: 'POST', headers: { host: 'localhost:3080', origin: 'http://localhost:3080' }, async *[Symbol.asyncIterator]() { yield JSON.stringify(body) } }
  const res = { writeHead(code) { status = code }, end(body) { result = JSON.parse(body) } }
  await routes.get(path)(req, res)
  return { status, result }
}
try {
  bucket = join(home, 'sessions', 'workspace')
  await mkdir(join(bucket, 'session-123'), { recursive: true })
  apply(ctx)
  const sessionRoute = '/dsh-workspace-menu/delete-session'
  for (const sessionId of ['.', '..', '../other']) assert.equal((await request(sessionRoute, { sessionId })).status, 400)
  assert.equal((await request('/dsh-workspace-menu/delete-workspace-directory', { path: home })).status, 400)
  assert.equal((await request('/dsh-workspace-menu/delete-workspace-directory', { path: join(home, '..') })).status, 400)
  live.add('session-123')
  const queued = await request(sessionRoute, { sessionId: 'session-123' })
  assert.equal(queued.status, 200)
  assert.equal(queued.result.queued, true)
  assert.ok(archived.includes('session-123'))
  await stat(join(bucket, 'session-123'))
  live.delete('session-123')
  // A fresh host instance retries queued work on startup.
  ctx.root = {}
  apply(ctx)
  for (let i = 0; i < 100; i++) {
    try { await stat(join(bucket, 'session-123')) } catch { break }
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  await assert.rejects(stat(join(bucket, 'session-123')), { code: 'ENOENT' })
  await stat(bucket)
  console.log('route tests passed')
} finally {
  if (previousHome === undefined) delete process.env.DSH_HOME
  else process.env.DSH_HOME = previousHome
  await rm(home, { recursive: true, force: true })
}
