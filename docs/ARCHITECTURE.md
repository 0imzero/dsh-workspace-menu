# Architecture

## Host half

`src/index.ts` registers one exact route:

```
POST /dsh-workspace-menu/open-in-explorer
```

The route is guarded by the same loopback/trusted-host fence used by DSH API
routes. It receives an absolute path, then launches the platform file manager:

- Windows: `explorer.exe`
- macOS: `open`
- Linux: `xdg-open`, then `gio`, `nautilus`, `dolphin`, `thunar`, `pcmanfm`

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
