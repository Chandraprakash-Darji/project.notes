import {
  IconChevronUp,
  IconChevronDown,
  IconX,
  IconSearch,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  onClose: () => void;
}

// window.find is non-standard but supported by the WebKit webview Tauri uses on macOS.
declare global {
  interface Window {
    find?: (
      query: string,
      caseSensitive?: boolean,
      backwards?: boolean,
      wrap?: boolean,
      wholeWord?: boolean,
      searchInFrames?: boolean,
      showDialog?: boolean,
    ) => boolean;
  }
}

export function FindBar({ onClose }: Props) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const find = (backwards: boolean) => {
    if (!q) return;
    window.find?.(q, false, backwards, true, false, false, false);
  };

  return (
    <div className="findbar">
      <IconSearch size={15} stroke={1.75} className="findbar-icon" />
      <input
        ref={inputRef}
        className="findbar-input"
        placeholder="Find in note…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            find(e.shiftKey);
          } else if (e.key === "Escape") {
            onClose();
          }
        }}
      />
      <button className="fb-btn" title="Previous" onClick={() => find(true)}>
        <IconChevronUp size={16} stroke={1.9} />
      </button>
      <button className="fb-btn" title="Next" onClick={() => find(false)}>
        <IconChevronDown size={16} stroke={1.9} />
      </button>
      <button className="fb-btn fb-close" title="Close" onClick={onClose}>
        <IconX size={16} stroke={1.9} />
      </button>
    </div>
  );
}
