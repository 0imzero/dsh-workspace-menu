import { fileURLToPath } from 'node:url'
import type { UserConfig } from 'tsdown'

const PLUGIN_ID = "@dsh-external/dsh-workspace-menu"

/**
 * DSH 0.2.x client externals.
 *
 * The plugin's browser half only needs React at runtime. Every DSH service it
 * uses (`slots`, `sessions`, `workspaces`, `uiWorkspace`, `locale`) arrives
 * through the Cordis fiber, not through a module import, so those packages are
 * NOT externals any more — DSH 0.2.x dropped `@deepseek-ai/dsh-client-runtime`
 * and inlined the client packages into the frontend bundle.
 */
const CLIENT_EXTERNALS = [
  'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client',
  'cordis',
]

const clientBundle: UserConfig = {
  entry: { client: 'src/client/index.ts' },
  outDir: 'lib',
  format: 'cjs',
  platform: 'browser',
  dts: false,
  sourcemap: true,
  clean: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  },
  deps: {
    neverBundle: [...CLIENT_EXTERNALS],
    alwaysBundle: (id: string) => !CLIENT_EXTERNALS.includes(id),
  },
  outputOptions: {
    entryFileNames: 'client.js',
    banner: 'window.__ModuleLoader__.load({ id: ' + JSON.stringify(PLUGIN_ID) + ', factory: (require) => {',
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
    codeSplitting: false,
  },
}

export default [clientBundle] satisfies UserConfig[]