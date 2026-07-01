# Raycast Notes

Reference notes on Raycast Notes — what it is, how it looks, and what it can do.
Captured here as a UX/feature reference (the note being edited in the screenshots
is a `project.rega` CRM lead-tracking draft).

## What it is

Raycast Notes is a lightweight, Markdown-based note-taking tool built into Raycast
(the macOS/Windows launcher). It's designed for frictionless capture — a note is
always one hotkey away and appears as a floating window above whatever app you're in.
It grew out of Raycast's earlier "Floating Notes" feature and merged into a single
Notes experience.

Good for: todos, meeting notes, scratch drafts, quick specs — the kind of thing you
want to jot without switching to a heavy app.

## How it looks

The window is compact, borderless, and translucent — it floats over other apps and
lets the desktop/apps behind it show through (the transparency adapts; it reads more
frosted over a wallpaper and darker over app windows).

```
┌─────────────────────────────────────────────┐
│ ● ● ●          Lead:          [⌘] [browse] [+]  │  ← title bar
├─────────────────────────────────────────────┤
│ email id                                       │
│ linkedin                                       │
│ location                                       │
│                                                │
│ Org:                                           │
│  • name                                        │  ← bullet lists
│  • website                                     │
│                                                │
│ Dashboard (Pie chart/Funnel chart)             │  ← bold heading
│  • Intro call Scheduled                         │
│  • Demo Done                                     │
│                                                │
├─────────────────────────────────────────────┤
│              502 characters              (T)   │  ← count + format
└─────────────────────────────────────────────┘
```

Elements visible in the UI:

- **Top-left** — macOS traffic-light window controls (close / minimize / zoom).
- **Top-center** — the note's title, taken automatically from the note's **first line**
  (here, `Lead:`).
- **Top-right toolbar** — three controls:
  - **⌘ Actions** — opens the action menu (same as `⌘K`).
  - **Browse Notes** — the stacked-windows icon; switches between your notes.
  - **+ New Note** — creates a new note.
- **Body** — live-rendered Markdown: bold headings, bulleted lists (with colored bullet
  dots), checklists, etc.
- **Bottom-center** — a live **character count** (`502 characters`).
- **Bottom-right** — a circular **"T"** button that toggles the **Format Bar**
  (`⌥⌘,`); see below.

The window shows one note at a time in a stack-based interface — you can't view two
notes side by side.

## Core commands

Three commands drive the feature from Raycast's root search:

| Command           | What it does                                       |
| ----------------- | -------------------------------------------------- |
| **Raycast Notes** | Toggles the Notes window (commonly bound to `⌥N`). |
| **Create Note**   | Opens a fresh note immediately.                    |
| **Search Notes**  | Searches across note titles and content.           |

## Actions menu (`⌘K`)

Opening the action panel surfaces the full set of note operations (top to bottom):

| Action                      | Shortcut |
| --------------------------- | -------- |
| New Note                    | `⌘N`     |
| Duplicate Note              | `⌘D`     |
| Pin Note                    | `⇧⌘P`    |
| Browse Notes                | `⌘P`     |
| Go Back                     | `⌘[`     |
| Go Forward                  | `⌘]`     |
| Find in Note                | `⌘F`     |
| Copy Note As…               | `⇧⌘C`    |
| Copy Deeplink               | `⇧⌘D`    |
| Create Quicklink            | `⇧⌘L`    |
| Export…                     | `⇧⌘E`    |
| Move List Item Up           | `⌃⌘↑`    |
| Move List Item Down         | `⌃⌘↓`    |
| Format…                     | `⇧⌘,`    |
| Disable Window Auto-Sizing  | `⇧⌘/`    |
| Toggle Format Bar           | `⌥⌘,`    |
| Actual Size                 | `⌘0`     |
| Zoom In                     | `⌘+`     |
| Zoom Out                    | `⌘-`     |
| Open Raycast Notes Settings | `⌘,`     |
| Show Recently Deleted Notes | —        |
| Delete Note                 | `⌃X`     |

