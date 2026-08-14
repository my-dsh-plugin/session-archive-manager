/**
 * Controller tests for the archived-sessions settings page: row assembly,
 * the derived live source, and the batch-action runner.
 *
 * @module dsh-session-archive-manager/tests/controller
 */

import { describe, expect, it, vi } from 'vitest'
import type { WorkspaceView } from '@deepseek-ai/dsh-api-remotes/client'
// The client-side summary shape, exactly as the runtime store carries it.
import type { SessionListState, SessionSummary, WorkspaceListState } from '@deepseek-ai/dsh-client-runtime/client'
import {
  assembleRows, createArchiveSource, groupRows, runActions, titleOf,
} from '../src/client/section-controller.ts'

/** A minimal controllable observable feed with the store's subscribe shape. */
function feed<T>(initial: T) {
  let value = initial
  const listeners = new Set<() => void>()
  return {
    getSnapshot: (): T => value,
    subscribe: (listener: () => void): (() => void) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    update(next: T): void {
      value = next
      for (const listener of [...listeners]) listener()
    },
  }
}

const sid = (id: string) => id as SessionSummary['id']

function summary(id: string, overrides: Partial<SessionSummary> = {}): SessionSummary {
  return {
    id: sid(id),
    displayTitle: id,
    updatedAt: 1,
    running: false,
    blank: true,
    ...overrides,
  }
}

