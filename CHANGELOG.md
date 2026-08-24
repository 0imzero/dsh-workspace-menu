# Changelog

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
