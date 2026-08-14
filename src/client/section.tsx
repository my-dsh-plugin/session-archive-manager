/**
 * The archived-sessions settings page: the archive set as a checkbox list
 * with per-row and batch actions. Rows come from the live derived source
 * (workspaces archive set × session summaries); actions ride the core
 * unarchive/delete RPCs through the runtime service.
 *
 * @module dsh-session-archive-manager/client/section
 */

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SessionId } from '@deepseek-ai/dsh-api-remotes/client'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import css from './section.module.css'
import type { ArchiveSnapshot, BatchResult, CardSource } from './section-controller.ts'

/** The registration-side face the section injects. */
export interface ArchiveManagerSectionFace {
  /**
   * Whether the harness ships the core unarchive/delete RPCs. When false the
   * page degrades to a read-only list with an upgrade notice.
   */
  capable: boolean
  hooks: {
    /** Live archive-set snapshot bound by the renderer as useArchivedRows. */
    archivedRows: CardSource<ArchiveSnapshot>
  }
  /** The unarchive and delete batch actions, closing over the runtime service. */
  actions: {
    /** Unarchive one or more sessions (reversible). */
    unarchive(sessionIds: readonly SessionId[]): Promise<BatchResult>
    /** Delete one or more sessions durably (irreversible). */
    remove(sessionIds: readonly SessionId[]): Promise<BatchResult>
  }
}

/** Props the renderer binds for the section. */
export type ArchiveManagerSectionProps =
  PropsRuntime<'settings.section'>
  & PropsLocale<'session-archive-manager'>
  & InjectFace<ArchiveManagerSectionFace>

/** The delete confirmation in flight, or undefined when none. */
type Confirm = { kind: 'selection' | 'all' }

/**
 * Render the archived-sessions settings page.
 * @param props - locale copy, the live snapshot, and the batch actions.
 * @returns the section.
 */
