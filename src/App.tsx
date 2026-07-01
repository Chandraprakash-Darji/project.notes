import {
  IconPlus,
  IconCopy,
  IconPin,
  IconPinnedOff,
  IconStack2,
  IconArrowLeft,
  IconArrowRight,
  IconSearch,
  IconClipboardText,
  IconLink,
  IconExternalLink,
  IconFileExport,
  IconArrowUp,
  IconArrowDown,
  IconTypography,
  IconArrowAutofitHeight,
  IconLetterT,
  IconZoomReset,
  IconZoomIn,
  IconZoomOut,
  IconSettings,
  IconTrash,
  IconTrashX,
  IconMarkdown,
  IconFileText,
  IconCode,
} from "@tabler/icons-react";
import { useHotkeys } from "@tanstack/react-hotkeys";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { CharacterCount } from "@tiptap/extension-character-count";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { parse as mdParse } from "marked";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  ActionsCombobox,
  type ActionGroup,
} from "./components/ActionsCombobox";
import { ArchivedBanner, RestoreDialog } from "./components/ArchivedNote";
import { BrowseNotes } from "./components/BrowseNotes";
import { FindBar } from "./components/FindBar";
import { Footer } from "./components/Footer";
import { FormatBar } from "./components/FormatBar";
import { TitleBar } from "./components/TitleBar";
import {
  copyToClipboard,
  deeplinkFor,
  exportNote,
  moveBlock,
  toMarkdown,
  type NoteFormat,
} from "./lib/actions";
import { registerToggleHotkey } from "./lib/hotkey";
import {
  loadNotes,
  saveNotes,
  loadTrash,
  saveTrash,
  newNote as makeNote,
  sortNotes,
  type Note,
} from "./lib/notes";
import { titleOf } from "./lib/title";

type BrowseMode = "notes" | "trash";
const ICON = 16;

