import type {
	ExtensionAPI,
	ExtensionCommandContext,
	ExtensionContext,
	Theme,
} from "@earendil-works/pi-coding-agent";
import {
	DynamicBorder,
	getMarkdownTheme,
	isEditToolResult,
	isToolCallEventType,
	isWriteToolResult,
} from "@earendil-works/pi-coding-agent";
import type { SelectItem } from "@earendil-works/pi-tui";
import { Container, Key, Markdown, SelectList, Text, matchesKey } from "@earendil-works/pi-tui";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

const ENTRY_BASELINE = "filechanges:baseline";
const ENTRY_CLEAR = "filechanges:clear";
const ENTRY_UNTRACK = "filechanges:untrack";

type Baseline = {
	readonly path: string;
	readonly absPath: string;
	readonly originalContent: string | null;
	readonly createdAt: number;
};

type TrackedFile = {
	readonly path: string;
	readonly absPath: string;
	readonly displayPath: string;
	readonly originalContent: string | null;
	readonly currentContent: string;
	readonly diff: string;
	readonly added: number;
	readonly removed: number;
	readonly kind: "new" | "edited";
	readonly updatedAt: number;
};

type PendingSnapshot = {
	readonly path: string;
	readonly absPath: string;
	readonly before: string | null;
};

type BaselineEntryData = {
	readonly path: string;
	readonly originalContent: string | null;
	readonly timestamp: number;
};

type PathEntryData = {
	readonly path: string;
	readonly timestamp: number;
};

type DiffPart = {
	readonly type: "same" | "add" | "remove";
	readonly line: string;
};

function stripAtPrefix(path: string): string {
	return path.startsWith("@") ? path.slice(1) : path;
}

function normalizeToolPath(cwd: string, rawPath: string): { absPath: string; relPath: string } {
	const cleanedPath = stripAtPrefix(rawPath);
	const absPath = resolve(cwd, cleanedPath);
	const relPath = relative(cwd, absPath);

	return {
		absPath,
		relPath: relPath && !relPath.startsWith("..") ? relPath : cleanedPath,
	};
}

async function readTextOrNull(absPath: string): Promise<string | null> {
	try {
		return await readFile(absPath, "utf-8");
	} catch {
		return null;
	}
}

function countDiffLines(unifiedDiff: string): { added: number; removed: number } {
	let added = 0;
	let removed = 0;

	for (const line of unifiedDiff.split("\n")) {
		if (line.startsWith("+++ ") || line.startsWith("--- ") || line.startsWith("@@")) continue;
		if (line.startsWith("+")) added++;
		else if (line.startsWith("-")) removed++;
	}

	return { added, removed };
}

function formatAddedRemovedPlain(added: number, removed: number): string {
	return `(+${added}/-${removed})`;
}

function styleAddedRemovedForList(theme: Theme, text: string): string {
	const match = text.match(/^\+(\d+)\/-([0-9]+)$/);
	if (!match) return theme.fg("muted", text);

	const added = Number(match[1]);
	const removed = Number(match[2]);
	const plus = added === 0 ? theme.fg("text", `+${added}`) : theme.fg("success", `+${added}`);
	const minus = removed === 0 ? theme.fg("text", `-${removed}`) : theme.fg("error", `-${removed}`);

	return plus + theme.fg("text", "/") + minus;
}

function formatStatus(tracked: ReadonlyMap<string, TrackedFile>, theme?: Theme): string | undefined {
	if (tracked.size === 0) return undefined;

	let edited = 0;
	let created = 0;
	for (const item of tracked.values()) {
		if (item.kind === "new") created++;
		else edited++;
	}

	const text = ` ${edited}  + ${created}`;
	return theme ? theme.fg("muted", text) : text;
}

