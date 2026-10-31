# dsh-workspace-menu

A workspace and chat management menu for the DSH home page. Double-click or right-click a workspace or chat to pin, rename, open in the file manager, archive, fork, copy, or open in a new window. Every feature can be toggled from the plugin's own page in the DSH settings panel.

> **v2.0.0 and later require DSH 0.2.x** (`dsh >= 0.2.1-rc.3`). Use v1.2.x for 0.1.x.

## Highlights

- **Workspace actions**: pin, rename, open in file explorer, copy path, new session, remove from list, delete workspace (including disk)
- **Chat actions**: pin, rename, mark unread/read, archive, unarchive, fork, copy session link, copy session title, open in new window, open containing folder, delete session (including disk records)
- **Host-authoritative session pinning**: shares the pin set with DSH's built-in "pin session" button, so it survives reloads, browsers and devices
- **Cross-platform**: Windows Explorer, macOS Finder, and Linux with `xdg-open` / `gio` / common file managers
- **Settings as its own page**: Settings → Workspace menu, 20 individual toggles, English and Chinese
- **No built-in source changes**: rows are located via DOM events and React fiber; DSH built-in code is untouched
- **Self-contained deletion**: session records and the workspace directory are removed by this plugin's own host routes

## Features

Project row (double-click or right-click):

- Pin / unpin
- Rename
- Open in file explorer
- Copy path
- New session
- Remove from workspace list (keeps disk)
- Delete workspace (including disk, double confirmation)

Chat row (double-click or right-click):

- Pin / unpin
- Rename
- Mark unread / read
- Archive session
- Unarchive session (shown when the session is in the archive set)
- Fork session
- Copy session link
- Copy session title
- Open in new window
- Open containing folder
- Delete session (including disk records, double confirmation)

Settings live on their own page: **Settings → Workspace menu**, with every feature toggleable individually.

## Install

Download the tgz from Releases and run:

```bash
dsh plugin --profile web add dsh-external-dsh-workspace-menu-2.0.1.tgz
```

Build locally:

```bash
npm install
npm run build
```

## Notes

- "Open in file explorer" calls the host to launch the system file manager: Windows Explorer on Windows, Finder on macOS, and `xdg-open` / `gio` / common file managers on Linux.
- **Workspace** pinning and the unread marker are stored in browser localStorage; **session** pinning is owned by the Host (a 0.2.x built-in) and is no longer kept locally.
- Opening in a new window uses the `?session=<id>` deep link; DSH 0.2.x has no URL routing of its own, so the plugin owns it.
- The settings page is at DSH Settings → Workspace menu.
- "Delete session (including disk records)" and "Delete workspace (including disk)" are handled by this plugin's own host routes; `@mlgbnb/dsh-archive-manager` is no longer required.
- Session records live in `$DSH_HOME/sessions/<workspace-slug>/<sessionId>/`; a delete only ever matches the directory whose name equals the requested session id.
