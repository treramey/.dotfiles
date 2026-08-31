import type {
	ToolCallEvent,
	ToolResultEvent,
} from "@earendil-works/pi-coding-agent";

/** Shell tool dialects whose commands are subject to deterministic Pi policy. */
export type PiShellToolName = "bash" | "exec_command";

/** A Pi or Codex shell call normalized to one mutable command boundary. */
export type NormalizedPiShellCommand = {
	readonly toolName: PiShellToolName;
	readonly command: string;
	replaceCommand(nextCommand: string): void;
};

/** File mutation tool dialects whose targets are subject to deterministic Pi policy. */
export type PiFileMutationToolName = "write" | "edit" | "apply_patch";

/** A Pi or Codex file mutation normalized to the paths it may change. */
export type NormalizedPiFileMutation = {
	readonly toolName: PiFileMutationToolName;
	readonly paths: readonly string[];
};

/** Model-visible tool results that may contain configured secrets. */
export type PiSecretBearingToolResult = {
	readonly toolName: "read" | "bash" | "exec_command" | "write_stdin";
	readonly path: string | undefined;
};

function stringField(
	input: Readonly<Record<string, unknown>>,
	field: string,
): string | undefined {
	const value = input[field];
	return typeof value === "string" ? value : undefined;
}

/** Parses native `bash.command` and Codex `exec_command.cmd` tool calls. */
export function parsePiShellToolCall(
	event: ToolCallEvent,
): NormalizedPiShellCommand | undefined {
	if (event.toolName === "bash") {
		const command = stringField(event.input, "command");
		if (command === undefined) return undefined;
		return {
			toolName: "bash",
			command,
			replaceCommand(nextCommand: string): void {
				event.input.command = nextCommand;
			},
		};
	}

	if (event.toolName === "exec_command") {
		const command = stringField(event.input, "cmd");
		if (command === undefined) return undefined;
		return {
			toolName: "exec_command",
			command,
			replaceCommand(nextCommand: string): void {
				event.input.cmd = nextCommand;
			},
		};
	}

	return undefined;
}

function parseApplyPatchPaths(patch: string): readonly string[] {
	const paths = new Set<string>();
	for (const line of patch.split(/\r?\n/)) {
		const header = line.match(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/);
		if (header?.[1] !== undefined) paths.add(header[1]);

		const move = line.match(/^\*\*\* Move to: (.+)$/);
		if (move?.[1] !== undefined) paths.add(move[1]);
	}
	return [...paths];
}

/** Parses native write/edit paths and every target named by a Codex patch. */
export function parsePiFileMutationToolCall(
	event: ToolCallEvent,
): NormalizedPiFileMutation | undefined {
	if (event.toolName === "write" || event.toolName === "edit") {
		const path = stringField(event.input, "path");
		if (path === undefined) return undefined;
		return { toolName: event.toolName, paths: [path] };
	}

	if (event.toolName !== "apply_patch") return undefined;
	const patch = stringField(event.input, "input") ?? stringField(event.input, "patch");
	if (patch === undefined) return undefined;
	return { toolName: "apply_patch", paths: parseApplyPatchPaths(patch) };
}

/** Classifies model-visible read and shell output that must pass through secret cloaking. */
export function parsePiSecretBearingToolResult(
	event: ToolResultEvent,
): PiSecretBearingToolResult | undefined {
	if (event.toolName === "read") {
		return { toolName: "read", path: stringField(event.input, "path") };
	}
	if (
		event.toolName === "bash" ||
		event.toolName === "exec_command" ||
		event.toolName === "write_stdin"
	) {
		return { toolName: event.toolName, path: undefined };
	}
	return undefined;
}
