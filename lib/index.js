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
import { spawn } from 'node:child_process';
import { statSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { homedir } from 'node:os';
import { isAbsolute, join, normalize, sep } from 'node:path';
export const name = '@dsh-external/dsh-workspace-menu';
export const inject = ['webServer', 'connection'];
// The development hot-reloader can apply the same linked bundle more than
// once. New DSH WebServer versions reject duplicate exact routes, so route
// ownership is shared by all plugin instances that use the same server.
const routeLeases = new WeakMap();
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
                reject(new Error(`opener exited with code ${code}`));
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
function isForbiddenDeletePath(path) {
    const normalized = normalize(path);
    const dshHome = process.env.DSH_HOME ?? join(homedir(), '.dsh');
    const forbidden = [process.cwd(), homedir(), dshHome, process.env.SystemRoot ?? ''].filter(Boolean);
    for (const item of forbidden) {
        const n = normalize(item);
        if (normalized === n || normalized === n + sep)
            return true;
    }
    if (normalized === '/' || normalized === '\\' || /^[a-zA-Z]:[\\/]?$/.test(normalized))
        return true;
    return false;
}
function acquireRoutes(ctx) {
    const existing = routeLeases.get(ctx.webServer);
    if (existing !== undefined) {
        existing.references += 1;
        return () => releaseRoutes(ctx.webServer, existing);
    }
    const disposers = [
        ctx.webServer.register({
            kind: 'exact',
            path: '/dsh-workspace-menu/open-in-explorer',
            handler: async (req, res) => {
                if (!ctx.connection.isTrusted(req)) {
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
                if (!ctx.connection.isTrusted(req)) {
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
    ];
    const lease = {
        references: 1,
        dispose: () => {
            for (const dispose of disposers)
                dispose();
        },
    };
    routeLeases.set(ctx.webServer, lease);
    return () => releaseRoutes(ctx.webServer, lease);
}
function releaseRoutes(webServer, lease) {
    lease.references -= 1;
    if (lease.references !== 0 || routeLeases.get(webServer) !== lease)
        return;
    routeLeases.delete(webServer);
    lease.dispose();
}
export function apply(ctx) {
    ctx.effect(() => acquireRoutes(ctx), '@dsh-external/dsh-workspace-menu: host routes');
}
//# sourceMappingURL=index.js.map