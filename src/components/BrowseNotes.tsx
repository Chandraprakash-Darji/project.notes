import {
  IconPin,
  IconPinnedOff,
  IconTrash,
  IconRestore,
} from "@tabler/icons-react";
import { Command } from "cmdk";
import { useState } from "react";

import type { Note } from "../lib/notes";
import { sortNotes } from "../lib/notes";
import { titleOf } from "../lib/title";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type Mode = "notes" | "trash";

interface Props {
  notes: Note[];
  trash: Note[];
  currentId: string | null;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: string) => void;
  onViewDeleted: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string, open?: boolean) => void;
  onPurge: (id: string) => void;
}

export const GLASS: React.CSSProperties = {
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
};

/** Human-readable "42 minutes ago" style relative time. */
function relativeTime(ts: number): string {
  const sec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  const ago = (n: number, unit: string) =>
    `${n} ${unit}${n === 1 ? "" : "s"} ago`;
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return ago(min, "minute");
  const hr = Math.floor(min / 60);
  if (hr < 24) return ago(hr, "hour");
  const day = Math.floor(hr / 24);
  if (day < 7) return ago(day, "day");
  if (day < 30) return ago(Math.floor(day / 7), "week");
  if (day < 365) return ago(Math.floor(day / 30), "month");
  return ago(Math.floor(day / 365), "year");
}

/** Count of visible characters in a TipTap HTML string. */
function charCountOf(html: string): number {
  if (!html) return 0;
  const el = document.createElement("div");
  el.innerHTML = html;
  return (el.textContent ?? "").length;
}

export function BrowseNotes({
  notes,
  trash,
  currentId,
  mode,
  onModeChange,
  open,
  onOpenChange,
  onSelect,
  onViewDeleted,
  onTogglePin,
  onDelete,
  onRestore,
  onPurge,
}: Props) {
  const [search, setSearch] = useState("");

  const close = () => {
    onOpenChange(false);
    setSearch("");
  };

  const sorted = sortNotes(notes);
  const pinned = sorted.filter((n) => n.pinned);
  const unpinned = sorted.filter((n) => !n.pinned);
  const trashSorted = [...trash].sort(
    (a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0),
  );

  const renderNote = (n: Note) => {
    const title = titleOf(n.content);
    const count = charCountOf(n.content);
    const isCurrent = mode === "notes" && n.id === currentId;
    return (
      <Command.Item
        key={n.id}
        value={`${title} ${n.id}`}
        keywords={[title]}
        onSelect={() =>
          mode === "notes" ? onSelect(n.id) : onViewDeleted(n.id)
        }
        className={`browse-note-item ${isCurrent ? "current" : ""}`}
      >
        <span className="browse-note-main">
          <span className="browse-note-title">{title}</span>
          <span className="browse-note-sub">
            {mode === "trash" ? (
              <>
                Deleted {relativeTime(n.deletedAt ?? n.updatedAt)} • {count}{" "}
                characters
              </>
            ) : isCurrent ? (
              <>
                <span className="browse-note-dot" />
                Current • {count} characters
              </>
            ) : (
              <>
                Opened {relativeTime(n.updatedAt)} • {count} characters
              </>
            )}
          </span>
        </span>
        <span className="browse-item-actions">
          {mode === "notes" ? (
            <>
              <ActionBtn
                title={n.pinned ? "Unpin" : "Pin"}
                onClick={() => onTogglePin(n.id)}
                icon={
                  n.pinned ? <IconPinnedOff size={15} /> : <IconPin size={15} />
                }
              />
              <ActionBtn
                title="Delete"
                onClick={() => onDelete(n.id)}
                icon={<IconTrash size={15} />}
              />
            </>
          ) : (
            <>
              <ActionBtn
                title="Restore"
                onClick={() => onRestore(n.id)}
                icon={<IconRestore size={15} />}
              />
              <ActionBtn
                title="Delete forever"
                onClick={() => onPurge(n.id)}
                icon={<IconTrash size={15} />}
              />
            </>
          )}
        </span>
      </Command.Item>
    );
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        className="tb-btn"
        title="Browse Notes (⌘P)"
        onClick={() => onOpenChange(!open)}
      >
        <IconBrowse size={16} stroke={1.75} />
      </PopoverTrigger>
      <PopoverContent
        sideOffset={10}
        className="cmdk-glass mr-2 w-[340px]"
        style={GLASS}
      >
        <Command
          shouldFilter
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === "Escape") {
              if (search) {
                e.preventDefault();
                setSearch("");
              } else {
                close();
              }
            }
          }}
        >
          {/* Tab switcher */}
          <div className="mt-1 mb-2 ml-1 flex items-center gap-1">
            <button
              className={`browse-tab ${mode === "notes" ? "active" : ""}`}
              onClick={() => {
                onModeChange("notes");
                setSearch("");
              }}
            >
              Notes
            </button>
            <button
              className={`browse-tab ${mode === "trash" ? "active" : ""}`}
              onClick={() => {
                onModeChange("trash");
                setSearch("");
              }}
            >
              Recently Deleted
            </button>
            <span className="flex-1" />
          </div>

          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder={
              mode === "notes" ? "Search for notes…" : "Search deleted…"
            }
            autoFocus
          />

          <Command.List>
            <Command.Empty>
              {mode === "notes" ? "No notes" : "Trash is empty"}
            </Command.Empty>

            {mode === "notes" ? (
              <>
                {pinned.length > 0 && (
                  <Command.Group heading="Pinned">
                    {pinned.map(renderNote)}
                  </Command.Group>
                )}
                <Command.Group heading="Notes">
                  {unpinned.map(renderNote)}
                </Command.Group>
              </>
            ) : (
              trashSorted.map(renderNote)
            )}
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/** Tiny action button that doesn't bubble to cmdk's item onSelect. */
function ActionBtn({
  title,
  onClick,
  icon,
}: {
  title: string;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      title={title}
      className="browse-action-btn"
      onPointerDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {icon}
    </button>
  );
}

function IconBrowse({ size, stroke }: { size: number; stroke: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
    >
      <rect x="3.5" y="1.5" width="8" height="8" rx="1.5" />
      <rect
        x="1.5"
        y="4.5"
        width="8"
        height="10"
        rx="1.5"
        fill="rgba(36,36,38,0.78)"
      />
    </svg>
  );
}
