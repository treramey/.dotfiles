import assert from "node:assert/strict";
import test from "node:test";

import { getUvPolicyBlockedMessage } from "../uv-python-interceptor.ts";

test("blocks Python package and virtualenv commands that bypass uv", () => {
	const commands = [
		"pip install requests",
		"pip3 install requests",
		"poetry install",
		"python -m pip install requests",
		".venv/bin/python3.13 -m venv .venv",
	];
	for (const command of commands) {
		assert.notEqual(getUvPolicyBlockedMessage(command), undefined, command);
	}
});

test("allows uv commands and ordinary Python execution", () => {
	for (const command of ["uv add requests", "uv run python script.py", "python script.py"]) {
		assert.equal(getUvPolicyBlockedMessage(command), undefined, command);
	}
});
