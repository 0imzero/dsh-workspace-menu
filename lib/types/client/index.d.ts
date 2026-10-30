import type { Context } from 'cordis';
import type { IWorkspaces, ISessions, LocaleRuntime, SlotsService, UiWorkspace } from './types.ts';
type ClientContext = Context & {
    slots: SlotsService;
    sessions: ISessions;
    workspaces: IWorkspaces;
    uiWorkspace: UiWorkspace;
    locale: LocaleRuntime;
};
/** Required client services. */
export declare const inject: string[];
export declare function apply(ctx: ClientContext): void;
export {};
