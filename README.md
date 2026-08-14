# session-archive-manager

Manage archived sessions from DeepSeek Harness Settings: view, unarchive, delete, batch delete, or delete all — the archived-session surface the harness itself does not ship.

> 中文：[README.zh.md](README.zh.md)

## Features

- **View** every archived session in Settings — title, workspace, working directory, and last-updated time — even though the harness hides archived sessions from every grouping surface.
- **Unarchive** one session or a selection: each reappears in its retained workspace accounting slot.
- **Delete** one session, **delete a selection**, or **delete all** archived sessions at once, each with an inline confirmation.
- **Live refresh**: the list follows the host's archive set and session summaries while the page is open; actions reflect immediately through the runtime stores.

## Requirements

The plugin is UI-only: it rides the core `workspace.unarchiveSession` and `workspace.deleteSession` RPCs plus the runtime `workspaces.unarchiveSession` / `workspaces.deleteSession` actions. The harness does not ship those APIs yet (no upstream release channel), so **a source checkout of deepseek-harness with the bundled patch applied is required today**. On a harness without the APIs the settings page shows the archive list read-only with an upgrade notice.

## Install

### 1. Patch the harness core (required until the APIs ship upstream)

From this repository, against your deepseek-harness checkout (pinned to base commit `47f943859b`; a different commit may need `git apply -3`):

```sh
node scripts/apply-patch.mjs /path/to/deepseek-harness
cd /path/to/deepseek-harness
npm run build:lib:host
npm run build:lib:client
```

The patch (`patches/dsh-core-unarchive-delete.patch`) adds the two workspace RPCs, the session-persistence delete seam with JSONL/SQLite backends, the client-runtime actions, and their tests. It is additive only — no existing behavior changes.

### 2. Link the plugin into your web profile

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

### 3. Restart the harness

The **Archived Sessions** entry appears in Settings, after Plugins. If the page shows the read-only notice, the core patch is not active in the running build.

## Development

```sh
pnpm build      # tsc + tsdown + client bundle (needs the sibling harness checkout)
pnpm typecheck  # host + client type checks
pnpm test       # controller unit tests
```

The client bundle is produced by the shared harness preset (`packages/client/tsdown.client.ts`); git installs ship the prebuilt `lib/client.js`.

## Known Limitations and Deferred Work

- Deleting a session refuses while the session is live (attached to a running agent); close it first, then delete.
- Attachments written by a deleted session are not garbage-collected; they remain in the attachment store, which is content-addressed and shared by log export.
- The session-search index drops a deleted session on its next reconciliation; the running web client's sidebar refreshes from its own stores and may show the row until the next list refresh.

## License

Apache-2.0
