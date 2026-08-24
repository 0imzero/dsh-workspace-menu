# Architecture

## Host half

`src/index.ts` registers routes through a shared `WeakMap<WebServer, RouteLease>`
so hot-reload or duplicate loader applications never register the same exact
route twice.

Routes:

```
POST /dsh-workspace-menu/open-in-explorer
POST /dsh-workspace-menu/delete-workspace-directory
```

`open-in-explorer` is guarded by the same loopback/trusted-host fence used by
DSH API routes. It receives an absolute path, then launches the platform file
manager:

- Windows: `explorer.exe`
- macOS: `open`
- Linux: `xdg-open`, then `gio`, `nautilus`, `dolphin`, `thunar`, `pcmanfm`

`delete-workspace-directory` only removes a project directory after the client
has already asked `@mlgbnb/dsh-archive-manager` to delete the workspace's
session records. It refuses to delete protected paths (home, DSH home, drive
roots, cwd). Session data deletion itself is intentionally delegated to
`dsh-archive-manager` to avoid conflicting with its workspace/projcache writes.

## Client half

`src/client/index.ts` is loaded by the DSH web client. It:

1. Listens for `dblclick` and `contextmenu` on the document.
2. Finds the closest `[role="treeitem"]` row.
3. Reads the React fiber attached to that row to decide whether it is a
   workspace row or a session row. This avoids matching file trees or subagent
   trees that also use `role="treeitem"`.
4. Shows a menu with the enabled actions.
5. Registers a collapsible settings item into the DSH General settings page
   through the `settings.general.item` slot.

Feature flags are stored in `localStorage` under `dsh-workspace-menu:v1`.

## Deep links

"Open in new window" builds a URL with `?session=<id>`. On load the client
reads the query parameter and opens the matching session once the session list
has it.
