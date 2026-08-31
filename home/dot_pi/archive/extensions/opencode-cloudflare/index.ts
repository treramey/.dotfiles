import {
	getAgentDir,
	SettingsManager,
	type ExtensionAPI,
	type ExtensionCommandContext,
	type ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { PROVIDER_ID } from "./constants.ts";
import { buildDoctorReport } from "./doctor.ts";
import { createOpencodeCloudflareProvider } from "./provider.ts";
import { createGatewayMessageEndHandler } from "./redact-gateway-secrets.ts";
import { recoverOpencodeCloudflareStartupModel } from "./startup-model.ts";

const STARTUP_CATALOG_TIMEOUT_MS = 5_000;

async function handleDoctor(ctx: ExtensionCommandContext): Promise<void> {
	const status = ctx.modelRegistry.getProviderAuthStatus(PROVIDER_ID);
	const report = await buildDoctorReport({
		piAuthStatus: status.configured ? status.source ?? status.label ?? "configured" : "missing",
	});
	ctx.ui.notify(report, "info");
}

async function recoverStartupDefaultModel(pi: ExtensionAPI, ctx: ExtensionContext): Promise<void> {
	const settings = SettingsManager.create(ctx.cwd, getAgentDir(), { projectTrusted: ctx.isProjectTrusted() });
	const result = await recoverOpencodeCloudflareStartupModel({
		activeModel: ctx.model,
		defaultProvider: settings.getDefaultProvider(),
		defaultModelId: settings.getDefaultModel(),
		defaultThinkingLevel: settings.getDefaultThinkingLevel(),
		refreshCachedCatalog: async () => {
			try {
				const refresh = await ctx.modelRegistry.refresh({
					providers: [PROVIDER_ID],
					allowNetwork: false,
					signal: AbortSignal.timeout(STARTUP_CATALOG_TIMEOUT_MS),
				});
				return !refresh.aborted && !refresh.errors.has(PROVIDER_ID);
			} catch {
				return false;
			}
		},
		findModel: (provider, modelId) => ctx.modelRegistry.find(provider, modelId),
		setModel: (model) => pi.setModel(model),
		setThinkingLevel: (level) => pi.setThinkingLevel(level),
	});

	if (result === "catalog-unavailable") {
		ctx.ui.notify("OpenCode Cloudflare startup recovery: cached model catalog is unavailable", "warning");
	} else if (result === "model-unavailable") {
		ctx.ui.notify("OpenCode Cloudflare startup recovery: configured default model is unavailable", "warning");
	} else if (result === "auth-unavailable") {
		ctx.ui.notify("OpenCode Cloudflare startup recovery: provider authentication is unavailable", "warning");
	}
}

/**
 * Register the OpenCode Cloudflare provider, doctor command, and error redaction.
 *
 * @param pi - Pi extension API.
 */
export default function registerOpencodeCloudflare(pi: ExtensionAPI): void {
	pi.registerProvider(createOpencodeCloudflareProvider());
	pi.on("session_start", async (_event, ctx) => recoverStartupDefaultModel(pi, ctx));
	pi.on("message_end", createGatewayMessageEndHandler());
	pi.registerCommand("opencode-cf-doctor", {
		description: "Validate OpenCode Cloudflare authentication and gateway health",
		handler: async (_args, ctx) => handleDoctor(ctx),
	});
}
