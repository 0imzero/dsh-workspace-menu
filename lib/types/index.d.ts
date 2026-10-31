import type { Context } from 'cordis';
interface HttpRequest {
    url?: string;
    method?: string;
    headers: Record<string, string | string[] | undefined>;
    [Symbol.asyncIterator](): AsyncIterator<string | Uint8Array>;
}
interface HttpResponse {
    statusCode: number;
    writeHead(status: number, headers?: Record<string, string>): void;
    end(body?: string | Uint8Array): void;
}
interface WebServer {
    register(route: {
        kind: 'exact' | 'prefix';
        path: string;
        handler: (req: HttpRequest, res: HttpResponse) => void | Promise<void>;
    }): () => void;
}
interface WebStartup {
    trustedHosts: readonly string[];
}
type AppContext = Context & {
    webServer: WebServer;
    webStartup: WebStartup;
    sessionPersistence: {
        stat(id: string): Promise<unknown>;
        open(id: string, access: 'write'): Promise<{
            close(): Promise<void>;
        }>;
    };
    sessions: {
        get(id: string): unknown;
    };
    workspaceRegistry: {
        archivedSessionIds: readonly string[];
        archiveSession(id: string, options?: {
            stopActivity?: boolean;
        }): Promise<void>;
        unarchiveSession(id: string): Promise<void>;
        unpinSession(id: string): Promise<void>;
        list(): Array<{
            sessionIds: readonly string[];
            detachSession(id: string): Promise<void>;
        }>;
    };
};
export declare const name = "@dsh-external/dsh-workspace-menu";
export declare const inject: string[];
export declare function apply(ctx: AppContext): void;
export {};
