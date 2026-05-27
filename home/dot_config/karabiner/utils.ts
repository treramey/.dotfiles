import { To, KeyCode, Manipulator, KarabinerRules } from "./types";

/**
 * Custom way to describe a command in a layer
 */
export interface LayerCommand {
	to: To[];
	description?: string;
}

type HyperKeySublayer = {
	// The ? is necessary, otherwise we'd have to define something for _every_ key code
	[key_code in KeyCode]?: LayerCommand;
};

/**
 * Create a Hyper Key sublayer, where every command is prefixed with a key
 * e.g. Hyper + O ("Open") is the "open applications" layer, I can press
 * e.g. Hyper + O + G ("Google Chrome") to open Chrome
 */
export function createHyperSubLayer(
	sublayer_key: KeyCode,
	commands: HyperKeySublayer,
	allSubLayerVariables: string[],
): Manipulator[] {
	const subLayerVariableName = generateSubLayerVariableName(sublayer_key);

	return [
		// When Left Option + sublayer_key is pressed, set the variable to 1; on key_up, set it to 0 again
		{
			description: `Toggle Left Option sublayer ${sublayer_key}`,
			type: "basic",
			from: {
				key_code: sublayer_key,
				modifiers: {
					mandatory: ["left_option"],
				},
			},
			to_after_key_up: [
				{
					set_variable: {
						name: subLayerVariableName,
						// The default value of a variable is 0: https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/conditions/variable/
						// That means by using 0 and 1 we can filter for "0" in the conditions below and it'll work on startup
						value: 0,
					},
				},
			],
			to: [
				{
					set_variable: {
						name: subLayerVariableName,
						value: 1,
					},
				},
			],
			// This enables us to press other sublayer keys in the current sublayer
			// (e.g. Left Option + O > M even though Left Option + M is also a sublayer)
			// basically, only trigger a sublayer if no other sublayer is active
			conditions: allSubLayerVariables
				.filter((subLayerVariable) => subLayerVariable !== subLayerVariableName)
				.map((subLayerVariable) => ({
					type: "variable_if",
					name: subLayerVariable,
					value: 0,
				})),
		},
		// Define the individual commands that are meant to trigger in the sublayer
		...(Object.keys(commands) as (keyof typeof commands)[]).map(
			(command_key): Manipulator => ({
				...commands[command_key],
				type: "basic" as const,
				from: {
					key_code: command_key,
					modifiers: {
						// Mandatory modifiers are *not* added to the "to" event
						mandatory: ["any"],
					},
				},
				// Only trigger this command if the variable is 1 (i.e., if Hyper + sublayer is held)
				conditions: [
					{
						type: "variable_if",
						name: subLayerVariableName,
						value: 1,
					},
				],
			}),
		),
	];
}

/**
 * Create all hyper sublayers. This needs to be a single function, as well need to
 * have all the hyper variable names in order to filter them and make sure only one
 * activates at a time
 */
export function createHyperSubLayers(
	subLayers: {
		[key_code in KeyCode]?: HyperKeySublayer | LayerCommand;
	},
): KarabinerRules[] {
	const allSubLayerVariables = (
		Object.keys(subLayers) as (keyof typeof subLayers)[]
	).map((sublayer_key) => generateSubLayerVariableName(sublayer_key));

	return Object.entries(subLayers).map(([key, value]) =>
		"to" in value
			? {
					// Non-nested commands open on Left Option + Shift, so plain
					// lalt + key stays free for normal option/special-character typing.
					description: `Left Option + Shift + ${key}`,
					manipulators: [
						{
							...value,
							type: "basic" as const,
							from: {
								key_code: key as KeyCode,
								modifiers: {
									// Mandatory modifiers are *not* added to the "to" event.
									// Shift is required, but either physical Shift key should work.
									mandatory: ["left_option", "shift"],
								},
							},
						},
					],
				}
			: {
					description: `Left Option sublayer "${key}"`,
					manipulators: createHyperSubLayer(
						key as KeyCode,
						value,
						allSubLayerVariables,
					),
				},
	);
}

function generateSubLayerVariableName(key: KeyCode) {
	return `hyper_sublayer_${key}`;
}

function shellQuote(value: string): string {
	return `'${value.replace(/'/g, "'\\''")}'`;
}

/**
 * Shortcut for opening a URL, file, or app bundle path.
 */
export function open(what: string): LayerCommand {
	return {
		to: [
			{
				shell_command: `open ${shellQuote(what)}`,
			},
		],
		description: `Open ${what}`,
	};
}

export function run(command: string, description?: string): LayerCommand {
	return {
		to: [
			{
				shell_command: command,
			},
		],
		description: description ?? `Run ${command}`,
	};
}

/**
 * Shortcut for opening an app bundle by path.
 */
export function app(name: string, path = `/Applications/${name}.app`): LayerCommand {
	return open(path);
}

export function appExecutable(path: string): LayerCommand {
	return run(
		`/usr/bin/nohup ${shellQuote(path)} >/dev/null 2>&1 &`,
		`Launch ${path}`,
	);
}
