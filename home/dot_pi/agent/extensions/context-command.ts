/**
 * /context — compact context usage report.
 *
 * Shows startup context (system prompt, tools, context files, skills) and, once a
 * conversation exists, message/tool-call consumers. Counts are estimates except
 * when the active provider has reported aggregate usage via ctx.getContextUsage().
 *
 * Adapted from:
 * https://github.com/abhinand5/pi-setup/blob/main/extensions/context-command.ts
 */

import type {
	ContextUsage,
	ExtensionAPI,
	ExtensionCommandContext,
	Theme,
	ToolInfo,
} from "@earendil-works/pi-coding-agent";
import { Box, matchesKey, Text, truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

type Item = {
	readonly label: string;
	readonly tokens: number;
	readonly detail?: string;
	readonly kind?: string;
};

type ContextReport = {
	readonly model: string;
	readonly limit: number;
	readonly total: number;
	readonly free: number;
	readonly mode: "startup" | "conversation";
	readonly categories: readonly Item[];
	readonly startup: {
		readonly system: readonly Item[];
		readonly tools: readonly Item[];
		readonly memory: readonly Item[];
		readonly skills: Readonly<Record<string, readonly Item[]>>;
	};
	readonly conversation: {
		readonly entries: number;
		readonly byRole: readonly Item[];
		readonly toolCalls: readonly Item[];
		readonly largest: readonly Item[];
	};
};

const TOKEN_DIVISOR = 4;
const MAX_LIST = 6;

function stringify(value: unknown): string {
	if (typeof value === "string") return value;
	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
}

function estimateTokens(value: unknown): number {
	if (value == null) return 0;
	return Math.max(0, Math.ceil(stringify(value).length / TOKEN_DIVISOR));
}

function fmt(n: number): string {
	if (n < 20 && n > 0) return "<20";
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
	if (n >= 10_000) return `${Math.round(n / 1000)}k`;
	if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
	return String(Math.round(n));
}

function pct(tokens: number, limit: number): string {
	if (!limit) return "0%";
	const percentage = (tokens / limit) * 100;
	return percentage < 0.1 && tokens > 0 ? "<0.1%" : `${percentage.toFixed(1)}%`;
}

function compactPath(file: string): string {
	const home = process.env.HOME;
	return home && file.startsWith(home) ? file.replace(home, "~") : file;
}

function firstLine(value: unknown): string {
	return stringify(value).replace(/\s+/g, " ").trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function contentText(content: unknown): string {
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return firstLine(content);

	const parts: string[] = [];
	for (const block of content) {
		if (!isRecord(block)) continue;
		if (block.type === "text" && typeof block.text === "string") {
			parts.push(block.text);
			continue;
		}
		if (block.type === "thinking" && typeof block.thinking === "string") {
			parts.push(block.thinking);
			continue;
		}
		if (block.type === "toolCall") {
			const name = typeof block.name === "string" ? block.name : "tool";
			parts.push(`${name} ${stringify(block.arguments ?? {})}`);
			continue;
		}
		if (block.type === "image") {
			parts.push("[image]");
		}
	}
	return parts.join("\n");
}

function messageRole(message: unknown): string | undefined {
	if (!isRecord(message)) return undefined;
	return typeof message.role === "string" ? message.role : undefined;
}

function messageTokens(message: unknown): number {
	if (!isRecord(message)) return estimateTokens(message);
	if (message.role === "toolResult") {
		const toolName = typeof message.toolName === "string" ? message.toolName : "toolResult";
		return estimateTokens(`${toolName}\n${contentText(message.content)}`);
	}
	return estimateTokens(contentText(message.content ?? message));
}

function selectedToolNames(ctx: ExtensionCommandContext, pi: ExtensionAPI): Set<string> {
	const selectedTools = ctx.getSystemPromptOptions().selectedTools;
	if (!selectedTools || selectedTools.length === 0) return new Set(pi.getActiveTools());
	return new Set(selectedTools);
}

function subtractKnown(systemPrompt: string, known: readonly string[]): number {
	let remaining = systemPrompt;
	for (const part of known.filter(Boolean).sort((a, b) => b.length - a.length)) {
		remaining = remaining.replace(part, "");
	}
	return estimateTokens(remaining);
}

function pushCount(map: Map<string, number>, key: string, tokens: number): void {
	map.set(key, (map.get(key) ?? 0) + tokens);
}

function topItems(items: readonly Item[], max = MAX_LIST): Item[] {
	return [...items].sort((a, b) => b.tokens - a.tokens || a.label.localeCompare(b.label)).slice(0, max);
}

function contextUsageLimit(usage: ContextUsage | undefined, ctx: ExtensionCommandContext): number {
	return usage?.contextWindow ?? ctx.model?.contextWindow ?? 128_000;
}

function contextUsageTokens(usage: ContextUsage | undefined): number {
	return usage?.tokens ?? 0;
}

function buildReport(pi: ExtensionAPI, ctx: ExtensionCommandContext): ContextReport {
	const options = ctx.getSystemPromptOptions();
	const usage = ctx.getContextUsage();
	const limit = contextUsageLimit(usage, ctx);
	const model = ctx.model?.id ?? "unknown model";
	const systemPrompt = ctx.getSystemPrompt();

	const skillItems: Item[] = (options.skills ?? []).map((skill) => ({
		label: skill.name,
		tokens: estimateTokens(`${skill.name}\n${skill.description}`),
		detail: compactPath(skill.filePath),
		kind: skill.sourceInfo.scope,
	}));
	const skillsByScope: Record<string, Item[]> = {};
	for (const item of skillItems) {
		const scope = item.kind ?? "skills";
		(skillsByScope[scope] ??= []).push(item);
	}

	const memoryItems: Item[] = (options.contextFiles ?? []).map((file) => ({
		label: compactPath(file.path),
		tokens: estimateTokens(file.content),
	}));

	const selected = selectedToolNames(ctx, pi);
	const toolItems: Item[] = pi.getAllTools()
		.filter((tool: ToolInfo) => selected.size === 0 || selected.has(tool.name))
		.map((tool: ToolInfo) => ({
			label: tool.name,
			// Match the prompt-facing footprint, not the full JSON schema object.
			tokens: estimateTokens([
				tool.name,
				tool.description,
				...(tool.promptGuidelines ?? []),
			].filter(Boolean).join("\n")),
			detail: tool.sourceInfo.source,
		}));

	const knownPromptParts = [
		...(options.skills ?? []).map((skill) => `${skill.name}\n${skill.description}`),
		...(options.skills ?? []).map((skill) => skill.description),
		...(options.contextFiles ?? []).map((file) => file.content),
		...(options.promptGuidelines ?? []),
		options.customPrompt,
		options.appendSystemPrompt,
	].filter((value): value is string => typeof value === "string" && value.length > 0);

	const promptGuidelinesTokens = estimateTokens((options.promptGuidelines ?? []).join("\n"));
	const customPromptTokens = estimateTokens([options.customPrompt, options.appendSystemPrompt].filter(Boolean).join("\n"));
	const systemBaseTokens = Math.max(estimateTokens(systemPrompt) ? 1 : 0, subtractKnown(systemPrompt, knownPromptParts));
	const systemItems: Item[] = [
		{ label: "Pi system prompt", tokens: systemBaseTokens },
		{ label: "Prompt guidelines", tokens: promptGuidelinesTokens },
		{ label: "Custom/append prompt", tokens: customPromptTokens },
	].filter((item) => item.tokens > 0);

	const roleTokens = new Map<string, number>();
	const toolCallTokens = new Map<string, number>();
	const largest: Item[] = [];
	let messageEntries = 0;
	let conversationTokens = 0;

	for (const entry of ctx.sessionManager.getBranch()) {
		if (entry.type !== "message") continue;
		messageEntries += 1;
		const message = entry.message;
		const role = messageRole(message) ?? "message";
		const tokens = messageTokens(message);
		conversationTokens += tokens;
		pushCount(roleTokens, role, tokens);

		if (role === "assistant" && isRecord(message) && Array.isArray(message.content)) {
			for (const block of message.content) {
				if (!isRecord(block) || block.type !== "toolCall" || typeof block.name !== "string") continue;
				pushCount(toolCallTokens, block.name, estimateTokens(block.arguments ?? {}) + estimateTokens(block.name));
			}
		}

		if (role === "toolResult" && isRecord(message) && typeof message.toolName === "string") {
			pushCount(toolCallTokens, `${message.toolName} result`, tokens);
		}

		largest.push({
			label: `${role}${entry.id ? ` ${entry.id}` : ""}`,
			tokens,
			detail: firstLine(contentText(isRecord(message) ? message.content : message)).slice(0, 80),
		});
	}

	const startupSystem = systemItems.reduce((sum, item) => sum + item.tokens, 0);
	const startupTools = toolItems.reduce((sum, item) => sum + item.tokens, 0);
	const startupMemory = memoryItems.reduce((sum, item) => sum + item.tokens, 0);
	const startupSkills = skillItems.reduce((sum, item) => sum + item.tokens, 0);
	const startupTokens = startupSystem + startupTools + startupMemory + startupSkills;
	const measuredTotal = contextUsageTokens(usage);
	const total = Math.max(measuredTotal, startupTokens + conversationTokens);
	const accounted = startupTokens + conversationTokens;
	const other = Math.max(0, total - accounted);
	const free = Math.max(0, limit - total);

	const categories: Item[] = [
		{ label: "System prompt", tokens: startupSystem },
		{ label: "System tools", tokens: startupTools, detail: `${toolItems.length} active` },
		{ label: "Memory files", tokens: startupMemory, detail: `${memoryItems.length} files` },
		{ label: "Skills", tokens: startupSkills, detail: `${skillItems.length} loaded` },
		{ label: "Messages", tokens: conversationTokens, detail: `${messageEntries} entries` },
		{ label: "Provider/other", tokens: other },
		{ label: "Free space", tokens: free },
	];

	return {
		model,
		limit,
		total,
		free,
		mode: messageEntries === 0 ? "startup" : "conversation",
		categories,
		startup: {
			system: systemItems,
			tools: topItems(toolItems),
			memory: topItems(memoryItems),
			skills: Object.fromEntries(Object.entries(skillsByScope).map(([scope, items]) => [scope, topItems(items)])),
		},
		conversation: {
			entries: messageEntries,
			byRole: [...roleTokens.entries()]
				.map(([label, tokens]) => ({ label, tokens }))
				.sort((a, b) => b.tokens - a.tokens),
			toolCalls: [...toolCallTokens.entries()]
				.map(([label, tokens]) => ({ label, tokens }))
				.sort((a, b) => b.tokens - a.tokens)
				.slice(0, MAX_LIST),
			largest: topItems(largest, 10),
		},
	};
}

function plainReport(report: ContextReport): string {
	const lines: string[] = [];
	lines.push(`Context Usage — ${report.model}`);
	lines.push(`${fmt(report.total)}/${fmt(report.limit)} tokens (${pct(report.total, report.limit)}) · free ${fmt(report.free)}`);
	lines.push("");
	lines.push("Breakdown");
	for (const item of report.categories) lines.push(`  ${item.label}: ${fmt(item.tokens)} (${pct(item.tokens, report.limit)})${item.detail ? ` · ${item.detail}` : ""}`);
	lines.push("");
	lines.push("Startup context");
	for (const item of report.startup.system) lines.push(`  ${item.label}: ${fmt(item.tokens)}`);
	for (const item of report.startup.tools) lines.push(`  tool ${item.label}: ${fmt(item.tokens)}`);
	for (const item of report.startup.memory) lines.push(`  memory ${item.label}: ${fmt(item.tokens)}`);
	for (const [scope, items] of Object.entries(report.startup.skills)) {
		lines.push(`  skills ${scope}`);
		for (const item of items) lines.push(`    ${item.label}: ${fmt(item.tokens)}`);
	}
	if (report.mode === "conversation") {
		lines.push("");
		lines.push("Conversation");
		for (const item of report.conversation.byRole) lines.push(`  ${item.label}: ${fmt(item.tokens)}`);
		if (report.conversation.toolCalls.length) lines.push("  Tool calls/results");
		for (const item of report.conversation.toolCalls) lines.push(`    ${item.label}: ${fmt(item.tokens)}`);
		lines.push("  Largest entries");
		for (const item of report.conversation.largest) lines.push(`    ${item.label}: ${fmt(item.tokens)} · ${item.detail ?? ""}`);
	}
	return lines.join("\n");
}

function renderReport(report: ContextReport, theme: Theme, width: number): string[] {
	const barWidth = Math.max(12, Math.min(28, Math.floor(width / 4)));
	const usedCells = Math.max(0, Math.min(barWidth, Math.round((report.total / report.limit) * barWidth)));
	const bar = `${"█".repeat(usedCells)}${"░".repeat(barWidth - usedCells)}`;
	const lines: string[] = [];
	const add = (line = "") => lines.push(line);
	const item = (prefix: string, row: Item) => {
		const amount = `${fmt(row.tokens)} (${pct(row.tokens, report.limit)})`;
		add(`${theme.fg("dim", prefix)} ${theme.fg("text", row.label)} ${theme.fg("dim", "·")} ${theme.fg("accent", amount)}${row.detail ? ` ${theme.fg("dim", "· " + row.detail)}` : ""}`);
	};

	add(`${theme.fg("accent", theme.bold("Context Usage"))} ${theme.fg("dim", "·")} ${theme.fg("text", report.model)}`);
	add(`${theme.fg(report.total / report.limit > 0.8 ? "error" : report.total / report.limit > 0.5 ? "warning" : "success", bar)} ${theme.fg("text", `${fmt(report.total)}/${fmt(report.limit)}`)} ${theme.fg("dim", `(${pct(report.total, report.limit)}) · free ${fmt(report.free)}`)}`);
	add("");
	add(theme.fg("dim", "Estimated usage by category"));
	for (const row of report.categories) item("├", row);
	add("");
	add(`${theme.fg("accent", "Startup context")} ${theme.fg("dim", report.mode === "startup" ? "before first message" : "base payload")}`);
	for (const row of report.startup.system) item("├", row);
	if (report.startup.memory.length) {
		add(theme.fg("dim", "├ Memory files"));
		for (const row of report.startup.memory) item("│ ├", row);
	}
	if (report.startup.tools.length) {
		add(theme.fg("dim", `├ System tools · top ${report.startup.tools.length}`));
		for (const row of report.startup.tools) item("│ ├", row);
	}
	for (const [scope, rows] of Object.entries(report.startup.skills)) {
		add(theme.fg("dim", `├ Skills · ${scope}`));
		for (const row of rows) item("│ ├", row);
	}
	if (report.mode === "conversation") {
		add("");
		add(`${theme.fg("accent", "Conversation")} ${theme.fg("dim", `${report.conversation.entries} entries`)}`);
		for (const row of report.conversation.byRole) item("├", row);
		if (report.conversation.toolCalls.length) {
			add(theme.fg("dim", "├ Tool calls/results"));
			for (const row of report.conversation.toolCalls) item("│ ├", row);
		}
		if (report.conversation.largest.length) {
			add(theme.fg("dim", "├ Largest message entries"));
			for (const row of report.conversation.largest) item("│ ├", row);
		}
	}

	return lines.map((line) => visibleWidth(line) > width ? truncateToWidth(line, width) : line);
}

async function showContextOverlay(report: ContextReport, ctx: ExtensionCommandContext): Promise<void> {
	// overlay:false replaces the main viewport so the report fills the screen,
	// is scrollable (Ctrl+N/P), and disappears on Esc without adding anything to
	// the model context.
	await ctx.ui.custom<void>((_tui, theme, _keybindings, done) => ({
		render(width: number): string[] {
			const box = new Box(1, 1, (text) => theme.bg("customMessageBg", text));
			const body = [
				...renderReport(report, theme, Math.max(20, width - 2)),
				"",
				theme.fg("dim", "Esc/Enter to close · not added to model context"),
			].join("\n");
			box.addChild(new Text(body, 0, 0));
			return box.render(width);
		},
		invalidate() {},
		handleInput(data: string): void {
			if (matchesKey(data, "enter") || matchesKey(data, "escape")) done();
		},
	}));
}

export default function contextCommandExtension(pi: ExtensionAPI): void {
	pi.registerCommand("context", {
		description: "Show what is consuming the context window",
		handler: async (_args, ctx) => {
			const report = buildReport(pi, ctx);
			if (ctx.mode === "print" || !ctx.hasUI) {
				console.log(plainReport(report));
				return;
			}
			await showContextOverlay(report, ctx);
		},
	});
}
