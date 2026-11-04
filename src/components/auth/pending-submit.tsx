"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

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
  const status = useFormStatus();
  const pending = forcePending || status.pending;
  return (
    <button
      type="submit"
      className={`${className}${pending ? " pointer-events-none opacity-70" : ""}`}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {pending ? pendingLabel : idle}
    </button>
  );
}
