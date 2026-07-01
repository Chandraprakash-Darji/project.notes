/** Derive a note title from its HTML content: the text of the first block, à la Raycast. */
export function titleOf(html: string): string {
  if (!html) return "New Note";
  const doc = new DOMParser().parseFromString(html, "text/html");
  const first = doc.body.querySelector("h1, h2, h3, p, li, blockquote, pre");
  const text = (first?.textContent ?? doc.body.textContent ?? "").trim();
  return text || "New Note";
}

/** Plain-text of a note, used for search. */
export function textOf(html: string): string {
  if (!html) return "";
  return (
    new DOMParser().parseFromString(html, "text/html").body.textContent ?? ""
  );
}
