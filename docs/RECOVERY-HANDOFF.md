# dsh-workspace-menu：中断更新恢复交接

更新时间：2026-08-25

> 状态：已恢复。后续 1.2.0 在“不重复实现会话永久删除”的前提下，新增了
> “删除工作区（含磁盘）”和“删除会话（含磁盘记录）”：会话记录统一调用
> `@mlgbnb/dsh-archive-manager` 的 `/api/dsh-archive-manager/delete`，
> 本插件只增加一条受保护的工作区目录删除路由，避免两套写入逻辑冲突。

## 目标

恢复 `@dsh-external/dsh-workspace-menu` 在当前 DSH Web profile 下的启动，并使其与当前 DSH WebServer 和持久化契约兼容。

该插件的作用是为 DSH 首页的工作区（Project）和会话（Chat）行提供双击/右键菜单：置顶、重命名、在系统文件管理器中打开、复制路径/链接、归档、分叉、新窗口打开，以及在 General 设置页中的开关。

## 启动故障与根因

报错：

```text
webserver: duplicate exact route "/dsh-workspace-menu/open-in-explorer"
```

失败发生在 `src/index.ts` 的 Host 路由注册处。当前 DSH 的 `ctx.webServer.register()` 以 `(kind, path)` 为唯一键；同一个精确路由注册第二次会直接抛错。

该插件通过本地 link 安装在 Web profile：

```text
C:\Users\Zero\.dsh\profiles\web\package.json
  @dsh-external/dsh-workspace-menu -> link:D:\DeepSeekHarness\extensions\dsh-workspace-menu
```

在开发热重载/重复 loader 应用的情形下，插件 Host half 被应用了不止一次。旧实现每次 `apply()` 都直接注册 `/dsh-workspace-menu/open-in-explorer`，故第二次应用时启动失败。

## 已完成的源码修改（尚未构建）

以下修改已写入源码，但 `lib/` 仍是中断更新生成的旧产物；必须重新构建后才能生效。

### 1. 重复加载安全的路由租约

文件：`src/index.ts`

- 添加 `WeakMap<WebServer, RouteLease>`。
- `acquireRoutes(ctx)`：同一 `WebServer` 已有路由租约时仅递增引用计数，不再次调用 `register()`。
- `releaseRoutes()`：只有最后一个插件实例释放时才调用 WebServer 返回的 disposer。
- `apply()` 改为单一 `ctx.effect(() => acquireRoutes(ctx), ...)`。

这样同一个 DSH WebServer 上只会注册一份 `POST /dsh-workspace-menu/open-in-explorer`，但正常卸载仍会释放路由。

### 2. 移除中断更新中不安全的删除实现

中断更新曾计划加入：

```text
POST /dsh-workspace-menu/delete-session
POST /dsh-workspace-menu/delete-workspace
```

并直接对 `sessionPersistence.locate()` 得到的路径和工作区路径执行 `rm`。该做法已从 `src/index.ts` 移除；客户端中对应的会话“删除（含磁盘记录）”开关、请求和菜单项也已移除。

原因：当前 DSH 的公开契约没有 session 的持久删除 API。`workspaceRegistry.delete()` 的定义是**仅移除工作区注册**，保留目录及会话日志；`sessionPersistence` 也可以由 SQLite 等没有“每个会话一个文件”的后端实现。直接删路径会绕过内存索引、缓存和持久化协调，不能作为兼容最新版 DSH 的实现。

工作区菜单保留官方支持的动作，但文案改为：

```text
从工作区列表中移除
```

确认文案明确说明目录和会话记录仍保留在磁盘上。

## 已安装的归档永久删除功能

用户所见的“归档后直接删除”来自第三方插件：

```text
@mlgbnb/dsh-archive-manager@1.0.7
C:\Users\Zero\.dsh\profiles\web\node_modules\@mlgbnb\dsh-archive-manager
```

该插件在“设置 → 插件 → 归档管理”中提供归档预览、恢复和物理删除。它不是 DSH 原生公开 API：实现直接修改 `workspace.json`、`session_projcache.json`、Registry 私有成员，并递归删除存储目录。因此 `dsh-workspace-menu` 不应再重复实现同类会话永久删除功能，否则两套数据文件写入逻辑会互相干扰，并增加随 DSH 升级损坏数据的风险。

## 当前工作树状态

`src/index.ts` 和 `src/client/index.ts` 已包含上述恢复改动。

`lib/index.js`、`lib/client.js` 和 `lib/client.js.map` 仍包含中断更新的旧删除功能，且尚未包含路由租约。因此当前启动仍会加载旧 `lib/index.js` 并报重复路由，直至完成构建。

不要手动删除 `lib/`，应由项目构建脚本重建。

## 待完成工作

在目录 `D:\DeepSeekHarness\extensions\dsh-workspace-menu` 中执行：

```powershell
npm run typecheck
npm run build:client
npm run check
node --check lib/index.js
```

注意：现有 `npm run build:client` 只会使用 `tsdown` 构建浏览器端 `lib/client.js`。Host 端 `src/index.ts` 的构建方式需要确认；当前 `scripts/build.sh` 只执行 `node --check lib/index.js`，不会从 TypeScript 重建它。

应先检查项目已有的发布/构建方式，确保 `src/index.ts` 被编译为 ESM `lib/index.js` 且生成类型声明。可行做法是新增明确的 host 构建脚本（例如 `tsc -p tsconfig.json`，若其输出符合 package layout），再令 `npm run build` 串联 host 与 client 构建。不得手工复制 TypeScript 到 `lib/index.js`。

构建后验证：

```powershell
dsh --profile web
```

成功标准：出现 Web UI 启动地址，且日志中不再包含 `duplicate exact route "/dsh-workspace-menu/open-in-explorer"`。随后在浏览器中测试：

1. 工作区右键“在资源管理器中打开”；
2. 工作区右键“从工作区列表中移除”（确认不会删磁盘目录）；
3. 会话右键归档；
4. 设置 → 插件 → 归档管理中的“物理删除”仍由 `@mlgbnb/dsh-archive-manager` 独立处理。

## 文档待同步

完成构建并验证后：

1. 更新 `docs/ARCHITECTURE.md`，明确 Host half 仅有 `open-in-explorer` 一条路由；
2. 在 `CHANGELOG.md` 新增版本条目，记录“重复 loader 下的 route lease 兼容修复”和“不再重复实现永久删除”；
3. 用 `git diff` 检查只包含本次恢复所需变更，再按当前项目发布流程打包/发版。
