import { describe, expect, it } from "vitest";

import { newNote, sortNotes } from "../notes";

describe("sortNotes", () => {
  it("places pinned notes before unpinned", () => {
    const notes = [
      { content: "", createdAt: 1, id: "1", pinned: false, updatedAt: 1 },
      { content: "", createdAt: 2, id: "2", pinned: true, updatedAt: 2 },
    ];
    expect(sortNotes(notes)[0].id).toBe("2");
  });

  it("sorts unpinned notes by updatedAt descending", () => {
    const notes = [
      { content: "", createdAt: 1, id: "old", pinned: false, updatedAt: 1 },
      { content: "", createdAt: 2, id: "new", pinned: false, updatedAt: 2 },
    ];
    expect(sortNotes(notes)[0].id).toBe("new");
  });

  it("keeps two pinned notes sorted by updatedAt", () => {
    const notes = [
      { content: "", createdAt: 1, id: "p1", pinned: true, updatedAt: 1 },
      { content: "", createdAt: 2, id: "p2", pinned: true, updatedAt: 2 },
    ];
    expect(sortNotes(notes)[0].id).toBe("p2");
  });

  it("does not mutate the input array", () => {
    const notes = [
      { content: "", createdAt: 1, id: "1", pinned: false, updatedAt: 2 },
      { content: "", createdAt: 2, id: "2", pinned: true, updatedAt: 1 },
    ];
    const original = [...notes];
    sortNotes(notes);
    expect(notes).toEqual(original);
  });
});

describe("newNote", () => {
  it("creates a note with required fields", () => {
    const note = newNote();
    expect(note.id).toBeTruthy();
    expect(note.pinned).toBe(false);
    expect(note.content).toBe("");
    expect(note.createdAt).toBe(note.updatedAt);
  });

  it("generates unique ids across calls", () => {
    const a = newNote();
    const b = newNote();
    expect(a.id).not.toBe(b.id);
  });
});
