"use client";

import { toast } from "sonner";

export function CopyLinkButton({ url }: { url: string }) {
  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          toast.success("Enlace copiado.");
        } catch {
          toast.error("No se pudo copiar.");
        }
      }}
    >
      Copiar al portapapeles
    </button>
  );
}
