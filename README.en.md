# DSH Workspace Menu

[简体中文](README.md) · **English**

Add a context menu to workspaces and chats on the DSH home page. Right-click or double-click a row to rename it, copy a path, archive a chat, and more.

> **Compatibility:** v2.0.0 and later support DSH 0.2.x (`>= 0.2.1-rc.3`). For DSH 0.1.x, use [v1.2.0](https://github.com/0imzero/dsh-workspace-menu/releases/tag/v1.2.0).

## Installation

Install from npm:

```bash
dsh plugin --profile web add @0imzero/dsh-workspace-menu
```

Alternatively, download the package from [Releases](https://github.com/0imzero/dsh-workspace-menu/releases/latest), then run this command from the download directory:

```bash
dsh plugin --profile web add dsh-external-dsh-workspace-menu-2.0.3.tgz
```

Restart DSH, then right-click or double-click a workspace or chat on the home page. You can turn individual actions on or off under **Settings → Workspace menu**. The settings page is available in English and Chinese.

When switching from the older `@dsh-external/dsh-workspace-menu` package to the npm package, remove the old package first to avoid loading both.

## What you can do

**Workspaces**

- Pin or unpin, and rename
- Open in the file manager, copy the path, or start a new chat
- Remove from the list while keeping files, or delete the workspace and its directory after a second confirmation

**Chats**

- Pin or unpin, rename, and mark as read or unread
- Archive, unarchive, and fork
- Copy the chat link or title, open in a new window, or open the containing folder
- Delete the chat and its disk records after a second confirmation

## Notes

- Chat pins share the state used by DSH's built-in pin button. Workspace pins and unread markers are stored in the current browser's localStorage.
- Deleting a chat archives it and opens a new chat first. If DSH still holds the record, deletion is retried later; unarchiving cancels a pending deletion.
- The file manager action uses Windows Explorer, macOS Finder, or an available Linux program such as `xdg-open` or `gio`.
- Opening a chat in a new window uses the plugin's `?session=<id>` link.
- Permanent deletion is handled by the plugin's host routes; `@mlgbnb/dsh-archive-manager` is not required. Session records live under `$DSH_HOME/sessions/<workspace-slug>/<sessionId>/`.
- The plugin locates workspace and chat rows through DOM events and React fiber, without modifying DSH's built-in source.

## Local development

```bash
npm install
npm run build
npm test
```

## License

[BSD 3-Clause](LICENSE)
