import { IconCommand, IconChevronRight } from "@tabler/icons-react";
import { Command } from "cmdk";
import { useState } from "react";
import type { ReactNode } from "react";

import { GLASS } from "./BrowseNotes";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

// ── types ──────────────────────────────────────────────

export interface ActionItem {
  id: string;
  label: string;
  icon: ReactNode;
  shortcut?: string;
  danger?: boolean;
  run?: () => void;
  children?: ActionItem[];
}

export interface ActionGroup {
  label?: string;
  items: ActionItem[];
}

// ── props ──────────────────────────────────────────────

interface Props {
  groups: ActionGroup[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── component ──────────────────────────────────────────

export function ActionsCombobox({ groups, open, onOpenChange }: Props) {
  const [pages, setPages] = useState<ActionItem[][]>([]);
  const [search, setSearch] = useState("");
  const currentPage = pages[pages.length - 1];

  const close = () => {
    onOpenChange(false);
    setPages([]);
    setSearch("");
  };

  const handleSelect = (a: ActionItem) => {
    if (a.children) {
      setPages((p) => [...p, a.children!]);
      setSearch("");
      return;
    }
    close();
    a.run?.();
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {/* Trigger button in the title bar pill */}
      <PopoverTrigger
        className="tb-btn"
        title="Actions (⌘K)"
        onClick={() => onOpenChange(!open)}
      >
        <IconCommand size={16} stroke={1.75} />
      </PopoverTrigger>
      <PopoverContent sideOffset={10} className="cmdk-glass mr-2" style={GLASS}>
        <Command
          shouldFilter
          onKeyDown={(e) => {
            if (e.key === "Escape" || (e.key === "Backspace" && !search)) {
              if (currentPage) {
                e.preventDefault();
                setPages((p) => p.slice(0, -1));
              } else {
                close();
              }
            }
          }}
        >
          {/* iOS glass menu */}
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder={currentPage ? "Search formats…" : "Search actions…"}
            autoFocus
          />

          <Command.List>
            <Command.Empty>No actions found.</Command.Empty>

            {currentPage
              ? currentPage.map((a) => (
                  <Command.Item
                    key={a.id}
                    value={a.label}
                    onSelect={() => handleSelect(a)}
                    data-danger={a.danger ? "" : undefined}
                  >
                    <IosMenuItem action={a} />
                  </Command.Item>
                ))
              : groups.map((g, gi) => (
                  <Command.Group key={gi} heading={g.label}>
                    {g.items.map((a) => (
                      <Command.Item
                        key={a.id}
                        value={a.label}
                        keywords={[a.shortcut ?? ""].filter(Boolean)}
                        onSelect={() => handleSelect(a)}
                        data-danger={a.danger ? "" : undefined}
                      >
                        <IosMenuItem action={a} />
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ── shared item layout ──────────────────────────────────

function IosMenuItem({ action: a }: { action: ActionItem }) {
  const iconColor = a.danger ? "#ff453a" : undefined;
  const labelColor = a.danger ? "#ff453a" : undefined;

  return (
    <>
      <span className="cmdk-item-icon" style={{ color: iconColor }}>
        {a.icon}
      </span>
      <span className="cmdk-item-label" style={{ color: labelColor }}>
        {a.label}
      </span>
      {a.children ? (
        <IconChevronRight
          size={15}
          stroke={2.5}
          className="cmdk-item-trailing"
        />
      ) : a.shortcut ? (
        <ShortcutBadge shortcut={a.shortcut} />
      ) : null}
    </>
  );
}

function ShortcutBadge({ shortcut }: { shortcut: string }) {
  const parts = shortcut.split(/(?=[⇧⌃⌥⌘])/);
  return (
    <span className="cmdk-item-shortcut">
      {parts.map((p, i) => (
        <span key={i}>{p}</span>
      ))}
    </span>
  );
}
