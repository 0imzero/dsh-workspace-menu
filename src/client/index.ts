/**
 * @dsh-external/dsh-workspace-menu — client half (DSH 0.2.x).
 *
 * 在 DSH 主页的工作区（Project）与会话（Chat）行上增强交互：
 * - 双击或右键 Project 行：置顶 / 重命名 / 在资源管理器中打开 / 复制路径 / 新建会话 / 移除 / 删除（含磁盘）
 * - 双击或右键 Chat 行：置顶 / 重命名 / 标记未读 / 归档 / 取消归档 / 分叉 / 复制链接 / 复制标题 /
 *   新窗口打开 / 打开所在目录 / 删除（含磁盘记录）
 *
 * 0.2.x 适配要点：
 * - 导航与领域动作统一走 `ctx.uiWorkspace`（`ctx.sessions.open` / `ctx.workspaces.startSession`
 *   在 0.2.x 已移除）。
 * - 会话置顶改用 Host 权威的 pin 集合（`pinnedSessionIds` + `uiWorkspace.pinSession`），
 *   与内置「置顶会话」按钮保持一致，不再用 localStorage 模拟。
 * - 设置从 General 单行改成独立的 `settings.section` 页面，并注册自己的 locale 命名空间。
 * - 永久删除会话改为调用本插件自己的 Host 路由，不再依赖未安装的 dsh-archive-manager。
 */
import { createElement, useState, type CSSProperties, type ReactNode } from 'react'
import type { Context } from 'cordis'
import type {
  IWorkspaces,
  ISessions,
  LocaleRuntime,
  SessionSummary,
  SlotsService,
  UiWorkspace,
  WorkspaceView,
} from './types.ts'
import { en, NS, zh } from './locales.ts'

type ClientContext = Context & {
  slots: SlotsService
  sessions: ISessions
  workspaces: IWorkspaces
  uiWorkspace: UiWorkspace
  locale: LocaleRuntime
}

interface PersistedState {
  pinnedWorkspaces: string[]
  unreadSessions: string[]
  features: Record<string, boolean>
}

type FeatureKey =
  | 'dblclick'
  | 'contextmenu'
  | 'workspacePin'
  | 'workspaceRename'
  | 'workspaceOpenExplorer'
  | 'workspaceCopyPath'
  | 'workspaceNewSession'
  | 'workspaceDelete'
  | 'workspaceDeleteDisk'
  | 'sessionPin'
  | 'sessionRename'
  | 'sessionUnread'
  | 'sessionArchive'
  | 'sessionUnarchive'
  | 'sessionFork'
  | 'sessionCopyLink'
  | 'sessionCopyTitle'
  | 'sessionOpenWindow'
  | 'sessionOpenFolder'
  | 'sessionDelete'

const FEATURE_KEYS: FeatureKey[] = [
  'dblclick',
  'contextmenu',
  'workspacePin',
  'workspaceRename',
  'workspaceOpenExplorer',
  'workspaceCopyPath',
  'workspaceNewSession',
  'workspaceDelete',
  'workspaceDeleteDisk',
  'sessionPin',
  'sessionRename',
  'sessionUnread',
  'sessionArchive',
  'sessionUnarchive',
  'sessionFork',
  'sessionCopyLink',
  'sessionCopyTitle',
  'sessionOpenWindow',
  'sessionOpenFolder',
  'sessionDelete',
]

const DEFAULT_FEATURES: Record<FeatureKey, boolean> = {
  dblclick: true,
  contextmenu: true,
  workspacePin: true,
  workspaceRename: true,
  workspaceOpenExplorer: true,
  workspaceCopyPath: true,
  workspaceNewSession: true,
  workspaceDelete: true,
  workspaceDeleteDisk: true,
  sessionPin: true,
  sessionRename: true,
  sessionUnread: true,
  sessionArchive: true,
  sessionUnarchive: true,
  sessionFork: true,
  sessionCopyLink: true,
  sessionCopyTitle: true,
  sessionOpenWindow: true,
  sessionOpenFolder: true,
  sessionDelete: true,
}

const FEATURE_GROUPS: Array<{ title: string; keys: FeatureKey[] }> = [
  { title: 'group.trigger', keys: ['dblclick', 'contextmenu'] },
  { title: 'group.workspace', keys: ['workspacePin', 'workspaceRename', 'workspaceOpenExplorer', 'workspaceCopyPath', 'workspaceNewSession', 'workspaceDelete', 'workspaceDeleteDisk'] },
  { title: 'group.session', keys: ['sessionPin', 'sessionRename', 'sessionUnread', 'sessionArchive', 'sessionUnarchive', 'sessionFork', 'sessionCopyLink', 'sessionCopyTitle', 'sessionOpenWindow', 'sessionOpenFolder', 'sessionDelete'] },
]

