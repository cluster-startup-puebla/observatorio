"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function CopyLinkButton({ url }: { url: string }) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-line px-3 py-2 text-small font-semibold text-ink hover:bg-surface-subtle"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setDone(true);
          toast.success("Enlace copiado.");
          window.setTimeout(() => setDone(false), 1600);
        } catch {
          toast.error("No se pudo copiar.");
        }
      }}
    >
      {done ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      {done ? "Copiado" : "Copiar"}
    </button>
  );
}
