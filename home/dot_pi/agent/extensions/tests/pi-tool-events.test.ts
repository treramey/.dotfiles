import assert from "node:assert/strict";
import test from "node:test";

import type {
	ToolCallEvent,
	ToolResultEvent,
} from "@earendil-works/pi-coding-agent";

import {
	parsePiFileMutationToolCall,
	parsePiSecretBearingToolResult,
	parsePiShellToolCall,
} from "../policy/pi-tool-events.ts";

test("normalizes and mutates both Pi and Codex shell command dialects", () => {
	const events: ToolCallEvent[] = [
		{ type: "tool_call", toolCallId: "bash-1", toolName: "bash", input: { command: "git status" } },
		{
			type: "tool_call",
			toolCallId: "exec-1",
			toolName: "exec_command",
			input: { cmd: "git status", workdir: "/tmp" },
		},
	];

	for (const event of events) {
		const normalized = parsePiShellToolCall(event);
		assert.ok(normalized);
		assert.equal(normalized.command, "git status");
		normalized.replaceCommand("git diff");
		assert.equal(parsePiShellToolCall(event)?.command, "git diff");
	}
});

test("normalizes traditional file mutations and every Codex patch target", () => {
	const writeEvent: ToolCallEvent = {
		type: "tool_call",
		toolCallId: "write-1",
		toolName: "write",
		input: { path: "worker-configuration.d.ts", content: "generated" },
	};
	assert.deepEqual(parsePiFileMutationToolCall(writeEvent), {
		toolName: "write",
		paths: ["worker-configuration.d.ts"],
	});

	const patchEvent: ToolCallEvent = {
		type: "tool_call",
		toolCallId: "patch-1",
		toolName: "apply_patch",
		input: {
			input: [
				"*** Begin Patch",
				"*** Update File: apps/api/worker-configuration.d.ts",
				"*** Move to: apps/worker/worker-configuration.d.ts",
				"*** Add File: apps/web/new.ts",
				"*** End Patch",
			].join("\n"),
		},
	};
	assert.deepEqual(parsePiFileMutationToolCall(patchEvent), {
		toolName: "apply_patch",
		paths: [
			"apps/api/worker-configuration.d.ts",
			"apps/worker/worker-configuration.d.ts",
			"apps/web/new.ts",
		],
	});
});

test("classifies read and both Codex shell result tools for secret cloaking", () => {
	const results: ToolResultEvent[] = [
		{
			type: "tool_result",
			toolCallId: "read-1",
			toolName: "read",
			input: { path: ".env" },
			content: [{ type: "text", text: "TOKEN=value" }],
			details: undefined,
			isError: false,
		},
		{
			type: "tool_result",
			toolCallId: "exec-1",
			toolName: "exec_command",
			input: { cmd: "env" },
			content: [{ type: "text", text: "TOKEN=value" }],
			details: undefined,
			isError: false,
		},
		{
			type: "tool_result",
			toolCallId: "stdin-1",
			toolName: "write_stdin",
			input: { session_id: 1, chars: "" },
			content: [{ type: "text", text: "TOKEN=value" }],
			details: undefined,
			isError: false,
		},
	];

	assert.deepEqual(parsePiSecretBearingToolResult(results[0]!), {
		toolName: "read",
		path: ".env",
	});
	assert.deepEqual(parsePiSecretBearingToolResult(results[1]!), {
		toolName: "exec_command",
		path: undefined,
	});
	assert.deepEqual(parsePiSecretBearingToolResult(results[2]!), {
		toolName: "write_stdin",
		path: undefined,
	});
});