function workspace(id: string, sessionIds: string[], title = id): WorkspaceView {
  return {
    workspaceId: id as WorkspaceView['workspaceId'],
    path: `/w/${id}`,
    title,
    sessionIds: sessionIds.map(sid),
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

describe('assembleRows', () => {
  it('cross-references archive ids with summaries and workspace accounting, in archive order', () => {
    const byId = {
      's1': summary('s1', {
        displayTitle: 'hello',
        updatedAt: 5,
        blank: false,
      }),
      's2': summary('s2', { updatedAt: 3 }),
    }
    const workspaces = [workspace('w1', ['s1'])]
    const rows = assembleRows([sid('s1'), sid('s2'), sid('ghost')], byId, workspaces)

    expect(rows).toHaveLength(3)
    expect(rows[0]).toMatchObject({
      sessionId: sid('s1'),
      title: 'hello',
      updatedAt: 5,
      blank: false,
      workspaceId: 'w1',
      workspaceTitle: 'w1',
    })
    expect(rows[1]).toMatchObject({
      sessionId: sid('s2'),
      title: 's2',
      workspaceId: undefined,
      workspaceTitle: undefined,
    })
    // A stale id with no summary still renders as an actionable row.
    expect(rows[2]).toMatchObject({
      sessionId: sid('ghost'),
      title: undefined,
      updatedAt: 0,
      workspaceId: undefined,
      workspaceTitle: undefined,
    })
  })

  it('reads the client-side display title, preferring displayTitle over title', () => {
    expect(titleOf(summary('s1', { displayTitle: 'hello' }))).toBe('hello')
    expect(titleOf({ id: sid('s2'), title: 'named' } as SessionSummary)).toBe('named')
    expect(titleOf({ id: sid('s3') } as SessionSummary)).toBeUndefined()
  })
})

describe('groupRows', () => {
  const row = (id: string, workspaceId?: string): ReturnType<typeof assembleRows>[number] => ({
    sessionId: sid(id),
    title: id,
    cwd: undefined,
    updatedAt: 1,
    blank: false,
    running: false,
    workspaceId: workspaceId as ReturnType<typeof assembleRows>[number]['workspaceId'],
    workspaceTitle: workspaceId,
  })

  it('groups by workspace id in registry order and collects the ungrouped bucket last', () => {
    const workspaces = [workspace('w2', ['s3', 's4']), workspace('w1', ['s1'])]
    const groups = groupRows(
      [row('s1', 'w1'), row('s2'), row('s3', 'w2'), row('s4', 'w2')],
      workspaces,
    )
    expect(groups.map(group => group.workspaceId)).toEqual(['w2', 'w1', undefined])
    expect(groups[0]?.rows.map(r => r.sessionId)).toEqual([sid('s3'), sid('s4')])
    expect(groups[1]?.rows.map(r => r.sessionId)).toEqual([sid('s1')])
    expect(groups[2]?.workspaceTitle).toBeUndefined()
    expect(groups[2]?.rows.map(r => r.sessionId)).toEqual([sid('s2')])
  })

  it('keeps same-titled workspaces in separate groups (grouping is by id)', () => {
    const workspaces = [
      workspace('w1', ['s1'], 'same'),
      workspace('w2', ['s2'], 'same'),
    ]
    const groups = groupRows([row('s2', 'w2'), row('s1', 'w1')], workspaces)
    expect(groups.map(group => group.workspaceId)).toEqual(['w1', 'w2'])
    expect(groups[0]?.rows.map(r => r.sessionId)).toEqual([sid('s1')])
    expect(groups[1]?.rows.map(r => r.sessionId)).toEqual([sid('s2')])
  })

  it('produces no groups from empty rows', () => {
    expect(groupRows([], [workspace('w1', [])])).toEqual([])
  })
})

describe('createArchiveSource', () => {
  const emptyWorkspace = (): WorkspaceListState => ({
    items: [], archivedSessionIds: [], state: 'idle', phase: 'ready',
    error: null, baselinesReady: true, recentWorkspaceId: undefined,
  })
  const emptySessions = (): SessionListState => ({
    ids: [], byId: {}, current: undefined, phase: 'ready',
    subagentsByParent: {}, jobs: {},
  })

  it('publishes a stable snapshot between changes and rebuilds on feed updates', () => {
    const workspaces = feed<WorkspaceListState>(emptyWorkspace())
    const sessions = feed<SessionListState>(emptySessions())
    const { source, dispose } = createArchiveSource(workspaces, sessions)

    const first = source.getSnapshot()
    expect(first.status).toBe('ready')
    expect(first.rows).toEqual([])

    // Unrelated updates keep the same snapshot reference until rows move.
    sessions.update({ ...emptySessions(), ids: [sid('x')], byId: { x: summary('x') } })
    expect(source.getSnapshot()).toBe(first)

    workspaces.update({ ...emptyWorkspace(), archivedSessionIds: [sid('x')] })
    const second = source.getSnapshot()
    expect(second).not.toBe(first)
    expect(second.rows).toHaveLength(1)
    expect(second.rows[0]).toMatchObject({ sessionId: sid('x'), title: 'x' })

    // Subscribers are notified on rebuilds and stop after dispose.
    const listener = vi.fn()
    const stop = source.subscribe(listener)
    sessions.update(emptySessions())
    expect(listener).toHaveBeenCalledTimes(1)
    stop()
    dispose()
    workspaces.update({ ...emptyWorkspace(), archivedSessionIds: [] })
    expect(listener).toHaveBeenCalledTimes(1)
  })
})

describe('runActions', () => {
  it('runs in order and collects per-id failures instead of stopping at the first', async () => {
    const order: string[] = []
    const result = await runActions([sid('a'), sid('b'), sid('c')], async (sessionId) => {
      order.push(String(sessionId))
      if (String(sessionId) === 'b') throw new Error('boom')
    })
    expect(order).toEqual(['a', 'b', 'c'])
    expect(result.failed).toEqual([{ sessionId: sid('b'), message: 'boom' }])
  })

  it('reports an empty failure list when everything succeeds', async () => {
    const result = await runActions([sid('a')], async () => {})
    expect(result.failed).toEqual([])
  })

  it('extracts the RPC code from runtime service errors so the page can categorize', async () => {
    const result = await runActions([sid('a'), sid('b')], async (sessionId) => {
      if (String(sessionId) === 'a') {
        throw new Error(
          "session delete failed: session-live: cannot delete session 'a': the session is running; stop it before deleting",
        )
      }
      throw new Error("session delete failed: session-not-found: cannot delete session 'b'")
    })
    expect(result.failed).toEqual([
      { sessionId: sid('a'), message: expect.stringContaining('session-live'), code: 'session-live' },
      { sessionId: sid('b'), message: expect.stringContaining('session-not-found'), code: 'session-not-found' },
    ])
  })
})