Note the two window/recovery items: **Disable Window Auto-Sizing** locks the floating
window to a fixed size instead of growing with content, and **Show Recently Deleted
Notes** is the recovery path for notes you've deleted.

## Formatting

Full Markdown support, applied via shortcuts or Markdown syntax as you type.

### Paragraph / block formatting

| Format                       | Shortcut              |
| ---------------------------- | --------------------- |
| Heading 1–3                  | `⌥⌘1` / `⌥⌘2` / `⌥⌘3` |
| Code block                   | `⌥⌘C`                 |
| Blockquote                   | `⇧⌘B`                 |
| Ordered / bullet / task list | `⇧⌘7` / `⇧⌘8` / `⇧⌘9` |
| Horizontal rule              | type `---` or `___`   |

### Inline text formatting

| Format        | Shortcut |
| ------------- | -------- |
| Bold          | `⌘B`     |
| Italic        | `⌘I`     |
| Underline     | `⌘U`     |
| Strikethrough | `⇧⌘S`    |
| Inline code   | `⌘E`     |
| Link          | `⌘L`     |
| Emoji picker  | type `:` |

Lists can be indented and reordered (`⌃⌘↑` / `⌃⌘↓` to move a list item up/down).
Checklists are first-class — toggle a task complete with `⌘Enter` when the cursor is
on that line.

### Format Bar

Clicking the **"T"** button (or `⌥⌘,`) opens a floating toolbar pinned to the bottom of
the note — a point-and-click alternative to the formatting shortcuts. Left to right:

| Control          | Purpose                                                                   |
| ---------------- | ------------------------------------------------------------------------- |
| **H ▾**          | Heading level dropdown (H1 / H2 / H3)                                     |
| **I ▾**          | Inline text style dropdown (bold, italic, underline, strikethrough, code) |
| **🔗**           | Insert link                                                               |
| **`<>`**         | Insert code block                                                         |
| (insert / block) | Insert element (e.g. blockquote)                                          |
| (indent)         | Indent / block formatting                                                 |
| **☰ ▾**         | List type dropdown (bullet / ordered / task)                              |
| **✕**            | Close the Format Bar                                                      |

## Navigation & organization

- **Browse / switch notes** — `⌘P`, or the Browse Notes toolbar button.
- **History** — `⌘[` / `⌘]` move back/forward through previously opened notes, like a
  browser.
- **Pinning** — `⇧⌘P` pins a note; pinned notes sort to the top of Search/Browse and
  are reachable with `⌘0`–`⌘9` while Notes is open.
- **Zoom** — `⌘-` / `⌘+` adjust text size, `⌘0` resets.

## Sharing & export

- Export any note as **plain text**, **Markdown**, or **HTML**.
- Share out to other apps (e.g. Apple Notes).
- **Copy Deeplink** / **Create Quicklink** to jump straight back to a specific note
  from anywhere in Raycast.

## Plans, storage & privacy

- **Free** — up to **5 notes**, no account required.
- **Pro** — **unlimited** notes.
- Notes are stored in an **encrypted database** locally.
- With a Raycast account, notes sync across devices — **but tasks/checklist state does
  not sync** across devices.

## Limitations

- One note visible at a time (no side-by-side).
- Task completion state isn't synced across devices.
- Free tier caps you at 5 notes.

## Why this is a useful reference for project.rega

The screenshots show Raycast Notes being used as a scratchpad for the CRM lead model
(lead fields, org fields, a pipeline/funnel of stages, call-log conventions). Patterns
worth borrowing for a capture-first CRM UI:

- **First line becomes the title** — zero-friction naming.
- **Floating, always-available capture** over any app.
- **Markdown + checklists** as the primary structure for freeform + structured data.
- **Deeplinks/Quicklinks** so a record is one shortcut away.

## Sources

- [Raycast Notes — core features](https://www.raycast.com/core-features/notes)
- [Notes — Raycast Manual](https://manual.raycast.com/notes)
- [Meet the new Raycast Notes — Raycast Blog](https://www.raycast.com/blog/raycast-notes)
- Screenshots of the Raycast Notes floating window and action menu (provided).
