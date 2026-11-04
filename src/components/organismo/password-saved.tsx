"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function PasswordSaved() {
  useEffect(() => {
    toast.success("Contraseña actualizada.");
    const next = new URL(window.location.href);
    next.searchParams.delete("listo");
    window.history.replaceState(null, "", `${next.pathname}${next.search}${next.hash}`);
  }, []);
  return null;
}
