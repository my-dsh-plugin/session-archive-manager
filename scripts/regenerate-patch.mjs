#!/usr/bin/env node
/**
 * Regenerate patches/dsh-core-unarchive-delete.patch from a deepseek-harness
 * checkout whose master carries the core extension commits on top of the
 * pinned base. Run this after the harness upstream moves so the bundled patch
 * stays in sync: bump BASE below, regenerate, and re-verify with
 * `git apply --check` on the new base.
 *
 * Usage: node scripts/regenerate-patch.mjs [path-to-harness]
 * (defaults to ../deepseek-harness next to this repository)
 */

import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const harness = resolve(process.argv[2] ?? resolve(repoRoot, '..', 'deepseek-harness'))
const patch = resolve(repoRoot, 'patches', 'dsh-core-unarchive-delete.patch')

/** Harness upstream commit the extension was developed against. */
const BASE = process.env.DSH_PATCH_BASE ?? '47f943859b'

if (!existsSync(resolve(harness, 'package.json'))) {
  console.error(`no deepseek-harness checkout at ${harness}; pass the path as the first argument`)
  process.exit(1)
}

try {
  execFileSync('git', ['rev-parse', '--verify', `${BASE}^{commit}`], { cwd: harness, stdio: 'ignore' })
} catch {
  console.error(`base commit ${BASE} does not exist in ${harness}`)
  process.exit(1)
}

// The patch carries only the session-archive-manager core extension; the
// unrelated ui-settings-models locale work in the author checkout is excluded.
const diff = execFileSync('git', [
  'diff', `${BASE}..HEAD`, '--', '.',
  ':(exclude)packages/client/ui-settings-models/**',
], { cwd: harness, encoding: 'utf8' })
if (diff.trim().length === 0) {
  console.error(`no diff between ${BASE} and HEAD; nothing to write`)
  process.exit(1)
}

const { writeFileSync } = await import('node:fs')
writeFileSync(patch, diff)

// Verify the FRESH patch reverse-applies cleanly against the checkout, i.e.
// it describes HEAD exactly — a stale or partial write would fail here.
try {
  execFileSync('git', ['apply', '--check', '--reverse', patch], { cwd: harness, stdio: 'pipe' })
} catch {
  console.error(`regenerated patch does not describe ${BASE}..HEAD exactly; refusing`)
  process.exit(1)
}

console.log(`Regenerated ${patch} from ${BASE}..HEAD`)
console.log('Verify it applies cleanly to the new base before committing:')
console.log(`  git -C ${harness} stash && git apply --check ${patch} && git stash pop`)
