"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const messages: Record<string, string> = {
  boost: "Boost guardado.",
  manual: "Ajuste registrado.",
  backfill: "Barrido histórico listo.",
};

export function LavasOkToast({ ok }: { ok?: string }) {
  useEffect(() => {
    if (!ok) return;
    const message = messages[ok];
    if (message) toast.success(message);
  }, [ok]);
  return null;
}