interface RowInfo {
  kind: 'workspace' | 'session'
  id: string
  title: string
}

interface MenuItem {
  id: string
  label: string
  danger?: boolean
  disabled?: boolean
  onClick: () => void
}

const PLUGIN_ID = '@dsh-external/dsh-workspace-menu'
const SECTION_ID = 'dsh-workspace-menu'
const SECTION_ORDER = 130
const STORAGE_KEY = 'dsh-workspace-menu:v1'
const MENU_CLASS = 'dsh-ws-menu'
const MODAL_CLASS = 'dsh-ws-modal'

/** Translate one of the plugin's own keys through the active UI language. */
function translator(ctx: ClientContext): (key: string, params?: Record<string, unknown>) => string {
  return (key, params) => ctx.locale.bind(NS)(key, params)
}

const defaultState = (): PersistedState => ({
  pinnedWorkspaces: [],
  unreadSessions: [],
  features: { ...DEFAULT_FEATURES },
})

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    return {
      pinnedWorkspaces: Array.isArray(parsed.pinnedWorkspaces) ? parsed.pinnedWorkspaces : [],
      unreadSessions: Array.isArray(parsed.unreadSessions) ? parsed.unreadSessions : [],
      features: { ...DEFAULT_FEATURES, ...(parsed.features ?? {}) },
    }
  } catch {
    return defaultState()
  }
}

function isFeatureEnabled(state: PersistedState, key: FeatureKey): boolean {
  return state.features[key] !== false
}

function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage unavailable — keep the session-local behavior only.
  }
}

function toggleId(list: readonly string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
}

/**
 * Read the React fiber attached to a built-in row DOM node and recover the
 * component props (group/node). This lets us map a row to its workspace/session
 * id without touching the built-in package source.
 */
function fiberPropsOf(el: Element): Record<string, any> | undefined {
  const key = Object.keys(el).find((k) => k.startsWith('__reactFiber$'))
  if (!key) return undefined
  let fiber: any = (el as any)[key]
  for (let i = 0; fiber && i < 30; i++) {
    const props = fiber.memoizedProps
    const sessionNode = props?.node?.id !== undefined
      && typeof props.node.updatedAt === 'number'
      && typeof props.node.blank === 'boolean'
    if (props && (props.group !== undefined || sessionNode)) return props
    fiber = fiber.return
  }
  return undefined
}

function rowInfo(el: Element): RowInfo | undefined {
  const props = fiberPropsOf(el)
  if (props?.node?.id !== undefined && typeof props.node.updatedAt === 'number' && typeof props.node.blank === 'boolean') {
    const node = props.node
    return {
      kind: 'session',
      id: String(node.id),
      title: String(node.title ?? node.displayTitle ?? ''),
    }
  }
  if (props?.group !== undefined) {
    const group = props.group
    const workspaceId = group.workspaceId === undefined ? '' : String(group.workspaceId)
    if (!workspaceId) return undefined
    return {
      kind: 'workspace',
      id: workspaceId,
      title: String(group.label ?? ''),
    }
  }
  return undefined
}

function deepLink(sessionId: string): string {
  const url = new URL(window.location.href)
  url.searchParams.set('session', sessionId)
  return url.toString()
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
      return true
    } catch {
      return false
    }
  }
}

async function postJson(path: string, body: unknown): Promise<void> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    let message = `failed (${response.status})`
    try {
      const data = await response.json() as { error?: { message?: string } | string }
      if (typeof data.error === 'string') message = data.error
      else if (data.error?.message) message = data.error.message
    } catch {
      // keep status message
    }
    throw new Error(message)
  }
}

/** 调用宿主路由，在操作系统文件管理器（Windows 资源管理器等）中打开目录或定位文件。 */
async function openInExplorer(path: string): Promise<void> {
  await postJson('/dsh-workspace-menu/open-in-explorer', { path })
}

/** 删除工作区目录（会话记录先由 deleteSession 清理，目录由本插件安全移除）。 */
async function deleteWorkspaceDirectory(path: string): Promise<void> {
  await postJson('/dsh-workspace-menu/delete-workspace-directory', { path })
}

