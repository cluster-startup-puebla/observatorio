import { ActionButton } from "@/components/ui/action-button";

export function RepairPasses() {
  return (
    <form action="/api/admin/pases/faltantes" method="post">
      <ActionButton hold pendingLabel="Generando…">Generar los que faltan</ActionButton>
    </form>
  );
}
