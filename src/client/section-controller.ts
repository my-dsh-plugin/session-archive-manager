/**
 * The section's data logic: cross-referencing the live workspaces archive
 * set with the live session summaries, plus the sequential batch-action
 * runner. Pure functions of their inputs — no Cordis, no React — so every
 * decision is unit-testable.
 *
 * @module dsh-session-archive-manager/client/section-controller
 */

import type { SessionId, WorkspaceId, WorkspaceView } from '@deepseek-ai/dsh-api-remotes/client'
// The CLIENT-side summary shape the runtime store carries (id/displayTitle/
// projectionValues) — NOT the wire shape (sessionId/projections) the host
// sends. Reading the wire fields off the store's rows yields no titles.
import type { SessionListState, SessionSummary, WorkspaceListState } from '@deepseek-ai/dsh-client-runtime/client'

/** One archived session row the settings page renders, in archive order. */
export interface ArchiveRow {
  /** The archived session id. */
  sessionId: SessionId
  /**
   * Human-facing label exactly as the sidebar shows it (durable title,
   * project basename, then the raw id); undefined only when the session has
   * no summary at all (its log vanished, or the list has not caught up).
   */
  title: string | undefined
  /** Working directory (header.cwd passthrough); absent when unrecorded. */
  cwd: string | undefined
  /** Last-updated instant (ms since epoch). */
  updatedAt: number
  /** Derived conversation-not-started bit, passthrough of the summary. */
  blank: boolean
  /** Whether the session has an attached running agent. */
  running: boolean
  /** The accounting workspace id, when a workspace accounts the session. */
  workspaceId: WorkspaceId | undefined
  /** The accounting workspace display title, when accounted. */
  workspaceTitle: string | undefined
}

/** The section's live snapshot. */
export interface ArchiveSnapshot {
  status: 'loading' | 'ready'
  /** Archived rows in archive order. */
  rows: readonly ArchiveRow[]
  /** Rows grouped by accounting workspace, in registry order; ungrouped last. */
  groups: readonly ArchiveGroup[]
}

/** Observable source the renderer binds as a snapshot hook. */
export interface CardSource<T> {
  getSnapshot(): T
  subscribe(listener: () => void): () => void
}

/** The section's batch-action outcome: which ids failed and why. */
export interface BatchResult {
  failed: Array<{
    sessionId: SessionId
    message: string
    /** RPC code extracted from the service error, when it is a business code. */
    code?: string
  }>
}

/**
 * The display label of one client-side session summary: `displayTitle` is
 * always present on the store's rows (title → project basename → id); the
 * `title` fallback covers a row shape without it.
 * @param summary - the client-side session summary row.
 * @returns the display label, or `undefined` when the row carries neither.
 */
export function titleOf(summary: SessionSummary): string | undefined {
  return summary.displayTitle ?? summary.title
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
      workspaceId: workspace?.workspaceId,
      workspaceTitle: workspace?.title,
    }
  })
}

/** One workspace group of archived rows; the ungrouped bucket has no id or title. */
export interface ArchiveGroup {
  /** The accounting workspace id; undefined for unaccounted sessions. */
  workspaceId: WorkspaceId | undefined
  /** The workspace display title; undefined for the ungrouped bucket. */
  workspaceTitle: string | undefined
  /** Rows in this group, in archive order. */
  rows: readonly ArchiveRow[]
}

/**
 * Group flat archive rows by their accounting workspace, in workspace
 * registry order; sessions no workspace accounts fall into one final
 * ungrouped bucket. Grouping is by workspace id, never by title (duplicate
 * titles are legal), so two same-named workspaces stay separate groups.
 * @param rows - flat archived rows in archive order.
 * @param workspaces - workspace views in registry display order.
 * @returns the groups; empty rows produce no groups.
 */
export function groupRows(
  rows: readonly ArchiveRow[],
  workspaces: readonly WorkspaceView[],
): ArchiveGroup[] {
  const byWorkspace = new Map<WorkspaceId, ArchiveRow[]>()
  const ungrouped: ArchiveRow[] = []
  for (const row of rows) {
    if (row.workspaceId === undefined) {
      ungrouped.push(row)
      continue
    }
    const list = byWorkspace.get(row.workspaceId)
    if (list === undefined) byWorkspace.set(row.workspaceId, [row])
    else list.push(row)
  }
  const groups: ArchiveGroup[] = []
  for (const workspace of workspaces) {
    const list = byWorkspace.get(workspace.workspaceId)
    if (list === undefined) continue
    byWorkspace.delete(workspace.workspaceId)
    groups.push({ workspaceId: workspace.workspaceId, workspaceTitle: workspace.title, rows: list })
  }
  if (ungrouped.length > 0) {
    groups.push({ workspaceId: undefined, workspaceTitle: undefined, rows: ungrouped })
  }
  return groups
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
      && row.workspaceId === other.workspaceId
      && row.workspaceTitle === other.workspaceTitle
  })
}

/** Whether two group lists carry the same workspace sequence (rows are compared separately). */
function groupsEqual(left: readonly ArchiveGroup[], right: readonly ArchiveGroup[]): boolean {
  return left.length === right.length
    && left.every((group, index) => group.workspaceId === right[index]?.workspaceId)
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
    const groups = groupRows(rows, workspace.items)
    const ready = workspace.phase === 'ready' && session.phase === 'ready'
    return { status: ready ? 'ready' : 'loading', rows, groups }
  }
  let snapshot = build()
  const listeners = new Set<() => void>()
  const rebuild = (): void => {
    const next = build()
    // A feed update that leaves the derived rows and group sequence unchanged
    // keeps the prior snapshot reference, so renderers do not re-render on
    // no-op refreshes.
    if (next.status === snapshot.status
      && rowsEqual(next.rows, snapshot.rows)
      && groupsEqual(next.groups, snapshot.groups)) return
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
      failed.push(failureOf(sessionId, error))
    }
  }
  return { failed }
}

/**
 * Project one action failure, extracting the RPC code from the runtime
 * service's `session <verb> failed: <code>: <message>` error format so the
 * page can categorize known business rejections (a live session, a vanished
 * session) instead of showing raw text.
 * @param sessionId - the failed id.
 * @param error - the thrown rejection.
 * @returns the structured failure.
 */
export function failureOf(sessionId: SessionId, error: unknown): BatchResult['failed'][number] {
  const message = error instanceof Error ? error.message : String(error)
  const code = /^session (?:unarchive|delete) failed: ([\w-]+): /.exec(message)?.[1]
  return {
    sessionId,
    message,
    ...code === undefined ? {} : { code },
  }
}
