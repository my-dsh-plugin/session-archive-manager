/**
 * Locale dictionaries for the archived-sessions settings page.
 *
 * @module dsh-session-archive-manager/client/locales
 */

/** Simplified Chinese product copy. */
export const zh: { [Key in Dictionary]: string } = {
  nav: '归档会话',
  title: '归档会话',
  intro: '归档会话会从所有会话列表中隐藏，但日志与工作区归属仍然保留。在这里查看、取消归档或删除它们。',
  empty: '暂无归档会话。',
  loading: '正在加载…',
  selectAll: '全选',
  unarchive: '取消归档',
  deleteSelection: '删除所选',
  deleteAll: '全量删除',
  confirmDeleteSelection: '确定删除选中的 {count} 个会话吗？会话日志将被永久删除，此操作无法撤销。',
  confirmDeleteAll: '确定删除全部 {count} 个归档会话吗？会话日志将被永久删除，此操作无法撤销。',
  confirm: '确认删除',
  cancel: '取消',
  untitled: '（未命名）',
  missing: '（会话已不存在）',
  workspace: '工作区',
  updated: '更新时间',
  running: '运行中',
  blank: '空白',
  done: '操作完成',
  failed: '{count} 个会话操作失败',
  failedDetail: '失败：{message}',
  actionError: '操作失败：{message}',
}

/** English product copy (the dictionary key source of truth). */
export const en = {
  nav: 'Archived Sessions',
  title: 'Archived Sessions',
  intro: 'Archived sessions are hidden from every session list, but their logs and workspace accounting slots are kept. View, unarchive, or delete them here.',
  empty: 'No archived sessions.',
  loading: 'Loading…',
  selectAll: 'Select all',
  unarchive: 'Unarchive',
  deleteSelection: 'Delete selected',
  deleteAll: 'Delete all',
  confirmDeleteSelection: 'Delete the {count} selected sessions? Their logs are permanently removed; this cannot be undone.',
  confirmDeleteAll: 'Delete all {count} archived sessions? Their logs are permanently removed; this cannot be undone.',
  confirm: 'Confirm delete',
  cancel: 'Cancel',
  untitled: '(untitled)',
  missing: '(session no longer exists)',
  workspace: 'Workspace',
  updated: 'Updated',
  running: 'Running',
  blank: 'Blank',
  done: 'Done',
  failed: '{count} sessions failed',
  failedDetail: 'Failed: {message}',
  actionError: 'Action failed: {message}',
}

export type Dictionary = keyof typeof en
