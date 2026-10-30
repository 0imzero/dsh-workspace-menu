# Architecture

Target: **DSH 0.2.x** (`dsh >= 0.2.1-rc.3`). The plugin is split into a Node
host half and a browser client half, and it depends on no DSH package at
runtime.

## Host half — `src/index.ts`

Compiled with `tsc -p tsconfig.host.json` into `lib/index.js`.

Services: `webServer`, `webStartup`.
(`webRuntime` was the 0.1.x name; DSH 0.2.x renamed it to `webStartup`, which
is where the trusted-host list now lives.)

Routes:

```
POST /dsh-workspace-menu/open-in-explorer
POST /dsh-workspace-menu/delete-workspace-directory
POST /dsh-workspace-menu/delete-session
```

All three sit behind the same loopback / trusted-host / same-origin fence the
DSH API routes use: a cross-origin `Origin` header or a `sec-fetch-site:
cross-site` request is refused with 403, and a request whose `Host` is neither
loopback nor trusted is refused as well.

`open-in-explorer` takes an absolute path and launches the platform file
manager:

- Windows: `explorer.exe` (`/select,` for a file)
- macOS: `open`
- Linux: `xdg-open`, then `gio`, `nautilus`, `dolphin`, `thunar`, `pcmanfm`

`delete-workspace-directory` refuses protected paths (home, DSH home, drive
roots, cwd) before removing anything.

`delete-session` removes one Session's Host record. DSH stores records in
`$DSH_HOME/sessions/<workspace-slug>/<sessionId>/`, and the directory name is
the Session identity, so the handler only ever removes a directory whose name
equals the requested id, inside the sessions root. A Session that never wrote
a log is a no-op.

Route ownership is shared through a `WeakMap` lease keyed by the **root**
context. Keying it by `ctx.webServer` was wrong: that is a per-scope service
proxy, so a second mount of the same bundle (hot reload, a second profile
entry) missed the lease and registered the same exact route twice, which DSH's
web server rejects.

## Client half — `src/client/index.ts`

Bundled with `tsdown` into `lib/client.js` (CJS wrapped in the
`window.__ModuleLoader__.load` handshake). Only `react` stays external; the
0.1.x externals `@deepseek-ai/dsh-client-runtime` and
`@deepseek-ai/dsh-client-ui-primitives` no longer exist in 0.2.x.

Services: `slots`, `sessions`, `workspaces`, `uiWorkspace`, `locale`.

Flow:

1. Listen for `dblclick` and `contextmenu` on the document.
2. Find the closest `[role="treeitem"]` row.
3. Read the React fiber attached to that row to decide whether it is a
   workspace row or a session row. This avoids matching file trees or subagent
   trees that also use `role="treeitem"`.
4. Show a menu with the enabled actions.
5. Register a `settings.section` page into the DSH settings panel, with the
   plugin's own `zh` / `en` locale namespace.

### The 0.2.x API seams the client uses

| Concern | 0.1.x | 0.2.x |
|---|---|---|
| Open a session | `ctx.sessions.open(id)` | `ctx.uiWorkspace.openSession(id)` |
| New session in a workspace | `ctx.workspaces.startSession(id)` | `ctx.uiWorkspace.startSession(id)` |
| Fork | `ctx.sessions.fork(...)` | `ctx.uiWorkspace.forkSession(...)` |
| Pin / unpin a session | localStorage | `ctx.uiWorkspace.pinSession(id)` / `unpinSession(id)`, read from `workspaces.list.getSnapshot().pinnedSessionIds` |
| Archive | `ctx.workspaces.archiveSession(id)` | `ctx.uiWorkspace.archiveSession(id)` (+ `unarchiveSession(id)`) |
| Refresh the workspace list | `ctx.workspaces.refresh()` | the list is a live projection |
| Settings seat | `settings.general.item` | `settings.section` |

Pin state is split on purpose: 0.2.x owns **session** pins on the Host, but
has no workspace-level pin, so **workspace** pinning stays in localStorage.

### State

Feature flags, workspace pins and the unread marker are stored in
`localStorage` under `dsh-workspace-menu:v1`. Session pins are not.

## Deep links

DSH 0.2.x has no URL routing of its own. "Open in new window" and "copy
session link" build a URL with `?session=<id>`; on load the client reads the
query parameter and opens the matching session through
`ctx.uiWorkspace.openSession()` once the catalog knows it (with one explicit
`ctx.sessions.refresh()` before giving up).

## Local type declarations

`src/client/types.ts` declares the slice of the 0.2.x client contract the
plugin consumes. DSH 0.2.x inlines its client packages into the frontend
bundle, so those type packages are not published as standalone 0.2.x
releases; declaring them locally keeps the package buildable against any
0.2.x installation instead of pinning it to an unpublished type surface.