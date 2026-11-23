"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Field, controlClass } from "@/components/landing/molecules/field";
import { Button } from "@/components/ui/button";
import { cancelSessionRsvpAction } from "@/lib/app/cancel-session-rsvp-action";

export function CancelSessionRsvp({ sessionId }: { sessionId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  if (done) return <p className="text-body text-ink">Cancelaste tu lugar.</p>;

  return (
    <details
      className="rounded-2xl border border-line px-4 py-3"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="cursor-pointer text-sm text-ink-secondary">No voy a asistir</summary>
      <div className="grid gap-3 pt-3">
        <Field id="cancel-session-reason" label="Por qué cancelas tu asistencia">
          <textarea
            id="cancel-session-reason"
            required
            maxLength={280}
            rows={3}
            value={reason}
            className={controlClass}
            onChange={(event) => setReason(event.target.value)}
          />
        </Field>
        <Button
          type="button"
          variant="secondary"
          className="w-fit"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const result = await cancelSessionRsvpAction(sessionId, reason);
              if (result.error) {
                toast.error(result.error);
                return;
              }
              setDone(true);
              setOpen(false);
              toast.success("Cancelaste tu lugar.");
            })
          }
        >
          {pending ? "Cancelando…" : "Cancelar mi lugar"}
        </Button>
      </div>
    </details>
  );
}