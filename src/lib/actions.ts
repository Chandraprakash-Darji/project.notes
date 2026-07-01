import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import type { Editor } from "@tiptap/react";
import TurndownService from "turndown";

export type NoteFormat = "md" | "txt" | "html";

export function deeplinkFor(id: string): string {
  return `reganotes://note/${id}`;
}

/** Convert the editor's HTML into Markdown (handles task lists and strikethrough). */
export function toMarkdown(html: string): string {
  const td = new TurndownService({
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    headingStyle: "atx",
  });
  td.addRule("strikethrough", {
    filter: ["s", "del"],
    replacement: (content) => `~~${content}~~`,
  });
  td.addRule("taskItem", {
    filter: (node) =>
      node.nodeName === "LI" && node.getAttribute("data-checked") !== null,
    replacement: (content, node) => {
      const checked =
        (node as HTMLElement).getAttribute("data-checked") === "true";
      return `- [${checked ? "x" : " "}] ${content.replace(/^\s+/, "").trimEnd()}\n`;
    },
  });
  return td.turndown(html).trim() + "\n";
}

export interface NoteContents {
  md: string;
  txt: string;
  html: string;
}

const FORMAT_META: Record<
  NoteFormat,
  { ext: string; name: string; mime: string }
> = {
  html: { ext: "html", mime: "text/html", name: "HTML" },
  md: { ext: "md", mime: "text/markdown", name: "Markdown" },
  txt: { ext: "txt", mime: "text/plain", name: "Plain Text" },
};

export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* clipboard unavailable */
  }
}

function safeName(name: string): string {
  return (
    (name || "note")
      .replace(/[\\/:*?"<>|\n]+/g, "_")
      .trim()
      .slice(0, 60) || "note"
  );
}

/** Save a note to disk in the given format via the native save dialog (browser download fallback). */
export async function exportNote(
  title: string,
  format: NoteFormat,
  contents: NoteContents,
): Promise<void> {
  const base = safeName(title);
  const { ext, name, mime } = FORMAT_META[format];
  const data = contents[format];
  try {
    const path = await save({
      defaultPath: `${base}.${ext}`,
      filters: [{ extensions: [ext], name }],
    });
    if (!path) return; // cancelled
    await invoke("write_file", { contents: data, path });
  } catch {
    const blob = new Blob([data], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${base}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

/** Swap the current block (or list item) with its previous/next sibling. */
export function moveBlock(editor: Editor | null, dir: -1 | 1): void {
  if (!editor) return;
  try {
    const { state, view } = editor;
    const { $from } = state.selection;

    // Prefer the innermost list item ancestor; otherwise the top-level block.
    let depth = 1;
    for (let d = $from.depth; d >= 1; d--) {
      const name = $from.node(d).type.name;
      if (name === "listItem" || name === "taskItem") {
        depth = d;
        break;
      }
      depth = 1;
    }

    const parent = $from.node(depth - 1);
    const index = $from.index(depth - 1);
    const target = index + dir;
    if (target < 0 || target >= parent.childCount) return;

    const node = $from.node(depth);
    const before = $from.before(depth);
    const after = $from.after(depth);
    const sibling = parent.child(target);

    const tr =
      dir < 0
        ? state.tr.replaceWith(before - sibling.nodeSize, after, [
            node,
            sibling,
          ])
        : state.tr.replaceWith(before, after + sibling.nodeSize, [
            sibling,
            node,
          ]);

    view.dispatch(tr.scrollIntoView());
    editor.commands.focus();
  } catch {
    /* not movable */
  }
}
