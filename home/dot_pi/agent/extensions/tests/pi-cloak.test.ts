import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
	cloakCommandOutputText,
	cloakText,
	loadState,
} from "../pi-cloak/index.ts";

function makeCloakState() {
	const directory = mkdtempSync(join(tmpdir(), "pi-cloak-test-"));
	const configPath = join(directory, "cloak.json");
	writeFileSync(
		configPath,
		JSON.stringify({
			enabled: true,
			cloakCharacter: "*",
			cloakLength: null,
			tryAllPatterns: true,
			patterns: [
				{ filePattern: "**/*.env*", cloakPattern: "(=).+", replace: "$1" },
				{
					filePattern: "**/*.json",
					cloakPattern: "(\\\"apiKey\\\"\\s*:\\s*\\\")[^\\\"]+",
					replace: "$1",
				},
			],
		}),
	);
	return loadState(configPath);
}

test("redacts configured secrets from matching read results", () => {
	const state = makeCloakState();
	const result = cloakText("TOKEN=synthetic-secret", ".env", "/repo", state);
	assert.equal(result, "TOKEN=****************");
	assert.doesNotMatch(result, /synthetic-secret/);
});

test("redacts all configured patterns from command and write_stdin output", () => {
	const state = makeCloakState();
	const result = cloakCommandOutputText(
		'TOKEN=synthetic-secret\n{"apiKey":"another-synthetic-secret"}',
		state,
	);
	assert.doesNotMatch(result, /synthetic-secret/);
	assert.match(result, /^TOKEN=\*+/);
	assert.match(result, /"apiKey":"\*+"/);
});
