"use client";

import { Loader2 } from "lucide-react";
import { useState, type ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";

const variants = {
  primary: "btn btn-primary",
  secondary: "btn btn-secondary",
  plain: "btn",
  "on-dark": "btn btn-on-dark",
} as const;

type Variant = keyof typeof variants;

export function ActionButton({
  variant = "primary",
  pendingLabel,
  pending = false,
  hold = false,
  className,
  children,
  disabled,
  type = "submit",
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  pendingLabel?: string;
  pending?: boolean;
  hold?: boolean;
}) {
  const status = useFormStatus();
  const [held, setHeld] = useState(false);
  const busy = pending || held || (type === "submit" && status.pending);
  const locked = Boolean(disabled || busy);
  return (
    <button
      {...props}
      type={type}
      className={[variants[variant], className, locked ? "pointer-events-none opacity-70" : ""].filter(Boolean).join(" ")}
      disabled={locked}
      aria-busy={busy || undefined}
      data-state={busy ? "pending" : locked ? "disabled" : "idle"}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !hold || locked) return;
        const form = event.currentTarget.form;
        if (form && !form.checkValidity()) return;
        // Defer so disabling the button does not cancel the submit.
        queueMicrotask(() => setHeld(true));
      }}
    >
      {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {busy && pendingLabel ? pendingLabel : children}
    </button>
  );
}
