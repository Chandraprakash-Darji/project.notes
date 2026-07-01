import { IconLetterT } from "@tabler/icons-react";

interface Props {
  charCount: number;
  formatBarOpen: boolean;
  onToggleFormatBar: () => void;
}

export function Footer({ charCount, formatBarOpen, onToggleFormatBar }: Props) {
  return (
    <footer className="footer">
      <span className="footer-count">{charCount} characters</span>
      <button
        className={`footer-format ${formatBarOpen ? "active" : ""}`}
        title="Toggle Format Bar (⌥⌘,)"
        onClick={onToggleFormatBar}
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
        <IconLetterT size={16} stroke={2} />
      </button>
    </footer>
  );
}
