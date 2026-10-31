# Changelog

## 2.0.3

- Match the DSH Web font and font-size settings in menus, rename dialogs, notifications, and the plugin settings page.

## 2.0.2

- Leave the current chat before deleting it, so its row can disappear without a manual page refresh.
- Archive and queue sessions that are still in use, then retry deletion when possible and after restart. Unarchiving cancels a pending deletion.
- Stop workspace directory deletion while one of its session deletions is still pending.

## 2.0.1

- Reject `.` and `..` as session IDs and skip linked session buckets when deleting records.
- Protect parent directories of the DSH home, user home, current directory, and system directory from workspace deletion, including case variations on Windows.
- Stop workspace deletion if a session record cannot be removed, instead of silently continuing.

## 2.0.0 — DSH 0.2.x adaptation

Breaking: this release targets DSH 0.2.x only (`dsh >= 0.2.1-rc.3`).

- **Fix the settings entry disappearing.** The 0.1.x build imported
  `IconChevronDownOutline14` from `@deepseek-ai/dsh-client-ui-primitives`;
  DSH 0.2.x renamed that icon to `IconChevronDownOutlineMedium` /
  `IconChevronDownOutlineRegular`. The missing export made the settings
  component throw while rendering, and the slot runtime silently abdicated
  the entry — the plugin looked installed but had no settings row at all.
  The settings UI now draws its own chevron and depends on no icon export.
- **Move the settings out of the General row into their own page.** DSH 0.2.x
  documents `settings.general.item` as the seat for a *single* setting that
  needs no page of its own, and `settings.section` as the seat for a page.
  The plugin registers a `settings.section` entry (`dsh-workspace-menu`).
- **Own a locale namespace.** The plugin registers `zh` / `en` dictionaries
  and renders its page title, menu labels and dialogs through `ctx.locale`,
  so they follow the active UI language.
- **Navigate through the view owner.** `ctx.sessions.open()` and
  `ctx.workspaces.startSession()` were removed in 0.2.x; the plugin now uses
  `ctx.uiWorkspace.openSession()` / `startSession()` / `forkSession()`.
- **Host-authoritative session pinning.** The pin set moved to the Workspace
  Controller (`pinnedSessionIds` + `uiWorkspace.pinSession` / `unpinSession`),
  so the plugin's pin now agrees with DSH's built-in "pin session" button.
  Workspace pinning stays local because 0.2.x has no workspace-level pin.
- **New action: unarchive.** DSH 0.2.x exposes the archive set and
  `unarchiveSession()`, so the session menu offers "unarchive" for sessions
  that are currently archived.
- **Self-contained permanent deletion.** The plugin used to delegate session
  log deletion to `@mlgbnb/dsh-archive-manager`, which is not part of a
  stock installation. It now owns `POST /dsh-workspace-menu/delete-session`,
  which removes `$DSH_HOME/sessions/<bucket>/<sessionId>/` and nothing else.
- **Host API fixes.** `webRuntime` is gone in 0.2.x; the host half now
  injects `webStartup` and reads `ctx.webStartup.trustedHosts`.
- **Route lease fix.** The lease was keyed by `ctx.webServer`, a per-scope
  service proxy, so a second mount of the same bundle missed the lease and
  registered the same exact route twice (`duplicate exact route`). It is now
  keyed by the root context.
- **Drop the removed client packages.** `@deepseek-ai/dsh-client-runtime` and
  `@deepseek-ai/dsh-client-ui-primitives` no longer exist in 0.2.x; the client
  half declares the small slice of the 0.2.x contract it uses locally, so the
  package builds without a DSH checkout and without version-coupling to
  unpublished client packages.
- Drop `ctx.workspaces.refresh()` (0.2.x projects the list live).

## 1.2.0

- Add host route lease (`WeakMap` reference counting) so duplicate loader
  applications no longer crash with `duplicate exact route`.
- Add "delete workspace (including disk)" action: session records are removed
  through `@mlgbnb/dsh-archive-manager`, then the project directory is removed
  via a narrow protected host route.
- Add "delete session (including disk)" action that delegates to
  `@mlgbnb/dsh-archive-manager`; the plugin does not write archive/projcache
  files itself.
- Add proper host build (`tsconfig.host.json` + `tsc`) so `src/index.ts` is
  compiled instead of hand-maintaining `lib/index.js`.

## 1.1.3

- DSH rc8 compatibility: simplify the bundle patch so the plugin no longer gets disabled by the runtime-injected entry guard.

## 1.1.2

- Add `dsh.bundle.patch` manifest so the plugin installs with the official `dsh plugin add` flow.

## 1.1.1

- Update README with feature highlights and General settings integration notes.

## 1.1.0

- Make the General settings item collapsible.
- Align the settings item with the DSH Language / Appearance row styles.

## 1.0.0

- Integrate settings into the DSH General settings page.
- Align settings UI with DSH design tokens.
- Cross-platform file manager opening.

## 0.1.x

- Initial workspace/chat context menu.
- Host route for opening directories in the system file manager.
- Fix context menu being closed by chat auto-scroll.
