# dsh-workspace-menu

A workspace and chat management menu for the DSH home page. Double-click or right-click a workspace or chat to pin, rename, open in the file manager, archive, fork, copy, or open in a new window. Every feature can be toggled from the DSH General settings.

## Highlights

- **Workspace actions**: pin, rename, open in file explorer, copy path, new session, delete workspace
- **Chat actions**: pin, rename, mark unread/read, archive, fork, copy session link, copy session title, open in new window, open containing folder
- **Cross-platform**: Windows Explorer, macOS Finder, and Linux with `xdg-open` / `gio` / common file managers
- **Settings integrated**: feature toggles live in the DSH General settings, are collapsible, and can be enabled individually
- **No built-in source changes**: rows are located via DOM events and React fiber; DSH built-in code is untouched

## Features

Project row (double-click or right-click):

- Pin / unpin
- Rename
- Open in file explorer
- Copy path
- New session
- Delete workspace

Chat row (double-click or right-click):

- Pin / unpin
- Rename
- Mark unread / read
- Archive session
- Fork session
- Copy session link
- Copy session title
- Open in new window
- Open containing folder

Settings are integrated into the DSH General settings page; each feature can be enabled or disabled individually.

## Install

Download the tgz from Releases and run:

```bash
dsh plugin --profile web add dsh-external-dsh-workspace-menu-1.1.0.tgz
```

Build locally:

```bash
npm install
npm run build:client
```

## Notes

- "Open in file explorer" calls the host to launch the system file manager: Windows Explorer on Windows, Finder on macOS, and `xdg-open` / `gio` / common file managers on Linux.
- Pin and unread state is stored in browser localStorage.
- Opening in a new window uses the `?session=<id>` deep link.
- The settings item is located in DSH Settings → General and can be collapsed or expanded.
