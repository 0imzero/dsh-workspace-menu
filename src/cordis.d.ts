declare module 'cordis' {
  export interface Context {
    effect(fn: () => void | (() => void), label?: string): void
    /** The root context of the composition; stable across service scopes. */
    root: Context
  }
  export default Context
}