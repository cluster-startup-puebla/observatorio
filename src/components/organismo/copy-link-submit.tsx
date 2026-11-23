"use client";

import type { CSSProperties } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function CopyLinkSubmit({
  label = "Generar enlace",
  pendingLabel = "Generando…",
  className,
  style,
}: {
  label?: string;
  pendingLabel?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      className={className}
      style={style}
    >
      {pending ? <Loader2 className="mr-1 inline size-4 animate-spin" aria-hidden /> : null}
      {pending ? pendingLabel : label}
    </button>
  );
}