/** 永久删除会话记录（宿主的 session 日志目录）。 */
async function deleteSessionRecord(sessionId: string): Promise<void> {
  await postJson('/dsh-workspace-menu/delete-session', { sessionId })
}

function flashMessage(message: string): void {
  const old = document.querySelector('.dsh-ws-toast')
  old?.remove()
  const toast = document.createElement('div')
  toast.className = 'dsh-ws-toast'
  toast.textContent = message
  document.body.appendChild(toast)
  window.setTimeout(() => toast.remove(), 1600)
}

function removeMenu(): void {
  document.querySelectorAll(`.${MENU_CLASS}`).forEach((el) => el.remove())
}

function showMenu(x: number, y: number, items: MenuItem[]): void {
  removeMenu()
  const menu = document.createElement('div')
  menu.className = MENU_CLASS
  menu.setAttribute('role', 'menu')
  for (const item of items) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `dsh-ws-menu-item${item.danger ? ' dsh-ws-menu-item-danger' : ''}`
    button.textContent = item.label
    button.disabled = item.disabled === true
    button.setAttribute('role', 'menuitem')
    button.addEventListener('click', (event) => {
      event.stopPropagation()
      removeMenu()
      item.onClick()
    })
    menu.appendChild(button)
  }
  document.body.appendChild(menu)
  const rect = menu.getBoundingClientRect()
  const margin = 8
  const left = Math.min(Math.max(margin, x), window.innerWidth - rect.width - margin)
  const top = Math.min(Math.max(margin, y), window.innerHeight - rect.height - margin)
  menu.style.left = `${left}px`
  menu.style.top = `${top}px`

  const close = (event: Event): void => {
    if (event.target instanceof Node && menu.contains(event.target)) return
    removeMenu()
    cleanup()
  }
  const onKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      removeMenu()
      cleanup()
    }
  }
  const onResize = (): void => {
    removeMenu()
    cleanup()
  }
  const cleanup = (): void => {
    document.removeEventListener('mousedown', close, true)
    document.removeEventListener('keydown', onKey, true)
    window.removeEventListener('blur', cleanup)
    window.removeEventListener('resize', cleanup)
  }
  document.addEventListener('mousedown', close, true)
  document.addEventListener('keydown', onKey, true)
  window.addEventListener('blur', cleanup)
  window.addEventListener('resize', cleanup)
}

function promptText(ctx: ClientContext, title: string, initial: string): Promise<string | null> {
  const t = translator(ctx)
  return new Promise((resolve) => {
    removeMenu()
    const old = document.querySelector(`.${MODAL_CLASS}`)
    old?.remove()
    const backdrop = document.createElement('div')
    backdrop.className = `${MODAL_CLASS}-backdrop`
    const box = document.createElement('div')
    box.className = MODAL_CLASS
    const heading = document.createElement('h3')
    heading.textContent = title
    const input = document.createElement('input')
    input.type = 'text'
    input.value = initial
    input.spellcheck = false
    const error = document.createElement('div')
    error.className = `${MODAL_CLASS}-error`
    error.style.display = 'none'
    const footer = document.createElement('div')
    footer.className = `${MODAL_CLASS}-footer`
    const cancel = document.createElement('button')
    cancel.type = 'button'
    cancel.textContent = t('dialog.cancel')
    const ok = document.createElement('button')
    ok.type = 'button'
    ok.className = `${MODAL_CLASS}-ok`
    ok.textContent = t('dialog.confirm')
    const close = (result: string | null): void => {
      backdrop.remove()
      resolve(result)
    }
    cancel.addEventListener('click', () => close(null))
    ok.addEventListener('click', () => {
      const value = input.value.trim()
      if (!value) {
        error.textContent = t('dialog.nameEmpty')
        error.style.display = 'block'
        return
      }
      close(value)
    })
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') ok.click()
      if (event.key === 'Escape') close(null)
    })
    backdrop.addEventListener('mousedown', (event) => {
      if (event.target === backdrop) close(null)
    })
    footer.append(cancel, ok)
    box.append(heading, input, error, footer)
    backdrop.appendChild(box)
    document.body.appendChild(backdrop)
    input.focus()
    input.select()
  })
}

/** Host-authoritative pinned Session set (0.2.x keeps it on the Workspace Controller). */
function pinnedSessions(ctx: ClientContext): readonly string[] {
  try {
    return ctx.workspaces.list.getSnapshot().pinnedSessionIds ?? []
  } catch {
    return []
  }
}

