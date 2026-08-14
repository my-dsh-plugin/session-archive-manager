/**
 * Controller tests for the archived-sessions settings page: row assembly,
 * the derived live source, and the batch-action runner.
 *
 * @module dsh-session-archive-manager/tests/controller
 */

import { describe, expect, it, vi } from 'vitest'
import type { SessionSummary, WorkspaceView } from '@deepseek-ai/dsh-api-remotes/client'
import type { SessionListState, WorkspaceListState } from '@deepseek-ai/dsh-client-runtime/client'
import {
  assembleRows, createArchiveSource, runActions, titleOf,
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

const sid = (id: string) => id as SessionSummary['sessionId']

function summary(id: string, overrides: Partial<SessionSummary> = {}): SessionSummary {
  return {
    sessionId: sid(id),
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
        updatedAt: 5,
        blank: false,
        projections: { asOfSeq: 3, values: { title: 'hello' } },
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
      workspaceTitle: 'w1',
    })
    expect(rows[1]).toMatchObject({
      sessionId: sid('s2'),
      title: undefined,
      workspaceTitle: undefined,
    })
    // A stale id with no summary still renders as an actionable row.
    expect(rows[2]).toMatchObject({
      sessionId: sid('ghost'),
      title: undefined,
      updatedAt: 0,
      workspaceTitle: undefined,
    })
  })

  it('reads the title projection through a structural cast, ignoring non-string values', () => {
    expect(titleOf(summary('s1', { projections: { asOfSeq: 1, values: { title: 'hi' } } }))).toBe('hi')
    expect(titleOf(summary('s2', { projections: { asOfSeq: 1, values: { title: null } } }))).toBeUndefined()
    expect(titleOf(summary('s3'))).toBeUndefined()
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
    expect(second.rows[0]).toMatchObject({ sessionId: sid('x'), title: undefined })

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
})
