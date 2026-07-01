import { IconPlus } from "@tabler/icons-react";
import type { ReactNode } from "react";

interface Props {
  title: string;
  actionsSlot: ReactNode;
  browseSlot: ReactNode;
  onNew: () => void;
}

export function TitleBar({ title, actionsSlot, browseSlot, onNew }: Props) {
  return (
    <header className="titlebar" data-tauri-drag-region>
      <div className="titlebar-spacer" data-tauri-drag-region />
      <span className="titlebar-title" data-tauri-drag-region>
        {title}
      </span>
      <div
        className="titlebar-actions"
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
        {actionsSlot}
        {browseSlot}
        <button className="tb-btn" title="New Note (⌘N)" onClick={onNew}>
          <IconPlus size={16} stroke={1.75} />
        </button>
      </div>
    </header>
  );
}
