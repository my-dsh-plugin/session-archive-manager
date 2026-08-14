window.__ModuleLoader__.load({
	id: "dsh-session-archive-manager",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-css:/Users/cuizhy/WebstormProjects/my-dsh-plugin/session-archive-manager/src/client/section.module.css.mjs
		const css = "._68II3W_section{flex-direction:column;gap:14px;max-width:760px;display:flex}._68II3W_title{color:var(--dsw-alias-label-primary);margin:0;font-size:16px;font-weight:500;line-height:24px}._68II3W_intro{color:var(--dsw-alias-label-tertiary);margin:0;font-size:14px;line-height:22px}._68II3W_toolbar{flex-wrap:wrap;align-items:center;gap:8px;padding-left:12px;display:flex}._68II3W_selectAll{color:var(--dsw-alias-label-secondary);align-items:center;gap:6px;font-size:12px;line-height:18px;display:inline-flex}._68II3W_spacer{flex:1}._68II3W_groupTitle{color:var(--dsw-alias-label-secondary);margin:2px 0 4px;font-size:14px;font-weight:600;line-height:20px}._68II3W_group+._68II3W_group{margin-top:12px}._68II3W_list{border:1px solid var(--dsw-alias-border-l2);border-radius:12px;flex-direction:column;margin:0;padding:0;list-style:none;display:flex;overflow:hidden}._68II3W_row{border-top:1px solid var(--dsw-alias-border-l2);grid-template-columns:auto minmax(0,1fr) auto auto;align-items:center;gap:8px;padding:7px 10px;display:grid}._68II3W_row:first-child{border-top:none}._68II3W_row:hover{background:var(--dsw-alias-interactive-bg-hover)}._68II3W_checkbox{cursor:pointer;margin:0;display:block}._68II3W_cellTitle{flex-direction:column;gap:1px;min-width:0;display:flex}._68II3W_name{color:var(--dsw-alias-label-primary);white-space:nowrap;text-overflow:ellipsis;font-size:14px;line-height:22px;overflow:hidden}._68II3W_meta{color:var(--dsw-alias-label-tertiary);white-space:nowrap;text-overflow:ellipsis;font-size:12px;line-height:18px;overflow:hidden}._68II3W_badge{border-radius:999px;padding:1px 8px;font-size:12px;line-height:18px}._68II3W_badgeRunning{color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-interactive-bg-hover-solid)}._68II3W_badgeBlank{color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-interactive-bg-hover)}._68II3W_updated{color:var(--dsw-alias-label-tertiary);white-space:nowrap;font-size:12px;line-height:18px}._68II3W_empty{color:var(--dsw-alias-label-tertiary);text-align:center;margin:0;padding:24px 12px;font-size:14px;line-height:22px}._68II3W_notice{color:var(--dsw-alias-label-tertiary);margin:0;font-size:13px;line-height:20px}._68II3W_noticeOk{color:var(--dsw-alias-state-success-primary)}._68II3W_noticeError{color:var(--dsw-alias-state-error-primary)}._68II3W_confirm{border:1px solid var(--dsw-alias-state-error-primary);border-radius:12px;flex-wrap:wrap;align-items:center;gap:8px;padding:10px 12px;display:flex}._68II3W_confirmText{color:var(--dsw-alias-state-error-primary);flex:1;margin:0;font-size:13px;line-height:20px}";
		const tagId = "dsh-session-archive-manager/section.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-session-archive-manager";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var section_module_css_default = {
			"section": "_68II3W_section",
			"cellTitle": "_68II3W_cellTitle",
			"toolbar": "_68II3W_toolbar",
			"list": "_68II3W_list",
			"updated": "_68II3W_updated",
			"title": "_68II3W_title",
			"confirmText": "_68II3W_confirmText",
			"name": "_68II3W_name",
			"badge": "_68II3W_badge",
			"groupTitle": "_68II3W_groupTitle",
			"badgeBlank": "_68II3W_badgeBlank",
			"confirm": "_68II3W_confirm",
			"spacer": "_68II3W_spacer",
			"selectAll": "_68II3W_selectAll",
			"group": "_68II3W_group",
			"row": "_68II3W_row",
			"badgeRunning": "_68II3W_badgeRunning",
			"noticeOk": "_68II3W_noticeOk",
			"noticeError": "_68II3W_noticeError",
			"checkbox": "_68II3W_checkbox",
			"empty": "_68II3W_empty",
			"intro": "_68II3W_intro",
			"meta": "_68II3W_meta",
			"notice": "_68II3W_notice"
		};
		//#endregion
		//#region src/client/section.tsx
		/**
		* The archived-sessions settings page: the archive set as a checkbox list
		* with per-row and batch actions. Rows come from the live derived source
		* (workspaces archive set × session summaries); actions ride the core
		* unarchive/delete RPCs through the runtime service.
		*
		* @module dsh-session-archive-manager/client/section
		*/
		/**
		* Render the archived-sessions settings page.
		* @param props - locale copy, the live snapshot, and the batch actions.
		* @returns the section.
		*/
		function ArchiveManagerSection(props) {
			const { t } = props;
			const snapshot = props.useArchivedRows((value) => value);
			const [selected, setSelected] = (0, react.useState)(/* @__PURE__ */ new Set());
			const [busy, setBusy] = (0, react.useState)(false);
			const [confirm, setConfirm] = (0, react.useState)(void 0);
			const [notice, setNotice] = (0, react.useState)(void 0);
			const rows = snapshot.rows;
			const rowIds = (0, react.useMemo)(() => rows.map((row) => row.sessionId), [rows]);
			(0, react.useEffect)(() => {
				setSelected((current) => {
					const present = new Set(rowIds);
					const next = new Set([...current].filter((id) => present.has(id)));
					return next.size === current.size ? current : next;
				});
				setConfirm(void 0);
			}, [rowIds]);
			const allSelected = rowIds.length > 0 && selected.size === rowIds.length;
			/** Toggle one row's selection. */
			const toggle = (sessionId, checked) => {
				setSelected((current) => {
					const next = new Set(current);
					if (checked) next.add(sessionId);
					else next.delete(sessionId);
					return next;
				});
			};
			/** Apply a batch action, report its failures, and prune succeeded ids. */
			const run = async (ids, action) => {
				setBusy(true);
				setNotice(void 0);
				const result = await action(ids);
				setBusy(false);
				if (result.failed.length === 0) {
					setNotice({
						kind: "ok",
						text: t("done")
					});
					return;
				}
				const liveCount = result.failed.filter((failure) => failure.code === "session-live").length;
				const text = result.failed.length === ids.length ? t("failedDetail", { message: result.failed[0]?.message ?? "" }) : liveCount > 0 ? `${t("failed", { count: String(result.failed.length) })}${t("failedLive", { count: String(liveCount) })}` : t("failed", { count: String(result.failed.length) });
				setNotice({
					kind: "error",
					text
				});
				const failedIds = new Set(result.failed.map((failure) => failure.sessionId));
				setSelected((current) => new Set([...current].filter((id) => !failedIds.has(id))));
			};
			const onUnarchive = () => {
				if (selected.size === 0) return;
				run([...selected], props.actions.unarchive);
			};
			const onConfirmDelete = () => {
				if (confirm === void 0) return;
				const ids = confirm.kind === "all" ? rowIds : [...selected];
				if (ids.length === 0) {
					setConfirm(void 0);
					return;
				}
				setConfirm(void 0);
				run(ids, props.actions.remove);
			};
			if (snapshot.status === "loading" && rows.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: section_module_css_default.section,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
						className: section_module_css_default.title,
						children: t("title")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: section_module_css_default.intro,
						children: t("intro")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: section_module_css_default.notice,
						children: t("loading")
					})
				]
			});
			if (!props.capable) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: section_module_css_default.section,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
						className: section_module_css_default.title,
						children: t("title")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: section_module_css_default.intro,
						children: t("intro")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: `${section_module_css_default.notice} ${section_module_css_default.noticeError}`,
						children: t("unsupported")
					}),
					rows.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: section_module_css_default.notice,
						children: t("readOnly")
					})
				]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: section_module_css_default.section,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
						className: section_module_css_default.title,
						children: t("title")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: section_module_css_default.intro,
						children: t("intro")
					}),
					rows.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: section_module_css_default.empty,
						children: t("empty")
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: section_module_css_default.toolbar,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: section_module_css_default.selectAll,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										className: section_module_css_default.checkbox,
										checked: allSelected,
										"aria-label": t("selectAll"),
										onChange: (event) => {
											setSelected(event.target.checked ? new Set(rowIds) : /* @__PURE__ */ new Set());
										}
									}), t("selectAll")]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: section_module_css_default.spacer }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									disabled: selected.size === 0 || busy,
									onClick: onUnarchive,
									children: t("unarchive")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									disabled: selected.size === 0 || busy,
									onClick: () => {
										setConfirm({ kind: "selection" });
									},
									children: t("deleteSelection")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									disabled: busy,
									onClick: () => {
										setConfirm({ kind: "all" });
									},
									children: t("deleteAll")
								})
							]
						}),
						confirm !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: section_module_css_default.confirm,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: section_module_css_default.confirmText,
									children: confirm.kind === "all" ? t("confirmDeleteAll", { count: String(rows.length) }) : t("confirmDeleteSelection", { count: String(selected.size) })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "primary",
									disabled: busy,
									onClick: () => {
										onConfirmDelete();
									},
									children: t("confirm")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									disabled: busy,
									onClick: () => {
										setConfirm(void 0);
									},
									children: t("cancel")
								})
							]
						}),
						snapshot.groups.map((group) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: section_module_css_default.group,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								className: section_module_css_default.groupTitle,
								children: group.workspaceTitle ?? t("ungrouped")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
								className: section_module_css_default.list,
								children: group.rows.map((row) => {
									const checked = selected.has(row.sessionId);
									return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
										className: section_module_css_default.row,
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												type: "checkbox",
												className: section_module_css_default.checkbox,
												checked,
												"aria-label": row.title ?? row.sessionId,
												disabled: busy,
												onChange: (event) => {
													toggle(row.sessionId, event.target.checked);
												}
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: section_module_css_default.cellTitle,
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: section_module_css_default.name,
													title: row.sessionId,
													children: row.title === void 0 ? row.updatedAt === 0 ? t("missing") : t("untitled") : row.title
												}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: section_module_css_default.meta,
													children: row.cwd ?? String(row.sessionId)
												})]
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [row.running ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: `${section_module_css_default.badge} ${section_module_css_default.badgeRunning}`,
												children: t("running")
											}) : null, row.blank && !row.running ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: `${section_module_css_default.badge} ${section_module_css_default.badgeBlank}`,
												children: t("blank")
											}) : null] }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: section_module_css_default.updated,
												children: row.updatedAt === 0 ? "" : new Date(row.updatedAt).toLocaleString()
											})
										]
									}, String(row.sessionId));
								})
							})]
						}, group.workspaceId ?? "\0ungrouped"))
					] }),
					notice !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: notice.kind === "ok" ? `${section_module_css_default.notice} ${section_module_css_default.noticeOk}` : `${section_module_css_default.notice} ${section_module_css_default.noticeError}`,
						children: notice.text
					})
				]
			});
		}
		//#endregion
		//#region src/client/section-controller.ts
		/**
		* The display label of one client-side session summary: `displayTitle` is
		* always present on the store's rows (title → project basename → id); the
		* `title` fallback covers a row shape without it.
		* @param summary - the client-side session summary row.
		* @returns the display label, or `undefined` when the row carries neither.
		*/
		function titleOf(summary) {
			return summary.displayTitle ?? summary.title;
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
		function assembleRows(archived, byId, workspaces) {
			const account = /* @__PURE__ */ new Map();
			for (const workspace of workspaces) for (const sessionId of workspace.sessionIds) account.set(sessionId, workspace);
			return archived.map((sessionId) => {
				const summary = byId[String(sessionId)];
				const workspace = account.get(sessionId);
				return {
					sessionId,
					...summary === void 0 ? {
						title: void 0,
						cwd: void 0,
						updatedAt: 0,
						blank: true,
						running: false
					} : {
						title: titleOf(summary),
						cwd: summary.cwd,
						updatedAt: summary.updatedAt,
						blank: summary.blank,
						running: summary.running
					},
					workspaceId: workspace?.workspaceId,
					workspaceTitle: workspace?.title
				};
			});
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
		function groupRows(rows, workspaces) {
			const byWorkspace = /* @__PURE__ */ new Map();
			const ungrouped = [];
			for (const row of rows) {
				if (row.workspaceId === void 0) {
					ungrouped.push(row);
					continue;
				}
				const list = byWorkspace.get(row.workspaceId);
				if (list === void 0) byWorkspace.set(row.workspaceId, [row]);
				else list.push(row);
			}
			const groups = [];
			for (const workspace of workspaces) {
				const list = byWorkspace.get(workspace.workspaceId);
				if (list === void 0) continue;
				byWorkspace.delete(workspace.workspaceId);
				groups.push({
					workspaceId: workspace.workspaceId,
					workspaceTitle: workspace.title,
					rows: list
				});
			}
			if (ungrouped.length > 0) groups.push({
				workspaceId: void 0,
				workspaceTitle: void 0,
				rows: ungrouped
			});
			return groups;
		}
		/** Whether two row lists are equal field-by-field (archive sets are small). */
		function rowsEqual(left, right) {
			if (left.length !== right.length) return false;
			return left.every((row, index) => {
				const other = right[index];
				return other !== void 0 && row.sessionId === other.sessionId && row.title === other.title && row.cwd === other.cwd && row.updatedAt === other.updatedAt && row.blank === other.blank && row.running === other.running && row.workspaceId === other.workspaceId && row.workspaceTitle === other.workspaceTitle;
			});
		}
		/** Whether two group lists carry the same workspace sequence (rows are compared separately). */
		function groupsEqual(left, right) {
			return left.length === right.length && left.every((group, index) => group.workspaceId === right[index]?.workspaceId);
		}
		/**
		* Create the section's live source: a derived snapshot rebuilt on every
		* change of either feed, with a stable snapshot reference between changes.
		* @param workspaces - the live workspaces list feed.
		* @param sessions - the live sessions list feed.
		* @returns the observable source plus its disposal.
		*/
		function createArchiveSource(workspaces, sessions) {
			const build = () => {
				const workspace = workspaces.getSnapshot();
				const session = sessions.getSnapshot();
				const byId = session.byId;
				const rows = assembleRows(workspace.archivedSessionIds, byId, workspace.items);
				const groups = groupRows(rows, workspace.items);
				return {
					status: workspace.phase === "ready" && session.phase === "ready" ? "ready" : "loading",
					rows,
					groups
				};
			};
			let snapshot = build();
			const listeners = /* @__PURE__ */ new Set();
			const rebuild = () => {
				const next = build();
				if (next.status === snapshot.status && rowsEqual(next.rows, snapshot.rows) && groupsEqual(next.groups, snapshot.groups)) return;
				snapshot = next;
				for (const listener of [...listeners]) listener();
			};
			const offWorkspaces = workspaces.subscribe(rebuild);
			const offSessions = sessions.subscribe(rebuild);
			return {
				source: {
					getSnapshot: () => snapshot,
					subscribe: (listener) => {
						listeners.add(listener);
						return () => {
							listeners.delete(listener);
						};
					}
				},
				dispose: () => {
					offWorkspaces();
					offSessions();
				}
			};
		}
		/**
		* Run one action over ids in order, collecting per-id failures instead of
		* stopping at the first: a partially successful batch still reports the
		* failures, and the live feeds already reflect the successes.
		* @param sessionIds - ids to act on, in order.
		* @param action - one id's operation.
		* @returns the failed ids with their messages.
		*/
		async function runActions(sessionIds, action) {
			const failed = [];
			for (const sessionId of sessionIds) try {
				await action(sessionId);
			} catch (error) {
				failed.push(failureOf(sessionId, error));
			}
			return { failed };
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
		function failureOf(sessionId, error) {
			const message = error instanceof Error ? error.message : String(error);
			const code = /^session (?:unarchive|delete) failed: ([\w-]+): /.exec(message)?.[1];
			return {
				sessionId,
				message,
				...code === void 0 ? {} : { code }
			};
		}
		//#endregion
		//#region src/client/locales.ts
		/**
		* Locale dictionaries for the archived-sessions settings page.
		*
		* @module dsh-session-archive-manager/client/locales
		*/
		/** Simplified Chinese product copy. */
		const zh = {
			nav: "归档会话",
			title: "归档会话",
			intro: "归档会话会从所有会话列表中隐藏，但日志与工作区归属仍然保留。在这里查看、取消归档或删除它们。",
			unsupported: "当前 Harness 缺少归档管理所需的 workspace.unarchiveSession / workspace.deleteSession 核心 API。请应用仓库 patches/ 目录下随附的核心补丁并重建 Harness，详见 README。",
			readOnly: "在补上核心 API 之前，本页仅显示归档列表，操作不可用。",
			empty: "暂无归档会话。",
			loading: "正在加载…",
			selectAll: "全选",
			unarchive: "取消归档",
			deleteSelection: "删除所选",
			deleteAll: "全量删除",
			confirmDeleteSelection: "确定删除选中的 {count} 个会话吗？会话日志将被永久删除，此操作无法撤销。",
			confirmDeleteAll: "确定删除全部 {count} 个归档会话吗？会话日志将被永久删除，此操作无法撤销。",
			confirm: "确认删除",
			cancel: "取消",
			untitled: "（未命名）",
			missing: "（会话已不存在）",
			workspace: "工作区",
			ungrouped: "未分组",
			updated: "更新时间",
			running: "运行中",
			blank: "空白",
			done: "操作完成",
			failed: "{count} 个会话操作失败",
			failedLive: "（其中 {count} 个正在运行，停止回合后重试）",
			failedDetail: "失败：{message}",
			actionError: "操作失败：{message}"
		};
		/** English product copy (the dictionary key source of truth). */
		const en = {
			nav: "Archived Sessions",
			title: "Archived Sessions",
			intro: "Archived sessions are hidden from every session list, but their logs and workspace accounting slots are kept. View, unarchive, or delete them here.",
			unsupported: "This harness lacks the workspace.unarchiveSession / workspace.deleteSession core APIs the page needs. Apply the bundled core patch from the patches/ directory and rebuild the harness — see the README.",
			readOnly: "Until the core APIs are present, this page only shows the archive list; actions are disabled.",
			empty: "No archived sessions.",
			loading: "Loading…",
			selectAll: "Select all",
			unarchive: "Unarchive",
			deleteSelection: "Delete selected",
			deleteAll: "Delete all",
			confirmDeleteSelection: "Delete the {count} selected sessions? Their logs are permanently removed; this cannot be undone.",
			confirmDeleteAll: "Delete all {count} archived sessions? Their logs are permanently removed; this cannot be undone.",
			confirm: "Confirm delete",
			cancel: "Cancel",
			untitled: "(untitled)",
			missing: "(session no longer exists)",
			workspace: "Workspace",
			ungrouped: "Ungrouped",
			updated: "Updated",
			running: "Running",
			blank: "Blank",
			done: "Done",
			failed: "{count} sessions failed",
			failedDetail: "Failed: {message}",
			failedLive: " ({count} are running; stop their turns and retry)",
			actionError: "Action failed: {message}"
		};
		//#endregion
		//#region src/client/index.ts
		/** Locale dictionary namespace owned by this section. */
		const NS = "session-archive-manager";
		/** Required services (cordis fiber inject). */
		const inject = [
			"slots",
			"locale",
			"workspaces",
			"sessions"
		];
		/**
		* Mount the archived-sessions settings section.
		* @param ctx - the browser plugin context.
		*/
		function apply(ctx) {
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "session-archive-manager: section dictionaries");
			const capable = typeof ctx.workspaces.unarchiveSession === "function" && typeof ctx.workspaces.deleteSession === "function";
			const source = createArchiveSource(ctx.workspaces.list, ctx.sessions.list);
			ctx.effect(() => () => source.dispose(), "session-archive-manager: rows subscription");
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "session-archive-manager",
				order: 16,
				label: () => t("nav"),
				locale: NS,
				inject: () => ({
					capable,
					hooks: { archivedRows: source.source },
					actions: {
						unarchive: (sessionIds) => runActions(sessionIds, (sessionId) => ctx.workspaces.unarchiveSession(sessionId)),
						remove: (sessionIds) => runActions(sessionIds, (sessionId) => ctx.workspaces.deleteSession(sessionId))
					}
				})
			}, ArchiveManagerSection));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map