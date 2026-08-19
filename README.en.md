# dsh-workspace-menu

Enhancement menu for workspaces and chats on the DSH home page.

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

Each feature can be enabled or disabled in the DSH settings page.

## Install

Download the tgz from Releases and run:

```bash
dsh plugin --profile web add dsh-external-dsh-workspace-menu-0.1.0.tgz
```

Build locally:

```bash
npm install
npm run build:client
```

## Notes

- Does not modify DSH built-in source; locates rows via DOM events and React fiber.
- "Open in file explorer" calls the host to launch the system file manager: Windows Explorer on Windows, Finder on macOS, and xdg-open / gio / common file managers on Linux.
- Pin and unread state is stored in browser localStorage.
- Opening in a new window uses the `?session=<id>` deep link.
