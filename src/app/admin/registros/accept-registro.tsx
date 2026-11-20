"use client";

import { ActionButton } from "@/components/ui/action-button";

export function AcceptRegistro({ id, completed, poured }: { id: string; completed: string; poured: string }) {
  if (!completed) return null;
  const label = poured ? "Enviar pase" : "Aceptar";
  return (
    <form action={`/api/admin/registros/${id}/aceptar`} method="post">
      <ActionButton hold pendingLabel={poured ? "Enviando…" : "Aceptando…"}>
        {label}
      </ActionButton>
    </form>
  );
}
