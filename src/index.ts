/**
 * @dsh-external/dsh-workspace-menu — host half.
 *
 * 提供真正的“在系统文件管理器中打开”能力：浏览器端请求本路由，
 * Host 按平台调用对应文件管理器：
 * - Windows：explorer.exe
 * - macOS：open（Finder）
 * - Linux：xdg-open / gio / nautilus / dolphin / thunar / pcmanfm 依次回退
 * 路由带 Host/Origin 信任围栏，防止跨站滥用。
 */
import { spawn } from 'node:child_process'
import { statSync } from 'node:fs'
import { isAbsolute, join, normalize } from 'node:path'
import type { Context } from 'cordis'

interface HttpRequest {
  url?: string
  method?: string
  headers: Record<string, string | string[] | undefined>
  [Symbol.asyncIterator](): AsyncIterator<string | Uint8Array>
}

interface HttpResponse {
  statusCode: number
  writeHead(status: number, headers?: Record<string, string>): void
  end(body?: string | Uint8Array): void
}

interface WebServer {
  register(route: {
    kind: 'exact' | 'prefix'
    path: string
    handler: (req: HttpRequest, res: HttpResponse) => void | Promise<void>
  }): () => void
}

interface WebRuntime {
  trustedHosts: readonly string[]
}

type AppContext = Context & {
  webServer: WebServer
  webRuntime: WebRuntime
}

export const name = '@dsh-external/dsh-workspace-menu'
export const inject = ['webServer', 'webRuntime']

function header(headers: HttpRequest['headers'], name: string): string | undefined {
  const value = headers[name]
  return typeof value === 'string' ? value : undefined
}

function parseAuthority(authority: string): URL | undefined {
  try {
    return new URL(`http://${authority}`)
  } catch {
    return undefined
  }
}

function isLoopbackHostname(hostname: string): boolean {
  if (hostname === 'localhost' || hostname === '[::1]') return true
  const parts = hostname.split('.')
  return parts.length === 4
    && parts[0] === '127'
    && parts.every(part => /^\d{1,3}$/.test(part) && Number(part) <= 255)
}

function canonicalAuthority(entry: string, entryUrl: URL): string {
  const port = entryUrl.port !== '' ? entryUrl.port : new URL(`https://${entry}`).port
  return port === '' ? entryUrl.hostname : `${entryUrl.hostname}:${port}`
}

function isTrustedAuthority(hostUrl: URL, trustedHosts: readonly string[]): boolean {
  return trustedHosts.some((entry) => {
    const entryUrl = parseAuthority(entry)
    if (entryUrl === undefined) return false
    return canonicalAuthority(entry, entryUrl) === entryUrl.hostname
      ? entryUrl.hostname === hostUrl.hostname
      : entryUrl.host === hostUrl.host
  })
}

function isTrustedApiRequest(req: HttpRequest, trustedHosts: readonly string[]): boolean {
  const host = header(req.headers, 'host')
  if (host === undefined) return false
  const hostUrl = parseAuthority(host)
  if (hostUrl === undefined) return false
  if (!isLoopbackHostname(hostUrl.hostname) && !isTrustedAuthority(hostUrl, trustedHosts)) return false
  if (header(req.headers, 'sec-fetch-site') === 'cross-site') return false
  const origin = header(req.headers, 'origin')
  if (origin === undefined) return true
  try {
    return new URL(origin).host === hostUrl.host
  } catch {
    return false
  }
}

async function readJsonBody(req: HttpRequest): Promise<unknown> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const value of req) {
    const chunk = Buffer.isBuffer(value) ? value : Buffer.from(String(value))
    size += chunk.length
    if (size > 1024 * 1024) throw new Error('body too large')
    chunks.push(chunk)
  }
  const text = Buffer.concat(chunks).toString('utf8')
  return text ? JSON.parse(text) : {}
}

function writeJson(res: HttpResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body)
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(payload)
}

function isDirectoryPath(path: string): boolean {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

function spawnOpener(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false
    const child = spawn(cmd, args, { detached: true, stdio: 'ignore' })
    child.on('error', (error) => {
      if (settled) return
      settled = true
      reject(error)
    })
    child.on('spawn', () => {
      if (settled) return
      settled = true
      child.unref()
      resolve()
    })
    child.on('exit', (code) => {
      if (settled) return
      settled = true
      if (code === 0 || code === null) resolve()
      else reject(new Error(`opener exited with code ${code}`))
    })
  })
}

async function openInOs(rawPath: string): Promise<void> {
  const path = normalize(rawPath)
  if (process.platform === 'win32') {
    const explorer = process.env.SystemRoot
      ? join(process.env.SystemRoot, 'explorer.exe')
      : 'explorer.exe'
    const args = isDirectoryPath(path) ? [path] : [`/select,${path}`]
    await spawnOpener(explorer, args)
    return
  }
  if (process.platform === 'darwin') {
    await spawnOpener('open', [path])
    return
  }
  // Linux：优先 xdg-open，缺失或不可用时依次尝试常见文件管理器。
  const candidates: Array<{ cmd: string; args: string[] }> = [
    { cmd: 'xdg-open', args: [path] },
    { cmd: 'gio', args: ['open', path] },
    { cmd: 'nautilus', args: [path] },
    { cmd: 'dolphin', args: [path] },
    { cmd: 'thunar', args: [path] },
    { cmd: 'pcmanfm', args: [path] },
  ]
  let lastError: unknown
  for (const candidate of candidates) {
    try {
      await spawnOpener(candidate.cmd, candidate.args)
      return
    } catch (error) {
      lastError = error
    }
  }
  throw lastError instanceof Error ? lastError : new Error('no file manager available')
}

export function apply(ctx: AppContext): void {
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/dsh-workspace-menu/open-in-explorer',
    handler: async (req, res) => {
      if (!isTrustedApiRequest(req, ctx.webRuntime.trustedHosts)) {
        writeJson(res, 403, { ok: false, error: { code: 'forbidden', message: 'forbidden' } })
        return
      }
      if (req.method !== 'POST') {
        writeJson(res, 405, { ok: false, error: { code: 'method-error', message: 'method not allowed' } })
        return
      }
      try {
        const body = (await readJsonBody(req)) as { path?: unknown } | null
        const raw = typeof body?.path === 'string' ? body.path : ''
        if (!raw || !isAbsolute(raw) || raw.includes('\0')) {
          writeJson(res, 400, { ok: false, error: { code: 'bad-request', message: 'invalid absolute path' } })
          return
        }
        await openInOs(raw)
        writeJson(res, 200, { ok: true })
      } catch (error) {
        writeJson(res, 400, { ok: false, error: { code: 'open-failed', message: error instanceof Error ? error.message : String(error) } })
      }
    },
  }), '@dsh-external/dsh-workspace-menu: open-in-explorer route')
}
