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
  unsupported: '当前 Harness 缺少归档管理所需的 workspace.unarchiveSession / workspace.deleteSession 核心 API。请应用仓库 patches/ 目录下随附的核心补丁并重建 Harness，详见 README。',
  readOnly: '在补上核心 API 之前，本页仅显示归档列表，操作不可用。',
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
  ungrouped: '未分组',
  updated: '更新时间',
  running: '运行中',
  blank: '空白',
  done: '操作完成',
  failed: '{count} 个会话操作失败',
  failedLive: '（其中 {count} 个正在运行，停止回合后重试）',
  failedDetail: '失败：{message}',
  actionError: '操作失败：{message}',
}

/** English product copy (the dictionary key source of truth). */
export const en = {
  nav: 'Archived Sessions',
  title: 'Archived Sessions',
  intro: 'Archived sessions are hidden from every session list, but their logs and workspace accounting slots are kept. View, unarchive, or delete them here.',
  unsupported: 'This harness lacks the workspace.unarchiveSession / workspace.deleteSession core APIs the page needs. Apply the bundled core patch from the patches/ directory and rebuild the harness — see the README.',
  readOnly: 'Until the core APIs are present, this page only shows the archive list; actions are disabled.',
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
  ungrouped: 'Ungrouped',
  updated: 'Updated',
  running: 'Running',
  blank: 'Blank',
  done: 'Done',
  failed: '{count} sessions failed',
  failedDetail: 'Failed: {message}',
  failedLive: ' ({count} are running; stop their turns and retry)',
  actionError: 'Action failed: {message}',
}

export type Dictionary = keyof typeof en
