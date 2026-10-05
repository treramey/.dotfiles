import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { HunkExtensionAPI } from "hunkdiff/extension";

type Palette = Readonly<Record<string, string>>;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const paletteCandidates = (home: string) => [
  process.env.OMARCHY_HUNK_COLORS,
  join(home, ".local/state/omarchy/current/theme/colors.toml"),
  join(home, ".config/omarchy/current/theme/colors.toml"),
].filter((path): path is string => Boolean(path));

function readPalette(home: string): Palette | undefined {
  const path = paletteCandidates(home).find(existsSync);
  if (!path) {
    return undefined;
  }

  const values: Record<string, string> = {};
  const entries = readFileSync(path, "utf8").matchAll(/^\s*([A-Za-z][A-Za-z0-9_]*)\s*=\s*["']([^"']+)["']/gm);

  for (const [, key, value] of entries) {
    values[key] = value;
  }

  return values;
}

function color(palette: Palette, key: string): string {
  const value = palette[key];
  if (!value || !HEX_COLOR.test(value)) {
    throw new Error(`Omarchy palette is missing a valid ${key} color`);
  }

  return value;
}

function hexToRgb(value: string): [number, number, number] {
  const hex = value.slice(1);
  return [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16)) as [number, number, number];
}

function rgbToHex([red, green, blue]: [number, number, number]): string {
  return `#${[red, green, blue]
    .map((channel) => Math.round(Math.max(0, Math.min(255, channel))).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mix(start: string, end: string, amount: number): string {
  const startRgb = hexToRgb(start);
  const endRgb = hexToRgb(end);
  return rgbToHex(startRgb.map((channel, index) => channel * (1 - amount) + endRgb[index] * amount) as [number, number, number]);
}

function luminance(value: string): number {
  const channels = hexToRgb(value).map((channel) => channel / 255);
  const linear = channels.map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function createTheme(palette: Palette) {
  const background = color(palette, "background");
  const foreground = color(palette, "foreground");
  const accent = color(palette, "accent");
  const muted = color(palette, "muted");
  const red = color(palette, "red");
  const green = color(palette, "green");
  const yellow = color(palette, "yellow");
  const blue = color(palette, "blue");
  const magenta = color(palette, "magenta");
  const cyan = color(palette, "cyan");
  const dark = luminance(background) < 0.5;
  const surfaceAmount = dark ? 0.08 : 0.06;
  const borderAmount = dark ? 0.3 : 0.38;
  const diffAmount = dark ? 0.18 : 0.12;

  return {
    id: "omarchy-system",
    label: "Omarchy System",
    base: dark ? "github-dark-default" : "github-light-default",
    background,
    panel: mix(background, foreground, surfaceAmount),
    panelAlt: mix(background, foreground, dark ? 0.14 : 0.12),
    border: mix(background, foreground, borderAmount),
    accent,
    accentMuted: mix(background, accent, 0.55),
    text: foreground,
    muted,
    addedBg: mix(background, green, diffAmount),
    removedBg: mix(background, red, diffAmount),
    movedAddedBg: mix(background, cyan, diffAmount),
    movedRemovedBg: mix(background, magenta, diffAmount),
    contextBg: mix(background, foreground, dark ? 0.04 : 0.03),
    addedContentBg: mix(background, green, dark ? 0.38 : 0.24),
    removedContentBg: mix(background, red, dark ? 0.38 : 0.24),
    contextContentBg: mix(background, foreground, dark ? 0.16 : 0.12),
    addedSignColor: green,
    removedSignColor: red,
    lineNumberBg: background,
    lineNumberFg: muted,
    selectedHunk: accent,
    badgeAdded: green,
    badgeRemoved: red,
    badgeNeutral: muted,
    fileNew: green,
    fileDeleted: red,
    fileRenamed: magenta,
    fileModified: yellow,
    fileUntracked: muted,
    noteBorder: accent,
    noteBackground: mix(background, foreground, dark ? 0.12 : 0.1),
    noteTitleBackground: mix(background, accent, dark ? 0.18 : 0.14),
    noteTitleText: foreground,
    syntaxScopes: {
      comment: muted,
      "punctuation.definition.comment": muted,
      keyword: yellow,
      "keyword.operator": accent,
      string: green,
      "entity.name.function": cyan,
      "support.type": cyan,
      "entity.name.type": cyan,
      "constant.numeric": magenta,
      variable: foreground,
      "storage.type": blue,
    },
  };
}

export default function registerOmarchyTheme(hunk: HunkExtensionAPI) {
  const home = process.env.HOME;
  if (!home) {
    return;
  }

  try {
    const palette = readPalette(home);
    if (palette) {
      hunk.registerTheme(createTheme(palette));
    }
  } catch (error) {
    hunk.on("startup", (_event, context) => {
      context.notify(`Omarchy Hunk theme unavailable: ${error instanceof Error ? error.message : String(error)}`, "warning");
    });
  }
}
