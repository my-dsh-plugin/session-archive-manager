/**
 * The section's data logic: cross-referencing the live workspaces archive
 * set with the live session summaries, plus the sequential batch-action
 * runner. Pure functions of their inputs — no Cordis, no React — so every
 * decision is unit-testable.
 *
 * @module dsh-session-archive-manager/client/section-controller
 */

import type { SessionId, SessionSummary, WorkspaceView } from '@deepseek-ai/dsh-api-remotes/client'
import type { SessionListState, WorkspaceListState } from '@deepseek-ai/dsh-client-runtime/client'

/** One archived session row the settings page renders, in archive order. */
export interface ArchiveRow {
  /** The archived session id. */
  sessionId: SessionId
  /** Display title from the session's `title` projection; falls back to the untitled copy key. */
  title: string | undefined
  /** Working directory (header.cwd passthrough); absent when unrecorded. */
  cwd: string | undefined
  /** Last-updated instant (ms since epoch). */
  updatedAt: number
  /** Derived conversation-not-started bit, passthrough of the summary. */
  blank: boolean
  /** Whether the session has an attached running agent. */
  running: boolean
  /** Title of the workspace that accounts the session, when accounted. */
  workspaceTitle: string | undefined
}

/** The section's live snapshot. */
export interface ArchiveSnapshot {
  status: 'loading' | 'ready'
  /** Archived rows in archive order. */
  rows: readonly ArchiveRow[]
}

/** Observable source the renderer binds as a snapshot hook. */
export interface CardSource<T> {
  getSnapshot(): T
  subscribe(listener: () => void): () => void
}

/** The section's batch-action outcome: which ids failed and why. */
export interface BatchResult {
  failed: Array<{ sessionId: SessionId; message: string }>
}

/**
 * The `title` projection value of one session summary: a plain string after
 * the first `session/title` event, `null` before it, absent without a
 * projection block. Read through a structural cast because the projection
 * map is merge-extensible and this page must not depend on the title
 * package's types.
 * @param summary - the session summary row.
 * @returns the title text, or `undefined` when none exists yet.
 */
export function titleOf(summary: SessionSummary): string | undefined {
  const value = (summary.projections?.values as { title?: unknown } | undefined)?.title
  return typeof value === 'string' ? value : undefined
}

/**
 * Cross-reference the archive set with the session summaries and workspace
 * views into display rows, in archive order. A session id with no summary
 * (its log vanished, or the list has not caught up) still renders as a row
 * with no title, so the stale id stays actionable.
 * @param archived - the registry-global archive set, in archive order.
 * @param byId - session summaries keyed by id.
 * @param workspaces - workspace views; used for accounting titles.
 * @returns the rows, one per archived id.
 */
export function assembleRows(
  archived: readonly SessionId[],
  byId: Readonly<Record<string, SessionSummary>>,
  workspaces: readonly WorkspaceView[],
): ArchiveRow[] {
  const account = new Map<SessionId, WorkspaceView>()
  for (const workspace of workspaces) {
    for (const sessionId of workspace.sessionIds) account.set(sessionId, workspace)
  }
  return archived.map(sessionId => {
    const summary = byId[String(sessionId)]
    const workspace = account.get(sessionId)
    return {
      sessionId,
      ...summary === undefined
        ? { title: undefined, cwd: undefined, updatedAt: 0, blank: true, running: false }
        : {
          title: titleOf(summary),
          cwd: summary.cwd,
          updatedAt: summary.updatedAt,
          blank: summary.blank,
          running: summary.running,
        },
      workspaceTitle: workspace?.title,
    }
  })
}

/** Whether two row lists are equal field-by-field (archive sets are small). */
function rowsEqual(left: readonly ArchiveRow[], right: readonly ArchiveRow[]): boolean {
  if (left.length !== right.length) return false
  return left.every((row, index) => {
    const other = right[index]
    return other !== undefined
      && row.sessionId === other.sessionId
      && row.title === other.title
      && row.cwd === other.cwd
      && row.updatedAt === other.updatedAt
      && row.blank === other.blank
      && row.running === other.running
      && row.workspaceTitle === other.workspaceTitle
  })
}

/**
 * Create the section's live source: a derived snapshot rebuilt on every
 * change of either feed, with a stable snapshot reference between changes.
 * @param workspaces - the live workspaces list feed.
 * @param sessions - the live sessions list feed.
 * @returns the observable source plus its disposal.
 */
export function createArchiveSource(
  workspaces: { getSnapshot(): WorkspaceListState; subscribe(listener: () => void): () => void },
  sessions: { getSnapshot(): SessionListState; subscribe(listener: () => void): () => void },
): { source: CardSource<ArchiveSnapshot>; dispose(): void } {
  const build = (): ArchiveSnapshot => {
    const workspace = workspaces.getSnapshot()
    const session = sessions.getSnapshot()
    // byId is keyed by the branded SessionId; widening to string keys for the
    // lookup table is a type-only cast — the keys are plain strings at runtime.
    const byId = session.byId as unknown as Readonly<Record<string, SessionSummary>>
    const rows = assembleRows(workspace.archivedSessionIds, byId, workspace.items)
    const ready = workspace.phase === 'ready' && session.phase === 'ready'
    return { status: ready ? 'ready' : 'loading', rows }
  }
  let snapshot = build()
  const listeners = new Set<() => void>()
  const rebuild = (): void => {
    const next = build()
    // A feed update that leaves the derived rows unchanged keeps the prior
    // snapshot reference, so renderers do not re-render on no-op refreshes.
    if (next.status === snapshot.status && rowsEqual(next.rows, snapshot.rows)) return
    snapshot = next
    for (const listener of [...listeners]) listener()
  }
  const offWorkspaces = workspaces.subscribe(rebuild)
  const offSessions = sessions.subscribe(rebuild)
  return {
    source: {
      getSnapshot: () => snapshot,
      subscribe: (listener) => {
        listeners.add(listener)
        return () => { listeners.delete(listener) }
      },
    },
    dispose: () => {
      offWorkspaces()
      offSessions()
    },
  }
}

/**
 * Run one action over ids in order, collecting per-id failures instead of
 * stopping at the first: a partially successful batch still reports the
 * failures, and the live feeds already reflect the successes.
 * @param sessionIds - ids to act on, in order.
 * @param action - one id's operation.
 * @returns the failed ids with their messages.
 */
export async function runActions(
  sessionIds: readonly SessionId[],
  action: (sessionId: SessionId) => Promise<void>,
): Promise<BatchResult> {
  const failed: BatchResult['failed'] = []
  for (const sessionId of sessionIds) {
    try {
      await action(sessionId)
    } catch (error: unknown) {
      failed.push({
        sessionId,
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }
  return { failed }
}
