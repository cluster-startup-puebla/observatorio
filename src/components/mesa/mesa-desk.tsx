"use client";

import { useRouter } from "next/navigation";
import { MesaArrivalDialog } from "@/components/mesa/arrival-dialog";
import { MesaCodeForm } from "@/components/mesa/mesa-code-form";
import { MesaQrScanner } from "@/components/mesa/qr-scanner";
import { mesaHref } from "@/lib/admin/mesa/href";

export function MesaDesk({
  hold,
  name,
  company,
  sector,
  invitedBy,
  error,
}: {
  hold: string;
  name?: string;
  company?: string;
  sector?: string;
  invitedBy?: string;
  error?: string;
}) {
  const router = useRouter();
  const open = Boolean(name || error);

  return (
    <>
      <div id="mesa-scan-form" className="flex min-h-0 flex-1 flex-col gap-6 pb-2">
        <MesaQrScanner hold={hold} paused={open} />
        <MesaCodeForm />
      </div>
      <MesaArrivalDialog
        open={open}
        name={name}
        company={company}
        sector={sector}
        invitedBy={invitedBy}
        error={error}
        onClose={() => router.replace(mesaHref)}
      />
    </>
  );
}
