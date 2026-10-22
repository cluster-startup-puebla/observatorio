"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

export function SheetSubmit({
  children,
  disabled,
  pendingLabel = "Guardando…",
}: {
  children: string;
  disabled?: boolean;
  pendingLabel?: string;
}) {
  const [pending, setPending] = useState(false);
  const locked = Boolean(disabled || pending);
  return (
    <button
      className={`btn btn-primary${locked ? " pointer-events-none opacity-70" : ""}`}
      type="submit"
      aria-busy={pending}
      aria-disabled={locked}
      onClick={(event) => {
        if (locked) {
          event.preventDefault();
          return;
        }
        const form = event.currentTarget.form;
        if (form && !form.checkValidity()) return;
        setPending(true);
      }}
    >
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {pending ? pendingLabel : children}
    </button>
  );
}
