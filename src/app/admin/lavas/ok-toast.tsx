"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const messages: Record<string, string> = {
  boost: "Boost guardado.",
  manual: "Ajuste registrado.",
  backfill: "Barrido histórico listo.",
};

export function LavasOkToast({ ok, summary }: { ok?: string; summary?: string }) {
  useEffect(() => {
    if (!ok) return;
    if (ok === "backfill" && summary) {
      toast.success(`Barrido listo: ${summary}`);
      return;
    }
    const message = messages[ok];
    if (message) toast.success(message);
  }, [ok, summary]);
  return null;
}
