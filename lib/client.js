window.__ModuleLoader__.load({
	id: "@dsh-external/dsh-workspace-menu",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		// src/client/locales.ts
		/**
		* Locale dictionaries for the dsh-workspace-menu client half.
		*
		* DSH 0.2.x ships a locale registry (`ctx.locale`) with per-package
		* namespaces; the plugin registers its own namespace so the settings page
		* title and every menu label follow the active UI language instead of being
		* hardcoded Chinese.
		*/
		/** The plugin's locale namespace. */
		const NS = "dsh-workspace-menu";
		/** Chinese dictionary. */
		const zh = {
			"nav": "工作区菜单",
			"page.title": "工作区与会话菜单",
			"page.desc": "开关工作区/会话右键与双击菜单里的各项功能。",
			"group.trigger": "触发方式",
			"group.workspace": "Project / 工作区功能",
			"group.session": "Chat / 会话功能",
			"feature.dblclick": "双击打开菜单",
			"feature.contextmenu": "右键打开菜单",
			"feature.workspacePin": "工作区：置顶/取消置顶",
			"feature.workspaceRename": "工作区：重命名",
			"feature.workspaceOpenExplorer": "工作区：在资源管理器中打开",
			"feature.workspaceCopyPath": "工作区：复制路径",
			"feature.workspaceNewSession": "工作区：新建会话",
			"feature.workspaceDelete": "工作区：从列表中移除",
			"feature.workspaceDeleteDisk": "工作区：删除工作区（含磁盘）",
			"feature.sessionPin": "会话：置顶/取消置顶",
			"feature.sessionRename": "会话：重命名",
			"feature.sessionUnread": "会话：标记未读/已读",
			"feature.sessionArchive": "会话：归档会话",
			"feature.sessionUnarchive": "会话：取消归档",
			"feature.sessionFork": "会话：分叉会话",
			"feature.sessionCopyLink": "会话：复制会话链接",
			"feature.sessionCopyTitle": "会话：复制会话标题",
			"feature.sessionOpenWindow": "会话：在新窗口中打开",
			"feature.sessionOpenFolder": "会话：打开所在目录",
			"feature.sessionDelete": "会话：删除会话（含磁盘记录）",
			"menu.pin": "置顶",
			"menu.unpin": "取消置顶",
			"menu.rename": "重命名",
			"menu.openExplorer": "在资源管理器中打开",
			"menu.copyPath": "复制路径",
			"menu.newSession": "新建会话",
			"menu.removeWorkspace": "从工作区列表中移除",
			"menu.deleteWorkspace": "删除工作区（含磁盘）",
			"menu.markUnread": "标记为未读",
			"menu.markRead": "标记为已读",
			"menu.archive": "归档会话",
			"menu.unarchive": "取消归档",
			"menu.fork": "分叉会话",
			"menu.copyLink": "复制会话链接",
			"menu.copyTitle": "复制会话标题",
			"menu.openWindow": "在新窗口中打开",
			"menu.openFolder": "打开所在目录",
			"menu.deleteSession": "删除会话（含磁盘记录）",
			"dialog.renameWorkspace": "重命名工作区",
			"dialog.renameSession": "重命名会话",
			"dialog.nameEmpty": "名称不能为空",
			"dialog.cancel": "取消",
			"dialog.confirm": "确定",
			"dialog.removeWorkspace": "确定从 DSH 工作区列表中移除“{title}”吗？\n目录和会话记录会保留在磁盘上。",
			"dialog.deleteWorkspace": "确定要删除工作区“{title}”吗？\n这会删除该目录下的所有文件。",
			"dialog.deleteWorkspaceTwice": "再次确认：删除工作区“{title}”将永久移除磁盘目录与全部会话记录，且无法恢复。\n确定继续吗？",
			"dialog.deleteSession": "确定要删除会话“{title}”吗？\n这会删除该会话的日志记录。",
			"dialog.deleteSessionTwice": "再次确认：删除会话“{title}”将永久移除其记录，且无法恢复。\n确定继续吗？",
			"toast.pinned": "已置顶",
			"toast.unpinned": "已取消置顶",
			"toast.pathCopied": "路径已复制",
			"toast.copyFailed": "复制失败",
			"toast.linkCopied": "链接已复制",
			"toast.titleCopied": "标题已复制",
			"toast.unread": "已标记为未读",
			"toast.read": "已标记为已读",
			"toast.renameFailed": "重命名失败",
			"toast.archiveFailed": "归档失败",
			"toast.unarchiveFailed": "取消归档失败",
			"toast.forkFailed": "分叉失败",
			"toast.removeFailed": "移除失败",
			"toast.workspaceDeleted": "工作区已删除",
			"toast.sessionDeleted": "会话已删除",
			"toast.deleteFailed": "删除失败：{reason}",
			"toast.openFailed": "打开失败：{reason}",
			"toast.renameUnavailable": "无法重命名：会话尚未加载"
		};
		/** English dictionary. */
		const en = {
			"nav": "Workspace menu",
			"page.title": "Workspace & session menu",
			"page.desc": "Toggle each action offered by the workspace/session context and double-click menus.",
			"group.trigger": "Triggers",
			"group.workspace": "Project / workspace actions",
			"group.session": "Chat / session actions",
			"feature.dblclick": "Open the menu on double click",
			"feature.contextmenu": "Open the menu on right click",
			"feature.workspacePin": "Workspace: pin / unpin",
			"feature.workspaceRename": "Workspace: rename",
			"feature.workspaceOpenExplorer": "Workspace: open in file manager",
			"feature.workspaceCopyPath": "Workspace: copy path",
			"feature.workspaceNewSession": "Workspace: new session",
			"feature.workspaceDelete": "Workspace: remove from the list",
			"feature.workspaceDeleteDisk": "Workspace: delete the workspace (including disk)",
			"feature.sessionPin": "Session: pin / unpin",
			"feature.sessionRename": "Session: rename",
			"feature.sessionUnread": "Session: mark unread / read",
			"feature.sessionArchive": "Session: archive",
			"feature.sessionUnarchive": "Session: unarchive",
			"feature.sessionFork": "Session: fork",
			"feature.sessionCopyLink": "Session: copy session link",
			"feature.sessionCopyTitle": "Session: copy session title",
			"feature.sessionOpenWindow": "Session: open in a new window",
			"feature.sessionOpenFolder": "Session: open its folder",
			"feature.sessionDelete": "Session: delete the session (including its log)",
			"menu.pin": "Pin",
			"menu.unpin": "Unpin",
			"menu.rename": "Rename",
			"menu.openExplorer": "Open in file manager",
			"menu.copyPath": "Copy path",
			"menu.newSession": "New session",
			"menu.removeWorkspace": "Remove from the workspace list",
			"menu.deleteWorkspace": "Delete workspace (including disk)",
			"menu.markUnread": "Mark as unread",
			"menu.markRead": "Mark as read",
			"menu.archive": "Archive session",
			"menu.unarchive": "Unarchive session",
			"menu.fork": "Fork session",
			"menu.copyLink": "Copy session link",
			"menu.copyTitle": "Copy session title",
			"menu.openWindow": "Open in a new window",
			"menu.openFolder": "Open its folder",
			"menu.deleteSession": "Delete session (including its log)",
			"dialog.renameWorkspace": "Rename workspace",
			"dialog.renameSession": "Rename session",
			"dialog.nameEmpty": "The name cannot be empty",
			"dialog.cancel": "Cancel",
			"dialog.confirm": "OK",
			"dialog.removeWorkspace": "Remove workspace “{title}” from the DSH workspace list?\nThe directory and the session records stay on disk.",
			"dialog.deleteWorkspace": "Delete workspace “{title}”?\nThis deletes every file under that directory.",
			"dialog.deleteWorkspaceTwice": "Confirm again: deleting workspace “{title}” permanently removes the directory and all session records, and cannot be undone.\nContinue?",
			"dialog.deleteSession": "Delete session “{title}”?\nThis deletes the session log.",
			"dialog.deleteSessionTwice": "Confirm again: deleting session “{title}” permanently removes its record, and cannot be undone.\nContinue?",
			"toast.pinned": "Pinned",
			"toast.unpinned": "Unpinned",
			"toast.pathCopied": "Path copied",
			"toast.copyFailed": "Copy failed",
			"toast.linkCopied": "Link copied",
			"toast.titleCopied": "Title copied",
			"toast.unread": "Marked as unread",
			"toast.read": "Marked as read",
			"toast.renameFailed": "Rename failed",
			"toast.archiveFailed": "Archive failed",
			"toast.unarchiveFailed": "Unarchive failed",
			"toast.forkFailed": "Fork failed",
			"toast.removeFailed": "Remove failed",
			"toast.workspaceDeleted": "Workspace deleted",
			"toast.sessionDeleted": "Session deleted",
			"toast.deleteFailed": "Delete failed: {reason}",
			"toast.openFailed": "Open failed: {reason}",
			"toast.renameUnavailable": "Cannot rename: the session is not loaded yet"
		};
		// src/client/index.ts
		/**
		* @dsh-external/dsh-workspace-menu — client half (DSH 0.2.x).
		*
		* 在 DSH 主页的工作区（Project）与会话（Chat）行上增强交互：
		* - 双击或右键 Project 行：置顶 / 重命名 / 在资源管理器中打开 / 复制路径 / 新建会话 / 移除 / 删除（含磁盘）
		* - 双击或右键 Chat 行：置顶 / 重命名 / 标记未读 / 归档 / 取消归档 / 分叉 / 复制链接 / 复制标题 /
		*   新窗口打开 / 打开所在目录 / 删除（含磁盘记录）
		*
		* 0.2.x 适配要点：
		* - 导航与领域动作统一走 `ctx.uiWorkspace`（`ctx.sessions.open` / `ctx.workspaces.startSession`
		*   在 0.2.x 已移除）。
		* - 会话置顶改用 Host 权威的 pin 集合（`pinnedSessionIds` + `uiWorkspace.pinSession`），
		*   与内置「置顶会话」按钮保持一致，不再用 localStorage 模拟。
		* - 设置从 General 单行改成独立的 `settings.section` 页面，并注册自己的 locale 命名空间。
		* - 永久删除会话改为调用本插件自己的 Host 路由，不再依赖未安装的 dsh-archive-manager。
		*/
		const DEFAULT_FEATURES = {
			dblclick: true,
			contextmenu: true,
			workspacePin: true,
			workspaceRename: true,
			workspaceOpenExplorer: true,
			workspaceCopyPath: true,
			workspaceNewSession: true,
			workspaceDelete: true,
			workspaceDeleteDisk: true,
			sessionPin: true,
			sessionRename: true,
			sessionUnread: true,
			sessionArchive: true,
			sessionUnarchive: true,
			sessionFork: true,
			sessionCopyLink: true,
			sessionCopyTitle: true,
			sessionOpenWindow: true,
			sessionOpenFolder: true,
			sessionDelete: true
		};
		const FEATURE_GROUPS = [
			{
				title: "group.trigger",
				keys: ["dblclick", "contextmenu"]
			},
			{
				title: "group.workspace",
				keys: [
					"workspacePin",
					"workspaceRename",
					"workspaceOpenExplorer",
					"workspaceCopyPath",
					"workspaceNewSession",
					"workspaceDelete",
					"workspaceDeleteDisk"
				]
			},
			{
				title: "group.session",
				keys: [
					"sessionPin",
					"sessionRename",
					"sessionUnread",
					"sessionArchive",
					"sessionUnarchive",
					"sessionFork",
					"sessionCopyLink",
					"sessionCopyTitle",
					"sessionOpenWindow",
					"sessionOpenFolder",
					"sessionDelete"
				]
			}
		];
		const PLUGIN_ID = "@dsh-external/dsh-workspace-menu";
		const SECTION_ID = "dsh-workspace-menu";
		const SECTION_ORDER = 130;
		const STORAGE_KEY = "dsh-workspace-menu:v1";
		const MENU_CLASS = "dsh-ws-menu";
		const MODAL_CLASS = "dsh-ws-modal";
		/** Translate one of the plugin's own keys through the active UI language. */
		function translator(ctx) {
			return (key, params) => ctx.locale.bind(NS)(key, params);
		}
		const defaultState = () => ({
			pinnedWorkspaces: [],
			unreadSessions: [],
			features: { ...DEFAULT_FEATURES }
		});
		function loadState() {
			try {
				const raw = localStorage.getItem(STORAGE_KEY);
				if (!raw) return defaultState();
				const parsed = JSON.parse(raw);
				return {
					pinnedWorkspaces: Array.isArray(parsed.pinnedWorkspaces) ? parsed.pinnedWorkspaces : [],
					unreadSessions: Array.isArray(parsed.unreadSessions) ? parsed.unreadSessions : [],
					features: {
						...DEFAULT_FEATURES,
						...parsed.features ?? {}
					}
				};
			} catch {
				return defaultState();
			}
		}
		function isFeatureEnabled(state, key) {
			return state.features[key] !== false;
		}
		function saveState(state) {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
			} catch {}
		}
		function toggleId(list, id) {
			return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
		}
		/**
		* Read the React fiber attached to a built-in row DOM node and recover the
		* component props (group/node). This lets us map a row to its workspace/session
		* id without touching the built-in package source.
		*/
		function fiberPropsOf(el) {
			const key = Object.keys(el).find((k) => k.startsWith("__reactFiber$"));
			if (!key) return void 0;
			let fiber = el[key];
			for (let i = 0; fiber && i < 30; i++) {
				const props = fiber.memoizedProps;
				const sessionNode = props?.node?.id !== void 0 && typeof props.node.updatedAt === "number" && typeof props.node.blank === "boolean";
				if (props && (props.group !== void 0 || sessionNode)) return props;
				fiber = fiber.return;
			}
		}
		function rowInfo(el) {
			const props = fiberPropsOf(el);
			if (props?.node?.id !== void 0 && typeof props.node.updatedAt === "number" && typeof props.node.blank === "boolean") {
				const node = props.node;
				return {
					kind: "session",
					id: String(node.id),
					title: String(node.title ?? node.displayTitle ?? "")
				};
			}
			if (props?.group !== void 0) {
				const group = props.group;
				const workspaceId = group.workspaceId === void 0 ? "" : String(group.workspaceId);
				if (!workspaceId) return void 0;
				return {
					kind: "workspace",
					id: workspaceId,
					title: String(group.label ?? "")
				};
			}
		}
		function deepLink(sessionId) {
			const url = new URL(window.location.href);
			url.searchParams.set("session", sessionId);
			return url.toString();
		}
		async function copyText(text) {
			try {
				await navigator.clipboard.writeText(text);
				return true;
			} catch {
				try {
					const ta = document.createElement("textarea");
					ta.value = text;
					ta.style.position = "fixed";
					ta.style.opacity = "0";
					document.body.appendChild(ta);
					ta.select();
					document.execCommand("copy");
					ta.remove();
					return true;
				} catch {
					return false;
				}
			}
		}
		async function postJson(path, body) {
			const response = await fetch(path, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(body)
			});
			if (!response.ok) {
				let message = `failed (${response.status})`;
				try {
					const data = await response.json();
					if (typeof data.error === "string") message = data.error;
					else if (data.error?.message) message = data.error.message;
				} catch {}
				throw new Error(message);
			}
		}
		/** 调用宿主路由，在操作系统文件管理器（Windows 资源管理器等）中打开目录或定位文件。 */
		async function openInExplorer(path) {
			await postJson("/dsh-workspace-menu/open-in-explorer", { path });
		}
		/** 删除工作区目录（会话记录先由 deleteSession 清理，目录由本插件安全移除）。 */
		async function deleteWorkspaceDirectory(path) {
			await postJson("/dsh-workspace-menu/delete-workspace-directory", { path });
		}
		/** 永久删除会话记录（宿主的 session 日志目录）。 */
		async function deleteSessionRecord(sessionId) {
			await postJson("/dsh-workspace-menu/delete-session", { sessionId });
		}
		function flashMessage(message) {
			document.querySelector(".dsh-ws-toast")?.remove();
			const toast = document.createElement("div");
			toast.className = "dsh-ws-toast";
			toast.textContent = message;
			document.body.appendChild(toast);
			window.setTimeout(() => toast.remove(), 1600);
		}
		function removeMenu() {
			document.querySelectorAll(`.${MENU_CLASS}`).forEach((el) => el.remove());
		}
		function showMenu(x, y, items) {
			removeMenu();
			const menu = document.createElement("div");
			menu.className = MENU_CLASS;
			menu.setAttribute("role", "menu");
			for (const item of items) {
				const button = document.createElement("button");
				button.type = "button";
				button.className = `dsh-ws-menu-item${item.danger ? " dsh-ws-menu-item-danger" : ""}`;
				button.textContent = item.label;
				button.disabled = item.disabled === true;
				button.setAttribute("role", "menuitem");
				button.addEventListener("click", (event) => {
					event.stopPropagation();
					removeMenu();
					item.onClick();
				});
				menu.appendChild(button);
			}
			document.body.appendChild(menu);
			const rect = menu.getBoundingClientRect();
			const margin = 8;
			const left = Math.min(Math.max(margin, x), window.innerWidth - rect.width - margin);
			const top = Math.min(Math.max(margin, y), window.innerHeight - rect.height - margin);
			menu.style.left = `${left}px`;
			menu.style.top = `${top}px`;
			const close = (event) => {
				if (event.target instanceof Node && menu.contains(event.target)) return;
				removeMenu();
				cleanup();
			};
			const onKey = (event) => {
				if (event.key === "Escape") {
					removeMenu();
					cleanup();
				}
			};
			const cleanup = () => {
				document.removeEventListener("mousedown", close, true);
				document.removeEventListener("keydown", onKey, true);
				window.removeEventListener("blur", cleanup);
				window.removeEventListener("resize", cleanup);
			};
			document.addEventListener("mousedown", close, true);
			document.addEventListener("keydown", onKey, true);
			window.addEventListener("blur", cleanup);
			window.addEventListener("resize", cleanup);
		}
		function promptText(ctx, title, initial) {
			const t = translator(ctx);
			return new Promise((resolve) => {
				removeMenu();
				document.querySelector(`.${MODAL_CLASS}`)?.remove();
				const backdrop = document.createElement("div");
				backdrop.className = `${MODAL_CLASS}-backdrop`;
				const box = document.createElement("div");
				box.className = MODAL_CLASS;
				const heading = document.createElement("h3");
				heading.textContent = title;
				const input = document.createElement("input");
				input.type = "text";
				input.value = initial;
				input.spellcheck = false;
				const error = document.createElement("div");
				error.className = `${MODAL_CLASS}-error`;
				error.style.display = "none";
				const footer = document.createElement("div");
				footer.className = `${MODAL_CLASS}-footer`;
				const cancel = document.createElement("button");
				cancel.type = "button";
				cancel.textContent = t("dialog.cancel");
				const ok = document.createElement("button");
				ok.type = "button";
				ok.className = `${MODAL_CLASS}-ok`;
				ok.textContent = t("dialog.confirm");
				const close = (result) => {
					backdrop.remove();
					resolve(result);
				};
				cancel.addEventListener("click", () => close(null));
				ok.addEventListener("click", () => {
					const value = input.value.trim();
					if (!value) {
						error.textContent = t("dialog.nameEmpty");
						error.style.display = "block";
						return;
					}
					close(value);
				});
				input.addEventListener("keydown", (event) => {
					if (event.key === "Enter") ok.click();
					if (event.key === "Escape") close(null);
				});
				backdrop.addEventListener("mousedown", (event) => {
					if (event.target === backdrop) close(null);
				});
				footer.append(cancel, ok);
				box.append(heading, input, error, footer);
				backdrop.appendChild(box);
				document.body.appendChild(backdrop);
				input.focus();
				input.select();
			});
		}
		/** Host-authoritative pinned Session set (0.2.x keeps it on the Workspace Controller). */
		function pinnedSessions(ctx) {
			try {
				return ctx.workspaces.list.getSnapshot().pinnedSessionIds ?? [];
			} catch {
				return [];
			}
		}
		/** Host-authoritative archived Session set. */
		function archivedSessions(ctx) {
			try {
				return ctx.workspaces.list.getSnapshot().archivedSessionIds ?? [];
			} catch {
				return [];
			}
		}
		function refreshBadges(ctx) {
			const state = loadState();
			const pinned = pinnedSessions(ctx);
			const rows = document.querySelectorAll("[role=\"treeitem\"]");
			for (const row of rows) {
				const info = rowInfo(row);
				if (!info) continue;
				if (info.kind === "workspace") {
					row.dataset.dshWorkspaceId = info.id || void 0;
					row.dataset.dshPinned = state.pinnedWorkspaces.includes(info.id) ? "true" : "false";
					row.dataset.dshUnread = "false";
				} else {
					row.dataset.dshSessionId = info.id;
					row.dataset.dshPinned = pinned.includes(info.id) ? "true" : "false";
					row.dataset.dshUnread = state.unreadSessions.includes(info.id) ? "true" : "false";
				}
			}
		}
		function getWorkspace(ctx, id) {
			return ctx.workspaces.list.getSnapshot().items.find((w) => w.workspaceId === id);
		}
		function getSession(ctx, id) {
			return ctx.sessions.list.getSnapshot().byId[id];
		}
		function workspaceMenu(ctx, workspaceId, title) {
			const t = translator(ctx);
			const state = loadState();
			const ws = getWorkspace(ctx, workspaceId);
			const pinned = state.pinnedWorkspaces.includes(workspaceId);
			const items = [];
			if (isFeatureEnabled(state, "workspacePin")) items.push({
				id: "pin",
				label: pinned ? t("menu.unpin") : t("menu.pin"),
				onClick: () => {
					const next = toggleId(state.pinnedWorkspaces, workspaceId);
					saveState({
						...loadState(),
						pinnedWorkspaces: next
					});
					if (!pinned) {
						const first = ctx.workspaces.list.getSnapshot().items[0];
						if (first && first.workspaceId !== workspaceId) ctx.workspaces.insertBefore(workspaceId, first.workspaceId).catch((e) => {
							console.warn("[dsh-workspace-menu] pin workspace failed", e);
						});
					}
					flashMessage(pinned ? t("toast.unpinned") : t("toast.pinned"));
					refreshBadges(ctx);
				}
			});
			if (isFeatureEnabled(state, "workspaceRename")) items.push({
				id: "rename",
				label: t("menu.rename"),
				onClick: () => {
					promptText(ctx, t("dialog.renameWorkspace"), title).then((name) => {
						if (!name) return;
						ctx.workspaces.rename(workspaceId, name).catch((e) => {
							console.warn("[dsh-workspace-menu] rename workspace failed", e);
							flashMessage(t("toast.renameFailed"));
						});
					});
				}
			});
			if (isFeatureEnabled(state, "workspaceOpenExplorer")) items.push({
				id: "open",
				label: t("menu.openExplorer"),
				onClick: () => {
					if (!ws) return;
					openInExplorer(ws.path).catch((e) => {
						console.warn("[dsh-workspace-menu] open in explorer failed", e);
						flashMessage(t("toast.openFailed", { reason: e instanceof Error ? e.message : String(e) }));
					});
				}
			});
			if (isFeatureEnabled(state, "workspaceCopyPath")) items.push({
				id: "copy-path",
				label: t("menu.copyPath"),
				onClick: () => {
					if (!ws) return;
					copyText(ws.path).then((ok) => flashMessage(ok ? t("toast.pathCopied") : t("toast.copyFailed")));
				}
			});
			if (isFeatureEnabled(state, "workspaceNewSession")) items.push({
				id: "new-session",
				label: t("menu.newSession"),
				onClick: () => {
					ctx.uiWorkspace.startSession(workspaceId);
				}
			});
			if (isFeatureEnabled(state, "workspaceDelete")) items.push({
				id: "delete",
				label: t("menu.removeWorkspace"),
				danger: true,
				onClick: () => {
					if (!window.confirm(t("dialog.removeWorkspace", { title }))) return;
					ctx.workspaces.delete(workspaceId).catch((e) => {
						console.warn("[dsh-workspace-menu] delete workspace failed", e);
						flashMessage(t("toast.removeFailed"));
					});
				}
			});
			if (isFeatureEnabled(state, "workspaceDeleteDisk")) items.push({
				id: "delete-disk",
				label: t("menu.deleteWorkspace"),
				danger: true,
				disabled: !ws,
				onClick: () => {
					if (!ws) return;
					if (!window.confirm(t("dialog.deleteWorkspace", { title }))) return;
					if (!window.confirm(t("dialog.deleteWorkspaceTwice", { title }))) return;
					const run = async () => {
						for (const sessionId of ws.sessionIds) await deleteSessionRecord(sessionId);
						await deleteWorkspaceDirectory(ws.path);
						await ctx.workspaces.delete(workspaceId);
					};
					run().then(() => {
						flashMessage(t("toast.workspaceDeleted"));
					}).catch((e) => {
						console.warn("[dsh-workspace-menu] delete workspace disk failed", e);
						flashMessage(t("toast.deleteFailed", { reason: e instanceof Error ? e.message : String(e) }));
					});
				}
			});
			return items;
		}
		function sessionMenu(ctx, sessionId, title) {
			const t = translator(ctx);
			const state = loadState();
			const session = getSession(ctx, sessionId);
			const pinned = pinnedSessions(ctx).includes(sessionId);
			const unread = state.unreadSessions.includes(sessionId);
			const archived = archivedSessions(ctx).includes(sessionId);
			const items = [];
			if (isFeatureEnabled(state, "sessionPin")) items.push({
				id: "pin",
				label: pinned ? t("menu.unpin") : t("menu.pin"),
				onClick: () => {
					(pinned ? ctx.uiWorkspace.unpinSession(sessionId) : ctx.uiWorkspace.pinSession(sessionId)).catch((e) => {
						console.warn("[dsh-workspace-menu] pin session failed", e);
					}).finally(() => refreshBadges(ctx));
					flashMessage(pinned ? t("toast.unpinned") : t("toast.pinned"));
				}
			});
			if (isFeatureEnabled(state, "sessionRename")) items.push({
				id: "rename",
				label: t("menu.rename"),
				onClick: () => {
					promptText(ctx, t("dialog.renameSession"), title).then((name) => {
						if (!name) return;
						const binding = ctx.sessions.binding(sessionId);
						if (!binding) {
							flashMessage(t("toast.renameUnavailable"));
							return;
						}
						binding.session.rename(name).then((result) => {
							if (!result.ok) throw new Error(result.error?.message ?? "rename rejected");
						}).catch((e) => {
							console.warn("[dsh-workspace-menu] rename session failed", e);
							flashMessage(t("toast.renameFailed"));
						});
					});
				}
			});
			if (isFeatureEnabled(state, "sessionUnread")) items.push({
				id: "unread",
				label: unread ? t("menu.markRead") : t("menu.markUnread"),
				onClick: () => {
					const next = toggleId(state.unreadSessions, sessionId);
					saveState({
						...loadState(),
						unreadSessions: next
					});
					flashMessage(unread ? t("toast.read") : t("toast.unread"));
					refreshBadges(ctx);
				}
			});
			if (isFeatureEnabled(state, "sessionArchive") && !archived) items.push({
				id: "archive",
				label: t("menu.archive"),
				onClick: () => {
					ctx.uiWorkspace.archiveSession(sessionId).catch((e) => {
						console.warn("[dsh-workspace-menu] archive session failed", e);
						flashMessage(t("toast.archiveFailed"));
					});
				}
			});
			if (isFeatureEnabled(state, "sessionUnarchive") && archived) items.push({
				id: "unarchive",
				label: t("menu.unarchive"),
				onClick: () => {
					ctx.uiWorkspace.unarchiveSession(sessionId).catch((e) => {
						console.warn("[dsh-workspace-menu] unarchive session failed", e);
						flashMessage(t("toast.unarchiveFailed"));
					});
				}
			});
			if (isFeatureEnabled(state, "sessionFork")) items.push({
				id: "fork",
				label: t("menu.fork"),
				onClick: () => {
					ctx.uiWorkspace.forkSession(sessionId, (childId) => {
						ctx.uiWorkspace.openSession(childId);
					}).catch((e) => {
						console.warn("[dsh-workspace-menu] fork session failed", e);
						flashMessage(t("toast.forkFailed"));
					});
				}
			});
			if (isFeatureEnabled(state, "sessionCopyLink")) items.push({
				id: "copy-link",
				label: t("menu.copyLink"),
				onClick: () => {
					copyText(deepLink(sessionId)).then((ok) => flashMessage(ok ? t("toast.linkCopied") : t("toast.copyFailed")));
				}
			});
			if (isFeatureEnabled(state, "sessionCopyTitle")) items.push({
				id: "copy-title",
				label: t("menu.copyTitle"),
				onClick: () => {
					copyText(title).then((ok) => flashMessage(ok ? t("toast.titleCopied") : t("toast.copyFailed")));
				}
			});
			if (isFeatureEnabled(state, "sessionOpenWindow")) items.push({
				id: "open-window",
				label: t("menu.openWindow"),
				onClick: () => {
					window.open(deepLink(sessionId), "_blank");
				}
			});
			if (isFeatureEnabled(state, "sessionOpenFolder")) items.push({
				id: "open-folder",
				label: t("menu.openFolder"),
				disabled: !session?.cwd,
				onClick: () => {
					if (!session?.cwd) return;
					openInExplorer(session.cwd).catch((e) => {
						console.warn("[dsh-workspace-menu] open session cwd failed", e);
						flashMessage(t("toast.openFailed", { reason: e instanceof Error ? e.message : String(e) }));
					});
				}
			});
			if (isFeatureEnabled(state, "sessionDelete")) items.push({
				id: "delete",
				label: t("menu.deleteSession"),
				danger: true,
				onClick: () => {
					if (!window.confirm(t("dialog.deleteSession", { title }))) return;
					if (!window.confirm(t("dialog.deleteSessionTwice", { title }))) return;
					deleteSessionRecord(sessionId).then(() => {
						flashMessage(t("toast.sessionDeleted"));
						ctx.sessions.refresh();
					}).catch((e) => {
						console.warn("[dsh-workspace-menu] delete session failed", e);
						flashMessage(t("toast.deleteFailed", { reason: e instanceof Error ? e.message : String(e) }));
					});
				}
			});
			return items;
		}
		function handleRowEvent(event, ctx) {
			const state = loadState();
			if (event.type === "dblclick" && !isFeatureEnabled(state, "dblclick")) return;
			if (event.type === "contextmenu" && !isFeatureEnabled(state, "contextmenu")) return;
			const row = (event.target instanceof Element ? event.target : void 0)?.closest("[role=\"treeitem\"]");
			if (!row) return;
			const info = rowInfo(row);
			if (!info) return;
			if (event.type === "contextmenu") event.preventDefault();
			if (event.type !== "dblclick" && event.type !== "contextmenu") return;
			event.stopPropagation();
			const items = info.kind === "workspace" ? workspaceMenu(ctx, info.id, info.title) : sessionMenu(ctx, info.id, info.title);
			if (items.length === 0) return;
			showMenu(event.clientX, event.clientY, items);
		}
		function injectStyles() {
			const style = document.createElement("style");
			style.textContent = `
    .${MENU_CLASS} {
      position: fixed;
      z-index: 2147483000;
      width: max-content;
      min-width: 130px;
      max-width: 220px;
      padding: 4px;
      background: rgba(255, 255, 255, 0.65);
      background: color-mix(in srgb, var(--dsw-alias-bg-layer-3, #ffffff) 62%, transparent);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.5));
      border-radius: 10px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), inset 0 0 1px rgba(255, 255, 255, 0.2);
      font: 13px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif;
      color: var(--dsw-alias-label-primary, #1a1a1a);
      user-select: none;
    }
    .${MENU_CLASS}-item {
      display: block;
      width: 100%;
      box-sizing: border-box;
      text-align: left;
      padding: 5px 9px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
      white-space: nowrap;
    }
    .${MENU_CLASS}-item:hover:not(:disabled) {
      background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.06));
    }
    .${MENU_CLASS}-item:disabled {
      opacity: .5;
      cursor: default;
    }
    .${MENU_CLASS}-item-danger {
      color: #d33;
    }
    .${MODAL_CLASS}-backdrop {
      position: fixed;
      inset: 0;
      z-index: 2147483001;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.35);
    }
    .${MODAL_CLASS} {
      min-width: 280px;
      padding: 16px;
      border-radius: 10px;
      background: var(--dsw-alias-bg-layer-3, #ffffff);
      color: var(--dsw-alias-label-primary, #1a1a1a);
      font: 13px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
    }
    .${MODAL_CLASS} h3 {
      margin: 0 0 10px;
      font-size: 14px;
      font-weight: 600;
    }
    .${MODAL_CLASS} input {
      width: 100%;
      box-sizing: border-box;
      padding: 6px 8px;
      border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
      border-radius: 6px;
      background: var(--dsw-alias-bg-input, transparent);
      color: inherit;
      font: inherit;
    }
    .${MODAL_CLASS}-error {
      margin-top: 6px;
      color: #d33;
      font-size: 12px;
    }
    .${MODAL_CLASS}-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 14px;
    }
    .${MODAL_CLASS}-footer button {
      padding: 5px 12px;
      border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
      border-radius: 6px;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
    .${MODAL_CLASS}-ok {
      background: var(--dsw-alias-brand, #4d6bfe) !important;
      border-color: transparent !important;
      color: #fff !important;
    }
    .dsh-ws-toast {
      position: fixed;
      left: 50%;
      bottom: 32px;
      z-index: 2147483002;
      transform: translateX(-50%);
      padding: 8px 14px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.78);
      color: #fff;
      font: 13px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif;
      pointer-events: none;
    }
    [data-dsh-pinned="true"] [data-dsh-workspace-title],
    [data-dsh-pinned="true"] [data-dsh-session-title] {
      font-weight: 600;
    }
    [data-dsh-unread="true"] [data-dsh-session-title]::after {
      content: " ●";
      color: var(--dsw-alias-brand, #4d6bfe);
    }
  `;
			document.head.appendChild(style);
			return () => style.remove();
		}
		function Switch(props) {
			const { checked, onChange, label } = props;
			const track = {
				position: "relative",
				width: 36,
				height: 20,
				borderRadius: 999,
				background: checked ? "var(--dsw-alias-brand, #4d6bfe)" : "var(--dsw-alias-bg-input, #2a2a32)",
				transition: "background .18s ease",
				flex: "none"
			};
			const thumb = {
				position: "absolute",
				top: 2,
				left: checked ? 18 : 2,
				width: 16,
				height: 16,
				borderRadius: "50%",
				background: "#fff",
				transition: "left .18s ease"
			};
			return (0, react.createElement)("label", { style: {
				display: "inline-flex",
				cursor: "pointer",
				flex: "none"
			} }, (0, react.createElement)("input", {
				type: "checkbox",
				checked,
				"aria-label": label,
				onChange: (event) => onChange(event.currentTarget.checked),
				style: {
					position: "absolute",
					opacity: 0,
					width: 0,
					height: 0
				}
			}), (0, react.createElement)("span", { style: track }, (0, react.createElement)("span", { style: thumb })));
		}
		function SettingsPage(props) {
			const { t } = props;
			const [state, setState] = (0, react.useState)(() => loadState());
			const toggle = (key, value) => {
				const next = {
					...loadState(),
					features: {
						...state.features,
						[key]: value
					}
				};
				saveState(next);
				setState(next);
			};
			const container = {
				width: "100%",
				boxSizing: "border-box",
				display: "flex",
				flexDirection: "column",
				gap: 4
			};
			const head = {
				display: "flex",
				flexDirection: "column",
				gap: 4,
				marginBottom: 8
			};
			const title = {
				margin: 0,
				fontSize: 14,
				fontWeight: 400,
				lineHeight: "22px",
				color: "var(--dsw-alias-label-primary, inherit)"
			};
			const desc = {
				margin: 0,
				fontSize: 12,
				lineHeight: "18px",
				color: "var(--dsw-alias-label-tertiary, inherit)"
			};
			const body = {
				display: "flex",
				flexDirection: "column",
				gap: 8,
				padding: "4px 0 8px"
			};
			const groupTitle = {
				padding: "12px 0 2px",
				fontSize: 12,
				fontWeight: 600,
				lineHeight: "18px",
				color: "var(--dsw-alias-label-tertiary, inherit)",
				textTransform: "uppercase",
				letterSpacing: ".04em"
			};
			const toggleRow = {
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				gap: 12,
				minHeight: 36,
				fontSize: 13,
				lineHeight: "20px",
				color: "var(--dsw-alias-label-primary, inherit)"
			};
			return (0, react.createElement)("div", {
				style: container,
				"data-dsh-workspace-menu-settings": "true"
			}, (0, react.createElement)("div", { style: head }, (0, react.createElement)("h3", { style: title }, t("page.title")), (0, react.createElement)("p", { style: desc }, t("page.desc"))), (0, react.createElement)("div", { style: body }, FEATURE_GROUPS.map((group) => (0, react.createElement)("div", { key: group.title }, (0, react.createElement)("div", { style: groupTitle }, t(group.title)), group.keys.map((key) => (0, react.createElement)("div", {
				key,
				style: toggleRow
			}, (0, react.createElement)("span", null, t(`feature.${key}`)), (0, react.createElement)(Switch, {
				checked: state.features[key] !== false,
				onChange: (value) => toggle(key, value),
				label: t(`feature.${key}`)
			})))))));
		}
		/**
		* Deep-link support: `?session=<id>` opens that session once the catalog
		* knows it. 0.2.x has no built-in URL routing, so the plugin owns it and
		* navigates through the view owner (`ctx.uiWorkspace.openSession`).
		*/
		function handleDeepLink(ctx) {
			const target = new URLSearchParams(window.location.search).get("session");
			if (!target) return () => void 0;
			let tries = 0;
			const timer = window.setInterval(() => {
				tries += 1;
				if (ctx.sessions.list.getSnapshot().byId[target]) {
					window.clearInterval(timer);
					ctx.uiWorkspace.openSession(target);
					return;
				}
				if (tries >= 30) {
					window.clearInterval(timer);
					ctx.sessions.refresh().then(() => {
						if (ctx.sessions.list.getSnapshot().byId[target]) ctx.uiWorkspace.openSession(target);
					}).catch(() => void 0);
				}
			}, 250);
			return () => window.clearInterval(timer);
		}
		/** Required client services. */
		const inject = [
			"slots",
			"sessions",
			"workspaces",
			"uiWorkspace",
			"locale"
		];
		function apply(ctx) {
			const t = translator(ctx);
			ctx.effect(() => {
				return ctx.locale.register(NS, {
					zh,
					en
				});
			}, `${PLUGIN_ID}: locale dictionaries`);
			ctx.effect(() => {
				let started = false;
				let cleanup;
				const start = () => {
					if (started) return;
					if (!document.body) {
						document.addEventListener("DOMContentLoaded", start, { once: true });
						return;
					}
					started = true;
					const removeStyle = injectStyles();
					const onDoubleClick = (event) => handleRowEvent(event, ctx);
					const onContextMenu = (event) => handleRowEvent(event, ctx);
					document.addEventListener("dblclick", onDoubleClick, true);
					document.addEventListener("contextmenu", onContextMenu, true);
					let raf = 0;
					const observer = new MutationObserver(() => {
						window.cancelAnimationFrame(raf);
						raf = window.requestAnimationFrame(() => refreshBadges(ctx));
					});
					observer.observe(document.body, {
						childList: true,
						subtree: true
					});
					refreshBadges(ctx);
					cleanup = () => {
						window.cancelAnimationFrame(raf);
						observer.disconnect();
						document.removeEventListener("dblclick", onDoubleClick, true);
						document.removeEventListener("contextmenu", onContextMenu, true);
						removeStyle();
						removeMenu();
						document.querySelectorAll(`.${MODAL_CLASS}-backdrop`).forEach((el) => el.remove());
					};
				};
				start();
				return () => {
					if (!started) document.removeEventListener("DOMContentLoaded", start);
					cleanup?.();
				};
			}, `${PLUGIN_ID}: row menu`);
			ctx.slots.inject("settings.section", () => {
				return ctx.slots.register({
					name: "settings.section",
					id: SECTION_ID,
					order: SECTION_ORDER,
					label: () => t("nav"),
					locale: NS,
					inject: () => ({ t })
				}, SettingsPage);
			});
			ctx.effect(() => handleDeepLink(ctx), `${PLUGIN_ID}: deep link`);
		}
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map