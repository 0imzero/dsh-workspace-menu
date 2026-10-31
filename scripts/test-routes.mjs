import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apply } from '../lib/index.js'

const home = await mkdtemp(join(tmpdir(), 'dsh-menu-test-'))
const previousHome = process.env.DSH_HOME
process.env.DSH_HOME = home
const routes = new Map()
const ctx = {
  root: {}, webStartup: { trustedHosts: [] },
  webServer: { register(route) { routes.set(route.path, route.handler); return () => routes.delete(route.path) } },
  effect(fn) { return fn() },
}
async function request(path, body) {
  let status
  const req = { method: 'POST', headers: { host: 'localhost:3080', origin: 'http://localhost:3080' }, async *[Symbol.asyncIterator]() { yield JSON.stringify(body) } }
  const res = { writeHead(code) { status = code }, end() {} }
  await routes.get(path)(req, res)
  return status
}
try {
  const bucket = join(home, 'sessions', 'workspace')
  await mkdir(join(bucket, 'session-123'), { recursive: true })
  apply(ctx)
  const sessionRoute = '/dsh-workspace-menu/delete-session'
  for (const sessionId of ['.', '..', '../other']) assert.equal(await request(sessionRoute, { sessionId }), 400)
  assert.equal(await request('/dsh-workspace-menu/delete-workspace-directory', { path: home }), 400)
  assert.equal(await request('/dsh-workspace-menu/delete-workspace-directory', { path: join(home, '..') }), 400)
  assert.equal(await request(sessionRoute, { sessionId: 'session-123' }), 200)
  await assert.rejects(stat(join(bucket, 'session-123')), { code: 'ENOENT' })
  await stat(bucket)
  console.log('route tests passed')
} finally {
  if (previousHome === undefined) delete process.env.DSH_HOME
  else process.env.DSH_HOME = previousHome
  await rm(home, { recursive: true, force: true })
}
