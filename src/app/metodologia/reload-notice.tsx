"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { metodologiaReloadAssignment } from "@/lib/auth/metodologia-reload";

let announced = false;

export function MetodologiaReloadNotice() {
  useEffect(() => {
    if (announced) return;
    announced = true;
    toast("Recarga tu página ahora.");
    document.cookie = metodologiaReloadAssignment;
  }, []);
  return null;
}
