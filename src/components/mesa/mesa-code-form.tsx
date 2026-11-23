"use client";

import { scanMesaAction } from "@/lib/admin/mesa/scan-action";
import { Button } from "@/components/ui/button";

/** Fallback when the camera cannot hand the code to the server action. */
export function MesaCodeForm() {
  return (
    <div className="mx-auto grid w-full max-w-md shrink-0 gap-2">
      <p className="text-center text-small text-ink-secondary">Apunta la cámara al pase.</p>
      <form action={scanMesaAction} className="grid grid-cols-[1fr_auto] gap-2">
        <input
          name="codigo"
          required
          placeholder="Código del QR"
          className="h-10 rounded-full border border-line bg-elevated px-4 text-body text-ink outline-none focus-visible:border-brand"
          autoComplete="off"
        />
        <Button type="submit" className="rounded-full px-4">
          Registrar
        </Button>
      </form>
    </div>
  );
}