/** Quick heuristic: does a pasted plain-text string look like Markdown? */
function isMdLike(text: string): boolean {
  return /^(#{1,6}\s|\*\*|__|[-*+]\s|>\s|`{1,3}|~~|\[.+\]\(.+\))/m.test(text);
}

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [trash, setTrash] = useState<Note[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  // When set, the editor previews a note from the trash read-only.
  const [deletedViewId, setDeletedViewId] = useState<string | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [menu, setMenu] = useState<
    "browse-notes" | "browse-trash" | "actions" | null
  >(null);
  const [formatBarOpen, setFormatBarOpen] = useState(false);
  const [finding, setFinding] = useState(false);
  const [autoSize, setAutoSize] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [windowFocused, setWindowFocused] = useState(true);

  const currentIdRef = useRef<string | null>(null);
  const loadedIdRef = useRef<string | null>(null);
  const settingRef = useRef(false);
  const saveTimer = useRef<number | undefined>(undefined);
  const trashTimer = useRef<number | undefined>(undefined);
  const historyRef = useRef<{ stack: string[]; index: number }>({
    index: -1,
    stack: [],
  });
  const notesRef = useRef<Note[]>([]);
  const deletedViewIdRef = useRef<string | null>(null);
  const handleNewTimer = useRef<number | undefined>(undefined);
  currentIdRef.current = currentId;
  notesRef.current = notes;
  deletedViewIdRef.current = deletedViewId;

  const editor = useEditor({
    content: "",
    editorProps: {
      handlePaste: (_view, event) => {
        const text = event.clipboardData?.getData("text/plain");
        if (!text || !isMdLike(text)) return false;
        const html = mdParse(text, { async: false }) as string;
        event.clipboardData?.setData("text/html", html);
        return false; // let TipTap's native HTML paste handler insert it
      },
    },
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount,
      Placeholder.configure({ placeholder: "Write something…" }),
    ],
    onUpdate: ({ editor }) => {
      // Never persist while setting content or previewing a read-only trash note.
      if (settingRef.current || deletedViewIdRef.current) return;
      const html = editor.getHTML();
      setCharCount(editor.storage.characterCount.characters());
      const id = currentIdRef.current;
      if (!id) return;
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, content: html, updatedAt: Date.now() } : n,
        ),
      );
    },
  });

  const pushHistory = useCallback((id: string) => {
    const h = historyRef.current;
    if (h.stack[h.index] === id) return;
    h.stack = h.stack.slice(0, h.index + 1);
    h.stack.push(id);
    h.index = h.stack.length - 1;
  }, []);

  // Initial load + global show/hide hotkey.
  useEffect(() => {
    (async () => {
      let initial = await loadNotes();
      if (initial.length === 0) initial = [makeNote()];
      const first = sortNotes(initial)[0].id;
      setNotes(initial);
      setTrash(await loadTrash());
      setCurrentId(first);
      pushHistory(first);
      setLoaded(true);
      registerToggleHotkey("Alt+N");
    })();
  }, [pushHistory]);

  // Load the active note into the editor. A trashed note (deletedViewId) is
  // shown read-only; a live note (currentId) is editable.
  useEffect(() => {
    if (!editor) return;

    if (deletedViewId) {
      const note = trash.find((n) => n.id === deletedViewId);
      if (!note) return;
      const key = `del:${deletedViewId}`;
      if (loadedIdRef.current === key) return;
      settingRef.current = true;
      editor.commands.setContent(note.content || "");
      settingRef.current = false;
      editor.setEditable(false, false);
      loadedIdRef.current = key;
      setCharCount(editor.storage.characterCount.characters());
      return;
    }

    if (!editor.isEditable) editor.setEditable(true, false);
    if (!currentId) return;
    const key = `note:${currentId}`;
    if (loadedIdRef.current === key) return;
    const note = notes.find((n) => n.id === currentId);
    if (!note) return;
    settingRef.current = true;
    editor.commands.setContent(note.content || "");
    settingRef.current = false;
    loadedIdRef.current = key;
    setCharCount(editor.storage.characterCount.characters());
  }, [editor, deletedViewId, currentId, notes, trash]);

  // Keep a valid selection when notes change (e.g. after delete).
  useEffect(() => {
    if (!loaded || notes.length === 0) return;
    if (!currentId || !notes.some((n) => n.id === currentId)) {
      loadedIdRef.current = null;
      setCurrentId(sortNotes(notes)[0].id);
    }
  }, [notes, currentId, loaded]);

  // Debounced persistence.
  useEffect(() => {
    if (!loaded) return;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => saveNotes(notes), 400);
    return () => window.clearTimeout(saveTimer.current);
  }, [notes, loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.clearTimeout(trashTimer.current);
    trashTimer.current = window.setTimeout(() => saveTrash(trash), 400);
    return () => window.clearTimeout(trashTimer.current);
  }, [trash, loaded]);

  // Open notes from reganotes://note/<id> deep links.
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    onOpenUrl((urls) => {
      for (const url of urls) {
        const m = /^reganotes:\/\/note\/(.+)$/.exec(url);
        if (!m) continue;
        const id = m[1];
        if (notesRef.current.some((n) => n.id === id)) {
          loadedIdRef.current = null;
          setDeletedViewId(null);
          setCurrentId(id);
        }
        const win = getCurrentWindow();
        win.show();
        win.setFocus();
      }
    })
      .then((u) => {
        unlisten = u;
      })
      .catch(() => {});
    return () => unlisten?.();
  }, []);

  // Apply webview zoom (falls back to CSS zoom outside Tauri).
  useEffect(() => {
    getCurrentWebview()
      .setZoom(zoom)
      .catch(() => {
        (document.documentElement.style as unknown as { zoom: string }).zoom =
          String(zoom);
      });
  }, [zoom]);

  // Reveal the window chrome (action bar, format button, traffic lights) only
  // while the window is focused — the Raycast Notes behaviour.
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    getCurrentWindow()
      .onFocusChanged(({ payload: focused }) => {
        setWindowFocused(focused);
        invoke("set_traffic_lights", { visible: focused }).catch(() => {});
      })
      .then((u) => {
        unlisten = u;
      })
      .catch(() => {});
    return () => unlisten?.();
  }, []);

  const focusEditor = useCallback(() => {
    setTimeout(() => editor?.commands.focus("end"), 0);
  }, [editor]);

  // Return focus to the editor when a menu closes, at the last known cursor position.
  useEffect(() => {
    if (menu === null) setTimeout(() => editor?.commands.focus(), 0);
  }, [menu, editor]);

  const handleNew = useCallback(() => {
    setDeletedViewId(null);
    // If the current note is already blank, just focus it.
    if (!deletedViewId && editor && editor.isEmpty) {
      focusEditor();
      return;
    }
    // If any existing note is blank, navigate to it instead of creating a new one.
    const blankId = notes.findIndex(
      (n) => !n.content || n.content.trim() === "",
    );
    if (blankId === -1) {
      const n = makeNote();
      setNotes((prev) => [n, ...prev]);
      setCurrentId(n.id);
      pushHistory(n.id);
    } else {
      const id = notes[blankId].id;
      loadedIdRef.current = null;
      setCurrentId(id);
      pushHistory(id);
    }
    setMenu(null);
    // Defer focus: the editor needs one tick to swap content before focusing.
    window.clearTimeout(handleNewTimer.current);
    handleNewTimer.current = window.setTimeout(
      () => editor?.commands.focus("end"),
      50,
    );
  }, [editor, notes, focusEditor, pushHistory, deletedViewId]);

  const handleSelect = useCallback(
    (id: string) => {
      setDeletedViewId(null);
      setCurrentId(id);
      pushHistory(id);
      setMenu(null);
      focusEditor();
    },
    [focusEditor, pushHistory],
  );

  const handleDuplicate = useCallback(() => {
    const cur = notes.find((n) => n.id === currentIdRef.current);
    if (!cur) return;
    const n = { ...makeNote(), content: cur.content };
    setNotes((prev) => [n, ...prev]);
    setDeletedViewId(null);
    setCurrentId(n.id);
    pushHistory(n.id);
    focusEditor();
  }, [notes, focusEditor, pushHistory]);

  const handleTogglePin = useCallback((id?: string) => {
    const target = id ?? currentIdRef.current;
    if (!target) return;
    setNotes((prev) =>
      prev.map((n) => (n.id === target ? { ...n, pinned: !n.pinned } : n)),
    );
  }, []);

  const handleDelete = useCallback(
    (id?: string) => {
      const target = id ?? currentIdRef.current;
      if (!target) return;
      const note = notes.find((n) => n.id === target);
      if (note)
        setTrash((prev) =>
          [{ ...note, deletedAt: Date.now() }, ...prev].slice(0, 100),
        );
      setNotes((prev) => {
        const next = prev.filter((n) => n.id !== target);
        return next.length === 0 ? [makeNote()] : next;
      });
    },
    [notes],
  );

  const handleRestore = useCallback(
    (id: string, open = false) => {
      const note = trash.find((n) => n.id === id);
      if (!note) return;
      const { deletedAt: _deletedAt, ...rest } = note;
      void _deletedAt;
      setTrash((prev) => prev.filter((n) => n.id !== id));
      setNotes((prev) => [{ ...rest, updatedAt: Date.now() }, ...prev]);
      setRestoreDialogOpen(false);
      setDeletedViewId((v) => (v === id ? null : v));
      setCurrentId(id);
      loadedIdRef.current = null;
      pushHistory(id);
      // Restoring from the banner/dialog also jumps to the now-live note.
      if (open) {
        setMenu(null);
        focusEditor();
      }
    },
    [trash, pushHistory, focusEditor],
  );

  const handlePurge = useCallback((id: string) => {
    setTrash((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const goBack = useCallback(() => {
    const h = historyRef.current;
    if (h.index <= 0) return;
    h.index -= 1;
    loadedIdRef.current = null;
    setDeletedViewId(null);
    setCurrentId(h.stack[h.index]);
  }, []);

  const goForward = useCallback(() => {
    const h = historyRef.current;
    if (h.index >= h.stack.length - 1) return;
    h.index += 1;
    loadedIdRef.current = null;
    setDeletedViewId(null);
    setCurrentId(h.stack[h.index]);
  }, []);

  const openBrowse = useCallback((mode: BrowseMode = "notes") => {
    setMenu(mode === "trash" ? "browse-trash" : "browse-notes");
  }, []);

  // Preview a deleted note read-only (from the Recently Deleted list).
  const viewDeleted = useCallback((id: string) => {
    loadedIdRef.current = null;
    setDeletedViewId(id);
    setMenu(null);
  }, []);

  const restoreViewed = useCallback(() => {
    if (deletedViewId) handleRestore(deletedViewId, true);
  }, [deletedViewId, handleRestore]);

  const copyAs = useCallback(
    (fmt: NoteFormat) => {
      if (!editor) return;
      const html = editor.getHTML();
      const text = editor.getText({ blockSeparator: "\n" });
      copyToClipboard(
        fmt === "html" ? html : fmt === "md" ? toMarkdown(html) : text,
      );
    },
    [editor],
  );

  const copyDeeplink = useCallback(() => {
    if (currentIdRef.current)
      copyToClipboard(deeplinkFor(currentIdRef.current));
  }, []);

  const exportAs = useCallback(
    (fmt: NoteFormat) => {
      if (!editor) return;
      const cur = notes.find((n) => n.id === currentIdRef.current);
      const html = editor.getHTML();
      const text = editor.getText({ blockSeparator: "\n" });
      exportNote(titleOf(cur?.content ?? ""), fmt, {
        html,
        md: toMarkdown(html),
        txt: text,
      });
    },
    [editor, notes],
  );

  const zoomIn = useCallback(
    () => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2))),
    [],
  );
  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2))),
    [],
  );
  const zoomReset = useCallback(() => setZoom(1), []);

  const closeOverlays = useCallback(() => {
    setMenu(null);
    setFinding(false);
    setRestoreDialogOpen(false);
  }, []);

  // Keyboard shortcuts (TanStack Hotkeys). ignoreInputs:false so they fire inside the editor too.
  useHotkeys(
    [
      {
        callback: () => setMenu((m) => (m === "actions" ? null : "actions")),
        hotkey: "Mod+K",
      },
      { callback: handleNew, hotkey: "Mod+N" },
      { callback: handleDuplicate, hotkey: "Mod+D" },
      { callback: () => handleTogglePin(), hotkey: "Mod+Shift+P" },
      {
        callback: () =>
          setMenu((m) => (m === "browse-notes" ? null : "browse-notes")),
        hotkey: "Mod+P",
      },
      { callback: () => setFinding((f) => !f), hotkey: "Mod+F" },
      { callback: () => copyAs("md"), hotkey: "Mod+Shift+C" },
      { callback: copyDeeplink, hotkey: "Mod+Shift+D" },
      { callback: copyDeeplink, hotkey: "Mod+Shift+L" },
      { callback: () => exportAs("md"), hotkey: "Mod+Shift+E" },
      { callback: () => moveBlock(editor, -1), hotkey: "Control+Meta+ArrowUp" },
      {
        callback: () => moveBlock(editor, 1),
        hotkey: "Control+Meta+ArrowDown",
      },
      {
        callback: () => setFormatBarOpen((f) => !f),
        hotkey: { key: ",", mod: true, shift: true },
      },
      { callback: () => setFormatBarOpen((f) => !f), hotkey: "Mod+Alt+," },
      {
        callback: () => setAutoSize((a) => !a),
        hotkey: { key: "/", mod: true, shift: true },
      },
      { callback: zoomReset, hotkey: "Mod+0" },
      { callback: zoomIn, hotkey: "Mod+=" },
      { callback: zoomOut, hotkey: "Mod+-" },
      { callback: goBack, hotkey: "Mod+[" },
      { callback: goForward, hotkey: "Mod+]" },
      { callback: () => {}, hotkey: "Mod+," },
      { callback: () => handleDelete(), hotkey: "Control+X" },
      { callback: closeOverlays, hotkey: "Escape" },
    ],
    { ignoreInputs: false, preventDefault: true },
  );

  const current = notes.find((n) => n.id === currentId) ?? null;
  const deletedNote = deletedViewId
    ? (trash.find((n) => n.id === deletedViewId) ?? null)
    : null;
  const title = deletedNote
    ? titleOf(deletedNote.content)
    : current
      ? titleOf(current.content)
      : "New Note";

  const actionGroups: ActionGroup[] = [
    {
      items: [
        {
          icon: <IconPlus size={ICON} />,
          id: "new",
          label: "New Note",
          run: handleNew,
          shortcut: "⌘N",
        },
        {
          icon: <IconCopy size={ICON} />,
          id: "duplicate",
          label: "Duplicate Note",
          run: handleDuplicate,
          shortcut: "⌘D",
        },
        {
          icon: current?.pinned ? (
            <IconPinnedOff size={ICON} />
          ) : (
            <IconPin size={ICON} />
          ),
          id: "pin",
          label: current?.pinned ? "Unpin Note" : "Pin Note",
          run: () => handleTogglePin(),
          shortcut: "⇧⌘P",
        },
      ],
    },
    {
      items: [
        {
          icon: <IconStack2 size={ICON} />,
          id: "browse",
          label: "Browse Notes",
          run: () => openBrowse("notes"),
          shortcut: "⌘P",
        },
        {
          icon: <IconArrowLeft size={ICON} />,
          id: "back",
          label: "Go Back",
          run: goBack,
          shortcut: "⌘[",
        },
        {
          icon: <IconArrowRight size={ICON} />,
          id: "forward",
          label: "Go Forward",
          run: goForward,
          shortcut: "⌘]",
        },
        {
          icon: <IconSearch size={ICON} />,
          id: "find",
          label: "Find in Note",
          run: () => setFinding(true),
          shortcut: "⌘F",
        },
      ],
      label: "Navigate",
    },
    {
      items: [
        {
          children: [
            {
              icon: <IconMarkdown size={ICON} />,
              id: "copy-md",
              label: "Markdown",
              run: () => copyAs("md"),
              shortcut: "⇧⌘C",
            },
            {
              icon: <IconFileText size={ICON} />,
              id: "copy-txt",
              label: "Plain Text",
              run: () => copyAs("txt"),
            },
            {
              icon: <IconCode size={ICON} />,
              id: "copy-html",
              label: "HTML",
              run: () => copyAs("html"),
            },
          ],
          icon: <IconClipboardText size={ICON} />,
          id: "copy-as",
          label: "Copy Note As…",
        },
        {
          icon: <IconLink size={ICON} />,
          id: "copy-deeplink",
          label: "Copy Deeplink",
          run: copyDeeplink,
          shortcut: "⇧⌘D",
        },
        {
          icon: <IconExternalLink size={ICON} />,
          id: "quicklink",
          label: "Create Quicklink",
          run: copyDeeplink,
          shortcut: "⇧⌘L",
        },
        {
          children: [
            {
              icon: <IconMarkdown size={ICON} />,
              id: "export-md",
              label: "Markdown",
              run: () => exportAs("md"),
              shortcut: "⇧⌘E",
            },
            {
              icon: <IconFileText size={ICON} />,
              id: "export-txt",
              label: "Plain Text",
              run: () => exportAs("txt"),
            },
            {
              icon: <IconCode size={ICON} />,
              id: "export-html",
              label: "HTML",
              run: () => exportAs("html"),
            },
          ],
          icon: <IconFileExport size={ICON} />,
          id: "export",
          label: "Export…",
        },
      ],
      label: "Share",
    },
    {
      items: [
        {
          icon: <IconArrowUp size={ICON} />,
          id: "move-up",
          label: "Move List Item Up",
          run: () => moveBlock(editor, -1),
          shortcut: "⌃⌘↑",
        },
        {
          icon: <IconArrowDown size={ICON} />,
          id: "move-down",
          label: "Move List Item Down",
          run: () => moveBlock(editor, 1),
          shortcut: "⌃⌘↓",
        },
        {
          icon: <IconTypography size={ICON} />,
          id: "format",
          label: "Format…",
          run: () => setFormatBarOpen(true),
          shortcut: "⇧⌘,",
        },
        {
          icon: <IconArrowAutofitHeight size={ICON} />,
          id: "autosize",
          label: autoSize
            ? "Disable Window Auto-Sizing"
            : "Enable Window Auto-Sizing",
          run: () => setAutoSize((a) => !a),
          shortcut: "⇧⌘/",
        },
        {
          icon: <IconLetterT size={ICON} />,
          id: "toggle-format",
          label: "Toggle Format Bar",
          run: () => setFormatBarOpen((f) => !f),
          shortcut: "⌥⌘,",
        },
      ],
      label: "Arrange",
    },
    {
      items: [
        {
          icon: <IconZoomReset size={ICON} />,
          id: "actual-size",
          label: "Actual Size",
          run: zoomReset,
          shortcut: "⌘0",
        },
        {
          icon: <IconZoomIn size={ICON} />,
          id: "zoom-in",
          label: "Zoom In",
          run: zoomIn,
          shortcut: "⌘+",
        },
        {
          icon: <IconZoomOut size={ICON} />,
          id: "zoom-out",
          label: "Zoom Out",
          run: zoomOut,
          shortcut: "⌘-",
        },
      ],
      label: "View",
    },
    {
      items: [
        {
          icon: <IconSettings size={ICON} />,
          id: "settings",
          label: "Open Settings",
          run: () => {},
          shortcut: "⌘,",
        },
        {
          icon: <IconTrash size={ICON} />,
          id: "trash",
          label: "Show Recently Deleted Notes",
          run: () => openBrowse("trash"),
        },
        {
          danger: true,
          icon: <IconTrashX size={ICON} />,
          id: "delete",
          label: "Delete Note",
          run: () => handleDelete(),
          shortcut: "⌃X",
        },
      ],
    },
  ];

  return (
    <div
      className={`app ${autoSize ? "" : "fixed-size"} ${
        windowFocused ? "" : "chrome-hidden"
      }`}
    >
      <TitleBar
        title={title}
        actionsSlot={
          <ActionsCombobox
            groups={actionGroups}
            open={menu === "actions"}
            onOpenChange={(o) => setMenu(o ? "actions" : null)}
          />
        }
        browseSlot={
          <BrowseNotes
            notes={notes}
            trash={trash}
            currentId={currentId}
            mode={menu === "browse-trash" ? "trash" : "notes"}
            onModeChange={(m) =>
              setMenu(m === "trash" ? "browse-trash" : "browse-notes")
            }
            open={menu === "browse-notes" || menu === "browse-trash"}
            onOpenChange={(o) => setMenu(o ? "browse-notes" : null)}
            onSelect={handleSelect}
            onViewDeleted={viewDeleted}
            onTogglePin={(id) => handleTogglePin(id)}
            onDelete={(id) => handleDelete(id)}
            onRestore={handleRestore}
            onPurge={handlePurge}
          />
        }
        onNew={handleNew}
      />

      {deletedNote && <ArchivedBanner onRestore={restoreViewed} />}

      <main
        className={`editor-wrap ${deletedNote ? "readonly" : ""}`}
        onClick={(e) => {
          // A trashed note is read-only — clicking to edit prompts to restore.
          if (deletedNote) {
            setRestoreDialogOpen(true);
            return;
          }
          if (e.target === e.currentTarget) editor?.commands.focus("end");
        }}
      >
        <EditorContent editor={editor} className="editor" />
      </main>

      {finding && <FindBar onClose={() => setFinding(false)} />}
      {formatBarOpen && (
        <FormatBar editor={editor} onClose={() => setFormatBarOpen(false)} />
      )}

      <Footer
        charCount={charCount}
        formatBarOpen={formatBarOpen}
        onToggleFormatBar={() => setFormatBarOpen((f) => !f)}
      />

      {restoreDialogOpen && deletedNote && (
        <RestoreDialog
          onCancel={() => setRestoreDialogOpen(false)}
          onRestore={restoreViewed}
        />
      )}
    </div>
  );
}