function buildWidgetLines(tracked: ReadonlyMap<string, TrackedFile>, theme?: Theme): string[] | undefined {
	if (tracked.size === 0) return undefined;

	const items = [...tracked.values()].sort((a, b) => b.updatedAt - a.updatedAt);
	const maxItems = 8;
	const lines: string[] = [];

	for (const item of items.slice(0, maxItems)) {
		const tag = item.kind === "new" ? "+" : "";

		if (!theme) {
			lines.push(`${tag} ${item.displayPath} ${formatAddedRemovedPlain(item.added, item.removed)}`);
			continue;
		}

		const prefix = theme.fg("muted", `${tag} ${item.displayPath} `);
		const plus = item.added === 0 ? theme.fg("text", `+${item.added}`) : theme.fg("success", `+${item.added}`);
		const minus = item.removed === 0 ? theme.fg("text", `-${item.removed}`) : theme.fg("error", `-${item.removed}`);
		const counts = theme.fg("text", "(") + plus + theme.fg("text", "/") + minus + theme.fg("text", ")");

		lines.push(prefix + counts);
	}

	if (items.length > maxItems) {
		const text = `…and ${items.length - maxItems} more`;
		lines.push(theme ? theme.fg("dim", text) : text);
	}

	return lines;
}

function diffLines(original: readonly string[], current: readonly string[]): DiffPart[] {
	const rows = original.length;
	const cols = current.length;
	const dp: number[][] = Array.from({ length: rows + 1 }, () => Array(cols + 1).fill(0));

	for (let i = rows - 1; i >= 0; i--) {
		for (let j = cols - 1; j >= 0; j--) {
			dp[i]![j] = original[i] === current[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
		}
	}

	const diff: DiffPart[] = [];
	let i = 0;
	let j = 0;

	while (i < rows && j < cols) {
		if (original[i] === current[j]) {
			diff.push({ type: "same", line: original[i] ?? "" });
			i++;
			j++;
		} else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
			diff.push({ type: "remove", line: original[i] ?? "" });
			i++;
		} else {
			diff.push({ type: "add", line: current[j] ?? "" });
			j++;
		}
	}

	while (i < rows) {
		diff.push({ type: "remove", line: original[i] ?? "" });
		i++;
	}
	while (j < cols) {
		diff.push({ type: "add", line: current[j] ?? "" });
		j++;
	}

	return diff;
}

function splitLines(text: string): string[] {
	if (text.length === 0) return [];
	return text.replace(/\n$/, "").split("\n");
}

function patchFromBaseline(displayPath: string, original: string | null, current: string): string {
	const before = splitLines(original ?? "");
	const after = splitLines(current);
	const diff = diffLines(before, after);
	const lines = [`--- ${displayPath}`, `+++ ${displayPath}`, "@@"];

	for (const part of diff) {
		if (part.type === "add") lines.push(`+${part.line}`);
		else if (part.type === "remove") lines.push(`-${part.line}`);
		else lines.push(` ${part.line}`);
	}

	return `${lines.join("\n")}\n`;
}