/** Host-authoritative archived Session set. */
function archivedSessions(ctx: ClientContext): readonly string[] {
  try {
    return ctx.workspaces.list.getSnapshot().archivedSessionIds ?? []
  } catch {
    return []
  }
}

function refreshBadges(ctx: ClientContext): void {
  const state = loadState()
  const pinned = pinnedSessions(ctx)
  const rows = document.querySelectorAll<HTMLElement>('[role="treeitem"]')
  for (const row of rows) {
    const info = rowInfo(row)
    if (!info) continue
    if (info.kind === 'workspace') {
      row.dataset.dshWorkspaceId = info.id || undefined
      row.dataset.dshPinned = state.pinnedWorkspaces.includes(info.id) ? 'true' : 'false'
      row.dataset.dshUnread = 'false'
    } else {
      row.dataset.dshSessionId = info.id
      row.dataset.dshPinned = pinned.includes(info.id) ? 'true' : 'false'
      row.dataset.dshUnread = state.unreadSessions.includes(info.id) ? 'true' : 'false'
    }
  }
}

function getWorkspace(ctx: ClientContext, id: string): WorkspaceView | undefined {
  return ctx.workspaces.list.getSnapshot().items.find((w) => w.workspaceId === id)
}

function getSession(ctx: ClientContext, id: string): SessionSummary | undefined {
  return ctx.sessions.list.getSnapshot().byId[id]
}

function workspaceMenu(ctx: ClientContext, workspaceId: string, title: string): MenuItem[] {
  const t = translator(ctx)
  const state = loadState()
  const ws = getWorkspace(ctx, workspaceId)
  const pinned = state.pinnedWorkspaces.includes(workspaceId)
  const items: MenuItem[] = []
  if (isFeatureEnabled(state, 'workspacePin')) {
    items.push({
      id: 'pin',
      label: pinned ? t('menu.unpin') : t('menu.pin'),
      onClick: () => {
        const next = toggleId(state.pinnedWorkspaces, workspaceId)
        saveState({ ...loadState(), pinnedWorkspaces: next })
        if (!pinned) {
          const ordered = ctx.workspaces.list.getSnapshot().items
          const first = ordered[0]
          if (first && first.workspaceId !== workspaceId) {
            ctx.workspaces.insertBefore(workspaceId, first.workspaceId).catch((e) => {
              console.warn('[dsh-workspace-menu] pin workspace failed', e)
            })
          }
        }
        flashMessage(pinned ? t('toast.unpinned') : t('toast.pinned'))
        refreshBadges(ctx)
      },
    })
  }
  if (isFeatureEnabled(state, 'workspaceRename')) {
    items.push({
      id: 'rename',
      label: t('menu.rename'),
      onClick: () => {
        void promptText(ctx, t('dialog.renameWorkspace'), title).then((name) => {
          if (!name) return
          ctx.workspaces.rename(workspaceId, name).catch((e) => {
            console.warn('[dsh-workspace-menu] rename workspace failed', e)
            flashMessage(t('toast.renameFailed'))
          })
        })
      },
    })
  }
  if (isFeatureEnabled(state, 'workspaceOpenExplorer')) {
    items.push({
      id: 'open',
      label: t('menu.openExplorer'),
      onClick: () => {
        if (!ws) return
        openInExplorer(ws.path).catch((e) => {
          console.warn('[dsh-workspace-menu] open in explorer failed', e)
          flashMessage(t('toast.openFailed', { reason: e instanceof Error ? e.message : String(e) }))
        })
      },
    })
  }
  if (isFeatureEnabled(state, 'workspaceCopyPath')) {
    items.push({
      id: 'copy-path',
      label: t('menu.copyPath'),
      onClick: () => {
        if (!ws) return
        void copyText(ws.path).then((ok) => flashMessage(ok ? t('toast.pathCopied') : t('toast.copyFailed')))
      },
    })
  }
  if (isFeatureEnabled(state, 'workspaceNewSession')) {
    items.push({
      id: 'new-session',
      label: t('menu.newSession'),
      onClick: () => {
        // 0.2.x: navigation and session creation are owned by the UI service.
        ctx.uiWorkspace.startSession(workspaceId)
      },
    })
  }
  if (isFeatureEnabled(state, 'workspaceDelete')) {
    items.push({
      id: 'delete',
      label: t('menu.removeWorkspace'),
      danger: true,
      onClick: () => {
        const ok = window.confirm(t('dialog.removeWorkspace', { title }))
        if (!ok) return
        ctx.workspaces.delete(workspaceId).catch((e) => {
          console.warn('[dsh-workspace-menu] delete workspace failed', e)
          flashMessage(t('toast.removeFailed'))
        })
      },
    })
  }
  if (isFeatureEnabled(state, 'workspaceDeleteDisk')) {
    items.push({
      id: 'delete-disk',
      label: t('menu.deleteWorkspace'),
      danger: true,
      disabled: !ws,
      onClick: () => {
        if (!ws) return
        const first = window.confirm(t('dialog.deleteWorkspace', { title }))
        if (!first) return
        const second = window.confirm(t('dialog.deleteWorkspaceTwice', { title }))
        if (!second) return
        const run = async (): Promise<void> => {
          for (const sessionId of ws.sessionIds) {
            await deleteSessionRecord(sessionId).catch(() => undefined)
          }
          await deleteWorkspaceDirectory(ws.path)
          await ctx.workspaces.delete(workspaceId)
        }
        run().then(() => {
          flashMessage(t('toast.workspaceDeleted'))
        }).catch((e) => {
          console.warn('[dsh-workspace-menu] delete workspace disk failed', e)
          flashMessage(t('toast.deleteFailed', { reason: e instanceof Error ? e.message : String(e) }))
        })
      },
    })
  }
  return items
}

