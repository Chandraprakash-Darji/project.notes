import { describe, expect, it } from "vitest";

import { textOf, titleOf } from "../title";

describe("titleOf", () => {
  it("returns 'New Note' for empty string", () => {
    expect(titleOf("")).toBe("New Note");
  });

  it("extracts text from the first paragraph", () => {
    expect(titleOf("<p>Hello world</p><p>second</p>")).toBe("Hello world");
  });

  it("prefers a heading over a later paragraph", () => {
    expect(titleOf("<h1>My Title</h1><p>body</p>")).toBe("My Title");
  });

  it("returns 'New Note' for whitespace-only content", () => {
    expect(titleOf("<p>   </p>")).toBe("New Note");
  });

  it("strips inline HTML tags from the title", () => {
    expect(titleOf("<p><strong>Bold</strong> title</p>")).toBe("Bold title");
  });
});

describe("textOf", () => {
  it("strips HTML tags and returns plain text", () => {
    expect(textOf("<p>Hello <strong>world</strong></p>")).toBe("Hello world");
  });

  it("returns empty string for empty input", () => {
    expect(textOf("")).toBe("");
  });

  it("collapses nested tags to text", () => {
    expect(textOf("<ul><li>item one</li><li>item two</li></ul>")).toContain(
      "item one",
    );
  });
});
