"use client";

import { useRouter } from "next/navigation";
import { MesaArrivalDialog } from "@/components/mesa/arrival-dialog";
import { MesaQrScanner } from "@/components/mesa/qr-scanner";
import { mesaHref } from "@/lib/admin/mesa/href";
import { scanDeskAction } from "@/lib/flow-actions";

export function MesaDesk({
  hold,
  name,
  error,
  action,
}: {
  hold: string;
  name?: string;
  error?: string;
  action?: string;
}) {
  const router = useRouter();
  const open = Boolean(name || error);

  return (
    <>
      <form action={action ?? scanDeskAction} method="post" className="flex min-h-0 flex-1 flex-col">
        <input id="codigo" name="codigo" type="hidden" defaultValue="" />
        <MesaQrScanner hold={hold} paused={open} />
      </form>
      <MesaArrivalDialog open={open} name={name} error={error} onClose={() => router.replace(mesaHref)} />
    </>
  );
}
