# Pi harness

Global Pi configuration, synced through this dotfiles repository and stowed at
`~/.pi`.

The default runtime is OpenAI Codex on GPT-5.6 Terra with medium reasoning.
Codex Conversion supplies the execution dialect, while the local policy
extensions keep Git, Cloudflare deployment, Worker configuration, Python, and
secret-handling guardrails active for both Pi and Codex tool event shapes.

## Maintenance

Install or refresh local extension dependencies from this directory:

```bash
npm install --ignore-scripts
```

Run every retained workspace check and the cross-dialect safety suite:

```bash
npm run check
```

Run a smoke test after package or extension changes:

```bash
PI_STARTUP_BENCHMARK=1 pi
```

Use `/reload` after changing extension code in a running Pi session.

## Layout

- `agent/settings.json` pins third-party Pi packages and model routing.
- `agent/pi-codex-conversion.json` configures the Codex execution harness.
- `agent/pi-auto-trees.json`, `agent/pi-smart-btw.json`, and
  `agent/pi-subagent-review.json` route background work to Luna, Terra, or Sol.
- `agent/extensions/policy/pi-tool-events.ts` normalizes Pi and Codex tool
  events before local safety policies inspect them.
- `agent/extensions/whimsical.ts` remains an active local extension.
- `archive/extensions/` contains reversible snapshots of retired extensions;
  Pi does not auto-load this directory.

The custom `opencode-cloudflare` provider and `web-tools` implementation are
archived. `pi-web-access` is the active web layer.

## Neovim bridge

The Pi side of `pi-nvim` is installed here. The Neovim side is configured in
`~/.config/nvim/plugin/28_pi.lua` with the `<Leader>a…` mappings.