function sessionMenu(ctx: ClientContext, sessionId: string, title: string): MenuItem[] {
  const t = translator(ctx)
  const state = loadState()
  const session = getSession(ctx, sessionId)
  const pinned = pinnedSessions(ctx).includes(sessionId)
  const unread = state.unreadSessions.includes(sessionId)
  const archived = archivedSessions(ctx).includes(sessionId)
  const items: MenuItem[] = []
  if (isFeatureEnabled(state, 'sessionPin')) {
    items.push({
      id: 'pin',
      label: pinned ? t('menu.unpin') : t('menu.pin'),
      onClick: () => {
        const action = pinned ? ctx.uiWorkspace.unpinSession(sessionId) : ctx.uiWorkspace.pinSession(sessionId)
        action.catch((e) => {
          console.warn('[dsh-workspace-menu] pin session failed', e)
        }).finally(() => refreshBadges(ctx))
        flashMessage(pinned ? t('toast.unpinned') : t('toast.pinned'))
      },
    })
  }
  if (isFeatureEnabled(state, 'sessionRename')) {
    items.push({
      id: 'rename',
      label: t('menu.rename'),
      onClick: () => {
        void promptText(ctx, t('dialog.renameSession'), title).then((name) => {
          if (!name) return
          const binding = ctx.sessions.binding(sessionId)
          if (!binding) {
            flashMessage(t('toast.renameUnavailable'))
            return
          }
          binding.session.rename(name).then((result) => {
            if (!result.ok) throw new Error(result.error?.message ?? 'rename rejected')
          }).catch((e) => {
            console.warn('[dsh-workspace-menu] rename session failed', e)
            flashMessage(t('toast.renameFailed'))
          })
        })
      },
    })
  }
  if (isFeatureEnabled(state, 'sessionUnread')) {
    items.push({
      id: 'unread',
      label: unread ? t('menu.markRead') : t('menu.markUnread'),
      onClick: () => {
        const next = toggleId(state.unreadSessions, sessionId)
        saveState({ ...loadState(), unreadSessions: next })
        flashMessage(unread ? t('toast.read') : t('toast.unread'))
        refreshBadges(ctx)
      },
    })
  }
  if (isFeatureEnabled(state, 'sessionArchive') && !archived) {
    items.push({
      id: 'archive',
      label: t('menu.archive'),
      onClick: () => {
        ctx.uiWorkspace.archiveSession(sessionId).catch((e) => {
          console.warn('[dsh-workspace-menu] archive session failed', e)
          flashMessage(t('toast.archiveFailed'))
        })
      },
    })
  }
  if (isFeatureEnabled(state, 'sessionUnarchive') && archived) {
    items.push({
      id: 'unarchive',
      label: t('menu.unarchive'),
      onClick: () => {
        ctx.uiWorkspace.unarchiveSession(sessionId).catch((e) => {
          console.warn('[dsh-workspace-menu] unarchive session failed', e)
          flashMessage(t('toast.unarchiveFailed'))
        })
      },
    })
  }
  if (isFeatureEnabled(state, 'sessionFork')) {
    items.push({
      id: 'fork',
      label: t('menu.fork'),
      onClick: () => {
        ctx.uiWorkspace.forkSession(sessionId, (childId) => {
          ctx.uiWorkspace.openSession(childId)
        }).catch((e) => {
          console.warn('[dsh-workspace-menu] fork session failed', e)
          flashMessage(t('toast.forkFailed'))
        })
      },
    })
  }
  if (isFeatureEnabled(state, 'sessionCopyLink')) {
    items.push({
      id: 'copy-link',
      label: t('menu.copyLink'),
      onClick: () => {
        void copyText(deepLink(sessionId)).then((ok) => flashMessage(ok ? t('toast.linkCopied') : t('toast.copyFailed')))
      },
    })
  }
  if (isFeatureEnabled(state, 'sessionCopyTitle')) {
    items.push({
      id: 'copy-title',
      label: t('menu.copyTitle'),
      onClick: () => {
        void copyText(title).then((ok) => flashMessage(ok ? t('toast.titleCopied') : t('toast.copyFailed')))
      },
    })
  }
  if (isFeatureEnabled(state, 'sessionOpenWindow')) {
    items.push({
      id: 'open-window',
      label: t('menu.openWindow'),
      onClick: () => {
        window.open(deepLink(sessionId), '_blank')
      },
    })
  }
  if (isFeatureEnabled(state, 'sessionOpenFolder')) {
    items.push({
      id: 'open-folder',
      label: t('menu.openFolder'),
      disabled: !session?.cwd,
      onClick: () => {
        if (!session?.cwd) return
        openInExplorer(session.cwd).catch((e) => {
          console.warn('[dsh-workspace-menu] open session cwd failed', e)
          flashMessage(t('toast.openFailed', { reason: e instanceof Error ? e.message : String(e) }))
        })
      },
    })
  }
  if (isFeatureEnabled(state, 'sessionDelete')) {
    items.push({
      id: 'delete',
      label: t('menu.deleteSession'),
      danger: true,
      onClick: () => {
        const first = window.confirm(t('dialog.deleteSession', { title }))
        if (!first) return
        const second = window.confirm(t('dialog.deleteSessionTwice', { title }))
        if (!second) return
        deleteSessionRecord(sessionId).then(() => {
          flashMessage(t('toast.sessionDeleted'))
          void ctx.sessions.refresh()
        }).catch((e) => {
          console.warn('[dsh-workspace-menu] delete session failed', e)
          flashMessage(t('toast.deleteFailed', { reason: e instanceof Error ? e.message : String(e) }))
        })
      },
    })
  }
  return items
}

