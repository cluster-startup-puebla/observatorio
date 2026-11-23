"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { claimSessionAction } from "@/lib/app/claim-session-action";
import { Button } from "@/components/ui/button";

export function ClaimSessionButton({ sessionId }: { sessionId: string }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  if (done) return <p className="text-body text-ink">Quedaste en espera de aceptación.</p>;

  return (
    <Button
      type="button"
      size="lg"
      className="w-fit rounded-full"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const result = await claimSessionAction(sessionId);
          if (result.error) {
            toast.error(result.error);
            return;
          }
          setDone(true);
          toast.success("Solicitud enviada. Quedas en espera.");
        })
      }
    >
      {pending ? "Enviando…" : "Solicitar lugar"}
    </Button>
  );
}
