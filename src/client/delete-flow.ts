import type { UiWorkspace } from './types.js'

/** Leave the session before requesting permanent removal. */
export async function leaveAndDelete(
  ui: UiWorkspace,
  sessionId: string,
  workspaceId: string | undefined,
  remove: (id: string) => Promise<boolean>,
): Promise<boolean> {
  await ui.archiveSession(sessionId, { stopActivity: true })
  if (workspaceId) await ui.openWorkspace(workspaceId)
  else ui.startSession()
  return remove(sessionId)
}
