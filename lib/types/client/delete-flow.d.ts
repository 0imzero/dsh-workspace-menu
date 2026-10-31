import type { UiWorkspace } from './types.js';
/** Leave the session before requesting permanent removal. */
export declare function leaveAndDelete(ui: UiWorkspace, sessionId: string, workspaceId: string | undefined, remove: (id: string) => Promise<boolean>): Promise<boolean>;
