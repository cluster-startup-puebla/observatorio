"use client";

import type { CSSProperties } from "react";
import { ActionButton } from "@/components/ui/action-button";

export function SheetSubmit({
  children,
  disabled,
  pendingLabel = "Guardando…",
  className,
  style,
}: {
  children: string;
  disabled?: boolean;
  pendingLabel?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <ActionButton hold pendingLabel={pendingLabel} disabled={disabled} className={className} style={style}>
      {children}
    </ActionButton>
  );
}
