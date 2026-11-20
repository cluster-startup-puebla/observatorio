"use client";

import { ActionButton } from "@/components/ui/action-button";

export function PendingSubmit({
  idle,
  pendingLabel,
  forcePending = false,
  className = "btn btn-primary",
}: {
  idle: string;
  pendingLabel: string;
  forcePending?: boolean;
  className?: string;
}) {
  const variant = className.includes("btn-secondary")
    ? "secondary"
    : className.includes("btn-on-dark")
      ? "on-dark"
      : className.includes("btn-primary")
        ? "primary"
        : "plain";
  const extra = className
    .split(/\s+/)
    .filter((token) => token && token !== "btn" && !token.startsWith("btn-"))
    .join(" ");
  return (
    <ActionButton variant={variant} pending={forcePending} pendingLabel={pendingLabel} className={extra || undefined}>
      {idle}
    </ActionButton>
  );
}
