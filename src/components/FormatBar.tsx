import {
  IconH1,
  IconH2,
  IconH3,
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconCode,
  IconLink,
  IconList,
  IconListNumbers,
  IconListCheck,
  IconBlockquote,
  IconSourceCode,
  IconLineDashed,
  IconX,
} from "@tabler/icons-react";
import type { Editor } from "@tiptap/react";
import { useEffect, useReducer } from "react";
import type { ReactNode } from "react";

interface Props {
  editor: Editor | null;
  onClose: () => void;
}

export function FormatBar({ editor, onClose }: Props) {
  // Re-render whenever the selection/doc changes so active states stay in sync.
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    if (!editor) return;
    editor.on("transaction", force);
    return () => {
      editor.off("transaction", force);
    };
  }, [editor]);

  if (!editor) return null;

  const btn = (
    icon: ReactNode,
    isActive: boolean,
    run: () => void,
    title: string,
  ) => (
    <button
      className={`fb-btn ${isActive ? "active" : ""}`}
      title={title}
      onMouseDown={(e) => e.preventDefault()} // keep the editor selection
      onClick={run}
    >
      {icon}
    </button>
  );

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const sz = 16;
  const st = 1.9;
  return (
    <div
      className="formatbar"
      style={{
        WebkitBackdropFilter: "blur(18px) saturate(180%)",
        backdropFilter: "blur(18px) saturate(180%)",
        background: "rgba(36, 36, 38, 0.78)",
        borderRadius: 34,
        boxShadow: [
          "0px 0px 0px 0.5px rgba(255,255,255,0.12)",
          "0px 8px 48px 0px rgba(0,0,0,0.55)",
          "inset 0px 40px 30px -40px rgba(255,255,255,0.05)",
          "inset 0px -40px 30px -40px rgba(0,0,0,0.18)",
        ].join(", "),
      }}
    >
      {btn(
        <IconH1 size={sz} stroke={st} />,
        editor.isActive("heading", { level: 1 }),
        () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        "Heading 1",
      )}
      {btn(
        <IconH2 size={sz} stroke={st} />,
        editor.isActive("heading", { level: 2 }),
        () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        "Heading 2",
      )}
      {btn(
        <IconH3 size={sz} stroke={st} />,
        editor.isActive("heading", { level: 3 }),
        () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        "Heading 3",
      )}
      <span className="fb-sep" />
      {btn(
        <IconBold size={sz} stroke={st} />,
        editor.isActive("bold"),
        () => editor.chain().focus().toggleBold().run(),
        "Bold (⌘B)",
      )}
      {btn(
        <IconItalic size={sz} stroke={st} />,
        editor.isActive("italic"),
        () => editor.chain().focus().toggleItalic().run(),
        "Italic (⌘I)",
      )}
      {btn(
        <IconUnderline size={sz} stroke={st} />,
        editor.isActive("underline"),
        () => editor.chain().focus().toggleUnderline().run(),
        "Underline (⌘U)",
      )}
      {btn(
        <IconStrikethrough size={sz} stroke={st} />,
        editor.isActive("strike"),
        () => editor.chain().focus().toggleStrike().run(),
        "Strikethrough",
      )}
      {btn(
        <IconCode size={sz} stroke={st} />,
        editor.isActive("code"),
        () => editor.chain().focus().toggleCode().run(),
        "Inline code",
      )}
      {btn(
        <IconLink size={sz} stroke={st} />,
        editor.isActive("link"),
        setLink,
        "Link",
      )}
      <span className="fb-sep" />
      {btn(
        <IconList size={sz} stroke={st} />,
        editor.isActive("bulletList"),
        () => editor.chain().focus().toggleBulletList().run(),
        "Bullet list",
      )}
      {btn(
        <IconListNumbers size={sz} stroke={st} />,
        editor.isActive("orderedList"),
        () => editor.chain().focus().toggleOrderedList().run(),
        "Numbered list",
      )}
      {btn(
        <IconListCheck size={sz} stroke={st} />,
        editor.isActive("taskList"),
        () => editor.chain().focus().toggleTaskList().run(),
        "Task list",
      )}
      {btn(
        <IconBlockquote size={sz} stroke={st} />,
        editor.isActive("blockquote"),
        () => editor.chain().focus().toggleBlockquote().run(),
        "Blockquote",
      )}
      {btn(
        <IconSourceCode size={sz} stroke={st} />,
        editor.isActive("codeBlock"),
        () => editor.chain().focus().toggleCodeBlock().run(),
        "Code block",
      )}
      {btn(
        <IconLineDashed size={sz} stroke={st} />,
        false,
        () => editor.chain().focus().setHorizontalRule().run(),
        "Divider",
      )}
      <span className="fb-spring" />
      <button className="fb-btn fb-close" title="Close (⌥⌘,)" onClick={onClose}>
        <IconX size={sz} stroke={st} />
      </button>
    </div>
  );
}
