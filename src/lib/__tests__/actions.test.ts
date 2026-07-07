import { describe, expect, it } from "vitest";

import { deeplinkFor, toMarkdown } from "../actions";

describe("deeplinkFor", () => {
  it("returns the reganotes:// URL for a given id", () => {
    expect(deeplinkFor("abc-123")).toBe("reganotes://note/abc-123");
  });

  it("preserves UUIDs verbatim", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    expect(deeplinkFor(id)).toBe(`reganotes://note/${id}`);
  });
});

describe("toMarkdown", () => {
  it("converts a plain paragraph", () => {
    expect(toMarkdown("<p>Hello</p>")).toBe("Hello\n");
  });

  it("converts bold to **...**", () => {
    expect(toMarkdown("<p><strong>bold</strong></p>")).toBe("**bold**\n");
  });

  it("converts italic to _..._", () => {
    expect(toMarkdown("<p><em>italic</em></p>")).toBe("_italic_\n");
  });

  it("converts an H1 to ATX heading", () => {
    expect(toMarkdown("<h1>Title</h1>")).toBe("# Title\n");
  });

  it("converts strikethrough via <s> tag", () => {
    expect(toMarkdown("<p><s>strike</s></p>")).toBe("~~strike~~\n");
  });

  it("converts strikethrough via <del> tag", () => {
    expect(toMarkdown("<p><del>strike</del></p>")).toBe("~~strike~~\n");
  });

  it("converts an unchecked task list item", () => {
    const html = '<ul><li data-checked="false"><p>todo</p></li></ul>';
    expect(toMarkdown(html)).toContain("- [ ]");
  });

  it("converts a checked task list item", () => {
    const html = '<ul><li data-checked="true"><p>done</p></li></ul>';
    expect(toMarkdown(html)).toContain("- [x]");
  });

  it("converts a fenced code block", () => {
    const html = "<pre><code>const x = 1;</code></pre>";
    expect(toMarkdown(html)).toContain("```");
  });
});
