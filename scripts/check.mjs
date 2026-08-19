#!/usr/bin/env node
/**
 * Package sanity check for dsh-workspace-menu.
 * Verifies the bundle manifest and the files the package promises to ship.
 */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const pkgPath = resolve(root, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))

const errors = []

if (!pkg.dsh?.bundle?.patch) {
  errors.push('package.json: missing dsh.bundle.patch')
} else if (!existsSync(resolve(root, pkg.dsh.bundle.patch))) {
  errors.push(`package.json: dsh.bundle.patch file not found: ${pkg.dsh.bundle.patch}`)
}

for (const file of ['lib/index.js', 'lib/client.js', 'cordis.patch.yml']) {
  if (!existsSync(resolve(root, file))) {
    errors.push(`missing file: ${file}`)
  }
}

if (errors.length > 0) {
  console.error('check failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log('check ok')
