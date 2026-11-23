"use client";

import { ActionButton } from "@/components/ui/action-button";

export function AcceptRegistro({
  id,
  completed,
  confirmed,
}: {
  id: string;
  completed: string;
  confirmed: boolean;
}) {
  if (!completed) return null;
  return (
    <form action={`/api/admin/registros/${id}/aceptar`} method="post">
      <ActionButton hold pendingLabel={confirmed ? "Reenviando…" : "Confirmando…"}>
        {confirmed ? "Reenviar pase" : "Confirmar lugar"}
      </ActionButton>
    </form>
  );
}
