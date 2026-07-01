# Rega Notes

A floating, always-on-top Markdown note-taker for macOS — a Raycast Notes-style
scratchpad built with **Tauri + React + TypeScript**. See
[`docs/raycast-notes.md`](docs/raycast-notes.md) for the feature study this is modelled on.

## Highlights

- **Floating window** — frameless overlay title bar, translucent macOS vibrancy,
  always-on-top, follows you across Spaces.
- **Global hotkey** — `⌥N` shows/hides the window from any app.
- **Markdown editor** (TipTap) — headings, bold/italic/underline/strike, inline code,
  code blocks, blockquotes, links, bullet/numbered/**task** lists, dividers, with
  live markdown input rules and a character count.
- **Multiple notes** — first line becomes the title; Browse + search; pin, duplicate,
  history (back/forward); auto-saved to disk.
- **Format bar** (the `T` toolbar) and a full **⌘ Actions menu** (Tabler icons).
- **Export** to Markdown / HTML / plain text, **Copy Deeplink**, **Find in note**,
  **zoom**, and a **Recently Deleted** trash with restore.

## Tech

| Concern            | Choice                                                    |
| ------------------ | --------------------------------------------------------- |
| Shell              | Tauri 2 (Rust)                                            |
| UI                 | React 19 + Vite + TypeScript                              |
| Editor             | TipTap 3 (ProseMirror)                                    |
| Icons              | `@tabler/icons-react`                                     |
| Keyboard shortcuts | `@tanstack/react-hotkeys`                                 |
| Window frosting    | `window-vibrancy` (Rust)                                  |
| Storage            | `@tauri-apps/plugin-store` (JSON on disk)                 |
| Export dialog      | `@tauri-apps/plugin-dialog` + a `write_file` Rust command |

## Keyboard shortcuts

| Shortcut    | Action                    | Shortcut      | Action                 |
| ----------- | ------------------------- | ------------- | ---------------------- |
| `⌥N`        | Show/hide window (global) | `⌘F`          | Find in note           |
| `⌘N`        | New note                  | `⇧⌘C`         | Copy note as text      |
| `⌘D`        | Duplicate note            | `⇧⌘D` / `⇧⌘L` | Copy deeplink          |
| `⇧⌘P`       | Pin / unpin               | `⇧⌘E`         | Export…                |
| `⌘P`        | Browse notes              | `⌃⌘↑` / `⌃⌘↓` | Move list item up/down |
| `⌘[` / `⌘]` | Back / forward            | `⌥⌘,` / `⇧⌘,` | Toggle format bar      |
| `⌘0`        | Actual size               | `⌘+` / `⌘-`   | Zoom in / out          |
| `Esc`       | Close overlays            | `⌃X`          | Delete note (menu)     |

## Develop

```bash
bun install
bun tauri dev      # run the app with hot reload
bun tauri build    # produce a release bundle
```

Requires the Rust toolchain and Xcode Command Line Tools.

## Project layout

```
src/                 React app
  components/         TitleBar, Footer, FormatBar, FindBar, ActionsMenu, BrowseNotes
  lib/               notes (storage), hotkey, actions (export/clipboard/move), title
src-tauri/           Tauri (Rust) shell
  src/lib.rs         plugins, window vibrancy, write_file command
  tauri.conf.json    window config (transparent, always-on-top, overlay title bar)
  capabilities/      permission set
docs/                reference notes
```
