/**
 * Git Interceptor
 *
 * Two guards for agent-driven git commands:
 *
 * 1. Editor hang prevention — Sets GIT_EDITOR, GIT_SEQUENCE_EDITOR to `true`
 *    (no-op) and GIT_MERGE_AUTOEDIT to `no` so git never spawns an interactive
 *    editor (nvim, vim, etc.) that would hang the bash process.
 *
 * 2. Hook bypass prevention — Blocks any command containing `--no-verify` so
 *    the agent cannot circumvent git hooks (pre-commit, commit-msg, etc.).
 *    The agent should fix hook failures or ask the human for help instead.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

import { parsePiShellToolCall } from "./policy/pi-tool-events.ts";

const GIT_ENV_PREFIX =
	"export GIT_EDITOR=true GIT_SEQUENCE_EDITOR=true GIT_MERGE_AUTOEDIT=no\n";

const NO_VERIFY_RE = /--no-verify\b/;

const BLOCK_REASON =
	"BLOCKED: --no-verify is not allowed. Git hooks exist for a reason. " +
	"Do not attempt to bypass them. Instead: fix the underlying issue that " +
	"is causing the hook to fail, or ask the user for help.";

/** The deterministic Git policy outcome for one shell command. */
export type GitShellCommandPolicyDecision =
	| { readonly _tag: "unrelated" }
	| { readonly _tag: "block"; readonly reason: string }
	| { readonly _tag: "allow"; readonly command: string };

/** Blocks hook bypasses and makes agent-driven Git commands non-interactive. */
export function applyGitShellCommandPolicy(command: string): GitShellCommandPolicyDecision {
	if (!command.includes("git")) return { _tag: "unrelated" };
	if (NO_VERIFY_RE.test(command)) return { _tag: "block", reason: BLOCK_REASON };
	return { _tag: "allow", command: GIT_ENV_PREFIX + command };
}

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", (event) => {
		const shellCall = parsePiShellToolCall(event);
		if (shellCall === undefined) return;
		const decision = applyGitShellCommandPolicy(shellCall.command);
		if (decision._tag === "unrelated") return;
		if (decision._tag === "block") return { block: true, reason: decision.reason };
		shellCall.replaceCommand(decision.command);
	});
}
