import assert from "node:assert/strict";
import test from "node:test";

import { applyGitShellCommandPolicy } from "../git-interceptor.ts";

test("blocks Git hook bypasses in normalized shell commands", () => {
	const decision = applyGitShellCommandPolicy("git commit --no-verify -m unsafe");
	assert.equal(decision._tag, "block");
	if (decision._tag === "block") assert.match(decision.reason, /--no-verify is not allowed/);
});

test("injects non-interactive Git editor settings without changing the command", () => {
	const decision = applyGitShellCommandPolicy("git rebase --continue");
	assert.equal(decision._tag, "allow");
	if (decision._tag === "allow") {
		assert.match(decision.command, /GIT_EDITOR=true/);
		assert.match(decision.command, /GIT_SEQUENCE_EDITOR=true/);
		assert.match(decision.command, /GIT_MERGE_AUTOEDIT=no/);
		assert.match(decision.command, /\ngit rebase --continue$/);
	}
});
