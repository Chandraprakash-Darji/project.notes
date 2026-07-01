import { load, type Store } from "@tauri-apps/plugin-store";

export interface Note {
  id: string;
  content: string; // TipTap HTML
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number; // set while in the trash
}

const FILE = "notes.json";
const KEY = "notes";
const TRASH_KEY = "trash";
const LS_KEY = "rega-notes";
const LS_TRASH_KEY = "rega-notes-trash";

let storePromise: Promise<Store> | null = null;
function getStore(): Promise<Store> {
  if (!storePromise)
    storePromise = load(FILE, { autoSave: false, defaults: {} });
  return storePromise;
}

/** Load notes from the Tauri store, falling back to localStorage (plain browser dev). */
export async function loadNotes(): Promise<Note[]> {
  try {
    const store = await getStore();
    return (await store.get<Note[]>(KEY)) ?? [];
  } catch {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Note[]) : [];
  }
}

/** Persist notes to the Tauri store, falling back to localStorage. */
export async function saveNotes(notes: Note[]): Promise<void> {
  try {
    const store = await getStore();
    await store.set(KEY, notes);
    await store.save();
  } catch {
    localStorage.setItem(LS_KEY, JSON.stringify(notes));
  }
}

/** Load trashed notes. */
export async function loadTrash(): Promise<Note[]> {
  try {
    const store = await getStore();
    return (await store.get<Note[]>(TRASH_KEY)) ?? [];
  } catch {
    const raw = localStorage.getItem(LS_TRASH_KEY);
    return raw ? (JSON.parse(raw) as Note[]) : [];
  }
}

/** Persist trashed notes. */
export async function saveTrash(trash: Note[]): Promise<void> {
  try {
    const store = await getStore();
    await store.set(TRASH_KEY, trash);
    await store.save();
  } catch {
    localStorage.setItem(LS_TRASH_KEY, JSON.stringify(trash));
  }
}

export function newNote(): Note {
  const now = Date.now();
  return {
    content: "",
    createdAt: now,
    id: crypto.randomUUID(),
    pinned: false,
    updatedAt: now,
  };
}

/** Pinned first, then most recently updated. */
export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });
}
