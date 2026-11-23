"use client";

import type { CSSProperties } from "react";
import { ActionButton } from "@/components/ui/action-button";

export function SheetSubmit({
  children,
  disabled,
  pendingLabel = "Guardando…",
  className,
  style,
  hold = true,
}: {
  children: string;
  disabled?: boolean;
  pendingLabel?: string;
  className?: string;
  style?: CSSProperties;
  hold?: boolean;
}) {
  return (
    <ActionButton
      hold={hold}
      pendingLabel={pendingLabel}
      disabled={disabled}
      className={className}
      style={style}
    >
      {children}
    </ActionButton>
  );
}