function handleRowEvent(event: MouseEvent, ctx: ClientContext): void {
  const state = loadState()
  if (event.type === 'dblclick' && !isFeatureEnabled(state, 'dblclick')) return
  if (event.type === 'contextmenu' && !isFeatureEnabled(state, 'contextmenu')) return
  const target = event.target instanceof Element ? event.target : undefined
  const row = target?.closest<HTMLElement>('[role="treeitem"]')
  if (!row) return
  const info = rowInfo(row)
  if (!info) return
  if (event.type === 'contextmenu') event.preventDefault()
  if (event.type !== 'dblclick' && event.type !== 'contextmenu') return
  event.stopPropagation()
  const items = info.kind === 'workspace'
    ? workspaceMenu(ctx, info.id, info.title)
    : sessionMenu(ctx, info.id, info.title)
  if (items.length === 0) return
  showMenu(event.clientX, event.clientY, items)
}
function injectStyles(): () => void {
  const style = document.createElement('style')
  style.textContent = `
    .${MENU_CLASS} {
      position: fixed;
      z-index: 2147483000;
      width: max-content;
      min-width: 130px;
      max-width: 220px;
      padding: 4px;
      background: rgba(255, 255, 255, 0.65);
      background: color-mix(in srgb, var(--dsw-alias-bg-layer-3, #ffffff) 62%, transparent);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.5));
      border-radius: 10px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), inset 0 0 1px rgba(255, 255, 255, 0.2);
      font: 13px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif;
      color: var(--dsw-alias-label-primary, #1a1a1a);
      user-select: none;
    }
    .${MENU_CLASS}-item {
      display: block;
      width: 100%;
      box-sizing: border-box;
      text-align: left;
      padding: 5px 9px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
      white-space: nowrap;
    }
    .${MENU_CLASS}-item:hover:not(:disabled) {
      background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.06));
    }
    .${MENU_CLASS}-item:disabled {
      opacity: .5;
      cursor: default;
    }
    .${MENU_CLASS}-item-danger {
      color: #d33;
    }
    .${MODAL_CLASS}-backdrop {
      position: fixed;
      inset: 0;
      z-index: 2147483001;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.35);
    }
    .${MODAL_CLASS} {
      min-width: 280px;
      padding: 16px;
      border-radius: 10px;
      background: var(--dsw-alias-bg-layer-3, #ffffff);
      color: var(--dsw-alias-label-primary, #1a1a1a);
      font: 13px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
    }
    .${MODAL_CLASS} h3 {
      margin: 0 0 10px;
      font-size: 14px;
      font-weight: 600;
    }
    .${MODAL_CLASS} input {
      width: 100%;
      box-sizing: border-box;
      padding: 6px 8px;
      border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
      border-radius: 6px;
      background: var(--dsw-alias-bg-input, transparent);
      color: inherit;
      font: inherit;
    }
    .${MODAL_CLASS}-error {
      margin-top: 6px;
      color: #d33;
      font-size: 12px;
    }
    .${MODAL_CLASS}-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 14px;
    }
    .${MODAL_CLASS}-footer button {
      padding: 5px 12px;
      border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
      border-radius: 6px;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
    .${MODAL_CLASS}-ok {
      background: var(--dsw-alias-brand, #4d6bfe) !important;
      border-color: transparent !important;
      color: #fff !important;
    }
    .dsh-ws-toast {
      position: fixed;
      left: 50%;
      bottom: 32px;
      z-index: 2147483002;
      transform: translateX(-50%);
      padding: 8px 14px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.78);
      color: #fff;
      font: 13px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif;
      pointer-events: none;
    }
    [data-dsh-pinned="true"] [data-dsh-workspace-title],
    [data-dsh-pinned="true"] [data-dsh-session-title] {
      font-weight: 600;
    }
    [data-dsh-unread="true"] [data-dsh-session-title]::after {
      content: " ●";
      color: var(--dsw-alias-brand, #4d6bfe);
    }
  `
  document.head.appendChild(style)
  return () => style.remove()
}

