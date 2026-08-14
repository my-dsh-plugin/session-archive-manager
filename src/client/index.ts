/**
 * session-archive-manager settings page, browser half. Registers one section
 * in the Settings nav (right after Plugins), bound to the runtime's live
 * workspaces/sessions stores; every operation rides the core
 * `workspace.unarchiveSession` / `workspace.deleteSession` RPCs through the
 * workspaces service.
 *
 * @module dsh-session-archive-manager/client
 */

// Type-only: the ctx.locale Context merge.
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: the ctx.settingsScope Context merge and the settings.section SlotMap entry.
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { SessionId } from '@deepseek-ai/dsh-api-remotes/client'
import { ArchiveManagerSection } from './section.tsx'
import type { ArchiveManagerSectionFace } from './section.tsx'
import { createArchiveSource, runActions } from './section-controller.ts'
import { en, zh } from './locales.ts'
import type { Dictionary } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The archived-sessions settings page copy. */
    'session-archive-manager': Dictionary
  }
}

/** Locale dictionary namespace owned by this section. */
const NS = 'session-archive-manager'

/** Required services (cordis fiber inject). */
export const inject = ['slots', 'locale', 'workspaces', 'sessions']

export type { ArchiveManagerSectionFace, ArchiveManagerSectionProps } from './section.tsx'

/**
 * Mount the archived-sessions settings section.
 * @param ctx - the browser plugin context.
 */
export function apply(ctx: ClientContext): void {
  const t = ctx.locale.bind(NS)
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'session-archive-manager: section dictionaries')

  // The derived rows source: rebuilt on every change of either live feed,
  // disposed with this plugin's fiber.
  const source = createArchiveSource(ctx.workspaces.list, ctx.sessions.list)
  ctx.effect(() => () => source.dispose(), 'session-archive-manager: rows subscription')

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    // Directly after Plugins (order 15); the harness ships no section past it.
    id: 'session-archive-manager',
    order: 16,
    label: () => t('nav'),
    locale: NS,
    inject: (): ArchiveManagerSectionFace => ({
      hooks: {
        archivedRows: source.source,
      },
      actions: {
        unarchive: (sessionIds: readonly SessionId[]) =>
          runActions(sessionIds, sessionId => ctx.workspaces.unarchiveSession(sessionId)),
        remove: (sessionIds: readonly SessionId[]) =>
          runActions(sessionIds, sessionId => ctx.workspaces.deleteSession(sessionId)),
      },
    }),
  }, ArchiveManagerSection))
}
