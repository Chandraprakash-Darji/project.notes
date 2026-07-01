import type { ReactNode } from "react";

interface Props {
  className?: string;
  children: ReactNode;
}

/**
 * iOS 27‑style glass menu container.
 * Dark‑adapted: multi‑layer frosting, ultra‑rounded (34px),
 * subtle ring + drop shadow, inner glow.
 */
export function IosMenu({ className, children }: Props) {
  return (
    <div
      className={className ?? ""}
      style={{
        WebkitBackdropFilter: "blur(48px) saturate(180%)",
        backdropFilter: "blur(48px) saturate(180%)",
        background: "rgba(36, 36, 38, 0.88)",
        borderRadius: 34,
        boxShadow: [
          "0px 0px 0px 0.5px rgba(255,255,255,0.12)",
          "0px 8px 48px 0px rgba(0,0,0,0.55)",
          "inset 0px 40px 30px -40px rgba(255,255,255,0.05)",
          "inset 0px -40px 30px -40px rgba(0,0,0,0.18)",
        ].join(", "),
        overflow: "hidden",
        position: "relative",
      }}
    >
      {children}
    </div>
  );
}

/** A 1px separator matching the iOS 27 spec. */
export function IosSeparator() {
  return (
    <div className="px-2 py-2.5">
      <div style={{ background: "rgba(255,255,255,0.08)", height: 1 }} />
    </div>
  );
}