export function ArchiveManagerSection(props: ArchiveManagerSectionProps): React.ReactElement | null {
  const { t } = props
  const snapshot = props.useArchivedRows(value => value)
  // Selected session ids; pruned whenever the live rows move.
  const [selected, setSelected] = useState<Set<SessionId>>(new Set())
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState<Confirm | undefined>(undefined)
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | undefined>(undefined)

  const rows = snapshot.rows
  const rowIds = useMemo(() => rows.map(row => row.sessionId), [rows])

  // Drop selections whose rows disappeared (unarchived or deleted elsewhere).
  useEffect(() => {
    setSelected(current => {
      const present = new Set(rowIds)
      const next = new Set([...current].filter(id => present.has(id)))
      return next.size === current.size ? current : next
    })
    setConfirm(undefined)
  }, [rowIds])

  const allSelected = rowIds.length > 0 && selected.size === rowIds.length

  /** Toggle one row's selection. */
  const toggle = (sessionId: SessionId, checked: boolean): void => {
    setSelected(current => {
      const next = new Set(current)
      if (checked) next.add(sessionId)
      else next.delete(sessionId)
      return next
    })
  }

  /** Apply a batch action, report its failures, and prune succeeded ids. */
  const run = async (ids: readonly SessionId[], action: (list: readonly SessionId[]) => Promise<BatchResult>): Promise<void> => {
    setBusy(true)
    setNotice(undefined)
    const result = await action(ids)
    setBusy(false)
    if (result.failed.length === 0) {
      setNotice({ kind: 'ok', text: t('done') })
      return
    }
    setNotice({
      kind: 'error',
      text: result.failed.length === ids.length
        ? t('failedDetail', { message: result.failed[0]?.message ?? '' })
        : t('failed', { count: String(result.failed.length) }),
    })
    const failedIds = new Set(result.failed.map(failure => failure.sessionId))
    setSelected(current => new Set([...current].filter(id => !failedIds.has(id))))
  }

  const onUnarchive = (): void => {
    if (selected.size === 0) return
    void run([...selected], props.actions.unarchive)
  }

  const onConfirmDelete = (): void => {
    if (confirm === undefined) return
    const ids = confirm.kind === 'all' ? rowIds : [...selected]
    if (ids.length === 0) {
      setConfirm(undefined)
      return
    }
    setConfirm(undefined)
    void run(ids, props.actions.remove)
  }

  if (snapshot.status === 'loading' && rows.length === 0) {
    return (
      <div className={css.section}>
        <h2 className={css.title}>{t('title')}</h2>
        <p className={css.intro}>{t('intro')}</p>
        <p className={css.notice}>{t('loading')}</p>
      </div>
    )
  }

  if (!props.capable) {
    return (
      <div className={css.section}>
        <h2 className={css.title}>{t('title')}</h2>
        <p className={css.intro}>{t('intro')}</p>
        <p className={`${css.notice} ${css.noticeError}`}>{t('unsupported')}</p>
        {rows.length > 0 && (
          <p className={css.notice}>{t('readOnly')}</p>
        )}
      </div>
    )
  }

  return (
    <div className={css.section}>
      <h2 className={css.title}>{t('title')}</h2>
      <p className={css.intro}>{t('intro')}</p>

      {rows.length === 0
        ? <p className={css.empty}>{t('empty')}</p>
        : (
          <>
            <div className={css.toolbar}>
              <label className={css.selectAll}>
                <input
                  type="checkbox"
                  className={css.checkbox}
                  checked={allSelected}
                  aria-label={t('selectAll')}
                  onChange={event => {
                    setSelected(event.target.checked ? new Set(rowIds) : new Set())
                  }}
                />
                {t('selectAll')}
              </label>
              <span className={css.spacer} />
              <Button
                variant="outline"
                disabled={selected.size === 0 || busy}
                onClick={onUnarchive}
              >
                {t('unarchive')}
              </Button>
              <Button
                variant="outline"
                disabled={selected.size === 0 || busy}
                onClick={() => { setConfirm({ kind: 'selection' }) }}
              >
                {t('deleteSelection')}
              </Button>
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => { setConfirm({ kind: 'all' }) }}
              >
                {t('deleteAll')}
              </Button>
            </div>

            {confirm !== undefined && (
              <div className={css.confirm}>
                <p className={css.confirmText}>
                  {confirm.kind === 'all'
                    ? t('confirmDeleteAll', { count: String(rows.length) })
                    : t('confirmDeleteSelection', { count: String(selected.size) })}
                </p>
                <Button
                  variant="primary"
                  disabled={busy}
                  onClick={() => { void onConfirmDelete() }}
                >
                  {t('confirm')}
                </Button>
                <Button variant="outline" disabled={busy} onClick={() => { setConfirm(undefined) }}>
                  {t('cancel')}
                </Button>
              </div>
            )}

            <ul className={css.list}>
              {rows.map(row => {
                const checked = selected.has(row.sessionId)
                return (
                  <li key={String(row.sessionId)} className={css.row}>
                    <input
                      type="checkbox"
                      className={css.checkbox}
                      checked={checked}
                      aria-label={row.title ?? row.sessionId}
                      disabled={busy}
                      onChange={event => { toggle(row.sessionId, event.target.checked) }}
                    />
                    <span className={css.cellTitle}>
                      <span className={css.name} title={row.sessionId}>
                        {row.title === undefined ? (row.updatedAt === 0 ? t('missing') : t('untitled')) : row.title}
                      </span>
                      <span className={css.meta}>
                        {[row.workspaceTitle, row.cwd].filter(Boolean).join(' · ') || String(row.sessionId)}
                      </span>
                    </span>
                    <span>
                      {row.running
                        ? <span className={`${css.badge} ${css.badgeRunning}`}>{t('running')}</span>
                        : null}
                      {row.blank && !row.running
                        ? <span className={`${css.badge} ${css.badgeBlank}`}>{t('blank')}</span>
                        : null}
                    </span>
                    <span className={css.updated}>
                      {row.updatedAt === 0 ? '' : new Date(row.updatedAt).toLocaleString()}
                    </span>
                  </li>
                )
              })}
            </ul>
          </>
        )}

      {notice !== undefined && (
        <p className={notice.kind === 'ok' ? `${css.notice} ${css.noticeOk}` : `${css.notice} ${css.noticeError}`}>
          {notice.text}
        </p>
      )}
    </div>
  )
}
