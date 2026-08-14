# session-archive-manager

Manage archived sessions from DeepSeek Harness Settings: view, unarchive, delete, batch delete, or delete all — the archived-session surface the harness itself does not ship.

> 中文：[README.zh.md](README.zh.md)

## Features

- **View** every archived session in Settings — title, workspace, working directory, and last-updated time — even though the harness hides archived sessions from every grouping surface.
- **Unarchive** one session or a selection: each reappears in its retained workspace accounting slot.
- **Delete** one session, **delete a selection**, or **delete all** archived sessions at once, each with an inline confirmation.
- **Live refresh**: the list follows the host's archive set and session summaries while the page is open; actions reflect immediately through the runtime stores.
- **Capability gate**: on a harness without the core APIs the page degrades to a read-only list with a clear upgrade notice instead of broken buttons.

## How it works

The plugin is UI-only. It derives the archived-session rows by cross-referencing the live `workspaces.list` archive set with `sessions.list` summaries, and every action rides the core `workspace.unarchiveSession` / `workspace.deleteSession` RPCs through the `workspaces` runtime service. Nothing polls, and nothing runs on the host side beyond the RPCs themselves.

## Requirements

The harness does not ship the unarchive/delete APIs yet (no upstream release channel), so **a source checkout of deepseek-harness with the bundled patch applied is required today**. On a harness without the APIs the settings page shows the archive list read-only with an upgrade notice.

## Install

### 1. Patch the harness core

From this repository, against your deepseek-harness checkout (pinned to base commit `47f943859b`; a different commit may need `git apply -3`):

```sh
node scripts/apply-patch.mjs /path/to/deepseek-harness
cd /path/to/deepseek-harness
npm run build:lib:host
npm run build:lib:client
```

The patch (`patches/dsh-core-unarchive-delete.patch`) adds the two workspace RPCs, the session-persistence delete seam with JSONL/SQLite backends, the client-runtime actions, and their tests. It is additive only — no existing behavior changes.

### 2. Install the plugin into your web profile

The official way — `dsh` CLI from your harness checkout, with `DSH_HOME` pointing at your harness home if it is not the default `~/.dsh`:

```sh
pnpm dsh plugin add --profile web /path/to/session-archive-manager
```

This adds the dependency and reconciles the `dsh.profile.bundles` layer list. The manual equivalent is editing the profile's `package.json`:

```json
"dependencies": {
  "dsh-session-archive-manager": "link:/path/to/session-archive-manager"
}
```

```json
"dsh": {
  "profile": {
    "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", "dsh-session-archive-manager"]
  }
}
```

then `pnpm install` inside the profile directory.

### 3. Restart and verify

Restart the harness (`npx @deepseek-ai/dsh web` or however you launch it). The **Archived Sessions** entry appears in Settings, after Plugins.

- The page shows the read-only notice → the core patch is not active in the running build (check the rebuild step, or that the old process was fully stopped).
- The menu entry is missing entirely → the plugin is not in the running profile's bundle layer (re-run `dsh plugin add`, verify the bundles list).

## Maintenance

The patch is pinned to a harness base commit, so it drifts as the harness upstream moves. When your checkout updates, regenerate and re-verify the patch before committing:

```sh
node scripts/regenerate-patch.mjs /path/to/deepseek-harness
git -C /path/to/deepseek-harness stash
git -C /path/to/deepseek-harness apply --check /path/to/session-archive-manager/patches/dsh-core-unarchive-delete.patch
git -C /path/to/deepseek-harness stash pop
```

The regeneration covers only this plugin's core extension (unrelated local changes are excluded automatically). Bump the base via `DSH_PATCH_BASE=<commit>` when the extension is re-based onto a newer upstream commit.

## Development

```sh
pnpm build      # tsc + tsdown + client bundle (needs the sibling harness checkout)
pnpm typecheck  # host + client type checks
pnpm test       # controller unit tests
```

The client bundle is produced by the shared harness preset (`packages/client/tsdown.client.ts`). The repository ships the prebuilt `lib/` so consumers can clone and use without building; rebuild only when changing the plugin.

## Known Limitations and Deferred Work

- Deleting a session refuses only while its agent is running a turn; stop the turn first, then delete.
- Attachments written by a deleted session are not garbage-collected; they remain in the attachment store, which is content-addressed and shared by log export.
- The session-search index drops a deleted session on its next reconciliation; the running web client's sidebar refreshes from its own stores and may show the row until the next list refresh.

## License

Apache-2.0