function Switch(props: { checked: boolean; onChange: (value: boolean) => void; label: string }): ReactNode {
  const { checked, onChange, label } = props
  const track: CSSProperties = {
    position: 'relative',
    width: 36,
    height: 20,
    borderRadius: 999,
    background: checked ? 'var(--dsw-alias-brand, #4d6bfe)' : 'var(--dsw-alias-bg-input, #2a2a32)',
    transition: 'background .18s ease',
    flex: 'none',
  }
  const thumb: CSSProperties = {
    position: 'absolute',
    top: 2,
    left: checked ? 18 : 2,
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: '#fff',
    transition: 'left .18s ease',
  }
  return createElement(
    'label',
    { style: { display: 'inline-flex', cursor: 'pointer', flex: 'none' } },
    createElement('input', {
      type: 'checkbox',
      checked,
      'aria-label': label,
      onChange: (event: any) => onChange(event.currentTarget.checked),
      style: { position: 'absolute', opacity: 0, width: 0, height: 0 },
    }),
    createElement('span', { style: track }, createElement('span', { style: thumb })),
  )
}

interface SettingsPageProps {
  t: (key: string, params?: Record<string, unknown>) => string
}

function SettingsPage(props: SettingsPageProps): ReactNode {
  const { t } = props
  const [state, setState] = useState<PersistedState>(() => loadState())

  const toggle = (key: FeatureKey, value: boolean): void => {
    const next = {
      ...loadState(),
      features: { ...state.features, [key]: value },
    }
    saveState(next)
    setState(next)
  }

  const container: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  }
  const head: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginBottom: 8,
  }
  const title: CSSProperties = {
    margin: 0,
    fontSize: 14,
    fontWeight: 400,
    lineHeight: '22px',
    color: 'var(--dsw-alias-label-primary, inherit)',
  }
  const desc: CSSProperties = {
    margin: 0,
    fontSize: 12,
    lineHeight: '18px',
    color: 'var(--dsw-alias-label-tertiary, inherit)',
  }
  const body: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '4px 0 8px',
  }
  const groupTitle: CSSProperties = {
    padding: '12px 0 2px',
    fontSize: 12,
    fontWeight: 600,
    lineHeight: '18px',
    color: 'var(--dsw-alias-label-tertiary, inherit)',
    textTransform: 'uppercase',
    letterSpacing: '.04em',
  }
  const toggleRow: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 36,
    fontSize: 13,
    lineHeight: '20px',
    color: 'var(--dsw-alias-label-primary, inherit)',
  }

  return createElement(
    'div',
    { style: container, 'data-dsh-workspace-menu-settings': 'true' },
    createElement(
      'div',
      { style: head },
      createElement('h3', { style: title }, t('page.title')),
      createElement('p', { style: desc }, t('page.desc')),
    ),
    createElement(
      'div',
      { style: body },
      FEATURE_GROUPS.map((group) =>
        createElement(
          'div',
          { key: group.title },
          createElement('div', { style: groupTitle }, t(group.title)),
          group.keys.map((key) =>
            createElement(
              'div',
              { key, style: toggleRow },
              createElement('span', null, t(`feature.${key}`)),
              createElement(Switch, {
                checked: state.features[key] !== false,
                onChange: (value: boolean) => toggle(key, value),
                label: t(`feature.${key}`),
              }),
            ),
          ),
        ),
      ),
    ),
  )
}

