declare module 'cordis' {
  export interface Context {
    effect(fn: () => void | (() => void), label?: string): void
  }
  export default Context
}
