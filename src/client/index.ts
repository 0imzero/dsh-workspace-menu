/**
 * @dsh-external/dsh-workspace-menu — client half.
 *
 * 在 DSH 主页的工作区（Project）与会话（Chat）行上增强交互：
 * - 双击或右键 Project 行：置顶 / 重命名 / 在资源管理器中打开 / 删除工作区 / 复制路径 / 新建会话
 * - 双击或右键 Chat 行：置顶 / 重命名 / 标记未读 / 归档 / 分叉 / 复制链接 / 复制标题 / 新窗口打开 / 打开所在目录
 *
 * 同时注册一个 Settings 设置区，并在 `?session=<id>` 深链到达时自动打开对应会话。
 */
import { createElement, useState, type CSSProperties, type ReactNode } from 'react'
import type { Context } from 'cordis'
import type { SlotsService } from '@deepseek-ai/dsh-client-ui-slots'
import type {
  ISessions,
  IWorkspaces,
  SessionSummary,
  WorkspaceView,
} from '@deepseek-ai/dsh-client-runtime/client'
// Type-only merge: makes `settings.section` visible to the slot registry.
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'

type ClientContext = Context & {
  slots: SlotsService
  sessions: ISessions
  workspaces: IWorkspaces
}

interface PersistedState {
  pinnedWorkspaces: string[]
  pinnedSessions: string[]
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
  | 'sessionPin'
  | 'sessionRename'
  | 'sessionUnread'
  | 'sessionArchive'
  | 'sessionFork'
  | 'sessionCopyLink'
  | 'sessionCopyTitle'
  | 'sessionOpenWindow'
  | 'sessionOpenFolder'

const FEATURE_KEYS: FeatureKey[] = [
  'dblclick',
  'contextmenu',
  'workspacePin',
  'workspaceRename',
  'workspaceOpenExplorer',
  'workspaceCopyPath',
  'workspaceNewSession',
  'workspaceDelete',
  'sessionPin',
  'sessionRename',
  'sessionUnread',
  'sessionArchive',
  'sessionFork',
  'sessionCopyLink',
  'sessionCopyTitle',
  'sessionOpenWindow',
  'sessionOpenFolder',
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
  sessionPin: true,
  sessionRename: true,
  sessionUnread: true,
  sessionArchive: true,
  sessionFork: true,
  sessionCopyLink: true,
  sessionCopyTitle: true,
  sessionOpenWindow: true,
  sessionOpenFolder: true,
}

const FEATURE_LABELS: Record<FeatureKey, string> = {
  dblclick: '双击打开菜单',
  contextmenu: '右键打开菜单',
  workspacePin: '工作区：置顶/取消置顶',
  workspaceRename: '工作区：重命名',
  workspaceOpenExplorer: '工作区：在资源管理器中打开',
  workspaceCopyPath: '工作区：复制路径',
  workspaceNewSession: '工作区：新建会话',
  workspaceDelete: '工作区：删除工作区',
  sessionPin: '会话：置顶/取消置顶',
  sessionRename: '会话：重命名',
  sessionUnread: '会话：标记未读/已读',
  sessionArchive: '会话：归档会话',
  sessionFork: '会话：分叉会话',
  sessionCopyLink: '会话：复制会话链接',
  sessionCopyTitle: '会话：复制会话标题',
  sessionOpenWindow: '会话：在新窗口中打开',
  sessionOpenFolder: '会话：打开所在目录',
}

const FEATURE_GROUPS: Array<{ title: string; keys: FeatureKey[] }> = [
  { title: '触发方式', keys: ['dblclick', 'contextmenu'] },
  { title: 'Project / 工作区功能', keys: ['workspacePin', 'workspaceRename', 'workspaceOpenExplorer', 'workspaceCopyPath', 'workspaceNewSession', 'workspaceDelete'] },
  { title: 'Chat / 会话功能', keys: ['sessionPin', 'sessionRename', 'sessionUnread', 'sessionArchive', 'sessionFork', 'sessionCopyLink', 'sessionCopyTitle', 'sessionOpenWindow', 'sessionOpenFolder'] },
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

const STORAGE_KEY = 'dsh-workspace-menu:v1'
const PLUGIN_ID = '@dsh-external/dsh-workspace-menu'
const MENU_CLASS = 'dsh-ws-menu'
const MODAL_CLASS = 'dsh-ws-modal'

const defaultState = (): PersistedState => ({
  pinnedWorkspaces: [],
  pinnedSessions: [],
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
      pinnedSessions: Array.isArray(parsed.pinnedSessions) ? parsed.pinnedSessions : [],
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

function rowInfo(el: Element, sessions: ISessions, workspaces: IWorkspaces): RowInfo | undefined {
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

/** 调用宿主路由，在操作系统文件管理器（Windows 资源管理器等）中打开目录。 */
async function openInExplorer(path: string): Promise<void> {
  const response = await fetch('/dsh-workspace-menu/open-in-explorer', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ path }),
  })
  if (!response.ok) {
    let message = `open failed (${response.status})`
    try {
      const data = await response.json() as { error?: { message?: string } }
      if (data.error?.message) message = data.error.message
    } catch {
      // keep status message
    }
    throw new Error(message)
  }
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
  const onScroll = (): void => {
    removeMenu()
    cleanup()
  }
  const cleanup = (): void => {
    document.removeEventListener('mousedown', close, true)
    document.removeEventListener('keydown', onKey, true)
    window.removeEventListener('blur', cleanup)
    window.removeEventListener('resize', onScroll)
    document.removeEventListener('scroll', onScroll, true)
  }
  document.addEventListener('mousedown', close, true)
  document.addEventListener('keydown', onKey, true)
  window.addEventListener('blur', cleanup)
  window.addEventListener('resize', onScroll)
  document.addEventListener('scroll', onScroll, true)
}

function promptText(title: string, initial: string): Promise<string | null> {
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
    error.className = 'dsh-ws-modal-error'
    error.style.display = 'none'
    const footer = document.createElement('div')
    footer.className = 'dsh-ws-modal-footer'
    const cancel = document.createElement('button')
    cancel.type = 'button'
    cancel.textContent = '取消'
    const ok = document.createElement('button')
    ok.type = 'button'
    ok.className = 'dsh-ws-modal-ok'
    ok.textContent = '确定'
    const close = (result: string | null): void => {
      backdrop.remove()
      resolve(result)
    }
    cancel.addEventListener('click', () => close(null))
    ok.addEventListener('click', () => {
      const value = input.value.trim()
      if (!value) {
        error.textContent = '名称不能为空'
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

function refreshBadges(ctx: ClientContext): void {
  const state = loadState()
  const rows = document.querySelectorAll<HTMLElement>('[role="treeitem"]')
  for (const row of rows) {
    const info = rowInfo(row, ctx.sessions, ctx.workspaces)
    if (!info) continue
    if (info.kind === 'workspace') {
      row.dataset.dshWorkspaceId = info.id || undefined
      row.dataset.dshPinned = state.pinnedWorkspaces.includes(info.id) ? 'true' : 'false'
      row.dataset.dshUnread = 'false'
    } else {
      row.dataset.dshSessionId = info.id
      row.dataset.dshPinned = state.pinnedSessions.includes(info.id) ? 'true' : 'false'
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
  const state = loadState()
  const ws = getWorkspace(ctx, workspaceId)
  const pinned = state.pinnedWorkspaces.includes(workspaceId)
  const items: MenuItem[] = []
  if (isFeatureEnabled(state, 'workspacePin')) {
    items.push({
      id: 'pin',
      label: pinned ? '取消置顶' : '置顶',
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
        flashMessage(pinned ? '已取消置顶' : '已置顶')
        refreshBadges(ctx)
      },
    })
  }
  if (isFeatureEnabled(state, 'workspaceRename')) {
    items.push({
      id: 'rename',
      label: '重命名',
      onClick: () => {
        void promptText('重命名工作区', title).then((name) => {
          if (!name) return
          ctx.workspaces.rename(workspaceId, name).catch((e) => {
            console.warn('[dsh-workspace-menu] rename workspace failed', e)
            flashMessage('重命名失败')
          })
        })
      },
    })
  }
  if (isFeatureEnabled(state, 'workspaceOpenExplorer')) {
    items.push({
      id: 'open',
      label: '在资源管理器中打开',
      onClick: () => {
        if (!ws) return
        openInExplorer(ws.path).catch((e) => {
          console.warn('[dsh-workspace-menu] open in explorer failed', e)
          flashMessage(`打开失败：${e instanceof Error ? e.message : String(e)}`)
        })
      },
    })
  }
  if (isFeatureEnabled(state, 'workspaceCopyPath')) {
    items.push({
      id: 'copy-path',
      label: '复制路径',
      onClick: () => {
        if (!ws) return
        void copyText(ws.path).then((ok) => flashMessage(ok ? '路径已复制' : '复制失败'))
      },
    })
  }
  if (isFeatureEnabled(state, 'workspaceNewSession')) {
    items.push({
      id: 'new-session',
      label: '新建会话',
      onClick: () => {
        ctx.workspaces.startSession(workspaceId)
      },
    })
  }
  if (isFeatureEnabled(state, 'workspaceDelete')) {
    items.push({
      id: 'delete',
      label: '删除工作区',
      danger: true,
      onClick: () => {
        const ok = window.confirm(`确定删除工作区“${title}”吗？\n目录和聊天记录不会被删除，只会从工作区列表中移除。`)
        if (!ok) return
        ctx.workspaces.delete(workspaceId).catch((e) => {
          console.warn('[dsh-workspace-menu] delete workspace failed', e)
          flashMessage('删除失败')
        })
      },
    })
  }
  return items
}

function sessionMenu(ctx: ClientContext, sessionId: string, title: string): MenuItem[] {
  const state = loadState()
  const session = getSession(ctx, sessionId)
  const pinned = state.pinnedSessions.includes(sessionId)
  const unread = state.unreadSessions.includes(sessionId)
  const workspaceId = ctx.workspaces.list.getSnapshot().items.find((w) =>
    w.sessionIds.includes(sessionId),
  )?.workspaceId
  const items: MenuItem[] = []
  if (isFeatureEnabled(state, 'sessionPin')) {
    items.push({
      id: 'pin',
      label: pinned ? '取消置顶' : '置顶',
      onClick: () => {
        const next = toggleId(state.pinnedSessions, sessionId)
        saveState({ ...loadState(), pinnedSessions: next })
        if (!pinned && workspaceId) {
          const ws = getWorkspace(ctx, workspaceId)
          const first = ws?.sessionIds[0]
          if (ws && first && first !== sessionId) {
            ctx.workspaces.insertSessionBefore(workspaceId, sessionId, first).catch((e) => {
              console.warn('[dsh-workspace-menu] pin session failed', e)
            })
          }
        }
        flashMessage(pinned ? '已取消置顶' : '已置顶')
        refreshBadges(ctx)
      },
    })
  }
  if (isFeatureEnabled(state, 'sessionRename')) {
    items.push({
      id: 'rename',
      label: '重命名',
      onClick: () => {
        void promptText('重命名会话', title).then((name) => {
          if (!name) return
          const session = ctx.sessions.binding(sessionId)?.session
          if (!session) {
            flashMessage('无法重命名：会话尚未加载')
            return
          }
          session.rename(name).then((result) => {
            if (!result.ok) throw new Error(result.error.message)
          }).catch((e) => {
            console.warn('[dsh-workspace-menu] rename session failed', e)
            flashMessage('重命名失败')
          })
        })
      },
    })
  }
  if (isFeatureEnabled(state, 'sessionUnread')) {
    items.push({
      id: 'unread',
      label: unread ? '标记为已读' : '标记为未读',
      onClick: () => {
        const next = toggleId(state.unreadSessions, sessionId)
        saveState({ ...loadState(), unreadSessions: next })
        flashMessage(unread ? '已标记为已读' : '已标记为未读')
        refreshBadges(ctx)
      },
    })
  }
  if (isFeatureEnabled(state, 'sessionArchive')) {
    items.push({
      id: 'archive',
      label: '归档会话',
      onClick: () => {
        ctx.workspaces.archiveSession(sessionId).catch((e) => {
          console.warn('[dsh-workspace-menu] archive session failed', e)
          flashMessage('归档失败')
        })
      },
    })
  }
  if (isFeatureEnabled(state, 'sessionFork')) {
    items.push({
      id: 'fork',
      label: '分叉会话',
      onClick: () => {
        ctx.sessions.fork({ sessionId, increaseTitle: true }).then((childId) => {
          ctx.sessions.open(childId)
        }).catch((e) => {
          console.warn('[dsh-workspace-menu] fork session failed', e)
          flashMessage('分叉失败')
        })
      },
    })
  }
  if (isFeatureEnabled(state, 'sessionCopyLink')) {
    items.push({
      id: 'copy-link',
      label: '复制会话链接',
      onClick: () => {
        void copyText(deepLink(sessionId)).then((ok) => flashMessage(ok ? '链接已复制' : '复制失败'))
      },
    })
  }
  if (isFeatureEnabled(state, 'sessionCopyTitle')) {
    items.push({
      id: 'copy-title',
      label: '复制会话标题',
      onClick: () => {
        void copyText(title).then((ok) => flashMessage(ok ? '标题已复制' : '复制失败'))
      },
    })
  }
  if (isFeatureEnabled(state, 'sessionOpenWindow')) {
    items.push({
      id: 'open-window',
      label: '在新窗口中打开',
      onClick: () => {
        window.open(deepLink(sessionId), '_blank')
      },
    })
  }
  if (isFeatureEnabled(state, 'sessionOpenFolder')) {
    items.push({
      id: 'open-folder',
      label: '打开所在目录',
      disabled: !session?.cwd,
      onClick: () => {
        if (!session?.cwd) return
        openInExplorer(session.cwd).catch((e) => {
          console.warn('[dsh-workspace-menu] open session cwd failed', e)
          flashMessage(`打开失败：${e instanceof Error ? e.message : String(e)}`)
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
  const info = rowInfo(row, ctx.sessions, ctx.workspaces)
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
      min-width: 210px;
      padding: 6px;
      background: var(--dsw-alias-bg-layer-3, #1e1e24);
      border: 1px solid var(--dsw-alias-border-strong, #3a3a44);
      border-radius: 10px;
      box-shadow: 0 10px 34px rgba(0,0,0,.38);
      font: 13px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif;
      color: var(--dsw-alias-label-primary, #e8e8ec);
      user-select: none;
    }
    .${MENU_CLASS}-item {
      display: block;
      width: 100%;
      box-sizing: border-box;
      text-align: left;
      padding: 7px 10px;
      border: none;
      border-radius: 7px;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
    .${MENU_CLASS}-item:hover:not(:disabled) {
      background: var(--dsw-alias-interactive-bg-hover, rgba(255,255,255,.08));
    }
    .${MENU_CLASS}-item:disabled {
      opacity: .5;
      cursor: default;
    }
    .${MENU_CLASS}-item-danger {
      color: var(--dsw-alias-danger, #f26d6d);
    }
    .dsh-ws-toast {
      position: fixed;
      left: 50%;
      bottom: 28px;
      transform: translateX(-50%);
      z-index: 2147483001;
      padding: 8px 14px;
      background: var(--dsw-alias-bg-layer-3, #1e1e24);
      border: 1px solid var(--dsw-alias-border-strong, #3a3a44);
      border-radius: 999px;
      box-shadow: 0 8px 24px rgba(0,0,0,.3);
      font: 13px/1.4 system-ui, sans-serif;
      color: var(--dsw-alias-label-primary, #e8e8ec);
    }
    .${MODAL_CLASS}-backdrop {
      position: fixed;
      inset: 0;
      z-index: 2147483002;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,.35);
    }
    .${MODAL_CLASS} {
      width: min(420px, calc(100vw - 32px));
      padding: 18px;
      background: var(--dsw-alias-bg-layer-3, #1e1e24);
      border: 1px solid var(--dsw-alias-border-strong, #3a3a44);
      border-radius: 14px;
      box-shadow: 0 16px 50px rgba(0,0,0,.45);
      font: 14px/1.5 system-ui, sans-serif;
      color: var(--dsw-alias-label-primary, #e8e8ec);
    }
    .${MODAL_CLASS} h3 {
      margin: 0 0 12px;
      font-size: 16px;
      font-weight: 600;
    }
    .${MODAL_CLASS} input {
      width: 100%;
      box-sizing: border-box;
      padding: 8px 10px;
      border: 1px solid var(--dsw-alias-border-strong, #3a3a44);
      border-radius: 8px;
      background: var(--dsw-alias-bg-input, #141418);
      color: inherit;
      font: inherit;
      outline: none;
    }
    .${MODAL_CLASS} input:focus {
      border-color: var(--dsw-alias-brand, #4d6bfe);
    }
    .${MODAL_CLASS}-error {
      margin-top: 8px;
      color: var(--dsw-alias-danger, #f26d6d);
      font-size: 12px;
    }
    .${MODAL_CLASS}-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
    .${MODAL_CLASS}-footer button {
      padding: 7px 14px;
      border: 1px solid var(--dsw-alias-border-strong, #3a3a44);
      border-radius: 8px;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
    .${MODAL_CLASS}-footer .${MODAL_CLASS}-ok {
      background: var(--dsw-alias-brand, #4d6bfe);
      border-color: transparent;
      color: #fff;
    }
    [role="treeitem"][data-dsh-pinned="true"] {
      box-shadow: inset 2px 0 0 var(--dsw-alias-brand, #4d6bfe);
    }
    [role="treeitem"][data-dsh-unread="true"] {
      box-shadow: inset 2px 0 0 var(--dsw-alias-warning, #f0a020);
    }
  `
  document.head.appendChild(style)
  return () => style.remove()
}

function SettingsSection(): ReactNode {
  const [state, setState] = useState<PersistedState>(() => loadState())

  const toggle = (key: FeatureKey, value: boolean): void => {
    const next = {
      ...loadState(),
      features: { ...state.features, [key]: value },
    }
    saveState(next)
    setState(next)
  }

  const rowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 0',
    cursor: 'pointer',
    fontSize: 13,
    lineHeight: 1.4,
  }
  const groupStyle: CSSProperties = {
    margin: '12px 0 4px',
    fontWeight: 600,
    fontSize: 13,
    color: 'var(--dsw-alias-label-secondary, #a0a0aa)',
  }

  return createElement(
    'div',
    { style: { padding: '4px 2px' } },
    createElement('p', { style: { margin: '0 0 8px', lineHeight: 1.6 } },
      '在这里开关插件提供的各个菜单功能。改动会立即保存到当前浏览器。'),
    FEATURE_GROUPS.map((group) =>
      createElement(
        'div',
        { key: group.title, style: { marginBottom: 8 } },
        createElement('div', { style: groupStyle }, group.title),
        group.keys.map((key) =>
          createElement(
            'label',
            { key, style: rowStyle },
            createElement('input', {
              type: 'checkbox',
              checked: state.features[key] !== false,
              onChange: (event) => toggle(key, event.currentTarget.checked),
            }),
            createElement('span', null, FEATURE_LABELS[key]),
          ),
        ),
      ),
    ),
  )
}

function handleDeepLink(ctx: ClientContext): () => void {
  const target = new URLSearchParams(window.location.search).get('session')
  if (!target) return () => undefined
  let tries = 0
  const timer = window.setInterval(() => {
    tries += 1
    const byId = ctx.sessions.list.getSnapshot().byId
    if (byId[target]) {
      window.clearInterval(timer)
      ctx.sessions.open(target)
      return
    }
    if (tries >= 30) {
      window.clearInterval(timer)
      // Try one explicit refresh before giving up.
      ctx.sessions.refresh().then(() => {
        if (ctx.sessions.list.getSnapshot().byId[target]) ctx.sessions.open(target)
      }).catch(() => undefined)
    }
  }, 250)
  return () => window.clearInterval(timer)
}

export const inject = ['slots', 'sessions', 'workspaces']

export function apply(ctx: ClientContext): void {
  ctx.effect(() => {
    let started = false
    let cleanup: (() => void) | undefined

    const start = (): void => {
      if (started) return
      // 防止在 <body> 尚未解析完成时 observe(null) 抛错，导致刷新后菜单失效。
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

  // Settings section: appears in DSH 系统设置.
  ctx.effect(() => {
    return ctx.slots.inject('settings.section', () =>
      ctx.slots.register({
        name: 'settings.section',
        id: PLUGIN_ID,
        order: 300,
        label: () => '工作区菜单',
      }, SettingsSection),
    )
  }, `${PLUGIN_ID}: settings section`)

  // Deep-link support for "在新窗口中打开" / "复制会话链接".
  ctx.effect(() => handleDeepLink(ctx), `${PLUGIN_ID}: deep link`)
}
