/**
 * @dsh-external/dsh-workspace-menu — host half (DSH 0.2.x).
 *
 * 提供真正的“在系统文件管理器中打开”能力：浏览器端请求本路由，
 * Host 按平台调用对应文件管理器：
 * - Windows：explorer.exe
 * - macOS：open（Finder）
 * - Linux：xdg-open / gio / nautilus / dolphin / thunar / pcmanfm 依次回退
 *
 * 另外提供两个受保护的管理路由：
 * - `/dsh-workspace-menu/delete-workspace-directory`：删除工作区目录
 * - `/dsh-workspace-menu/delete-session`：删除宿主的会话记录目录
 *
 * 路由带 Host/Origin 信任围栏，防止跨站滥用。
 *
 * 0.2.x 适配：`webRuntime` 服务已更名为 `webStartup`（DSH 0.2.1-rc.5）。
 */
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { homedir } from 'node:os';
import { isAbsolute, join, normalize, resolve, sep } from 'node:path';
export const name = '@dsh-external/dsh-workspace-menu';
export const inject = ['webServer', 'webStartup'];
// The development hot-reloader can apply the same linked bundle more than
// once. New DSH WebServer versions reject duplicate exact routes, so route
// ownership is shared by all plugin instances that use the same server.
// The lease is keyed by the ROOT context: `ctx.webServer` is a per-scope
// service proxy, so keying by it made a second mount miss the lease and
// register the same exact route twice.
const routeLeases = new WeakMap();
function header(headers, name) {
    const value = headers[name];
    return typeof value === 'string' ? value : undefined;
}
function parseAuthority(authority) {
    try {
        return new URL(`http://${authority}`);
    }
    catch {
        return undefined;
    }
}
function isLoopbackHostname(hostname) {
    if (hostname === 'localhost' || hostname === '[::1]')
        return true;
    const parts = hostname.split('.');
    return parts.length === 4
        && parts[0] === '127'
        && parts.every(part => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}
function canonicalAuthority(entry, entryUrl) {
    const port = entryUrl.port !== '' ? entryUrl.port : new URL(`https://${entry}`).port;
    return port === '' ? entryUrl.hostname : `${entryUrl.hostname}:${port}`;
}
function isTrustedAuthority(hostUrl, trustedHosts) {
    return trustedHosts.some((entry) => {
        const entryUrl = parseAuthority(entry);
        if (entryUrl === undefined)
            return false;
        return canonicalAuthority(entry, entryUrl) === entryUrl.hostname
            ? entryUrl.hostname === hostUrl.hostname
            : entryUrl.host === hostUrl.host;
    });
}
function isTrustedApiRequest(req, trustedHosts) {
    const host = header(req.headers, 'host');
    if (host === undefined)
        return false;
    const hostUrl = parseAuthority(host);
    if (hostUrl === undefined)
        return false;
    if (!isLoopbackHostname(hostUrl.hostname) && !isTrustedAuthority(hostUrl, trustedHosts))
        return false;
    if (header(req.headers, 'sec-fetch-site') === 'cross-site')
        return false;
    const origin = header(req.headers, 'origin');
    if (origin === undefined)
        return true;
    try {
        return new URL(origin).host === hostUrl.host;
    }
    catch {
        return false;
    }
}
async function readJsonBody(req) {
    const chunks = [];
    let size = 0;
    for await (const value of req) {
        const chunk = Buffer.isBuffer(value) ? value : Buffer.from(String(value));
        size += chunk.length;
        if (size > 1024 * 1024)
            throw new Error('body too large');
        chunks.push(chunk);
    }
    const text = Buffer.concat(chunks).toString('utf8');
    return text ? JSON.parse(text) : {};
}
function writeJson(res, status, body) {
    const payload = JSON.stringify(body);
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
    res.end(payload);
}
function isDirectoryPath(path) {
    try {
        return statSync(path).isDirectory();
    }
    catch {
        return false;
    }
}
function spawnOpener(cmd, args) {
    return new Promise((resolve, reject) => {
        let settled = false;
        const child = spawn(cmd, args, { detached: true, stdio: 'ignore' });
        child.on('error', (error) => {
            if (settled)
                return;
            settled = true;
            reject(error);
        });
        child.on('spawn', () => {
            if (settled)
                return;
            settled = true;
            child.unref();
            resolve();
        });
        child.on('exit', (code) => {
            if (settled)
                return;
            settled = true;
            if (code === 0 || code === null)
                resolve();
            else
                reject(new Error(`opener exited with code ${String(code)}`));
        });
    });
}
async function openInOs(rawPath) {
    const path = normalize(rawPath);
    if (process.platform === 'win32') {
        const explorer = process.env.SystemRoot
            ? join(process.env.SystemRoot, 'explorer.exe')
            : 'explorer.exe';
        const args = isDirectoryPath(path) ? [path] : [`/select,${path}`];
        await spawnOpener(explorer, args);
        return;
    }
    if (process.platform === 'darwin') {
        await spawnOpener('open', [path]);
        return;
    }
    // Linux：优先 xdg-open，缺失或不可用时依次尝试常见文件管理器。
    const candidates = [
        { cmd: 'xdg-open', args: [path] },
        { cmd: 'gio', args: ['open', path] },
        { cmd: 'nautilus', args: [path] },
        { cmd: 'dolphin', args: [path] },
        { cmd: 'thunar', args: [path] },
        { cmd: 'pcmanfm', args: [path] },
    ];
    let lastError;
    for (const candidate of candidates) {
        try {
            await spawnOpener(candidate.cmd, candidate.args);
            return;
        }
        catch (error) {
            lastError = error;
        }
    }
    throw lastError instanceof Error ? lastError : new Error('no file manager available');
}
function dshHome() {
    return process.env.DSH_HOME ?? join(homedir(), '.dsh');
}
function isForbiddenDeletePath(path) {
    const canonical = (value) => {
        const result = resolve(value).replace(/[\\/]+$/, '');
        return process.platform === 'win32' ? result.toLowerCase() : result;
    };
    const normalized = canonical(path);
    const home = dshHome();
    const forbidden = [process.cwd(), homedir(), home, process.env.SystemRoot ?? ''].filter(Boolean);
    for (const item of forbidden) {
        const n = canonical(item);
        if (normalized === n || n.startsWith(normalized + sep))
            return true;
    }
    if (normalized === '/' || normalized === '\\' || /^[a-zA-Z]:[\\/]?$/.test(normalized))
        return true;
    return false;
}
/**
 * Locate the Host's on-disk record of one Session.
 *
 * DSH keeps one directory per Session under
 * `$DSH_HOME/sessions/<workspace-slug>/<sessionId>/`, and the directory name
 * is the Session identity. The search stays inside the sessions root and
 * only ever matches a directory whose name equals the requested identity.
 */
function findSessionRecord(sessionId) {
    if (!isValidSessionId(sessionId))
        return undefined;
    const root = join(dshHome(), 'sessions');
    let entries;
    try {
        entries = readdirSync(root, { withFileTypes: true });
    }
    catch {
        return undefined;
    }
    for (const entry of entries) {
        if (!entry.isDirectory())
            continue;
        const candidate = join(root, entry.name, sessionId);
        try {
            if (existsSync(candidate) && statSync(candidate).isDirectory())
                return candidate;
        }
        catch {
            // unreadable bucket — keep looking
        }
    }
    return undefined;
}
function isValidSessionId(id) {
    return id !== '.' && id !== '..' && /^[A-Za-z0-9._-]{1,128}$/.test(id);
}
async function deleteSessionRecord(sessionId) {
    const record = findSessionRecord(sessionId);
    if (record === undefined) {
        // Nothing on disk to remove (the Session may never have written a log).
        return;
    }
    await rm(record, { recursive: true, force: true });
}
function acquireRoutes(ctx) {
    const key = ctx.root ?? ctx;
    const existing = routeLeases.get(key);
    if (existing !== undefined) {
        existing.references += 1;
        return () => releaseRoutes(key, existing);
    }
    const disposers = [
        ctx.webServer.register({
            kind: 'exact',
            path: '/dsh-workspace-menu/open-in-explorer',
            handler: async (req, res) => {
                if (!isTrustedApiRequest(req, ctx.webStartup.trustedHosts)) {
                    writeJson(res, 403, { ok: false, error: { code: 'forbidden', message: 'forbidden' } });
                    return;
                }
                if (req.method !== 'POST') {
                    writeJson(res, 405, { ok: false, error: { code: 'method-error', message: 'method not allowed' } });
                    return;
                }
                try {
                    const body = (await readJsonBody(req));
                    const raw = typeof body?.path === 'string' ? body.path : '';
                    if (!raw || !isAbsolute(raw) || raw.includes('\0')) {
                        writeJson(res, 400, { ok: false, error: { code: 'bad-request', message: 'invalid absolute path' } });
                        return;
                    }
                    await openInOs(raw);
                    writeJson(res, 200, { ok: true });
                }
                catch (error) {
                    writeJson(res, 400, { ok: false, error: { code: 'open-failed', message: error instanceof Error ? error.message : String(error) } });
                }
            },
        }),
        ctx.webServer.register({
            kind: 'exact',
            path: '/dsh-workspace-menu/delete-workspace-directory',
            handler: async (req, res) => {
                if (!isTrustedApiRequest(req, ctx.webStartup.trustedHosts)) {
                    writeJson(res, 403, { ok: false, error: { code: 'forbidden', message: 'forbidden' } });
                    return;
                }
                if (req.method !== 'POST') {
                    writeJson(res, 405, { ok: false, error: { code: 'method-error', message: 'method not allowed' } });
                    return;
                }
                try {
                    const body = (await readJsonBody(req));
                    const raw = typeof body?.path === 'string' ? body.path : '';
                    if (!raw || !isAbsolute(raw) || raw.includes('\0') || isForbiddenDeletePath(raw)) {
                        writeJson(res, 400, { ok: false, error: { code: 'bad-request', message: 'invalid or protected directory' } });
                        return;
                    }
                    await rm(normalize(raw), { recursive: true, force: true });
                    writeJson(res, 200, { ok: true });
                }
                catch (error) {
                    writeJson(res, 400, { ok: false, error: { code: 'delete-failed', message: error instanceof Error ? error.message : String(error) } });
                }
            },
        }),
        ctx.webServer.register({
            kind: 'exact',
            path: '/dsh-workspace-menu/delete-session',
            handler: async (req, res) => {
                if (!isTrustedApiRequest(req, ctx.webStartup.trustedHosts)) {
                    writeJson(res, 403, { ok: false, error: { code: 'forbidden', message: 'forbidden' } });
                    return;
                }
                if (req.method !== 'POST') {
                    writeJson(res, 405, { ok: false, error: { code: 'method-error', message: 'method not allowed' } });
                    return;
                }
                try {
                    const body = (await readJsonBody(req));
                    const raw = typeof body?.sessionId === 'string' ? body.sessionId : '';
                    if (!isValidSessionId(raw)) {
                        writeJson(res, 400, { ok: false, error: { code: 'bad-request', message: 'invalid session id' } });
                        return;
                    }
                    await deleteSessionRecord(raw);
                    writeJson(res, 200, { ok: true });
                }
                catch (error) {
                    writeJson(res, 400, { ok: false, error: { code: 'delete-failed', message: error instanceof Error ? error.message : String(error) } });
                }
            },
        }),
    ];
    const lease = {
        references: 1,
        dispose: () => {
            for (const dispose of disposers)
                dispose();
        },
    };
    routeLeases.set(key, lease);
    return () => releaseRoutes(key, lease);
}
function releaseRoutes(key, lease) {
    lease.references -= 1;
    if (lease.references !== 0 || routeLeases.get(key) !== lease)
        return;
    routeLeases.delete(key);
    lease.dispose();
}
export function apply(ctx) {
    ctx.effect(() => acquireRoutes(ctx), '@dsh-external/dsh-workspace-menu: host routes');
}
//# sourceMappingURL=index.js.map