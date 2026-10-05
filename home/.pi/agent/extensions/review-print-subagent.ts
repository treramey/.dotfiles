import { fileURLToPath } from "node:url";
import type {
	ExtensionAPI,
	ExtensionCommandContext,
} from "@earendil-works/pi-coding-agent";

const REVIEW_COMMAND = "review";
const REVIEW_MODEL = "openai-codex/gpt-5.6-sol";
const REVIEW_TIMEOUT_MS = 30 * 60 * 1_000;
const REVIEW_PROMPT_PATH = fileURLToPath(
	new URL("./review-print-subagent.prompt.md", import.meta.url),
);
const REVIEW_PREFACE = [
	"A review subagent is about to inspect the repository in isolation. Its findings are advisory only and may be wrong, overbroad, or missing session context.",
	"",
	"Do not treat review findings as a TODO list. Verify and triage each finding against the user’s request and the current implementation before changing code.",
].join("\n");
const REVIEW_FOLLOW_UP = [
	"Treat the review findings above as advisory and unverified.",
	"Read the cited code, classify each finding as address, defer, or skip, and ask for the user’s disposition before changing code.",
].join(" ");

async function findReviewRepositoryRoot(
	pi: ExtensionAPI,
	cwd: string,
): Promise<string | undefined> {
	const result = await pi.exec("git", ["rev-parse", "--show-toplevel"], {
		cwd,
		timeout: 10_000,
	});
	return result.code === 0 ? result.stdout.trim() || undefined : undefined;
}

async function buildReviewTask(
	pi: ExtensionAPI,
	repoRoot: string,
	extraFocus: string,
): Promise<string> {
	const status = await pi.exec("git", ["status", "--short", "--branch"], {
		cwd: repoRoot,
		timeout: 10_000,
	});
	const hasWorkingTreeChanges = status.stdout
		.split("\n")
		.some((line) => line.length > 0 && !line.startsWith("##"));
	const scope = hasWorkingTreeChanges
		? "Review all committed and uncommitted changes in the current working tree. Compare the branch with its local dev, main, or master merge base when one exists, and include staged, unstaged, and untracked files."
		: "The working tree is clean. Review the latest commit against its first parent.";

	return [
		`Repository root: ${repoRoot}`,
		scope,
		"Begin with git status, then inspect the complete relevant diff before reading targeted surrounding code.",
		status.stdout.trim()
			? `Git status captured at review start:\n${status.stdout.trim()}`
			: "Git status captured at review start: clean",
		extraFocus.trim() ? `Additional user focus: ${extraFocus.trim()}` : "",
	]
		.filter(Boolean)
		.join("\n\n");
}

function setReviewWidget(
	ctx: ExtensionCommandContext,
	message?: string,
): void {
	ctx.ui.setWidget(
		REVIEW_COMMAND,
		message
			? [
					ctx.ui.theme.fg("accent", "╭─ Review"),
					`${ctx.ui.theme.fg("muted", "│")} ${message}`,
					ctx.ui.theme.fg("muted", "╰─ Please wait"),
				]
			: undefined,
		{ placement: "aboveEditor" },
	);
}

/** Registers a print-mode `/review` command that cannot hang on Pi's RPC child lifecycle. */
export default function registerPrintModeReview(pi: ExtensionAPI): void {
	pi.registerCommand(REVIEW_COMMAND, {
		description: "Run an isolated read-only code review using a print-mode child",
		handler: async (args, ctx) => {
			if (!ctx.isIdle()) await ctx.waitForIdle();
			const repoRoot = await findReviewRepositoryRoot(pi, ctx.cwd);
			if (!repoRoot) {
				ctx.ui.notify("Review failed: the current directory is not in a Git repository.", "error");
				return;
			}

			pi.sendMessage(
				{
					customType: "subagent-review-preface",
					content: REVIEW_PREFACE,
					display: true,
				},
				{ triggerTurn: false },
			);

			try {
				const task = await buildReviewTask(pi, repoRoot, args);
				setReviewWidget(ctx, "Reviewing changes…");
				const result = await pi.exec(
					"pi",
					[
						"--no-session",
						"--no-extensions",
						"--no-skills",
						"--no-context-files",
						"--model",
						REVIEW_MODEL,
						"--thinking",
						"medium",
						"--tools",
						"read,bash,grep,find,ls",
						"--append-system-prompt",
						REVIEW_PROMPT_PATH,
						"--print",
						task,
					],
					{
						cwd: repoRoot,
						timeout: REVIEW_TIMEOUT_MS,
						...(ctx.signal ? { signal: ctx.signal } : {}),
					},
				);
				if (ctx.signal?.aborted) return;
				if (result.code !== 0 || !result.stdout.trim()) {
					const detail =
						result.stderr.trim() ||
						result.stdout.trim() ||
						`child exited with code ${result.code}`;
					ctx.ui.notify(`Review failed: ${detail}`, "error");
					return;
				}

				const findings = result.stdout.trim();
				pi.sendMessage(
					{
						customType: "subagent-review-findings",
						content: findings,
						display: true,
						details: { repoRoot, scope: "current-state" },
					},
					{ triggerTurn: false },
				);
				if (!findings.includes("No actionable issues found.")) {
					pi.sendUserMessage(REVIEW_FOLLOW_UP);
				}
				ctx.ui.notify("Review findings returned from the isolated subagent.", "info");
			} finally {
				setReviewWidget(ctx);
			}
		},
	});
}
