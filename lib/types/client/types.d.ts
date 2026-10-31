/**
 * Minimal local declarations of the DSH 0.2.x client contracts this plugin
 * uses.
 *
 * DSH 0.2.x inlines its client packages into the frontend bundle, so the
 * upstream type packages are not published as standalone 0.2.x releases.
 * Declaring the slice of the contract we actually consume here keeps the
 * plugin dependency-free and buildable against any 0.2.x installation,
 * instead of pinning it to an unpublished type surface.
 *
 * Every shape below mirrors DSH 0.2.1-rc.5:
 * - `ctx.sessions` is the Session Controller (no `open()`; navigation moved to
 *   the view owner `ctx.uiWorkspace`).
 * - `ctx.workspaces` is the Workspace Controller (no `refresh()`; the list is a
 *   live projection, and it owns the Host-authoritative session pin set).
 * - `ctx.uiWorkspace` is the navigation/action service owned by ui-workspace.
 */
/** One row of the Host-authoritative Session catalog. */
export interface SessionSummary {
    id: string;
    title?: string;
    displayTitle: string;
    cwd?: string;
    running: boolean;
    blank: boolean;
    updatedAt: number;
}
/** Snapshot of the Session catalog. */
export interface SessionListSnapshot {
    ids: string[];
    byId: Record<string, SessionSummary>;
}
/** One durable Workspace projected for browser consumers. */
export interface WorkspaceView {
    workspaceId: string;
    path: string;
    title: string;
    sessionIds: readonly string[];
    createdAt: string;
    updatedAt: string;
}
/** Snapshot of the Workspace registry. */
export interface WorkspaceListSnapshot {
    items: readonly WorkspaceView[];
    /** Registry-global archive set, Host order. */
    archivedSessionIds: readonly string[];
    /** Registry-global pin set, most recently pinned first. */
    pinnedSessionIds: readonly string[];
}
/** Read side of a controller projection. */
export interface SnapshotSource<T> {
    getSnapshot(): T;
    subscribe(listener: () => void): () => void;
}
/** The Workspace Controller service face (`ctx.workspaces`). */
export interface IWorkspaces {
    readonly list: SnapshotSource<WorkspaceListSnapshot>;
    rename(workspaceId: string, title: string): Promise<WorkspaceView>;
    delete(workspaceId: string): Promise<void>;
    insertBefore(workspaceId: string, beforeWorkspaceId?: string): Promise<void>;
}
/** The outward face of one materialized Session. */
export interface SessionFace {
    rename(title: string): Promise<{
        ok: boolean;
        error?: {
            message?: string;
        };
    }>;
}
/** One borrowed Session binding. */
export interface SessionBinding {
    readonly sessionId: string;
    readonly session: SessionFace;
}
/** The Session Controller service face (`ctx.sessions`). */
export interface ISessions {
    readonly list: SnapshotSource<SessionListSnapshot>;
    refresh(): Promise<void>;
    fork(opts: {
        sessionId: string;
        increaseTitle?: boolean;
    }): Promise<string>;
    binding(id: string): SessionBinding | undefined;
}
/** The Workspace navigation/action service (`ctx.uiWorkspace`). */
export interface UiWorkspace {
    openSession(target: string): void;
    openWorkspace(workspaceId: string): Promise<void>;
    startSession(workspaceId?: string, options?: {
        agentPreset?: string;
    }): void;
    archiveSession(sessionId: string, options?: {
        stopActivity?: boolean;
    }): Promise<void>;
    unarchiveSession(sessionId: string): Promise<void>;
    pinSession(sessionId: string): Promise<void>;
    unpinSession(sessionId: string): Promise<void>;
    forkSession(sessionId: string, onCreated?: (childId: string) => void): Promise<string>;
}
/** One registered slot occupant. */
export interface SlotEntry {
    options: {
        id?: string;
        order?: number;
        label?: unknown;
    };
}
/** The slot registry service face (`ctx.slots`). */
export interface SlotsService {
    /** Register one occupant of a slot; returns the disposer. */
    register(options: Record<string, unknown>, component: unknown): () => void;
    /** Run `callback` once the slot is declared; returns the disposer. */
    inject(key: string, callback: () => unknown): () => void;
    /** List the occupants of a slot. */
    entries(key: string): SlotEntry[];
}
/** The locale registry service face (`ctx.locale`). */
export interface LocaleRuntime {
    register(ns: string, dicts: Record<string, Record<string, string>>): () => void;
    bind(ns: string): (key: string, params?: Record<string, unknown>) => string;
}
