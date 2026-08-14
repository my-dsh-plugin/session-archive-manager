#!/usr/bin/env node
/**
 * Apply the bundled core patch (patches/dsh-core-unarchive-delete.patch) to a
 * sibling deepseek-harness source checkout, then print the rebuild steps.
 *
 * Usage: node scripts/apply-patch.mjs [path-to-harness]
 * (defaults to ../deepseek-harness next to this repository)
 *
 * The patch is pinned to harness base commit 47f943859b; a checkout on a
 * different commit may need `git apply -3` or manual resolution.
 */

import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const harness = resolve(process.argv[2] ?? resolve(repoRoot, '..', 'deepseek-harness'))
const patch = resolve(repoRoot, 'patches', 'dsh-core-unarchive-delete.patch')

if (!existsSync(patch)) {
  console.error(`missing patch file: ${patch}`)
  process.exit(1)
}
if (!existsSync(resolve(harness, 'package.json'))) {
  console.error(`no deepseek-harness checkout at ${harness}; pass the path as the first argument`)
  process.exit(1)
}

try {
  execFileSync('git', ['apply', '--check', patch], { cwd: harness, stdio: 'inherit' })
} catch {
  console.error(`\nThe patch does not apply cleanly to ${harness}.`)
  console.error('It is pinned to harness base commit 47f943859b; try `git apply -3` or check the harness version.')
  process.exit(1)
}
execFileSync('git', ['apply', patch], { cwd: harness, stdio: 'inherit' })
console.log(`\nApplied ${patch} to ${harness}`)
console.log('Next, rebuild the harness runtime and client libs, then restart it:')
console.log(`  cd ${harness}`)
console.log('  npm run build:lib:host')
console.log('  npm run build:lib:client')
console.log('Then install this plugin into your profile per the README and restart the GUI.')
