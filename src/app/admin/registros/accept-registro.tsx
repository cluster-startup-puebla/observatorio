"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function AcceptRegistro({ id, completed, poured }: { id: string; completed: string; poured: string }) {
  const [pending, setPending] = useState(false);
  if (!completed) return null;
  const label = poured ? "Enviar pase" : "Aceptar";
  return (
    <form action={`/api/admin/registros/${id}/aceptar`} method="post" onSubmit={() => setPending(true)}>
      <button
        className={`btn btn-primary${pending ? " pointer-events-none opacity-70" : ""}`}
        type="submit"
        aria-busy={pending}
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {pending ? "Aceptando…" : label}
      </button>
    </form>
  );
}