/**
 * Deep-link support: `?session=<id>` opens that session once the catalog
 * knows it. 0.2.x has no built-in URL routing, so the plugin owns it and
 * navigates through the view owner (`ctx.uiWorkspace.openSession`).
 */
function handleDeepLink(ctx: ClientContext): () => void {
  const target = new URLSearchParams(window.location.search).get('session')
  if (!target) return () => undefined
  let tries = 0
  const timer = window.setInterval(() => {
    tries += 1
    const byId = ctx.sessions.list.getSnapshot().byId
    if (byId[target]) {
      window.clearInterval(timer)
      ctx.uiWorkspace.openSession(target)
      return
    }
    if (tries >= 30) {
      window.clearInterval(timer)
      // Try one explicit refresh before giving up.
      ctx.sessions.refresh().then(() => {
        if (ctx.sessions.list.getSnapshot().byId[target]) ctx.uiWorkspace.openSession(target)
      }).catch(() => undefined)
    }
  }, 250)
  return () => window.clearInterval(timer)
}

/** Required client services. */
export const inject = ['slots', 'sessions', 'workspaces', 'uiWorkspace', 'locale']

export function apply(ctx: ClientContext): void {
  const t = translator(ctx)

  // Register the plugin's own locale namespace first so the settings section
  // title and every menu label follow the active UI language.
  ctx.effect(() => {
    return ctx.locale.register(NS, { zh, en })
  }, `${PLUGIN_ID}: locale dictionaries`)

  ctx.effect(() => {
    let started = false
    let cleanup: (() => void) | undefined

    const start = (): void => {
      if (started) return
      // 防止在 <body> 尚未解析完成时 observe(null) 抛错，导致刷新后菜失效。
      if (!document.body) {
        document.addEventListener('DOMContentLoaded', start, { once: true })
        return
      }
      started = true
      const removeStyle = injectStyles()
      const onDoubleClick = (event: MouseEvent): void => handleRowEvent(event, ctx)
      const onContextMenu = (event: MouseEvent): void => handleRowEvent(event, ctx)
      document.addEventListener('dblclick', onDoubleClick, true)
      document.addEventListener('contextmenu', onContextMenu, true)

      let raf = 0
      const observer = new MutationObserver(() => {
        window.cancelAnimationFrame(raf)
        raf = window.requestAnimationFrame(() => refreshBadges(ctx))
      })
      observer.observe(document.body, { childList: true, subtree: true })
      refreshBadges(ctx)

      cleanup = () => {
        window.cancelAnimationFrame(raf)
        observer.disconnect()
        document.removeEventListener('dblclick', onDoubleClick, true)
        document.removeEventListener('contextmenu', onContextMenu, true)
        removeStyle()
        removeMenu()
        document.querySelectorAll(`.${MODAL_CLASS}-backdrop`).forEach((el) => el.remove())
      }
    }

    start()
    return () => {
      if (!started) document.removeEventListener('DOMContentLoaded', start)
      cleanup?.()
    }
  }, `${PLUGIN_ID}: row menu`)

  // 0.2.x: the plugin owns a whole settings page, so it registers a
  // `settings.section` entry instead of a single General row.
  ctx.slots.inject('settings.section', () => {
    return ctx.slots.register({
      name: 'settings.section',
      id: SECTION_ID,
      order: SECTION_ORDER,
      label: () => t('nav'),
      locale: NS,
      inject: () => ({ t }),
    }, SettingsPage)
  })

  // Deep-link support for "在新窗口中打开" / "复制会话链接".
  ctx.effect(() => handleDeepLink(ctx), `${PLUGIN_ID}: deep link`)
}