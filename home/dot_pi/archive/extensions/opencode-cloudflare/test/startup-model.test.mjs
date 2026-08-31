import assert from "node:assert/strict";
import { test } from "node:test";
import { recoverOpencodeCloudflareStartupModel } from "../startup-model.ts";

const defaultModel = {
	id: "public-default-model",
	provider: "opencode.cloudflare.dev",
};

function createDependencies(overrides = {}) {
	const calls = [];
	return {
		calls,
		dependencies: {
			activeModel: undefined,
			defaultProvider: "opencode.cloudflare.dev",
			defaultModelId: defaultModel.id,
			defaultThinkingLevel: "medium",
			refreshCachedCatalog: async () => {
				calls.push("refresh");
				return true;
			},
			findModel: (provider, modelId) => {
				calls.push(`find:${provider}/${modelId}`);
				return defaultModel;
			},
			setModel: async (model) => {
				calls.push(`set:${model.provider}/${model.id}`);
				return true;
			},
			setThinkingLevel: (level) => {
				calls.push(`thinking:${level}`);
			},
			...overrides,
		},
	};
}

test("recovers the configured default model from the cached catalog", async () => {
	const { calls, dependencies } = createDependencies();

	const result = await recoverOpencodeCloudflareStartupModel(dependencies);

	assert.equal(result, "recovered");
	assert.deepEqual(calls, [
		"refresh",
		"find:opencode.cloudflare.dev/public-default-model",
		"set:opencode.cloudflare.dev/public-default-model",
		"thinking:medium",
	]);
});

test("leaves an already selected model unchanged", async () => {
	const { calls, dependencies } = createDependencies({ activeModel: defaultModel });

	const result = await recoverOpencodeCloudflareStartupModel(dependencies);

	assert.equal(result, "not-needed");
	assert.deepEqual(calls, []);
});

test("does not select a model for another configured provider", async () => {
	const { calls, dependencies } = createDependencies({ defaultProvider: "anthropic" });

	const result = await recoverOpencodeCloudflareStartupModel(dependencies);

	assert.equal(result, "not-configured-default");
	assert.deepEqual(calls, []);
});

test("reports a missing cached default model without changing session state", async () => {
	const { calls, dependencies } = createDependencies({
		findModel: (provider, modelId) => {
			calls.push(`find:${provider}/${modelId}`);
			return undefined;
		},
	});

	const result = await recoverOpencodeCloudflareStartupModel(dependencies);

	assert.equal(result, "model-unavailable");
	assert.deepEqual(calls, ["refresh", "find:opencode.cloudflare.dev/public-default-model"]);
});

test("does not change thinking when model authentication is unavailable", async () => {
	const { calls, dependencies } = createDependencies({
		setModel: async (model) => {
			calls.push(`set:${model.provider}/${model.id}`);
			return false;
		},
	});

	const result = await recoverOpencodeCloudflareStartupModel(dependencies);

	assert.equal(result, "auth-unavailable");
	assert.deepEqual(calls, [
		"refresh",
		"find:opencode.cloudflare.dev/public-default-model",
		"set:opencode.cloudflare.dev/public-default-model",
	]);
});
