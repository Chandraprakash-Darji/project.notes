# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun install                # install dependencies (also runs lefthook install via prepare)
bun tauri dev              # dev server + Tauri shell with hot reload
bun tauri build            # production bundle → src-tauri/target/release/bundle/

bun run lint               # oxlint (TypeScript/React)
bun run lint:fix           # oxlint --fix
bun run format             # oxfmt check
bun run format:fix         # oxfmt apply

bun run test               # vitest watch mode
bun run test:run           # vitest run (CI / one-shot)
bun run test:ui            # vitest browser UI

bun run release            # release-it (bump, changelog, tag, GitHub release)

# Rust only
cargo build --manifest-path src-tauri/Cargo.toml
cargo test  --manifest-path src-tauri/Cargo.toml
```

Frontend tests live in `src/lib/__tests__/` — pure lib functions only (no Tauri, no editor). Rust tests live in `src-tauri/src/`.

## Architecture

Rega Notes is a **macOS-only** floating note-taker — a Tauri 2 shell around a React + TipTap editor, modelled on Raycast Notes.

### Data flow

All state lives in `App.tsx` (single component). Notes are stored as **TipTap HTML** (not raw Markdown) in `~/.local/share/rega-notes/notes.json` via `tauri-plugin-store`. The same store API falls back to `localStorage` when the app runs in a plain browser (`bun run dev` without Tauri).

```
App.tsx
  ├─ lib/notes.ts     load/save/sort — wraps tauri-plugin-store + localStorage fallback
  ├─ lib/actions.ts   export (md/txt/html), clipboard, moveBlock (ProseMirror tr)
  ├─ lib/hotkey.ts    ⌥N global shortcut via tauri-plugin-global-shortcut
  └─ lib/title.ts     titleOf() — first DOM block → note title; textOf() → search text
```

### Editor guards

Two refs prevent feedback loops in `App.tsx`:

- `settingRef` — set to `true` around `editor.commands.setContent()`; `onUpdate` bails early while it's set, so programmatic loads don't trigger persistence.
- `loadedIdRef` — tracks `"note:<id>"` / `"del:<id>"` to skip redundant `setContent` calls when the note ID hasn't changed.

### Trash / read-only preview

`deletedViewId` (state) signals that the editor is showing a trashed note read-only. When set, `onUpdate` skips saves and `editor.setEditable(false)` is applied. Clicking the editor body while a deleted note is previewed opens `RestoreDialog`.

### Tauri commands (`src-tauri/src/lib.rs`)

| Command              | Purpose                                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `write_file`         | Writes exported content to an arbitrary user-chosen path; bypasses Tauri's fs-plugin path scoping                       |
| `set_traffic_lights` | Shows/hides macOS close/minimize/zoom buttons; called on window focus change to hide chrome when unfocused (Raycast UX) |

Traffic lights use `objc2-app-kit` (`NSWindow::standardWindowButton` + `NSView::setHidden`). The `cocoa`/`objc` crates are **not** used — they are deprecated.

Window vibrancy (`NSVisualEffectMaterial::HudWindow`) and `set_visible_on_all_workspaces` are applied at startup.

### Capabilities

`src-tauri/capabilities/default.json` is the full permission set. Any new Tauri API call needs a matching permission entry there.

## Release workflow

### Automatic (CI)

Every push to `main` triggers `.github/workflows/release.yml`:

1. `release-it --ci` reads conventional commits since the last tag, determines the next semver bump, bumps `package.json`, runs `scripts/sync-version.mjs` (mirrors version into `tauri.conf.json` + `Cargo.toml`), writes `CHANGELOG.md`, commits, creates a `v<version>` tag, and opens a GitHub Release.
2. If a new version was actually released, the `build-dmg` job runs on `macos-latest`: builds the Tauri app (`bun tauri build`) and uploads the `.dmg` to the GitHub Release as a downloadable asset.
3. Commits with no releasable changes (`fix:`/`feat:` etc.) are a no-op — release-it exits without bumping.

The release commit pushed by the bot (`chore: release v…`) is guarded from re-triggering the workflow via the `if:` condition. No secrets beyond the default `GITHUB_TOKEN` are required.

### Manual (local)

`bun run release` runs the same release-it flow interactively. Requires a `GITHUB_TOKEN` env var for the GitHub release step.

## Git hooks (lefthook)

Configured in `lefthook.yml`, installed automatically on `bun install` via the `prepare` script.

| Hook         | What runs                                                                                                              |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `pre-commit` | `oxlint` on staged `.ts/.tsx` files; `oxfmt` check on all files                                                        |
| `commit-msg` | `commitlint` — enforces [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, etc.) |
| `pre-push`   | `tsc --noEmit` typecheck + `vitest run`                                                                                |

Config: `commitlint.config.cjs` extends `@commitlint/config-conventional`.

## Tooling notes

- **Formatter**: `oxfmt` — double quotes, 80-char width, experimental import sorting (groups separated by blank lines), Tailwind class sorting keyed to `src/App.css`.
- **Linter**: `oxlint` — `sort-keys` is enforced (`"error"`); keep object literal keys alphabetically sorted. `typescript/no-import-type-side-effects` is also an error.
- **Package manager**: `bun` — use `bun add`/`bun remove`, not `npm`/`yarn`.
- **Rust macOS deps**: `objc2-app-kit = "0.3"` and `window-vibrancy = "0.5"` are in `[target."cfg(target_os = \"macos\")".dependencies]`. Tauri itself already pulls in `objc2 0.6` and `objc2-app-kit 0.3`, so no version conflicts.
