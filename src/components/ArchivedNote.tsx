import { IconTrash, IconLetterT } from "@tabler/icons-react";

/** Persistent banner shown above a read-only note from the trash. */
export function ArchivedBanner({ onRestore }: { onRestore: () => void }) {
  return (
    <div className="archived-banner">
      <IconTrash size={15} stroke={1.75} className="archived-banner-icon" />
      <span className="archived-banner-text">
        You are viewing an archived note
      </span>
      <button className="archived-restore-btn" onClick={onRestore}>
        Restore
      </button>
    </div>
  );
}

/** Modal prompting the user to restore a deleted note before editing it. */
export function RestoreDialog({
  onCancel,
  onRestore,
}: {
  onCancel: () => void;
  onRestore: () => void;
}) {
  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div
        className="dialog-card"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
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
        <div className="dialog-icon">
          <IconLetterT size={28} stroke={2.5} />
        </div>
        <div className="dialog-title">Restore this note to edit it</div>
        <div className="dialog-desc">
          This note is in Recently Deleted. Restore it to make changes.
        </div>
        <div className="dialog-actions">
          <button className="dialog-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="dialog-btn primary" onClick={onRestore} autoFocus>
            Restore
          </button>
        </div>
      </div>
    </div>
  );
}