async function ensureParentDir(absPath: string): Promise<void> {
	await mkdir(dirname(absPath), { recursive: true });
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function parseBaselineEntryData(data: unknown): BaselineEntryData | undefined {
	if (!isRecord(data) || typeof data.path !== "string") return undefined;

	return {
		path: data.path,
		originalContent: typeof data.originalContent === "string" ? data.originalContent : null,
		timestamp: typeof data.timestamp === "number" ? data.timestamp : Date.now(),
	};
}

function parsePathEntryData(data: unknown): PathEntryData | undefined {
	if (!isRecord(data) || typeof data.path !== "string") return undefined;

	return {
		path: data.path,
		timestamp: typeof data.timestamp === "number" ? data.timestamp : Date.now(),
	};
}

function parseCommandArgs(args: string | undefined): string[] {
	return (args ?? "")
		.split(/\s+/g)
		.map((arg) => arg.trim())
		.filter(Boolean);
}

function hasForce(args: string | undefined): boolean {
	return parseCommandArgs(args).includes("force");
}

function formatUnknownError(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

export default function (pi: ExtensionAPI) {
	const baselines = new Map<string, Baseline>();
	const tracked = new Map<string, TrackedFile>();
	const pendingByToolCallId = new Map<string, PendingSnapshot>();

	function updateUi(ctx: ExtensionContext): void {
		if (!ctx.hasUI) return;

		ctx.ui.setStatus("filechanges", formatStatus(tracked, ctx.ui.theme));
		ctx.ui.setWidget("filechanges", buildWidgetLines(tracked, ctx.ui.theme));
	}

	async function recomputeTrackedFile(ctx: ExtensionContext, relPath: string): Promise<void> {
		const baseline = baselines.get(relPath);
		if (!baseline) return;

		const current = await readTextOrNull(baseline.absPath);
		const displayPath = baseline.path;

		if (baseline.originalContent === null) {
			if (current === null) {
				tracked.delete(relPath);
				return;
			}

			const diff = patchFromBaseline(displayPath, null, current);
			const { added, removed } = countDiffLines(diff);
			tracked.set(relPath, {
				path: baseline.path,
				absPath: baseline.absPath,
				displayPath,
				originalContent: null,
				currentContent: current,
				diff,
				added,
				removed,
				kind: "new",
				updatedAt: Date.now(),
			});
			updateUi(ctx);
			return;
		}

		if (current === null) {
			const diff = patchFromBaseline(displayPath, baseline.originalContent, "");
			const { added, removed } = countDiffLines(diff);
			tracked.set(relPath, {
				path: baseline.path,
				absPath: baseline.absPath,
				displayPath,
				originalContent: baseline.originalContent,
				currentContent: "",
				diff,
				added,
				removed,
				kind: "edited",
				updatedAt: Date.now(),
			});
			updateUi(ctx);
			return;
		}

		if (current === baseline.originalContent) {
			tracked.delete(relPath);
			updateUi(ctx);
			return;
		}

		const diff = patchFromBaseline(displayPath, baseline.originalContent, current);
		const { added, removed } = countDiffLines(diff);
		tracked.set(relPath, {
			path: baseline.path,
			absPath: baseline.absPath,
			displayPath,
			originalContent: baseline.originalContent,
			currentContent: current,
			diff,
			added,
			removed,
			kind: "edited",
			updatedAt: Date.now(),
		});
		updateUi(ctx);
	}

	async function clearLog(ctx: ExtensionContext, reason: "accept" | "decline"): Promise<void> {
		baselines.clear();
		tracked.clear();
		pendingByToolCallId.clear();
		pi.appendEntry(ENTRY_CLEAR, { timestamp: Date.now(), reason });
		updateUi(ctx);
	}

	async function declineAll(ctx: ExtensionCommandContext, force: boolean): Promise<void> {
		await ctx.waitForIdle();

		if (tracked.size === 0) {
			if (ctx.hasUI) ctx.ui.notify("filechanges: nothing to decline.", "info");
			return;
		}

		if (ctx.hasUI && !force) {
			const ok = await ctx.ui.confirm(
				"Decline pi changes?",
				"This will revert ALL currently logged pi changes (overwrite files / delete created files).",
			);
			if (!ok) return;
		} else if (!ctx.hasUI && !force) {
			throw new Error("Decline requires confirmation. Run: /filechanges-decline force");
		}

		const items = [...tracked.values()].sort((a, b) => b.updatedAt - a.updatedAt);
		let reverted = 0;
		const errors: string[] = [];

		for (const item of items) {
			try {
				if (item.originalContent === null) {
					await rm(item.absPath, { force: true });
				} else {
					await ensureParentDir(item.absPath);
					await writeFile(item.absPath, item.originalContent, "utf-8");
				}
				reverted++;
			} catch (error) {
				errors.push(`${item.displayPath}: ${formatUnknownError(error)}`);
			}
		}

		await clearLog(ctx, "decline");

		if (!ctx.hasUI) return;
		if (errors.length === 0) {
			ctx.ui.notify(`filechanges: declined changes for ${reverted} file(s).`, "info");
			return;
		}

		ctx.ui.notify(
			`filechanges: declined with ${errors.length} error(s). Run /filechanges to inspect; see console for details.`,
			"warning",
		);
		console.warn(`[filechanges] decline errors:\n${errors.join("\n")}`);
	}

	async function acceptAll(ctx: ExtensionCommandContext, force: boolean): Promise<void> {
		await ctx.waitForIdle();

		if (tracked.size === 0) {
			if (ctx.hasUI) ctx.ui.notify("filechanges: nothing to accept.", "info");
			return;
		}

		if (ctx.hasUI && !force) {
			const ok = await ctx.ui.confirm(
				"Accept pi changes?",
				"This will keep current files as-is and clear the modification log.",
			);
			if (!ok) return;
		} else if (!ctx.hasUI && !force) {
			throw new Error("Accept requires confirmation. Run: /filechanges-accept force");
		}

		const count = tracked.size;
		await clearLog(ctx, "accept");
		if (ctx.hasUI) ctx.ui.notify(`filechanges: accepted changes for ${count} file(s).`, "info");
	}

	pi.registerCommand("filechanges", {
		description: "Show files changed by pi and inspect diffs",
		handler: async (_args, ctx) => {
			await ctx.waitForIdle();
			updateUi(ctx);

			if (!ctx.hasUI) {
				const items = [...tracked.values()].sort((a, b) => b.updatedAt - a.updatedAt);
				if (items.length === 0) {
					console.log("filechanges: no pi-made modifications recorded.");
					return;
				}

				const lines = buildWidgetLines(tracked) ?? [];
				console.log(lines.join("\n"));
				return;
			}

			while (true) {
				await ctx.waitForIdle();
				updateUi(ctx);

				const items = [...tracked.values()].sort((a, b) => b.updatedAt - a.updatedAt);
				if (items.length === 0) {
					ctx.ui.notify("filechanges: no pi-made modifications recorded.", "info");
					return;
				}

				const selectItems: SelectItem[] = [
					{ value: "__accept__", label: "Accept changes (clear log)", description: "Keep current files" },
					{ value: "__decline__", label: "Undo changes (revert)", description: "Restore original contents" },
					{ value: "__sep__", label: "────────", description: "" },
					...items.map((item) => ({
						value: item.path,
						label: `${item.kind === "new" ? "+" : ""} ${item.displayPath}`,
						description: `+${item.added}/-${item.removed}`,
					})),
				];

				const picked = await ctx.ui.custom<string | null>((tui, theme, _keybindings, done) => {
					const container = new Container();
					container.addChild(new DynamicBorder((text: string) => theme.fg("accent", text)));
					container.addChild(new Text(theme.fg("accent", theme.bold("File changes")), 1, 0));

					const list = new SelectList(selectItems, Math.min(14, selectItems.length), {
						selectedPrefix: (text) => theme.fg("accent", text),
						selectedText: (text) => theme.fg("accent", text),
						description: (text) => styleAddedRemovedForList(theme, text),
						scrollInfo: (text) => theme.fg("dim", text),
						noMatch: (text) => theme.fg("warning", text),
					});

					list.onSelect = (item) => {
						if (item.value === "__sep__") return;
						done(item.value);
					};
					list.onCancel = () => done(null);
					container.addChild(list);
					container.addChild(new Text(theme.fg("dim", "↑↓ navigate • enter select • esc close"), 1, 0));
					container.addChild(new DynamicBorder((text: string) => theme.fg("accent", text)));

					return {
						render: (width: number) => container.render(width),
						invalidate: () => container.invalidate(),
						handleInput: (data: string) => {
							list.handleInput(data);
							tui.requestRender();
						},
					};
				}, { overlay: true });

				if (!picked) return;
				if (picked === "__accept__") {
					await acceptAll(ctx, false);
					return;
				}
				if (picked === "__decline__") {
					await declineAll(ctx, false);
					return;
				}

				const item = tracked.get(picked);
				if (!item) {
					ctx.ui.notify("filechanges: entry not found (maybe log was cleared).", "warning");
					continue;
				}

				const markdown = `\`\`\`diff\n${item.diff.trimEnd() || "(no diff)"}\n\`\`\``;
				await ctx.ui.custom<void>((tui, theme, _keybindings, done) => {
					const container = new Container();
					container.addChild(new DynamicBorder((text: string) => theme.fg("accent", text)));
					container.addChild(new Text(theme.fg("accent", theme.bold(item.displayPath)), 1, 0));
					container.addChild(new Markdown(markdown, 1, 0, getMarkdownTheme()));
					container.addChild(new Text(theme.fg("dim", "esc to go back"), 1, 0));
					container.addChild(new DynamicBorder((text: string) => theme.fg("accent", text)));

					return {
						render: (width: number) => container.render(width),
						invalidate: () => container.invalidate(),
						handleInput: (data: string) => {
							if (matchesKey(data, Key.escape) || matchesKey(data, Key.ctrl("c"))) done();
							else tui.requestRender();
						},
					};
				}, { overlay: true });
			}
		},
	});

	pi.registerCommand("filechanges-accept", {
		description: "Accept pi-made changes (keeps files, clears log)",
		handler: async (args, ctx) => {
			await acceptAll(ctx, hasForce(args));
		},
	});

	pi.registerCommand("filechanges-decline", {
		description: "Decline pi-made changes (reverts files, clears log)",
		handler: async (args, ctx) => {
			await declineAll(ctx, hasForce(args));
		},
	});

	async function rebuildFromSession(ctx: ExtensionContext): Promise<void> {
		baselines.clear();
		tracked.clear();
		pendingByToolCallId.clear();

		for (const entry of ctx.sessionManager.getBranch()) {
			if (entry.type !== "custom") continue;

			if (entry.customType === ENTRY_CLEAR) {
				baselines.clear();
				tracked.clear();
				continue;
			}

			if (entry.customType === ENTRY_BASELINE) {
				const data = parseBaselineEntryData(entry.data);
				if (!data) continue;

				const { absPath, relPath } = normalizeToolPath(ctx.cwd, data.path);
				baselines.set(relPath, {
					path: relPath,
					absPath,
					originalContent: data.originalContent,
					createdAt: data.timestamp,
				});
				continue;
			}

			if (entry.customType === ENTRY_UNTRACK) {
				const data = parsePathEntryData(entry.data);
				if (!data) continue;

				const { relPath } = normalizeToolPath(ctx.cwd, data.path);
				baselines.delete(relPath);
				tracked.delete(relPath);
			}
		}

		for (const relPath of baselines.keys()) {
			await recomputeTrackedFile(ctx, relPath);
		}

		updateUi(ctx);
	}

	pi.on("session_start", async (_event, ctx) => {
		await rebuildFromSession(ctx);
	});

	pi.on("session_tree", async (_event, ctx) => {
		await rebuildFromSession(ctx);
	});

	pi.on("tool_call", async (event, ctx) => {
		if (!isToolCallEventType("edit", event) && !isToolCallEventType("write", event)) return;

		const { absPath, relPath } = normalizeToolPath(ctx.cwd, event.input.path);
		const before = await readTextOrNull(absPath);
		pendingByToolCallId.set(event.toolCallId, { path: relPath, absPath, before });
	});

	pi.on("tool_result", async (event, ctx) => {
		if (event.isError) {
			pendingByToolCallId.delete(event.toolCallId);
			return;
		}

		if (!isEditToolResult(event) && !isWriteToolResult(event)) return;

		const pending = pendingByToolCallId.get(event.toolCallId);
		pendingByToolCallId.delete(event.toolCallId);
		if (!pending) return;

		if (!baselines.has(pending.path)) {
			baselines.set(pending.path, {
				path: pending.path,
				absPath: pending.absPath,
				originalContent: pending.before,
				createdAt: Date.now(),
			});
			pi.appendEntry(ENTRY_BASELINE, {
				path: pending.path,
				originalContent: pending.before,
				timestamp: Date.now(),
			});
		}

		await recomputeTrackedFile(ctx, pending.path);

		const baseline = baselines.get(pending.path);
		const current = await readTextOrNull(pending.absPath);
		if (!baseline) {
			updateUi(ctx);
			return;
		}

		const backToOriginal =
			(baseline.originalContent !== null && current === baseline.originalContent) ||
			(baseline.originalContent === null && current === null);

		if (backToOriginal) {
			baselines.delete(pending.path);
			tracked.delete(pending.path);
			pi.appendEntry(ENTRY_UNTRACK, { path: pending.path, timestamp: Date.now() });
		}

		updateUi(ctx);
	});
}
