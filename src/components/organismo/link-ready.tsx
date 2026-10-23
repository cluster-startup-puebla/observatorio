"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const shown = new Set<string>();

export function LinkReady({ url }: { url: string }) {
  useEffect(() => {
    if (shown.has(url)) return;
    shown.add(url);
    toast.success("Enlace generado.");
    const next = new URL(window.location.href);
    next.searchParams.delete("enlace");
    window.history.replaceState(null, "", `${next.pathname}${next.search}${next.hash}`);
  }, [url]);
  return null;
}
