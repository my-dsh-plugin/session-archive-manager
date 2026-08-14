# session-archive-manager

Manage archived sessions from DeepSeek Harness Settings: view, unarchive, delete, batch delete, or delete all — the archived-session surface the harness itself does not ship.

> 中文：[README.zh.md](README.zh.md)

## Features

- **View** every archived session in Settings — title, workspace, working directory, and last-updated time — even though the harness hides archived sessions from every grouping surface.
- **Unarchive** one session or a selection: each reappears in its retained workspace accounting slot.
- **Delete** one session, **delete a selection**, or **delete all** archived sessions at once, each with an inline confirmation.
- **Live refresh**: the list follows the host's archive set and session summaries while the page is open; actions reflect immediately through the runtime stores.

## Requirements

- A DeepSeek Harness build that ships the `workspace.unarchiveSession` and `workspace.deleteSession` RPCs plus the runtime `workspaces.unarchiveSession` / `workspaces.deleteSession` actions. The plugin is UI-only and rides those core APIs — a harness without them cannot serve the page's actions.
- A web profile with the plugin linked (see below).

## Install

1. Clone next to your harness checkout and install:

   ```sh
   git clone https://github.com/my-dsh-plugin/session-archive-manager.git
   pnpm install
   ```

2. Link it into your web profile's `package.json` dependencies:

   ```json
   "dependencies": {
     "dsh-session-archive-manager": "link:/path/to/session-archive-manager"
   }
   ```

3. Add the bundle to the profile's `dsh.profile.bundles` list:

   ```json
   "dsh": {
     "profile": {
       "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", "dsh-session-archive-manager"]
     }
   }
   ```

4. Restart the harness. The **Archived Sessions** entry appears in Settings, after Plugins.

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
