/**
 * session-archive-manager: a DeepSeek Harness plugin that manages archived
 * sessions from the Settings page. Archived sessions have no surface in the
 * harness itself — grouping surfaces hide them everywhere — so this plugin
 * adds one: view the archive set, unarchive sessions back into their
 * retained accounting slots, delete single sessions, delete a selection, or
 * delete the whole archive at once.
 *
 * The plugin is UI-only: every operation rides the core
 * `workspace.unarchiveSession` / `workspace.deleteSession` RPCs and the
 * runtime's live workspaces/sessions stores. This host entry exists so the
 * bundle patch has a cordis plugin to mount; it registers nothing.
 *
 * @module dsh-session-archive-manager
 */

import type { Context } from '@deepseek-ai/cordis'

export const name = 'session-archive-manager'
export const inject: string[] = []

/**
 * Mount the host half. The plugin needs no host services — the settings
 * section and every operation live on the browser side.
 * @param _ctx - plugin context.
 */
export function apply(_ctx: Context): void {
  // No host-side behavior: the client bundle owns the whole feature.
}
